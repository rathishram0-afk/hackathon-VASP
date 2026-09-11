"""Shared Supabase client, built from the backend's own secret key.

This key has full (service-role-equivalent) database access, so every
query issued through it in this codebase must carry an explicit ownership
filter (e.g. `.eq("user_id", user_id)`) -- see investigations_db.py. Row
Level Security policies (supabase/migrations/) are still enabled on every
table as defense-in-depth for any other access path (direct DB access,
future use of a client-side key, etc.), not as the sole enforcement here.
"""
from __future__ import annotations

from functools import lru_cache

from supabase import Client, create_client

from Backend.app.config import require_supabase_config


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    url, key = require_supabase_config()
    return create_client(url, key)
