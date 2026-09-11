"""Full-pipeline integration test: wallet_address -> traversal -> scoring ->
API response, run against deterministic mocked on-chain data (no live API
dependency) so it's safe for CI.
"""
from unittest.mock import patch

from Backend.app import traversal
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
