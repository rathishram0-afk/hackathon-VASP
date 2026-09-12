"""Environment configuration for the Supabase auth/persistence layer.

Loads a local .env file (if present) so SUPABASE_URL / SUPABASE_SECRET_KEY
can be set without exporting them into the shell. Does not affect the
existing trace pipeline, which has no environment dependency.
"""
from __future__ import annotations

from pathlib import Path
import os

from dotenv import load_dotenv

_BACKEND_DIR = Path(__file__).resolve().parent.parent
_ENV_PATH = _BACKEND_DIR / ".env"
if _ENV_PATH.is_file():
    load_dotenv(dotenv_path=_ENV_PATH)
else:
    load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SECRET_KEY = os.environ.get("SUPABASE_SECRET_KEY", "")


def require_supabase_config() -> tuple[str, str]:
    """Raises a clear error at first use (not import time) if Supabase env
    vars are missing, instead of failing with an opaque client error."""
    if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SECRET_KEY must be set (see .env.example) "
            "to use authentication or investigation persistence."
        )
    return SUPABASE_URL, SUPABASE_SECRET_KEY
