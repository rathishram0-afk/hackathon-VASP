"""Unified interface the graph traversal engine (Backend/) calls to walk the
transaction graph outward from an address, one hop at a time.

Tries Blockchain.com (primary: no API key, single call returns full tx
detail) first, and falls back to Blockchair automatically if that call
fails or is rate-limited, so a single provider outage doesn't stall a
trace.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

from Blockchain.client import blockchair, onchain
from Blockchain.models import Edge
from Blockchain.tag_list import ExchangeTag, lookup_address

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class Hop:
    edge: Edge
    dst_tag: ExchangeTag | None  # set if dst is a directly tagged exchange address


def _fetch_outgoing_edges(address: str, limit: int) -> list[Edge]:
    try:
        return onchain.fetch_outgoing_edges(address, limit=limit)
    except onchain.OnChainClientError as primary_exc:
        logger.warning("Blockchain.com lookup failed for %s (%s); falling back to Blockchair", address, primary_exc)
        try:
            return blockchair.fetch_outgoing_edges(address, limit=limit)
        except blockchair.BlockchairClientError as fallback_exc:
            raise onchain.OnChainClientError(
                f"both on-chain providers failed for {address}: "
                f"blockchain.com=({primary_exc}) blockchair=({fallback_exc})"
            ) from fallback_exc


def get_next_hops(address: str, limit: int = 50) -> list[Hop]:
    """Fetches outgoing edges for `address` and annotates each destination
    with a direct exchange tag if one exists in the public tag list."""
    edges = _fetch_outgoing_edges(address, limit=limit)
    return [Hop(edge=e, dst_tag=lookup_address(e.dst)) for e in edges]
