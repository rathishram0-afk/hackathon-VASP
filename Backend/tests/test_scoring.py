from unittest.mock import patch

import networkx as nx

from Backend.app import scoring
from Backend.app.scoring import score_candidates
from Backend.app.traversal import DirectHit, TraversalResult
from Blockchain.elliptic import ExchangeSignature

SOURCE = "src"

FAKE_SIGNATURE = ExchangeSignature(
    mean_in_degree=5.0,
    std_in_degree=1.0,
    mean_out_degree=1.0,
    std_out_degree=1.0,
    mean_in_out_ratio=3.0,
    sample_size=100,
)


def _patched():
    return patch.object(scoring, "compute_exchange_signature", lambda: FAKE_SIGNATURE)


def test_direct_hit_outranks_heuristic_candidates():
    graph = nx.DiGraph()
    graph.add_node(SOURCE, hop_distance=0, tag=None)
    graph.add_node("exchange", hop_distance=1, tag=object())
    graph.add_node("maybe", hop_distance=1, tag=None)
    graph.add_edge(SOURCE, "exchange")
    graph.add_edge(SOURCE, "maybe")

    result = TraversalResult(
        graph=graph,
        source=SOURCE,
        direct_hits=[
            DirectHit(exchange="acme", label="acme", address="exchange", hop_distance=1, path=[SOURCE, "exchange"])
        ],
        frontier_untagged=["maybe"],
    )

    with _patched():
        candidates = score_candidates(result)

    assert candidates[0].kind == "direct_hit"
    assert candidates[0].exchange == "acme"
    assert candidates[0].confidence > candidates[1].confidence


def test_closer_heuristic_candidate_ranks_above_farther_one_with_identical_topology():
    graph = nx.DiGraph()
    graph.add_node(SOURCE, hop_distance=0, tag=None)
    graph.add_node("near", hop_distance=1, tag=None)
    graph.add_node("far", hop_distance=3, tag=None)
    graph.add_edge(SOURCE, "near")
    graph.add_edge(SOURCE, "far")  # same degree profile (0 in/out beyond this) for both

    result = TraversalResult(graph=graph, source=SOURCE, frontier_untagged=["near", "far"])

    with _patched():
        candidates = score_candidates(result)

    by_address = {c.address: c for c in candidates}
    assert by_address["near"].confidence > by_address["far"].confidence


def test_node_matching_exchange_signature_scores_higher_than_mismatched_one():
    graph = nx.DiGraph()
    graph.add_node(SOURCE, hop_distance=0, tag=None)
    graph.add_node("matches_signature", hop_distance=1, tag=None)
    graph.add_node("mismatched", hop_distance=1, tag=None)
    graph.add_edge(SOURCE, "matches_signature")
    graph.add_edge(SOURCE, "mismatched")

    # give "matches_signature" 5 inbound edges (matches FAKE_SIGNATURE.mean_in_degree=5) and 1 outbound
    for i in range(5):
        graph.add_edge(f"in{i}", "matches_signature")
    graph.add_edge("matches_signature", "out0")

    # "mismatched" has a degree profile far from the signature
    for i in range(30):
        graph.add_edge(f"m_in{i}", "mismatched")

    result = TraversalResult(
        graph=graph, source=SOURCE, frontier_untagged=["matches_signature", "mismatched"]
    )

    with _patched():
        candidates = score_candidates(result)

    by_address = {c.address: c for c in candidates}
    assert by_address["matches_signature"].confidence > by_address["mismatched"].confidence


def test_mixer_obscured_path_is_flagged_and_penalized():
    graph = nx.DiGraph()
    graph.add_node(SOURCE, hop_distance=0, tag=None)
    graph.add_node("mixer", hop_distance=1, tag=None)
    graph.add_node("victim_dst", hop_distance=2, tag=None)
    graph.add_edge(SOURCE, "mixer", value_btc=1.0, timestamp=1000)

    # mixer fans out to 6 near-identical, rapid, round-value outputs -> should trip mixer detection
    for i in range(6):
        dst = "victim_dst" if i == 0 else f"other{i}"
        graph.add_edge("mixer", dst, value_btc=0.01 + i * 0.00002, timestamp=1000 + i * 10)

    result = TraversalResult(graph=graph, source=SOURCE, frontier_untagged=["victim_dst"])

    with _patched():
        candidates = score_candidates(result)
        # sanity: confirm the synthetic graph really does trip mixer detection
        from Backend.app.mixer import detect_mixer_nodes

        assert "mixer" in detect_mixer_nodes(graph)

    victim = next(c for c in candidates if c.address == "victim_dst")
    assert victim.mixer_obscured is True
