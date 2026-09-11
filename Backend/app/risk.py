"""Derives a persistence-friendly (risk_score, classification) summary from
an existing /trace response. Pure post-processing over run_trace()'s
already-serialized dict -- does not touch traversal.py/scoring.py/mixer.py.
"""
from __future__ import annotations

NO_CANDIDATES = "NO_CANDIDATES"
DIRECT_EXCHANGE_HIT = "DIRECT_EXCHANGE_HIT"
HEURISTIC_CANDIDATE = "HEURISTIC_CANDIDATE"
MIXER_OBSCURED = "MIXER_OBSCURED"


def classify_trace_result(trace_result: dict) -> tuple[float, str]:
    """trace_result is the dict returned by Integeration.pipeline.run_trace
    (already sorted by confidence descending -- see scoring.score_candidates).
    Returns (risk_score 0-100, classification)."""
    candidates = trace_result.get("candidates") or []
    if not candidates:
        return 0.0, NO_CANDIDATES

    top = candidates[0]
    risk_score = round(float(top.get("confidence") or 0.0) * 100, 2)

    if top.get("mixer_obscured"):
        classification = MIXER_OBSCURED
    elif top.get("kind") == "direct_hit":
        classification = DIRECT_EXCHANGE_HIT
    else:
        classification = HEURISTIC_CANDIDATE

    return risk_score, classification
