"""Live on-chain data client, wrapping the Blockchain.com free-tier REST API
(https://www.blockchain.com/explorer/api/blockchain_api) with disk caching.

Blockchair (https://blockchair.com/api/docs) is supported as a secondary
backend behind the same interface, but Blockchain.com's `rawaddr` endpoint
is the primary source since it needs no API key and returns full tx
input/output detail in one call.
"""
from __future__ import annotations

import time

import requests

from Blockchain.client import cache
from Blockchain.models import Edge

BLOCKCHAIN_INFO_BASE = "https://blockchain.info"
BLOCKCHAIR_BASE = "https://api.blockchair.com/bitcoin"
REQUEST_TIMEOUT = 10
CACHE_MAX_AGE_SECONDS = 6 * 60 * 60  # 6h: on-chain history for a given address is append-only


class OnChainClientError(RuntimeError):
    pass


def _cached_get(url: str, params: dict | None = None) -> dict:
    cache_key = url + "?" + "&".join(f"{k}={v}" for k, v in sorted((params or {}).items()))
    cached = cache.get(cache_key, max_age_seconds=CACHE_MAX_AGE_SECONDS)
    if cached is not None:
        return cached

    resp = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
    if resp.status_code != 200:
        raise OnChainClientError(f"GET {url} -> HTTP {resp.status_code}: {resp.text[:200]}")
    data = resp.json()
    cache.set(cache_key, data)
    return data


def fetch_outgoing_edges(address: str, limit: int = 50) -> list[Edge]:
    """Returns outgoing transfers (address -> counterparty) for `address`,
    using Blockchain.com's rawaddr endpoint. Self-change outputs (back to
    `address`) are excluded since they aren't a hop outward."""
    url = f"{BLOCKCHAIN_INFO_BASE}/rawaddr/{address}"
    data = _cached_get(url, params={"limit": limit})

    edges: list[Edge] = []
    for tx in data.get("txs", []):
        input_addrs = {
            inp.get("prev_out", {}).get("addr")
            for inp in tx.get("inputs", [])
            if inp.get("prev_out")
        }
        if address not in input_addrs:
            continue  # address was only a recipient in this tx, not a sender

        tx_hash = tx.get("hash", "")
        ts = tx.get("time", int(time.time()))
        for out in tx.get("out", []):
            dst = out.get("addr")
            if not dst or dst == address:
                continue
            value_btc = out.get("value", 0) / 1e8
            edges.append(Edge(src=address, dst=dst, tx_hash=tx_hash, value_btc=value_btc, timestamp=ts))

    return edges


def fetch_address_summary(address: str) -> dict:
    """Raw summary (n_tx, total_received, total_sent, final_balance) for an
    address, used as extra scoring/context signal."""
    url = f"{BLOCKCHAIN_INFO_BASE}/rawaddr/{address}"
    data = _cached_get(url, params={"limit": 0})
    return {
        "n_tx": data.get("n_tx", 0),
        "total_received_btc": data.get("total_received", 0) / 1e8,
        "total_sent_btc": data.get("total_sent", 0) / 1e8,
        "final_balance_btc": data.get("final_balance", 0) / 1e8,
    }
