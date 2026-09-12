"""FastAPI service exposing the VASP trace pipeline.

Run: uvicorn Backend.app.main:app --reload
"""
import logging
import os
from pathlib import Path
import sys
from dotenv import load_dotenv

# Ensure repository root is in sys.path so Backend, Blockchain, etc. are importable
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_REPO_ROOT = _BACKEND_DIR.parent
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

# Reliably load Backend/.env based on Backend project location
_ENV_PATH = _BACKEND_DIR / ".env"
if _ENV_PATH.is_file():
    load_dotenv(dotenv_path=_ENV_PATH)
else:
    load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from Backend.app.copilot.router import router as copilot_router
from Backend.app.copilot.service import get_copilot_config_status
from Backend.app.investigations import router as investigations_router
from Backend.app.traversal import DEFAULT_MAX_HOPS, DEFAULT_MAX_NODES
from Blockchain.hops import ProviderUnavailableError
from Integeration.pipeline import run_trace

from contextlib import asynccontextmanager

logger = logging.getLogger("vasp.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Safe startup configuration check. Reports key status as boolean without ever logging the key."""
    if _ENV_PATH.is_file():
        load_dotenv(dotenv_path=_ENV_PATH)
    status = get_copilot_config_status()
    logger.info(
        "[Startup Check] Backend initialized. GEMINI_API_KEY configured: %s, GEMINI_MODEL: %s",
        status["gemini_api_key_configured"],
        status["gemini_model"],
    )
    yield


app = FastAPI(title="VASP Trace", version="0.1.0", lifespan=lifespan)
app.include_router(investigations_router)
app.include_router(copilot_router)


# Wide open for the hackathon demo -- the frontend (built separately) may be
# served from any local port during judging.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TraceRequest(BaseModel):
    wallet_address: str = Field(..., min_length=20, max_length=100)
    max_hops: int = Field(default=DEFAULT_MAX_HOPS, ge=1, le=8)
    max_nodes: int = Field(default=DEFAULT_MAX_NODES, ge=1, le=500)
    top_n: int = Field(default=10, ge=1, le=50)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/trace")
def trace(req: TraceRequest) -> dict:
    try:
        return run_trace(
            wallet_address=req.wallet_address,
            max_hops=req.max_hops,
            max_nodes=req.max_nodes,
            top_n=req.top_n,
        )
    except ProviderUnavailableError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
