"""Tests the Blockchair client's parsing logic against mocked HTTP responses
shaped like Blockchair's documented schema (live calls aren't available in
this environment -- see Blockchain/client/blockchair.py docstring)."""
from unittest.mock import MagicMock, patch

import pytest

from Blockchain.client import blockchair

ADDRESS = "1SourceAddress"
TX_HASH = "deadbeef"


def _mock_response(json_body: dict, status_code: int = 200) -> MagicMock:
    resp = MagicMock()
    resp.status_code = status_code
    resp.json.return_value = json_body
    resp.text = str(json_body)
    return resp


ADDRESS_DASHBOARD_RESPONSE = {
    "data": {
        ADDRESS: {
            "address": {"balance": 0},
            "transactions": [
                {"hash": TX_HASH, "time": "2024-01-01 00:00:00", "balance_change": -50000000},
                {"hash": "incoming_only", "time": "2024-01-02 00:00:00", "balance_change": 50000000},
            ],
        }
    },
    "context": {},
}

TX_DETAIL_RESPONSE = {
    "data": {
        TX_HASH: {
            "transaction": {"hash": TX_HASH, "time": "2024-01-01 00:00:00"},
            "inputs": [{"recipient": ADDRESS, "value": 50000000}],
            "outputs": [
                {"recipient": "counterparty1", "value": 30000000},
                {"recipient": ADDRESS, "value": 19990000},  # change, should be excluded
                {"recipient": "counterparty2", "value": 10000},
            ],
        }
    },
    "context": {},
}

RATE_LIMITED_RESPONSE = {
    "data": None,
    "context": {"code": 430, "error": "Your IP address is temporary blacklisted"},
}


def test_fetch_outgoing_edges_parses_spending_txs_and_excludes_change():
    def fake_get(url, params=None, timeout=None):
        if "dashboards/address" in url:
            return _mock_response(ADDRESS_DASHBOARD_RESPONSE)
        if "dashboards/transaction" in url:
            return _mock_response(TX_DETAIL_RESPONSE)
        raise AssertionError(f"unexpected url {url}")

    with patch("Blockchain.client.blockchair.requests.get", side_effect=fake_get), \
         patch("Blockchain.client.blockchair.cache.get", return_value=None), \
         patch("Blockchain.client.blockchair.cache.set"):
        edges = blockchair.fetch_outgoing_edges(ADDRESS)

    dsts = {e.dst for e in edges}
    assert dsts == {"counterparty1", "counterparty2"}
    assert ADDRESS not in dsts  # change output excluded

    by_dst = {e.dst: e for e in edges}
    assert by_dst["counterparty1"].value_btc == pytest.approx(0.3)
    assert by_dst["counterparty2"].value_btc == pytest.approx(0.0001)
    assert all(e.tx_hash == TX_HASH for e in edges)


def test_incoming_only_tx_is_not_treated_as_a_spend():
    def fake_get(url, params=None, timeout=None):
        return _mock_response(ADDRESS_DASHBOARD_RESPONSE)

    with patch("Blockchain.client.blockchair.requests.get", side_effect=fake_get), \
         patch("Blockchain.client.blockchair.cache.get", return_value=None), \
         patch("Blockchain.client.blockchair.cache.set"):
        hashes = blockchair._fetch_spending_tx_hashes(ADDRESS, limit=50)

    assert hashes == [TX_HASH]  # "incoming_only" excluded (positive balance_change)


def test_rate_limited_response_raises_blockchair_client_error():
    def fake_get(url, params=None, timeout=None):
        return _mock_response(RATE_LIMITED_RESPONSE)

    with patch("Blockchain.client.blockchair.requests.get", side_effect=fake_get), \
         patch("Blockchain.client.blockchair.cache.get", return_value=None), \
         patch("Blockchain.client.blockchair.cache.set"):
        with pytest.raises(blockchair.BlockchairClientError, match="blacklisted"):
            blockchair.fetch_outgoing_edges(ADDRESS)


def test_non_200_http_status_raises_blockchair_client_error():
    def fake_get(url, params=None, timeout=None):
        return _mock_response({}, status_code=503)

    with patch("Blockchain.client.blockchair.requests.get", side_effect=fake_get), \
         patch("Blockchain.client.blockchair.cache.get", return_value=None), \
         patch("Blockchain.client.blockchair.cache.set"):
        with pytest.raises(blockchair.BlockchairClientError, match="503"):
            blockchair.fetch_outgoing_edges(ADDRESS)
