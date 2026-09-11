"""FastAPI service exposing the VASP trace pipeline.

Run: uvicorn Backend.app.main:app --reload
"""
from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from Backend.app.traversal import DEFAULT_MAX_HOPS, DEFAULT_MAX_NODES
from Blockchain.client.onchain import OnChainClientError
from Integeration.pipeline import run_trace

app = FastAPI(title="VASP Trace", version="0.1.0")

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
    except OnChainClientError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
