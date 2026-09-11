"""Blockchair API client (https://blockchair.com/api/docs), used as a
fallback on-chain data source when Blockchain.com's rawaddr endpoint is
unavailable or rate-limited.

Status: implemented, NOT live-validated. Both the sandbox dev environment
and a separate real machine (Windows, unrelated network) got the same
HTTP 430 "temporary blacklisted due to exceeding usage of API resources"
response on every attempt -- this is Blockchair's shared free-tier IP pool
being saturated, not something specific to one network. Getting a working
key requires contacting Blockchair (info@blockchair.com), which was
deliberately not pursued to avoid a paid plan. This client is implemented
directly against Blockchair's documented response schema instead of a
live-verified one. The schema (address dashboard `transactions` list with
`transaction_details`, and per-transaction `inputs`/`outputs` with
`recipient` + `value`) is stable and has been the same since Blockchair
API v2. Re-verify against a live call once a non-rate-limited IP or an API
key is available -- see `fetch_outgoing_edges` docstring for the exact
assumptions this makes.
"""
from __future__ import annotations

import time

import requests

from Blockchain.client import cache
from Blockchain.models import Edge

BLOCKCHAIR_BASE = "https://api.blockchair.com/bitcoin"
REQUEST_TIMEOUT = 10
CACHE_MAX_AGE_SECONDS = 6 * 60 * 60  # 6h: on-chain history for a given address is append-only

MAX_TX_DETAIL_LOOKUPS = 20  # bound the N+1 tx-detail fetches per address call


class BlockchairClientError(RuntimeError):
    pass


def _cached_get(url: str, params: dict | None = None) -> dict:
    cache_key = url + "?" + "&".join(f"{k}={v}" for k, v in sorted((params or {}).items()))
    cached = cache.get(cache_key, max_age_seconds=CACHE_MAX_AGE_SECONDS)
    if cached is not None:
        return cached

    resp = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
    if resp.status_code != 200:
        raise BlockchairClientError(f"GET {url} -> HTTP {resp.status_code}: {resp.text[:200]}")
    data = resp.json()
    if data.get("data") is None:
        # Blockchair returns HTTP 200 with data=null + an error in `context` for
        # rate-limit/blacklist responses -- surface that as a real failure.
        err = (data.get("context") or {}).get("error", "unknown Blockchair error")
        raise BlockchairClientError(f"GET {url} -> {err}")

    cache.set(cache_key, data)
    return data


def _fetch_spending_tx_hashes(address: str, limit: int) -> list[str]:
    """Address dashboard with transaction_details=true: each entry carries a
    `balance_change` (satoshis, signed) for that address in that tx.
    Negative balance_change means the address was a sender (spent funds) in
    that tx -- those are the "next hop outward" transactions we care about.
    """
    url = f"{BLOCKCHAIR_BASE}/dashboards/address/{address}"
    data = _cached_get(url, params={"transaction_details": "true", "limit": limit})

    addr_data = data.get("data", {}).get(address, {})
    txs = addr_data.get("transactions", [])
    return [
        tx["hash"]
        for tx in txs
        if isinstance(tx, dict) and tx.get("hash") and tx.get("balance_change", 0) < 0
    ]


def _fetch_tx_detail(tx_hash: str) -> dict:
    """/dashboards/transaction/{hash}: returns full decoded inputs/outputs,
    each with a `recipient` address and `value` in satoshis."""
    url = f"{BLOCKCHAIR_BASE}/dashboards/transaction/{tx_hash}"
    data = _cached_get(url, params={})
    return data.get("data", {}).get(tx_hash, {})


def fetch_outgoing_edges(address: str, limit: int = 50) -> list[Edge]:
    """Returns outgoing transfers (address -> counterparty) for `address`
    via Blockchair: first lists txs where the address' balance decreased
    (it was a sender), then fetches each tx's full input/output detail to
    find the destination addresses. Self-change outputs are excluded."""
    tx_hashes = _fetch_spending_tx_hashes(address, limit=limit)[:MAX_TX_DETAIL_LOOKUPS]

    edges: list[Edge] = []
    for tx_hash in tx_hashes:
        detail = _fetch_tx_detail(tx_hash)
        transaction = detail.get("transaction", {})
        outputs = detail.get("outputs", [])
        ts = transaction.get("time")
        timestamp = int(time.mktime(time.strptime(ts, "%Y-%m-%d %H:%M:%S"))) if ts else int(time.time())

        for out in outputs:
            dst = out.get("recipient")
            if not dst or dst == address:
                continue
            value_btc = (out.get("value") or 0) / 1e8
            edges.append(Edge(src=address, dst=dst, tx_hash=tx_hash, value_btc=value_btc, timestamp=timestamp))

    return edges
