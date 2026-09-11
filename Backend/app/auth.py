"""Centralized Supabase JWT authentication.

get_current_user() is the single dependency every protected endpoint uses.
It never trusts a client-decoded token: the bearer token is sent to
Supabase's Auth server (`auth.get_user`), which verifies the JWT signature,
expiry, and revocation state, and returns the authenticated user or raises.
"""
from __future__ import annotations

from dataclasses import dataclass

from fastapi import Header, HTTPException
from supabase_auth.errors import AuthError

from Backend.app.supabase_client import get_supabase_client


@dataclass(frozen=True)
class AuthenticatedUser:
    id: str  # Supabase auth.users UUID, as a string
    email: str | None


def _extract_bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.strip():
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        raise HTTPException(status_code=401, detail="Authorization header must be 'Bearer <token>'")

    return token.strip()


def get_current_user(authorization: str | None = Header(default=None)) -> AuthenticatedUser:
    token = _extract_bearer_token(authorization)

    try:
        response = get_supabase_client().auth.get_user(token)
    except AuthError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc
    except Exception as exc:  # network/config failures shouldn't look like a valid session
        raise HTTPException(status_code=401, detail="Could not verify token") from exc

    user = getattr(response, "user", None)
    if user is None or not getattr(user, "id", None):
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return AuthenticatedUser(id=user.id, email=getattr(user, "email", None))
