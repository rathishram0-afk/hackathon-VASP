"""Ownership-filtered repository functions for the investigations feature.

The Supabase client used here holds the backend's secret key, which has
full database access -- so every function that touches a specific user's
data filters by user_id explicitly (never relies solely on RLS, which is
still enabled on every table as defense-in-depth; see
Backend/supabase/migrations/001_initial_schema.sql).

`get_investigation` returning None for both "doesn't exist" and "exists but
belongs to someone else" is deliberate: the investigations router turns
both into a 404, so a caller can't distinguish another user's investigation
ID from one that was never created (avoids ID-enumeration/existence leaks).
"""
from __future__ import annotations

from typing import Any

from Backend.app.supabase_client import get_supabase_client


def create_investigation(user_id: str, data: dict[str, Any]) -> dict:
    # Drop None values (e.g. an omitted optional case_number) so Postgres
    # applies its column defaults instead of inserting an explicit NULL.
    payload = {**{k: v for k, v in data.items() if v is not None}, "user_id": user_id}
    result = get_supabase_client().table("investigations").insert(payload).execute()
    return result.data[0]


def list_investigations(user_id: str) -> list[dict]:
    result = (
        get_supabase_client()
        .table("investigations")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


def get_investigation(user_id: str, investigation_id: str) -> dict | None:
    result = (
        get_supabase_client()
        .table("investigations")
        .select("*")
        .eq("id", investigation_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def delete_investigation(user_id: str, investigation_id: str) -> bool:
    result = (
        get_supabase_client()
        .table("investigations")
        .delete()
        .eq("id", investigation_id)
        .eq("user_id", user_id)
        .execute()
    )
    return bool(result.data)


def update_investigation(user_id: str, investigation_id: str, fields: dict[str, Any]) -> dict | None:
    result = (
        get_supabase_client()
        .table("investigations")
        .update(fields)
        .eq("id", investigation_id)
        .eq("user_id", user_id)
        .execute()
    )
    return result.data[0] if result.data else None


def save_trace_result(investigation_id: str, result_payload: dict) -> dict:
    result = (
        get_supabase_client()
        .table("investigation_results")
        .insert({"investigation_id": investigation_id, "result": result_payload})
        .execute()
    )
    return result.data[0]


def list_results(investigation_id: str) -> list[dict]:
    result = (
        get_supabase_client()
        .table("investigation_results")
        .select("*")
        .eq("investigation_id", investigation_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


def list_evidence(investigation_id: str) -> list[dict]:
    result = (
        get_supabase_client()
        .table("evidence")
        .select("*")
        .eq("investigation_id", investigation_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


def create_note(user_id: str, investigation_id: str, content: str) -> dict:
    result = (
        get_supabase_client()
        .table("investigation_notes")
        .insert({"investigation_id": investigation_id, "user_id": user_id, "content": content})
        .execute()
    )
    return result.data[0]


def list_notes(investigation_id: str) -> list[dict]:
    result = (
        get_supabase_client()
        .table("investigation_notes")
        .select("*")
        .eq("investigation_id", investigation_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data
