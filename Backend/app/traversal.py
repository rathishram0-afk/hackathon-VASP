"""Outward graph traversal engine: walks the transaction graph hop by hop
from a scam-linked source wallet, using NetworkX to hold the growing graph
and the Blockchain data layer to fetch each frontier's next hops.
"""
from __future__ import annotations

from collections import deque
from dataclasses import dataclass, field

import networkx as nx

from Blockchain.hops import get_next_hops
from Blockchain.tag_list import ExchangeTag

DEFAULT_MAX_HOPS = 4
DEFAULT_MAX_NODES = 150
DEFAULT_MAX_FANOUT_PER_NODE = 25  # bound live API + graph blowup at high fan-out nodes


@dataclass
class DirectHit:
    exchange: str
    label: str
    address: str
    hop_distance: int
    path: list[str]


@dataclass
class TraversalResult:
    graph: nx.DiGraph
    source: str
    direct_hits: list[DirectHit] = field(default_factory=list)
    frontier_untagged: list[str] = field(default_factory=list)  # leaf nodes with no tag, within budget
    truncated: bool = False  # hit max_nodes before exhausting the frontier


def traverse(
    source: str,
    max_hops: int = DEFAULT_MAX_HOPS,
    max_nodes: int = DEFAULT_MAX_NODES,
    max_fanout_per_node: int = DEFAULT_MAX_FANOUT_PER_NODE,
) -> TraversalResult:
    """BFS outward from `source`. Stops expanding a branch once it hits a
    directly tagged exchange address (no need to trace past a known
    custodial deposit), a mixer flag is applied upstream in Backend/app/mixer.py
    and doesn't affect traversal itself, and stops globally once
    `max_nodes` is reached."""
    graph = nx.DiGraph()
    graph.add_node(source, hop_distance=0, tag=None)

    result = TraversalResult(graph=graph, source=source)

    visited = {source}
    queue: deque[tuple[str, int]] = deque([(source, 0)])

    while queue:
        if len(visited) >= max_nodes:
            result.truncated = True
            break

        address, depth = queue.popleft()
        if depth >= max_hops:
            result.frontier_untagged.append(address)
            continue

        try:
            hops = get_next_hops(address)
        except Exception:
            # live API hiccup on this node: treat as a dead-end branch rather than failing the whole trace
            result.frontier_untagged.append(address)
            continue

        hops = hops[:max_fanout_per_node]

        if not hops:
            if graph.nodes[address].get("tag") is None:
                result.frontier_untagged.append(address)
            continue

        for hop in hops:
            dst = hop.edge.dst
            is_new = dst not in graph
            if is_new and dst not in visited and len(visited) >= max_nodes:
                # node budget exhausted mid-expansion: stop admitting new nodes from this
                # frontier node, but still record that the trail continues past here
                result.truncated = True
                result.frontier_untagged.append(address)
                break
            if is_new:
                graph.add_node(dst, hop_distance=depth + 1, tag=hop.dst_tag)
            graph.add_edge(
                address,
                dst,
                tx_hash=hop.edge.tx_hash,
                value_btc=hop.edge.value_btc,
                timestamp=hop.edge.timestamp,
            )

            if hop.dst_tag is not None:
                path = _path_to(graph, source, dst)
                result.direct_hits.append(
                    DirectHit(
                        exchange=hop.dst_tag.exchange,
                        label=hop.dst_tag.label,
                        address=dst,
                        hop_distance=depth + 1,
                        path=path,
                    )
                )
                continue  # don't expand past a known exchange deposit address

            if dst not in visited:
                visited.add(dst)
                if len(visited) < max_nodes:
                    queue.append((dst, depth + 1))
                else:
                    result.truncated = True
                    result.frontier_untagged.append(dst)

    return result


def _path_to(graph: nx.DiGraph, source: str, target: str) -> list[str]:
    try:
        return nx.shortest_path(graph, source, target)
    except nx.NetworkXNoPath:
        return [source, target]
