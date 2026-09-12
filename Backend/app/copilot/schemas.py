"""Pydantic schemas for the VASP Trace Investigator Copilot."""
from __future__ import annotations

from typing import Any, Literal
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "model", "system"]
    content: str


class CopilotChatRequest(BaseModel):
    investigation_id: str = Field(..., description="ID of the investigation or case")
    message: str = Field(..., min_length=1, max_length=4000, description="User question or prompt")
    history: list[ChatMessage] = Field(default_factory=list, description="Prior conversation history")
    trace_context: dict[str, Any] | None = Field(
        default=None,
        description="Optional current trace result payload if not yet saved in database",
    )


class Citation(BaseModel):
    type: Literal["node", "transaction", "vasp", "evidence", "metric"]
    value: str
    label: str


class CopilotChatResponse(BaseModel):
    response: str
    citations: list[Citation] = Field(default_factory=list)
    suggested_prompts: list[str] = Field(default_factory=list)
    tools_used: list[str] = Field(default_factory=list)
    model: str
    gemini_calls_count: int = 0

