"""Orchestrates a full VASP trace: source wallet -> traversal -> scoring ->
API response payload. This is the single entry point Backend's FastAPI
endpoint calls.
"""
from __future__ import annotations

from Backend.app.scoring import Candidate, score_candidates
from Backend.app.traversal import (
    DEFAULT_MAX_HOPS,
    DEFAULT_MAX_NODES,
    TraversalResult,
    traverse,
)


def run_trace(
    wallet_address: str,
    max_hops: int = DEFAULT_MAX_HOPS,
    max_nodes: int = DEFAULT_MAX_NODES,
    top_n: int = 10,
) -> dict:
    result: TraversalResult = traverse(wallet_address, max_hops=max_hops, max_nodes=max_nodes)
    candidates: list[Candidate] = score_candidates(result, top_n=top_n)

    return {
        "source": wallet_address,
        "truncated": result.truncated,
        "graph": _serialize_graph(result),
        "candidates": [_serialize_candidate(c) for c in candidates],
    }


def _serialize_graph(result: TraversalResult) -> dict:
    nodes = [
        {
            "address": node,
            "hop_distance": data.get("hop_distance", 0),
            "tag": {"exchange": data["tag"].exchange, "label": data["tag"].label}
            if data.get("tag")
            else None,
        }
        for node, data in result.graph.nodes(data=True)
    ]
    edges = [
        {
            "src": src,
            "dst": dst,
            "tx_hash": data.get("tx_hash"),
            "value_btc": data.get("value_btc"),
            "timestamp": data.get("timestamp"),
        }
        for src, dst, data in result.graph.edges(data=True)
    ]
    return {"nodes": nodes, "edges": edges}


def _serialize_candidate(candidate: Candidate) -> dict:
    return {
        "exchange": candidate.exchange,
        "address": candidate.address,
        "confidence": candidate.confidence,
        "hop_distance": candidate.hop_distance,
        "path": candidate.path,
        "kind": candidate.kind,
        "mixer_obscured": candidate.mixer_obscured,
    }
