"""Shared data models for the blockchain data layer."""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Edge:
    """A single on-chain transfer from one address to another."""

    src: str
    dst: str
    tx_hash: str
    value_btc: float
    timestamp: int  # unix seconds

    def to_dict(self) -> dict:
        return {
            "src": self.src,
            "dst": self.dst,
            "tx_hash": self.tx_hash,
            "value_btc": self.value_btc,
            "timestamp": self.timestamp,
        }


@dataclass
class AddressActivity:
    """Aggregated on-chain activity for a single address, used for feature extraction."""

    address: str
    incoming: list[Edge] = field(default_factory=list)
    outgoing: list[Edge] = field(default_factory=list)

    @property
    def in_degree(self) -> int:
        return len(self.incoming)

    @property
    def out_degree(self) -> int:
        return len(self.outgoing)
