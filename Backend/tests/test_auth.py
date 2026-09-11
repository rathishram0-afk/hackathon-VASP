"""Tests for the centralized Supabase auth dependency. No real network calls
-- the Supabase client's auth.get_user is mocked."""
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from supabase_auth.errors import AuthApiError

from Backend.app.main import app

client = TestClient(app)


def test_missing_authorization_header_returns_401():
    resp = client.get("/me")
    assert resp.status_code == 401


def test_malformed_authorization_scheme_returns_401():
    resp = client.get("/me", headers={"Authorization": "Basic abc123"})
    assert resp.status_code == 401


def test_bearer_with_empty_token_returns_401():
    resp = client.get("/me", headers={"Authorization": "Bearer "})
    assert resp.status_code == 401


def test_invalid_or_expired_token_returns_401():
    with patch("Backend.app.auth.get_supabase_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.auth.get_user.side_effect = AuthApiError("invalid token", 401, None)
        mock_get_client.return_value = mock_client

        resp = client.get("/me", headers={"Authorization": "Bearer bad.token.here"})

    assert resp.status_code == 401


def test_valid_token_returns_authenticated_user():
    fake_user = MagicMock(id="11111111-1111-1111-1111-111111111111", email="investigator@example.com")
    fake_response = MagicMock(user=fake_user)

    with patch("Backend.app.auth.get_supabase_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.auth.get_user.return_value = fake_response
        mock_get_client.return_value = mock_client

        resp = client.get("/me", headers={"Authorization": "Bearer good.token.here"})

    assert resp.status_code == 200
    assert resp.json() == {
        "id": "11111111-1111-1111-1111-111111111111",
        "email": "investigator@example.com",
    }


def test_supabase_returning_no_user_returns_401():
    with patch("Backend.app.auth.get_supabase_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.auth.get_user.return_value = MagicMock(user=None)
        mock_get_client.return_value = mock_client

        resp = client.get("/me", headers={"Authorization": "Bearer good.token.here"})

    assert resp.status_code == 401
