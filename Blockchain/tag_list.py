"""Loads real public exchange-address tag packs (GraphSense format) into an
address -> exchange lookup table.

Tag packs are YAML files following the GraphSense tagpack schema
(https://github.com/graphsense/graphsense-tagpacks). A curated set of
BTC-relevant exchange tagpacks ships under `Blockchain/data/tagpacks/`.
"""
from __future__ import annotations

import glob
import os
from dataclasses import dataclass
from functools import lru_cache

import yaml

TAGPACKS_DIR = os.path.join(os.path.dirname(__file__), "data", "tagpacks")


@dataclass(frozen=True)
class ExchangeTag:
    address: str
    exchange: str
    label: str
    source: str


def _load_single_pack(path: str) -> list[ExchangeTag]:
    with open(path, "r", encoding="utf-8") as fh:
        doc = yaml.safe_load(fh)

    if not doc or "tags" not in doc:
        return []

    pack_actor = doc.get("actor") or doc.get("title") or os.path.basename(path)
    pack_currency = doc.get("currency")
    pack_label = doc.get("label")
    source = doc.get("source", path)

    tags: list[ExchangeTag] = []
    for tag in doc["tags"]:
        currency = tag.get("currency", pack_currency)
        if currency and currency != "BTC":
            continue
        address = tag.get("address")
        if not address:
            continue
        tags.append(
            ExchangeTag(
                address=address,
                exchange=pack_actor,
                label=tag.get("label", pack_label) or pack_actor,
                source=source,
            )
        )
    return tags


@lru_cache(maxsize=1)
def load_tag_list() -> dict[str, ExchangeTag]:
    """Returns a dict of address -> ExchangeTag for every known BTC exchange
    address across all bundled tagpacks. First tag wins on collision."""
    lookup: dict[str, ExchangeTag] = {}
    for path in sorted(glob.glob(os.path.join(TAGPACKS_DIR, "*.yaml"))):
        for tag in _load_single_pack(path):
            lookup.setdefault(tag.address, tag)
    return lookup


def lookup_address(address: str) -> ExchangeTag | None:
    return load_tag_list().get(address)


def tag_list_stats() -> dict:
    lookup = load_tag_list()
    exchanges: dict[str, int] = {}
    for tag in lookup.values():
        exchanges[tag.exchange] = exchanges.get(tag.exchange, 0) + 1
    return {"total_addresses": len(lookup), "by_exchange": exchanges}
