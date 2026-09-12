from unittest.mock import patch

import pytest

from Backend.app import traversal
from Blockchain.hops import Hop, ProviderUnavailableError
from Blockchain.models import Edge
from Blockchain.tag_list import ExchangeTag

SOURCE = "src"
TAGGED_EXCHANGE = "exchange_addr"


def _edge(src: str, dst: str) -> Edge:
    return Edge(src=src, dst=dst, tx_hash=f"{src}->{dst}", value_btc=0.1, timestamp=1_700_000_000)


def _mock_hops(mapping: dict[str, list[str]], tagged: set[str]):
    def fake_get_next_hops(address: str, limit: int = 50):
        dsts = mapping.get(address, [])
        return [
            Hop(
                edge=_edge(address, dst),
                dst_tag=ExchangeTag(address=dst, exchange="acme", label="acme exchange", source="test")
                if dst in tagged
                else None,
            )
            for dst in dsts
        ]

    return fake_get_next_hops


# src -> A -> B -> EXCHANGE (tagged, hop 3)
#          -> C (untagged dead end, hop 2)
LINEAR_MAPPING = {
    SOURCE: ["A"],
    "A": ["B", "C"],
    "B": [TAGGED_EXCHANGE],
}


def test_traversal_tracks_hop_distance_and_direct_hit():
    with patch.object(traversal, "get_next_hops", _mock_hops(LINEAR_MAPPING, {TAGGED_EXCHANGE})):
        result = traversal.traverse(SOURCE, max_hops=5, max_nodes=50)

    assert result.graph.nodes["A"]["hop_distance"] == 1
    assert result.graph.nodes["B"]["hop_distance"] == 2
    assert result.graph.nodes[TAGGED_EXCHANGE]["hop_distance"] == 3

    assert len(result.direct_hits) == 1
    hit = result.direct_hits[0]
    assert hit.exchange == "acme"
    assert hit.address == TAGGED_EXCHANGE
    assert hit.hop_distance == 3
    assert hit.path == [SOURCE, "A", "B", TAGGED_EXCHANGE]

    # a directly tagged exchange address is a dead end -- not expanded further
    assert TAGGED_EXCHANGE not in LINEAR_MAPPING or all(
        e[0] != TAGGED_EXCHANGE for e in result.graph.edges
    )


def test_traversal_records_untagged_dead_ends():
    with patch.object(traversal, "get_next_hops", _mock_hops(LINEAR_MAPPING, {TAGGED_EXCHANGE})):
        result = traversal.traverse(SOURCE, max_hops=5, max_nodes=50)

    assert "C" in result.frontier_untagged


def test_traversal_respects_max_hops():
    with patch.object(traversal, "get_next_hops", _mock_hops(LINEAR_MAPPING, {TAGGED_EXCHANGE})):
        result = traversal.traverse(SOURCE, max_hops=1, max_nodes=50)

    # only src -> A should have been expanded; A itself is cut off at the hop budget
    assert set(result.graph.nodes) == {SOURCE, "A"}
    assert result.direct_hits == []
    assert "A" in result.frontier_untagged


def test_traversal_respects_max_nodes_and_flags_truncated():
    wide_mapping = {SOURCE: [f"n{i}" for i in range(10)]}
    with patch.object(traversal, "get_next_hops", _mock_hops(wide_mapping, set())):
        result = traversal.traverse(SOURCE, max_hops=5, max_nodes=4)

    assert result.truncated is True
    assert len(result.graph.nodes) <= 4


def test_traversal_raises_when_source_provider_unavailable():
    # If we never got any real data for the trace's own source address, the
    # graph would otherwise look like a legitimate (empty) result -- that
    # must surface as a real failure instead.
    def raising_get_next_hops(address: str, limit: int = 50):
        raise ProviderUnavailableError("both providers down")

    with patch.object(traversal, "get_next_hops", raising_get_next_hops):
        with pytest.raises(ProviderUnavailableError, match="both providers down"):
            traversal.traverse(SOURCE, max_hops=3, max_nodes=10)


def test_traversal_treats_non_source_provider_failure_as_dead_end():
    # A deeper node's lookup failing after real data was already gathered
    # elsewhere must not discard the rest of the (still useful) trace.
    def flaky_get_next_hops(address: str, limit: int = 50):
        if address == SOURCE:
            return [Hop(edge=_edge(SOURCE, "A"), dst_tag=None)]
        raise ProviderUnavailableError("rate limited")

    with patch.object(traversal, "get_next_hops", flaky_get_next_hops):
        result = traversal.traverse(SOURCE, max_hops=3, max_nodes=10)

    assert set(result.graph.nodes) == {SOURCE, "A"}
    assert "A" in result.frontier_untagged
    assert result.direct_hits == []


def test_traversal_propagates_unexpected_errors():
    # A bug (anything other than a known provider failure) must not be
    # silently swallowed into a fake dead end -- it should surface as a real
    # unhandled error (-> HTTP 500 at the API layer).
    def buggy_get_next_hops(address: str, limit: int = 50):
        raise ValueError("unexpected bug")

    with patch.object(traversal, "get_next_hops", buggy_get_next_hops):
        with pytest.raises(ValueError, match="unexpected bug"):
            traversal.traverse(SOURCE, max_hops=3, max_nodes=10)
