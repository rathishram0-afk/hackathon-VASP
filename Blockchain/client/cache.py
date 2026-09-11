"""Simple disk-based JSON response cache, keyed by request URL, so repeated
demo runs against the same wallets don't re-hit free-tier rate limits."""
from __future__ import annotations

import hashlib
import json
import os
import time

CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "cache")


def _cache_path(key: str) -> str:
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
    return os.path.join(CACHE_DIR, f"{digest}.json")


def get(key: str, max_age_seconds: int | None = None) -> dict | None:
    path = _cache_path(key)
    if not os.path.exists(path):
        return None
    if max_age_seconds is not None:
        age = time.time() - os.path.getmtime(path)
        if age > max_age_seconds:
            return None
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


def set(key: str, value: dict) -> None:
    os.makedirs(CACHE_DIR, exist_ok=True)
    with open(_cache_path(key), "w", encoding="utf-8") as fh:
        json.dump(value, fh)
