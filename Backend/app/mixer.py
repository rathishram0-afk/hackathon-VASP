"""Mixer/tumbler heuristic detection (stretch goal).

Rather than let a mixer/tumbler hop silently get attributed to whatever
exchange-deposit-like address happens to be downstream of it, we detect
classic tumbler signatures on each node's outgoing edges and flag any
candidate whose path runs through a flagged node as `mixer_obscured`.
"""
from __future__ import annotations

from dataclasses import dataclass

import networkx as nx

EQUAL_VALUE_TOLERANCE = 0.01  # 1% relative tolerance for "near-identical" output values
RAPID_SUCCESSION_WINDOW_SECONDS = 600  # 10 minutes
MIN_FANOUT_FOR_MIXER = 5

# weights for the composite mixer_score
W_EQUAL_VALUE = 0.4
W_FANOUT = 0.25
W_RAPID = 0.2
W_ROUND_NUMBER = 0.15

MIXER_SCORE_THRESHOLD = 0.55


@dataclass(frozen=True)
class MixerFlag:
    node: str
    mixer_score: float
    equal_value_ratio: float
    fanout: int
    rapid_succession: bool
    round_number_ratio: float


def _is_round(value_btc: float) -> bool:
    # common tumbler denominations: 0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0 BTC (+/- dust)
    denominations = [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0]
    return any(abs(value_btc - d) / d < 0.005 for d in denominations)


def _equal_value_ratio(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0
    matches = 0
    total_pairs = 0
    for i in range(len(values)):
        for j in range(i + 1, len(values)):
            total_pairs += 1
            a, b = values[i], values[j]
            denom = max(abs(a), abs(b), 1e-9)
            if abs(a - b) / denom <= EQUAL_VALUE_TOLERANCE:
                matches += 1
    return matches / total_pairs if total_pairs else 0.0


def detect_mixer_nodes(graph: nx.DiGraph) -> dict[str, MixerFlag]:
    """Scans every node's outgoing edges for tumbler-like fan-out patterns.
    Returns a dict of node -> MixerFlag for nodes at/above the threshold."""
    flags: dict[str, MixerFlag] = {}

    for node in graph.nodes:
        out_edges = list(graph.out_edges(node, data=True))
        fanout = len(out_edges)
        if fanout < MIN_FANOUT_FOR_MIXER:
            continue

        values = [d.get("value_btc", 0.0) for _, _, d in out_edges]
        timestamps = [d.get("timestamp", 0) for _, _, d in out_edges]

        equal_ratio = _equal_value_ratio(values)
        fanout_score = min(fanout / 20, 1.0)  # saturate around 20-way fan-out
        span = (max(timestamps) - min(timestamps)) if timestamps else 0
        rapid = span <= RAPID_SUCCESSION_WINDOW_SECONDS
        round_ratio = sum(1 for v in values if _is_round(v)) / len(values) if values else 0.0

        mixer_score = (
            W_EQUAL_VALUE * equal_ratio
            + W_FANOUT * fanout_score
            + W_RAPID * (1.0 if rapid else 0.0)
            + W_ROUND_NUMBER * round_ratio
        )

        if mixer_score >= MIXER_SCORE_THRESHOLD:
            flags[node] = MixerFlag(
                node=node,
                mixer_score=round(mixer_score, 4),
                equal_value_ratio=round(equal_ratio, 4),
                fanout=fanout,
                rapid_succession=rapid,
                round_number_ratio=round(round_ratio, 4),
            )

    return flags


def path_crosses_mixer(path: list[str], mixer_nodes: dict[str, MixerFlag]) -> bool:
    return any(node in mixer_nodes for node in path)
