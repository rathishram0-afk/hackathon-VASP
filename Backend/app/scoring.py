"""Scoring engine: ranks candidate exchange attributions for a completed
traversal.

Two kinds of candidates:
  - direct hits: a tagged exchange address was reached directly -> near-1.0
    confidence, scaled slightly by hop distance.
  - heuristic candidates: no tag was found within the hop budget, so the
    untagged frontier nodes are scored by how closely their local
    transaction-graph topology resembles the Elliptic-derived
    "exchange-deposit-like" signature (see Blockchain/elliptic.py), combined
    with a proximity decay by hop distance.
"""
from __future__ import annotations

import math
from dataclasses import dataclass

import networkx as nx

from Backend.app.mixer import detect_mixer_nodes, path_crosses_mixer
from Backend.app.traversal import TraversalResult
from Blockchain.elliptic import ExchangeSignature, compute_exchange_signature

PROXIMITY_DECAY = 0.35  # confidence multiplier lost per hop of distance
PATTERN_WEIGHT = 0.6
PROXIMITY_WEIGHT = 0.4
DIRECT_HIT_BASE_CONFIDENCE = 0.98
DIRECT_HIT_HOP_PENALTY = 0.02  # tiny penalty per hop so closer direct hits still rank first


@dataclass
class Candidate:
    exchange: str | None  # None for heuristic candidates without a resolved exchange name
    address: str
    confidence: float
    hop_distance: int
    path: list[str]
    kind: str  # "direct_hit" | "heuristic"
    mixer_obscured: bool = False


def _proximity_score(hop_distance: int) -> float:
    return math.exp(-PROXIMITY_DECAY * max(hop_distance - 1, 0))


def _pattern_score(graph: nx.DiGraph, node: str, signature: ExchangeSignature) -> float:
    """Compares a node's local in/out-degree topology to the reference
    exchange-deposit signature via a bounded Gaussian-similarity score in
    [0, 1] — 1.0 means the node's degree profile matches the signature's
    mean almost exactly, decaying smoothly as it diverges."""
    in_deg = graph.in_degree(node)
    out_deg = graph.out_degree(node)
    ratio = (in_deg + 1) / (out_deg + 1)

    def gaussian_sim(value: float, mean: float, std: float) -> float:
        std = std or 1.0
        z = (value - mean) / std
        return math.exp(-0.5 * z * z)

    in_sim = gaussian_sim(in_deg, signature.mean_in_degree, signature.std_in_degree)
    out_sim = gaussian_sim(out_deg, signature.mean_out_degree, signature.std_out_degree)
    ratio_sim = gaussian_sim(ratio, signature.mean_in_out_ratio, signature.std_in_degree or 1.0)

    return (in_sim + out_sim + ratio_sim) / 3


def score_candidates(result: TraversalResult, top_n: int = 10) -> list[Candidate]:
    candidates: list[Candidate] = []
    mixer_nodes = detect_mixer_nodes(result.graph)

    for hit in result.direct_hits:
        confidence = max(
            0.0,
            min(1.0, DIRECT_HIT_BASE_CONFIDENCE - DIRECT_HIT_HOP_PENALTY * (hit.hop_distance - 1)),
        )
        candidates.append(
            Candidate(
                exchange=hit.exchange,
                address=hit.address,
                confidence=round(confidence, 4),
                hop_distance=hit.hop_distance,
                path=hit.path,
                kind="direct_hit",
                mixer_obscured=path_crosses_mixer(hit.path[:-1], mixer_nodes),
            )
        )

    if result.frontier_untagged:
        signature = compute_exchange_signature()
        for node in result.frontier_untagged:
            if node == result.source or node not in result.graph:
                continue
            hop_distance = result.graph.nodes[node].get("hop_distance", 0)
            if hop_distance == 0:
                continue

            proximity = _proximity_score(hop_distance)
            pattern = _pattern_score(result.graph, node, signature)
            confidence = PROXIMITY_WEIGHT * proximity + PATTERN_WEIGHT * pattern

            path = _path_to(result.graph, result.source, node)
            mixer_obscured = path_crosses_mixer(path[:-1], mixer_nodes)
            candidates.append(
                Candidate(
                    exchange=None,
                    address=node,
                    # a heuristic score built on top of a mixer-obscured path is unreliable --
                    # surface that plainly instead of ranking it as a confident attribution
                    confidence=round(confidence * 0.5, 4) if mixer_obscured else round(confidence, 4),
                    hop_distance=hop_distance,
                    path=path,
                    kind="heuristic",
                    mixer_obscured=mixer_obscured,
                )
            )

    candidates.sort(key=lambda c: c.confidence, reverse=True)
    return candidates[:top_n]


def _path_to(graph: nx.DiGraph, source: str, target: str) -> list[str]:
    try:
        return nx.shortest_path(graph, source, target)
    except nx.NetworkXNoPath:
        return [source, target]
