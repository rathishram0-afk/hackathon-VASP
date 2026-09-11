from unittest.mock import patch

import pytest

from Blockchain import hops
from Blockchain.client import blockchair, onchain
from Blockchain.models import Edge

ADDRESS = "some_address"


def _edge(dst: str) -> Edge:
    return Edge(src=ADDRESS, dst=dst, tx_hash="h", value_btc=0.1, timestamp=1_700_000_000)


def test_uses_blockchain_com_when_it_succeeds():
    with patch.object(onchain, "fetch_outgoing_edges", return_value=[_edge("dst1")]) as primary, \
         patch.object(blockchair, "fetch_outgoing_edges") as fallback:
        result = hops.get_next_hops(ADDRESS)

    primary.assert_called_once()
    fallback.assert_not_called()
    assert [h.edge.dst for h in result] == ["dst1"]


def test_falls_back_to_blockchair_when_blockchain_com_fails():
    with patch.object(onchain, "fetch_outgoing_edges", side_effect=onchain.OnChainClientError("rate limited")), \
         patch.object(blockchair, "fetch_outgoing_edges", return_value=[_edge("dst2")]) as fallback:
        result = hops.get_next_hops(ADDRESS)

    fallback.assert_called_once()
    assert [h.edge.dst for h in result] == ["dst2"]


def test_raises_when_both_providers_fail():
    with patch.object(onchain, "fetch_outgoing_edges", side_effect=onchain.OnChainClientError("blockchain.com down")), \
         patch.object(blockchair, "fetch_outgoing_edges", side_effect=blockchair.BlockchairClientError("blockchair down")):
        with pytest.raises(onchain.OnChainClientError, match="both on-chain providers failed"):
            hops.get_next_hops(ADDRESS)
