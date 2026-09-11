"""Tests for the protected investigation endpoints and the existing
/health + /trace endpoints they sit alongside. No real Supabase or
blockchain calls -- auth is overridden via FastAPI's dependency_overrides,
and investigations_db / run_trace are mocked directly.
"""
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from Backend.app import investigations_db as db
from Backend.app.auth import AuthenticatedUser, get_current_user
from Backend.app.main import app

USER_A = AuthenticatedUser(id="11111111-1111-1111-1111-111111111111", email="a@example.com")
USER_B = AuthenticatedUser(id="22222222-2222-2222-2222-222222222222", email="b@example.com")

INVESTIGATION_ID = "33333333-3333-3333-3333-333333333333"

SOURCE_ADDRESS = "3EktnHQD7RiAE6uzMj2ZifT9YgRrkSgzQX"

FAKE_TRACE_RESULT = {
    "source": SOURCE_ADDRESS,
    "truncated": False,
    "graph": {"nodes": [], "edges": []},
    "candidates": [
        {
            "exchange": "acme_exchange",
            "address": "some_addr",
            "confidence": 0.95,
            "hop_distance": 1,
            "path": [SOURCE_ADDRESS, "some_addr"],
            "kind": "direct_hit",
            "mixer_obscured": False,
        }
    ],
}


@pytest.fixture(autouse=True)
def _clear_overrides():
    yield
    app.dependency_overrides.clear()


def _as_user(user: AuthenticatedUser) -> None:
    app.dependency_overrides[get_current_user] = lambda: user


client = TestClient(app)


# ---------------------------------------------------------------------------
# Existing endpoints, unchanged behavior
# ---------------------------------------------------------------------------


def test_health_still_works():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_trace_still_works_unauthenticated():
    with patch("Backend.app.main.run_trace", return_value=FAKE_TRACE_RESULT) as mock_run_trace:
        resp = client.post("/trace", json={"wallet_address": SOURCE_ADDRESS})

    assert resp.status_code == 200
    assert resp.json() == FAKE_TRACE_RESULT
    mock_run_trace.assert_called_once()
    # /trace is intentionally NOT behind auth -- unchanged public contract
    assert "wallet_address" in mock_run_trace.call_args.kwargs


# ---------------------------------------------------------------------------
# Investigation CRUD + ownership
# ---------------------------------------------------------------------------


def test_authenticated_user_can_create_investigation():
    _as_user(USER_A)
    created = {"id": INVESTIGATION_ID, "user_id": USER_A.id, "title": "Case 1", "wallet_address": SOURCE_ADDRESS}

    with patch.object(db, "create_investigation", return_value=created) as mock_create:
        resp = client.post(
            "/investigations",
            json={"title": "Case 1", "wallet_address": SOURCE_ADDRESS},
        )

    assert resp.status_code == 201
    assert resp.json() == created
    mock_create.assert_called_once()
    assert mock_create.call_args.args[0] == USER_A.id


def test_user_can_retrieve_own_investigations():
    _as_user(USER_A)
    rows = [{"id": INVESTIGATION_ID, "user_id": USER_A.id, "title": "Case 1"}]

    with patch.object(db, "list_investigations", return_value=rows) as mock_list:
        resp = client.get("/investigations")

    assert resp.status_code == 200
    assert resp.json() == rows
    mock_list.assert_called_once_with(USER_A.id)


def test_user_cannot_access_another_users_investigation():
    _as_user(USER_B)

    # db.get_investigation filters by user_id -- another user's row looks like "not found"
    with patch.object(db, "get_investigation", return_value=None) as mock_get:
        resp = client.get(f"/investigations/{INVESTIGATION_ID}")

    assert resp.status_code == 404
    mock_get.assert_called_once_with(USER_B.id, INVESTIGATION_ID)


def test_user_cannot_delete_another_users_investigation():
    _as_user(USER_B)

    with patch.object(db, "get_investigation", return_value=None) as mock_get, patch.object(
        db, "delete_investigation"
    ) as mock_delete:
        resp = client.delete(f"/investigations/{INVESTIGATION_ID}")

    assert resp.status_code == 404
    mock_get.assert_called_once_with(USER_B.id, INVESTIGATION_ID)
    mock_delete.assert_not_called()  # ownership check must short-circuit before any delete


def test_owner_can_delete_own_investigation():
    _as_user(USER_A)
    owned = {"id": INVESTIGATION_ID, "user_id": USER_A.id}

    with patch.object(db, "get_investigation", return_value=owned), patch.object(
        db, "delete_investigation", return_value=True
    ) as mock_delete:
        resp = client.delete(f"/investigations/{INVESTIGATION_ID}")

    assert resp.status_code == 204
    mock_delete.assert_called_once_with(USER_A.id, INVESTIGATION_ID)


def test_investigations_endpoints_require_authentication():
    # no dependency override, no Authorization header
    resp = client.get(f"/investigations/{INVESTIGATION_ID}")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Authenticated trace: reuses the existing pipeline, persists the result
# ---------------------------------------------------------------------------


def test_authenticated_trace_executes_existing_pipeline_and_persists_result():
    _as_user(USER_A)
    owned = {
        "id": INVESTIGATION_ID,
        "user_id": USER_A.id,
        "wallet_address": SOURCE_ADDRESS,
        "max_hops": 4,
        "max_nodes": 150,
    }

    with patch.object(db, "get_investigation", return_value=owned), patch(
        "Backend.app.investigations.run_trace", return_value=FAKE_TRACE_RESULT
    ) as mock_run_trace, patch.object(
        db, "save_trace_result", return_value={"id": "r1", "result": FAKE_TRACE_RESULT}
    ) as mock_save, patch.object(
        db, "update_investigation", return_value=owned
    ) as mock_update:
        resp = client.post(f"/investigations/{INVESTIGATION_ID}/trace")

    assert resp.status_code == 200
    assert resp.json() == FAKE_TRACE_RESULT

    # same pipeline function /trace uses -- called with this investigation's stored params
    mock_run_trace.assert_called_once_with(
        wallet_address=SOURCE_ADDRESS, max_hops=4, max_nodes=150
    )

    # trace result persisted as JSONB against the right investigation
    mock_save.assert_called_once_with(INVESTIGATION_ID, FAKE_TRACE_RESULT)

    # risk_score/classification derived and written back (top candidate: direct_hit, confidence 0.95)
    mock_update.assert_called_once()
    update_args = mock_update.call_args.args
    update_fields = update_args[2]
    assert update_args[0] == USER_A.id
    assert update_args[1] == INVESTIGATION_ID
    assert update_fields["classification"] == "DIRECT_EXCHANGE_HIT"
    assert update_fields["risk_score"] == pytest.approx(95.0)


def test_trace_on_unowned_investigation_returns_404_without_calling_pipeline():
    _as_user(USER_B)

    with patch.object(db, "get_investigation", return_value=None), patch(
        "Backend.app.investigations.run_trace"
    ) as mock_run_trace:
        resp = client.post(f"/investigations/{INVESTIGATION_ID}/trace")

    assert resp.status_code == 404
    mock_run_trace.assert_not_called()


# ---------------------------------------------------------------------------
# Notes / evidence scoping
# ---------------------------------------------------------------------------


def test_notes_are_scoped_to_the_correct_investigation():
    _as_user(USER_A)
    owned = {"id": INVESTIGATION_ID, "user_id": USER_A.id}
    created_note = {"id": "n1", "investigation_id": INVESTIGATION_ID, "content": "Looks like a peel chain"}

    with patch.object(db, "get_investigation", return_value=owned), patch.object(
        db, "create_note", return_value=created_note
    ) as mock_create_note:
        resp = client.post(
            f"/investigations/{INVESTIGATION_ID}/notes",
            json={"content": "Looks like a peel chain"},
        )

    assert resp.status_code == 201
    assert resp.json() == created_note
    mock_create_note.assert_called_once_with(USER_A.id, INVESTIGATION_ID, "Looks like a peel chain")


def test_evidence_scoped_to_correct_investigation_and_requires_ownership():
    _as_user(USER_A)
    owned = {"id": INVESTIGATION_ID, "user_id": USER_A.id}
    evidence_rows = [{"id": "e1", "investigation_id": INVESTIGATION_ID, "evidence_type": "tx"}]

    with patch.object(db, "get_investigation", return_value=owned), patch.object(
        db, "list_evidence", return_value=evidence_rows
    ) as mock_list_evidence:
        resp = client.get(f"/investigations/{INVESTIGATION_ID}/evidence")

    assert resp.status_code == 200
    assert resp.json() == evidence_rows
    mock_list_evidence.assert_called_once_with(INVESTIGATION_ID)


def test_notes_on_unowned_investigation_returns_404():
    _as_user(USER_B)

    with patch.object(db, "get_investigation", return_value=None), patch.object(
        db, "list_notes"
    ) as mock_list_notes:
        resp = client.get(f"/investigations/{INVESTIGATION_ID}/notes")

    assert resp.status_code == 404
    mock_list_notes.assert_not_called()
