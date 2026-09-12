"""Protected investigation-management endpoints, layered on top of the
existing (untouched) trace pipeline. Every endpoint here requires
authentication via get_current_user and enforces per-user ownership on any
investigation_id in the path.
"""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from Backend.app import investigations_db as db
from Backend.app.auth import AuthenticatedUser, get_current_user
from Backend.app.risk import classify_trace_result
from Backend.app.traversal import DEFAULT_MAX_HOPS, DEFAULT_MAX_NODES
from Blockchain.hops import ProviderUnavailableError
from Integeration.pipeline import run_trace

router = APIRouter()


class InvestigationCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    wallet_address: str = Field(..., min_length=20, max_length=100)
    case_number: str | None = Field(default=None, max_length=100)
    max_hops: int = Field(default=DEFAULT_MAX_HOPS, ge=1, le=8)
    max_nodes: int = Field(default=DEFAULT_MAX_NODES, ge=1, le=500)


class NoteCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=10000)


def _require_owned_investigation(user_id: str, investigation_id: UUID) -> dict:
    investigation = db.get_investigation(user_id, str(investigation_id))
    if investigation is None:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return investigation


@router.get("/me")
def me(user: AuthenticatedUser = Depends(get_current_user)) -> dict:
    return {"id": user.id, "email": user.email}


@router.get("/investigations")
def list_investigations(user: AuthenticatedUser = Depends(get_current_user)) -> list[dict]:
    return db.list_investigations(user.id)


@router.post("/investigations", status_code=201)
def create_investigation(
    payload: InvestigationCreate, user: AuthenticatedUser = Depends(get_current_user)
) -> dict:
    return db.create_investigation(user.id, payload.model_dump())


@router.get("/investigations/{investigation_id}")
def get_investigation(
    investigation_id: UUID, user: AuthenticatedUser = Depends(get_current_user)
) -> dict:
    return _require_owned_investigation(user.id, investigation_id)


@router.delete("/investigations/{investigation_id}", status_code=204)
def delete_investigation(
    investigation_id: UUID, user: AuthenticatedUser = Depends(get_current_user)
) -> None:
    _require_owned_investigation(user.id, investigation_id)
    db.delete_investigation(user.id, str(investigation_id))


@router.post("/investigations/{investigation_id}/trace")
def trace_investigation(
    investigation_id: UUID, user: AuthenticatedUser = Depends(get_current_user)
) -> dict:
    investigation = _require_owned_investigation(user.id, investigation_id)

    try:
        # Existing trace pipeline, unchanged -- same function POST /trace calls.
        trace_result = run_trace(
            wallet_address=investigation["wallet_address"],
            max_hops=investigation.get("max_hops", DEFAULT_MAX_HOPS),
            max_nodes=investigation.get("max_nodes", DEFAULT_MAX_NODES),
        )
    except ProviderUnavailableError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    db.save_trace_result(str(investigation_id), trace_result)

    risk_score, classification = classify_trace_result(trace_result)
    db.update_investigation(
        user.id,
        str(investigation_id),
        {"status": "TRACED", "risk_score": risk_score, "classification": classification},
    )

    return trace_result


@router.get("/investigations/{investigation_id}/results")
def get_investigation_results(
    investigation_id: UUID, user: AuthenticatedUser = Depends(get_current_user)
) -> list[dict]:
    _require_owned_investigation(user.id, investigation_id)
    return db.list_results(str(investigation_id))


@router.get("/investigations/{investigation_id}/evidence")
def get_investigation_evidence(
    investigation_id: UUID, user: AuthenticatedUser = Depends(get_current_user)
) -> list[dict]:
    _require_owned_investigation(user.id, investigation_id)
    return db.list_evidence(str(investigation_id))


@router.post("/investigations/{investigation_id}/notes", status_code=201)
def create_investigation_note(
    investigation_id: UUID,
    payload: NoteCreate,
    user: AuthenticatedUser = Depends(get_current_user),
) -> dict:
    _require_owned_investigation(user.id, investigation_id)
    return db.create_note(user.id, str(investigation_id), payload.content)


@router.get("/investigations/{investigation_id}/notes")
def get_investigation_notes(
    investigation_id: UUID, user: AuthenticatedUser = Depends(get_current_user)
) -> list[dict]:
    _require_owned_investigation(user.id, investigation_id)
    return db.list_notes(str(investigation_id))
