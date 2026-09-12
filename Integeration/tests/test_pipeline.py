"""Full-pipeline integration test: wallet_address -> traversal -> scoring ->
API response, run against deterministic mocked on-chain data (no live API
dependency) so it's safe for CI.
"""
from unittest.mock import patch

from Backend.app import traversal
from Blockchain.client import onchain
from Blockchain.hops import Hop
from Blockchain.models import Edge
from Blockchain.tag_list import ExchangeTag
from Integeration.pipeline import run_trace

SOURCE = "scam_wallet"
EXCHANGE_ADDR = "known_exchange_deposit"


def _edge(src: str, dst: str, value: float = 0.5) -> Edge:
    return Edge(src=src, dst=dst, tx_hash=f"{src}->{dst}", value_btc=value, timestamp=1_700_000_000)


# scam_wallet -> hop1 -> hop2 -> known_exchange_deposit (tagged, 3 hops out)
#            -> dead_end (untagged, 1 hop out)
MAPPING = {
    SOURCE: ["hop1", "dead_end"],
    "hop1": ["hop2"],
    "hop2": [EXCHANGE_ADDR],
}


def _fake_get_next_hops(address: str, limit: int = 50):
    dsts = MAPPING.get(address, [])
    return [
        Hop(
            edge=_edge(address, dst),
            dst_tag=ExchangeTag(address=dst, exchange="acme_exchange", label="acme deposit", source="test")
            if dst == EXCHANGE_ADDR
            else None,
        )
        for dst in dsts
    ]


def test_run_trace_finds_and_ranks_direct_hit_first():
    with patch.object(traversal, "get_next_hops", _fake_get_next_hops):
        response = run_trace(SOURCE, max_hops=5, max_nodes=50, top_n=10)

    assert response["source"] == SOURCE
    assert response["truncated"] is False

    node_addresses = {n["address"] for n in response["graph"]["nodes"]}
    assert {SOURCE, "hop1", "hop2", "dead_end", EXCHANGE_ADDR} <= node_addresses

    candidates = response["candidates"]
    assert candidates, "expected at least one candidate"
    top = candidates[0]
    assert top["kind"] == "direct_hit"
    assert top["exchange"] == "acme_exchange"
    assert top["address"] == EXCHANGE_ADDR
    assert top["path"] == [SOURCE, "hop1", "hop2", EXCHANGE_ADDR]
    assert top["confidence"] > 0.9

    # the untagged dead end should still surface as a lower-confidence heuristic candidate
    heuristic_addrs = {c["address"] for c in candidates if c["kind"] == "heuristic"}
    assert "dead_end" in heuristic_addrs


def test_run_trace_respects_max_hops_before_reaching_exchange():
    with patch.object(traversal, "get_next_hops", _fake_get_next_hops):
        response = run_trace(SOURCE, max_hops=2, max_nodes=50, top_n=10)

    node_addresses = {n["address"] for n in response["graph"]["nodes"]}
    assert EXCHANGE_ADDR not in node_addresses  # 3 hops away, budget only allows 2
    assert not any(c["kind"] == "direct_hit" for c in response["candidates"])


def test_realistic_provider_response_to_graph_pipeline():
    """Verify that a realistic provider response with >= 2 transactions, multiple
    inputs, multiple outputs, hashes, timestamps, and values successfully parses
    into NetworkX nodes and edges, and serializes correctly for /trace."""
    test_source = "36wra4K7QASAnXovBaH9VDYpFus9KkQbe3"
    counterparty_1 = "17ac9tXHxu1nxdLgLu9WYk7vR8ggFN5GkH"
    counterparty_2 = "bc1qd2kx8pmpnvfx40rmgd483988jcasamm9xw326zlm4pwguv5drxfssc4c86"
    counterparty_3 = "1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s"

    realistic_payload = {
        "address": test_source,
        "n_tx": 2,
        "total_received": 250000000,
        "total_sent": 250000000,
        "final_balance": 0,
        "txs": [
            {
                "hash": "tx_hash_0001_first_outgoing_transfer",
                "time": 1710000000,
                "inputs": [
                    {
                        "prev_out": {
                            "addr": test_source,
                            "value": 150000000,
                        }
                    }
                ],
                "out": [
                    {
                        "addr": counterparty_1,
                        "value": 50000000,
                    },
                    {
                        "addr": counterparty_2,
                        "value": 95000000,
                    },
                    {
                        "addr": test_source,
                        "value": 4500000,
                    },
                ],
            },
            {
                "hash": "tx_hash_0002_second_outgoing_transfer",
                "time": 1710003600,
                "inputs": [
                    {
                        "prev_out": {
                            "addr": test_source,
                            "value": 100000000,
                        }
                    },
                    {
                        "prev_out": {
                            "addr": "unrelated_co_sender_address",
                            "value": 20000000,
                        }
                    },
                ],
                "out": [
                    {
                        "addr": counterparty_3,
                        "value": 115000000,
                    },
                    {
                        "addr": None,
                        "value": 0,
                    },
                ],
            },
        ],
    }

    # Stage 1: Provider response exists and has transactions
    raw_txs = realistic_payload["txs"]
    assert len(raw_txs) == 2, "Provider must return at least 2 transactions"

    # Stage 2: Parsing transactions via Blockchain/client/onchain.py
    with patch.object(onchain, "_cached_get", return_value=realistic_payload):
        edges = onchain.fetch_outgoing_edges(test_source)

    assert len(edges) == 3, f"Expected 3 outgoing edges from source, got {len(edges)}"
    dst_addrs = {e.dst for e in edges}
    assert dst_addrs == {counterparty_1, counterparty_2, counterparty_3}
    assert test_source not in dst_addrs, "Self-change output must be filtered out"

    first_edge = next(e for e in edges if e.dst == counterparty_1)
    assert first_edge.tx_hash == "tx_hash_0001_first_outgoing_transfer"
    assert first_edge.value_btc == 0.5
    assert first_edge.timestamp == 1710000000

    # Stage 3: Graph traversal builds NetworkX graph
    with patch.object(onchain, "_cached_get", return_value=realistic_payload):
        traversal_result = traversal.traverse(test_source, max_hops=1, max_nodes=20)

    nx_graph = traversal_result.graph
    assert nx_graph.number_of_nodes() == 4, f"Expected 4 nodes, got {nx_graph.number_of_nodes()}"
    assert set(nx_graph.nodes) == {test_source, counterparty_1, counterparty_2, counterparty_3}
    assert nx_graph.number_of_edges() == 3, f"Expected 3 edges, got {nx_graph.number_of_edges()}"

    # Stage 4 & 5: Pipeline orchestration and /trace response
    with patch.object(onchain, "_cached_get", return_value=realistic_payload):
        trace_payload = run_trace(test_source, max_hops=1, max_nodes=20, top_n=10)

    assert trace_payload["source"] == test_source
    graph = trace_payload["graph"]
    assert len(graph["nodes"]) > 1, f"POST /trace graph.nodes must be > 1, got {len(graph['nodes'])}"
    assert len(graph["edges"]) > 0, f"POST /trace graph.edges must be > 0, got {len(graph['edges'])}"
    assert len(graph["nodes"]) == 4
    assert len(graph["edges"]) == 3

    assert len(trace_payload["candidates"]) > 0
    top_cand = trace_payload["candidates"][0]
    assert top_cand["hop_distance"] == 1
    assert top_cand["address"] in {counterparty_1, counterparty_2, counterparty_3}

