"""Trace data resolution and normalization for the Investigator Copilot."""
from __future__ import annotations

from typing import Any
import threading

from Backend.app import investigations_db as db

# Thread-safe in-memory cache for fast access to recent trace payloads
_TRACE_CACHE: dict[str, dict[str, Any]] = {}
_CACHE_LOCK = threading.Lock()


def cache_trace_result(investigation_id: str, trace_result: dict[str, Any]) -> None:
    """Store a trace result in the in-memory cache."""
    with _CACHE_LOCK:
        _TRACE_CACHE[investigation_id] = trace_result


def get_cached_trace_result(investigation_id: str) -> dict[str, Any] | None:
    """Retrieve a trace result from the in-memory cache."""
    with _CACHE_LOCK:
        return _TRACE_CACHE.get(investigation_id)


def resolve_trace_data(
    investigation_id: str, trace_context: dict[str, Any] | None = None
) -> dict[str, Any] | None:
    """Resolve trace data from explicit request context, in-memory cache, or database."""
    if trace_context and isinstance(trace_context, dict) and trace_context.get("graph"):
        cache_trace_result(investigation_id, trace_context)
        return trace_context

    cached = get_cached_trace_result(investigation_id)
    if cached:
        return cached

    # Attempt to load from database if Supabase is configured
    try:
        results = db.list_results(investigation_id)
        if results and isinstance(results, list):
            first = results[0]
            raw = first.get("result") if isinstance(first, dict) and "result" in first else first
            if isinstance(raw, dict) and "graph" in raw:
                cache_trace_result(investigation_id, raw)
                return raw
    except Exception:
        pass

    return None
