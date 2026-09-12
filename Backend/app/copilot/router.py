"""FastAPI router for the VASP Trace Investigator Copilot."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from Backend.app.copilot.schemas import CopilotChatRequest, CopilotChatResponse
from Backend.app.copilot.service import query_copilot

router = APIRouter(prefix="/copilot", tags=["copilot"])


@router.post("/chat", response_model=CopilotChatResponse)
def chat_copilot(req: CopilotChatRequest) -> CopilotChatResponse:
    """Chat with the VASP Trace Investigator AI Copilot."""
    try:
        return query_copilot(req)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Copilot query failed: {str(exc)}") from exc
