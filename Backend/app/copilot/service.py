"""Service layer for the VASP Trace Investigator Copilot."""
from __future__ import annotations

import logging
import os
import re
import threading
import time
from typing import Any

from pathlib import Path
import httpx
from dotenv import load_dotenv
from google import genai
from google.genai import types

from Backend.app.copilot.context import cache_trace_result, resolve_trace_data
from Backend.app.copilot.prompts import COPILOT_SYSTEM_INSTRUCTION
from Backend.app.copilot.schemas import Citation, CopilotChatRequest, CopilotChatResponse
from Backend.app.copilot.tools import (
    build_tool_suite,
    get_investigation_summary,
    get_mixer_analysis,
    get_risk_analysis,
    get_transaction_path,
    get_vasp_attributions,
)

# Reliably locate and load Backend/.env based on file location
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_ENV_PATH = _BACKEND_DIR / ".env"
if _ENV_PATH.is_file():
    load_dotenv(dotenv_path=_ENV_PATH)
else:
    load_dotenv()

logger = logging.getLogger("copilot")


def get_copilot_config_status() -> dict[str, Any]:
    """Safe check reporting configuration status without logging or exposing secrets."""
    has_key = bool(os.getenv("GEMINI_API_KEY", "").strip())
    model = os.getenv("GEMINI_MODEL", "gemini-3.6-flash").strip()
    return {
        "gemini_api_key_configured": has_key,
        "gemini_model": model,
    }

# In-memory query deduplication cache to prevent identical back-to-back Gemini calls
_QUERY_CACHE: dict[str, tuple[CopilotChatResponse, float]] = {}
_QUERY_CACHE_LOCK = threading.Lock()
QUERY_CACHE_TTL_SECONDS = 60.0


class GeminiRequestTracker:
    """Tracks and logs the exact count of HTTP requests dispatched to Gemini API without logging API keys."""

    def __init__(self) -> None:
        self.call_count = 0
        self.requested_paths: list[str] = []

    def on_request(self, request: httpx.Request) -> None:
        self.call_count += 1
        safe_path = request.url.path
        self.requested_paths.append(safe_path)
        logger.info(
            "[Gemini API Call #%d] Method=%s Endpoint=%s (Active Gemini Request)",
            self.call_count,
            request.method,
            safe_path,
        )


def _quota_exhausted_fallback(
    req: CopilotChatRequest,
    trace: dict[str, Any] | None,
    executed_tools: list[str],
    calls_made: int = 0,
) -> CopilotChatResponse:
    """Clean, professional forensic response when Gemini API 429 quota is reached,
    providing deterministic on-chain data without retrying or leaving the user stranded."""
    fallback_res = _rule_based_forensic_fallback(
        req, trace, executed_tools, error_reason="AI quota temporarily exhausted"
    )
    clean_message = (
        "⚠️ **AI Quota Temporarily Exhausted**: The Gemini API request quota has been reached "
        "(RPM/RPD limit). To protect your API quota budget, no automatic retries were performed.\n\n"
        "Here is the verified on-chain analysis retrieved directly from your current graph data:\n\n"
        + fallback_res.response
    )
    return CopilotChatResponse(
        response=clean_message,
        citations=fallback_res.citations,
        suggested_prompts=fallback_res.suggested_prompts,
        tools_used=fallback_res.tools_used,
        model="gemini-quota-exhausted",
        gemini_calls_count=calls_made,
    )



def _extract_citations(
    text: str, investigation_id: str, trace: dict[str, Any] | None
) -> list[Citation]:
    """Scan response text and trace data to extract interactive node, tx, and VASP citations."""
    if not trace:
        return []

    citations: list[Citation] = []
    seen_values: set[str] = set()

    nodes = (trace.get("graph") or {}).get("nodes") or []
    edges = (trace.get("graph") or {}).get("edges") or []
    candidates = trace.get("candidates") or []

    # 1. Match wallet addresses
    for node in nodes:
        addr = node.get("address")
        if not addr or addr in seen_values:
            continue
        if addr in text or (len(addr) > 10 and (addr[:8] in text or addr[-8:] in text)):
            short_label = f"Wallet {addr[:6]}...{addr[-4:]}"
            citations.append(Citation(type="node", value=addr, label=short_label))
            seen_values.add(addr)

    # 2. Match transaction hashes
    for edge in edges:
        tx_hash = edge.get("tx_hash")
        if not tx_hash or tx_hash in seen_values:
            continue
        if tx_hash in text or (len(tx_hash) > 12 and (tx_hash[:8] in text or tx_hash[-8:] in text)):
            short_label = f"Tx {tx_hash[:6]}...{tx_hash[-4:]}"
            citations.append(Citation(type="transaction", value=tx_hash, label=short_label))
            seen_values.add(tx_hash)

    # 3. Match candidate VASPs
    for c in candidates:
        exchange = c.get("exchange")
        if not exchange or exchange in seen_values:
            continue
        if exchange.lower() in text.lower():
            citations.append(Citation(type="vasp", value=exchange, label=f"VASP: {exchange}"))
            seen_values.add(exchange)

    return citations[:8]


def _build_suggested_prompts(trace: dict[str, Any] | None) -> list[str]:
    """Generate dynamic forensic follow-up suggestions based on trace state."""
    if not trace:
        return [
            "Explain the current investigation",
            "Why is this VASP candidate identified?",
            "Trace the flow of funds",
            "Check for mixer or obfuscation behavior",
        ]

    candidates = trace.get("candidates") or []
    has_mixer = any(c.get("mixer_obscured") for c in candidates)
    top_candidate = candidates[0].get("exchange") if candidates else None

    suggestions = [
        "Explain the overall investigation summary and fund flow",
    ]
    if top_candidate:
        suggestions.append(f"Why is {top_candidate} the primary VASP candidate?")
    suggestions.append("Trace the chronological transaction path step-by-step")
    if has_mixer:
        suggestions.append("Explain the mixer obfuscation detected in this path")
    else:
        suggestions.append("Check if any mixer or peeling chains were detected")
    suggestions.append("What subpoena or compliance actions should investigators take next?")

    return suggestions[:5]


def _rule_based_forensic_fallback(
    req: CopilotChatRequest,
    trace: dict[str, Any] | None,
    executed_tools: list[str],
    error_reason: str = "",
) -> CopilotChatResponse:
    """Deterministic, high-accuracy forensic assistant fallback if Gemini API is unreachable or unconfigured."""
    inv_id = req.investigation_id
    summary = get_investigation_summary(inv_id)
    executed_tools.append("get_investigation_summary")

    user_q = req.message.lower()
    response_lines: list[str] = []

    if not trace or summary.get("status") == "error":
        response_lines.append(
            f"**Forensic Notice**: Investigation `{inv_id}` trace data is currently being populated or unavailable."
        )
        response_lines.append(
            "Please ensure a trace has been initiated on the source wallet before querying detailed graph relationships."
        )
        return CopilotChatResponse(
            response="\n\n".join(response_lines),
            citations=[],
            suggested_prompts=_build_suggested_prompts(None),
            tools_used=executed_tools,
            model="forensic-fallback",
        )

    # 1. Summary / Overview question
    if any(k in user_q for k in ["summary", "overview", "explain", "what is this", "tell me"]):
        response_lines.append("### 🔍 Forensic Investigation Summary")
        response_lines.append(
            f"- **Source Wallet**: `{summary.get('source_wallet')}`\n"
            f"- **Active Graph**: {summary.get('total_nodes')} nodes, {summary.get('total_edges')} transactions traced across {summary.get('tracing_depth_hops')} hops.\n"
            f"- **Total Volume Traced**: {summary.get('total_volume_btc')} BTC\n"
            f"- **Top VASP Identified**: **{summary.get('top_vasp_candidate')}** ({summary.get('attribution_confidence')}% confidence, `{summary.get('attribution_kind')}`)\n"
            f"- **Risk Classification**: `{summary.get('risk_classification')}` (Score: {summary.get('overall_risk_score')}/100)\n"
            f"- **Mixer Status**: {'⚠️ Obfuscated' if summary.get('mixer_obscured') else '✅ No tumbler signatures detected'}"
        )

    # 2. VASP / Attribution question
    elif any(k in user_q for k in ["vasp", "exchange", "candidate", "why", "who"]):
        attributions = get_vasp_attributions(inv_id)
        executed_tools.append("get_vasp_attributions")
        response_lines.append("### 🏛️ VASP Attribution Assessment")
        candidates = attributions.get("candidates") or []
        if candidates:
            top = candidates[0]
            response_lines.append(
                f"The primary candidate is **{top.get('exchange')}** at deposit cluster `{top.get('address')}`.\n"
                f"- **Attribution Confidence**: {top.get('confidence_percent')}%\n"
                f"- **Attribution Kind**: `{top.get('attribution_kind')}`\n"
                f"- **Hop Distance from Source**: {top.get('hop_distance')} hops\n"
                f"- **Mixer Obscuration**: {'Yes (Pathway ran through privacy tumbler)' if top.get('mixer_obscured') else 'No direct tumbler interference'}\n\n"
                "*Note: Attribution confidence reflects the statistical certainty of cluster membership, which is distinct from the source wallet's risk score.*"
            )
        else:
            response_lines.append("No definitive VASP deposit clusters were identified within the configured hop limit.")

    # 3. Path / Flow question
    elif any(k in user_q for k in ["path", "flow", "trace", "hop", "step"]):
        path = get_transaction_path(inv_id)
        executed_tools.append("get_transaction_path")
        response_lines.append("### ⛓️ Chronological Transaction Path")
        hops = path.get("hops") or []
        if hops:
            for h in hops:
                response_lines.append(
                    f"**Hop {h.get('hop_step')}**: `{h.get('from_wallet')}` ➔ `{h.get('to_wallet')}`\n"
                    f"  - Tx Hash: `{h.get('tx_hash')}`\n"
                    f"  - Value: {h.get('value_btc')} BTC | Timestamp: {h.get('timestamp') or 'N/A'}"
                )
        else:
            response_lines.append("No active transaction path identified from the current source node.")

    # 4. Mixer / Obfuscation question
    elif any(k in user_q for k in ["mixer", "tumbler", "peel", "obfuscat"]):
        mixer = get_mixer_analysis(inv_id)
        executed_tools.append("get_mixer_analysis")
        response_lines.append("### 🌪️ Mixer & Obfuscation Analysis")
        response_lines.append(
            f"- **Tumbler Detection**: {mixer.get('findings')}\n"
            f"- **Mixer Flagged Path**: {mixer.get('mixer_obscured_path')}\n"
            f"- **High Fan-Out Relays**: {len(mixer.get('high_fanout_nodes', []))} detected"
        )

    # 5. General response
    else:
        risk = get_risk_analysis(inv_id)
        executed_tools.append("get_risk_analysis")
        response_lines.append("### 📋 Forensic Analysis & Next Steps")
        response_lines.append(
            f"Analysis of source wallet `{summary.get('source_wallet')}` indicates risk classification `{risk.get('risk_classification')}` "
            f"with top VASP outflow candidate **{summary.get('top_vasp_candidate')}**.\n\n"
            "**Recommended Investigative Next Steps**:\n"
            "1. Issue preservation letter / 2703(d) request to the identified VASP for KYC on deposit cluster.\n"
            "2. Audit intermediate relay timestamps for automated peeling chain sweeps.\n"
            "3. Expand neighboring cluster radius if secondary fan-outs exist."
        )

    if error_reason:
        response_lines.append(f"\n*(Note: Generated via internal forensic tools. Gemini API status: {error_reason})*")

    full_text = "\n\n".join(response_lines)
    citations = _extract_citations(full_text, inv_id, trace)

    return CopilotChatResponse(
        response=full_text,
        citations=citations,
        suggested_prompts=_build_suggested_prompts(trace),
        tools_used=list(set(executed_tools)),
        model="forensic-rule-engine",
    )


def query_copilot(req: CopilotChatRequest) -> CopilotChatResponse:
    """Execute a Copilot query using Gemini with controlled function tools and fallbacks."""
    # 1. Cache explicit trace context if provided
    if req.trace_context and isinstance(req.trace_context, dict):
        cache_trace_result(req.investigation_id, req.trace_context)

    # 2. Check deduplication query cache (Rule 7 & 10)
    norm_msg = " ".join(req.message.strip().lower().split())
    cache_key = f"{req.investigation_id}:{norm_msg}"
    now = time.time()
    with _QUERY_CACHE_LOCK:
        if cache_key in _QUERY_CACHE:
            cached_resp, cached_time = _QUERY_CACHE[cache_key]
            if now - cached_time < QUERY_CACHE_TTL_SECONDS:
                logger.info(
                    "[Copilot Deduplication Cache Hit] Query '%s' for investigation %s served from cache with 0 Gemini API calls.",
                    req.message[:60],
                    req.investigation_id,
                )
                return CopilotChatResponse(
                    response=cached_resp.response,
                    citations=cached_resp.citations,
                    suggested_prompts=cached_resp.suggested_prompts,
                    tools_used=cached_resp.tools_used,
                    model=cached_resp.model,
                    gemini_calls_count=0,
                )

    trace = resolve_trace_data(req.investigation_id, req.trace_context)
    bound_tools, executed_tools = build_tool_suite(req.investigation_id)

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    model_name = os.getenv("GEMINI_MODEL", "gemini-3.6-flash").strip()

    if not api_key:
        logger.info(
            "[Investigator Copilot] GEMINI_API_KEY not configured. Using deterministic forensic rule engine (0 Gemini API calls)."
        )
        return _rule_based_forensic_fallback(
            req, trace, executed_tools, error_reason="GEMINI_API_KEY not configured"
        )

    tracker = GeminiRequestTracker()
    try:
        # Rule 5: Do not automatically retry 429 errors (attempts=1).
        # RequestTracker logs exact count without logging the API key.
        http_client = httpx.Client(event_hooks={"request": [tracker.on_request]})
        http_options = types.HttpOptions(
            httpx_client=http_client,
            retry_options=types.HttpRetryOptions(attempts=1),
        )
        client = genai.Client(api_key=api_key, http_options=http_options)

        # Build conversation history for GenAI SDK
        gemini_history: list[types.Content] = []
        for msg in req.history:
            role = "user" if msg.role == "user" else "model"
            gemini_history.append(
                types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=msg.content)],
                )
            )

        # Rule 4 & 8: Function/tool calling must not create an unnecessary loop.
        # maximum_remote_calls=2 limits AFC to strictly at most 1 tool execution turn (2 remote calls max).
        config = types.GenerateContentConfig(
            system_instruction=COPILOT_SYSTEM_INSTRUCTION,
            tools=bound_tools,
            temperature=0.15,
            automatic_function_calling=types.AutomaticFunctionCallingConfig(
                maximum_remote_calls=2,
            ),
        )

        chat = client.chats.create(
            model=model_name,
            config=config,
            history=gemini_history if gemini_history else None,
        )

        # Rule 9: Do not send entire investigation to Gemini; send concise metadata header
        user_prompt = req.message
        if trace and trace.get("source"):
            graph = trace.get("graph") or {}
            node_cnt = len(graph.get("nodes") or [])
            edge_cnt = len(graph.get("edges") or [])
            user_prompt = (
                f"[Investigation Case: {req.investigation_id} | Source: {trace.get('source')} | Graph: {node_cnt} nodes, {edge_cnt} edges]\n"
                f"Question: {req.message}"
            )

        response = chat.send_message(user_prompt)
        response_text = response.text or ""

        if not response_text:
            return _rule_based_forensic_fallback(
                req, trace, executed_tools, error_reason="Empty response from model"
            )

        citations = _extract_citations(response_text, req.investigation_id, trace)
        suggested_prompts = _build_suggested_prompts(trace)

        chat_response = CopilotChatResponse(
            response=response_text,
            citations=citations,
            suggested_prompts=suggested_prompts,
            tools_used=list(set(executed_tools)),
            model=model_name,
            gemini_calls_count=tracker.call_count,
        )

        # Cache response for duplicate prevention (Rule 7)
        with _QUERY_CACHE_LOCK:
            _QUERY_CACHE[cache_key] = (chat_response, time.time())

        logger.info(
            "[Investigator Copilot] Message: '%s' | Investigation: '%s' | Gemini API calls made: %d | Tools used: %s | Model: %s",
            req.message[:80],
            req.investigation_id,
            tracker.call_count,
            executed_tools,
            model_name,
        )

        return chat_response

    except Exception as exc:
        err_str = str(exc)
        is_429 = (
            "429" in err_str
            or "RESOURCE_EXHAUSTED" in err_str
            or "quota" in err_str.lower()
        )
        if is_429:
            logger.warning(
                "[Gemini Quota Exceeded] HTTP 429 ResourceExhausted: Gemini API free-tier quota reached. Zero automatic retries performed. Gemini calls made: %d",
                tracker.call_count,
            )
            fallback_res = _quota_exhausted_fallback(
                req, trace, executed_tools, calls_made=tracker.call_count
            )
            with _QUERY_CACHE_LOCK:
                _QUERY_CACHE[cache_key] = (fallback_res, time.time())
            return fallback_res

        logger.error(
            "[Investigator Copilot Error] %s. Gemini calls made: %d. Falling back to forensic engine.",
            err_str,
            tracker.call_count,
        )
        fallback_res = _rule_based_forensic_fallback(
            req, trace, executed_tools, error_reason=err_str
        )
        with _QUERY_CACHE_LOCK:
            _QUERY_CACHE[cache_key] = (fallback_res, time.time())
        return fallback_res


