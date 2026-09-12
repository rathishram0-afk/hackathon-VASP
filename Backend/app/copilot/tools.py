"""Controlled forensic investigation tools for the Investigator Copilot.

Gemini interacts with the investigation state ONLY through these functions.
Direct arbitrary database or external API access is strictly forbidden.
"""
from __future__ import annotations

from typing import Any, Callable
from Backend.app.copilot.context import resolve_trace_data, get_cached_trace_result
from Backend.app.risk import classify_trace_result
from Backend.app import investigations_db as db


def _get_active_trace(investigation_id: str) -> dict[str, Any] | None:
    trace = resolve_trace_data(investigation_id)
    if not trace:
        # Fallback to any recent cached trace
        from Backend.app.copilot.context import _TRACE_CACHE, _CACHE_LOCK
        with _CACHE_LOCK:
            if _TRACE_CACHE:
                return next(iter(_TRACE_CACHE.values()))
    return trace


def get_investigation_summary(investigation_id: str = "") -> dict[str, Any]:
    """Retrieve high-level summary metrics of the current cryptocurrency investigation, including node count, volume, top VASP, and risk classification.
    
    Args:
        investigation_id: Optional ID of the investigation.
    """
    trace = _get_active_trace(investigation_id)
    if not trace:
        return {
            "status": "error",
            "message": "Investigation not found or no trace data available.",
        }

    graph = trace.get("graph") or {}
    nodes = graph.get("nodes") or []
    edges = graph.get("edges") or []
    candidates = trace.get("candidates") or []
    source = trace.get("source", "Unknown")

    total_volume = sum(float(e.get("value_btc") or 0.0) for e in edges)
    risk_score, classification = classify_trace_result(trace)
    top_candidate = candidates[0] if candidates else None

    return {
        "status": "success",
        "investigation_id": investigation_id,
        "source_wallet": source,
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "tracing_depth_hops": max([n.get("hop_distance", 0) for n in nodes], default=0),
        "total_volume_btc": round(total_volume, 8),
        "top_vasp_candidate": top_candidate.get("exchange") if top_candidate else "None identified",
        "attribution_confidence": round(float(top_candidate.get("confidence", 0.0)) * 100, 2)
        if top_candidate
        else 0.0,
        "attribution_kind": top_candidate.get("kind") if top_candidate else "none",
        "mixer_obscured": bool(top_candidate.get("mixer_obscured")) if top_candidate else False,
        "risk_classification": classification,
        "overall_risk_score": risk_score,
        "truncated": bool(trace.get("truncated", False)),
    }


def get_wallet_details(address: str, investigation_id: str = "") -> dict[str, Any]:
    """Inspect specific wallet node details, including hop distance, inbound/outbound flows, and forensic role.
    
    Args:
        address: Blockchain wallet address to inspect.
        investigation_id: Optional ID of the investigation.
    """
    trace = _get_active_trace(investigation_id)
    if not trace:
        return {"status": "error", "message": "Investigation not found."}

    graph = trace.get("graph") or {}
    nodes = graph.get("nodes") or []
    edges = graph.get("edges") or []
    candidates = trace.get("candidates") or []
    source = trace.get("source", "")

    target_node = next((n for n in nodes if n.get("address") == address), None)
    if not target_node:
        return {
            "status": "not_found",
            "message": f"Wallet address {address} is not present in the current investigation graph.",
        }

    inbound = [e for e in edges if e.get("dst") == address]
    outbound = [e for e in edges if e.get("src") == address]

    inbound_vol = sum(float(e.get("value_btc") or 0.0) for e in inbound)
    outbound_vol = sum(float(e.get("value_btc") or 0.0) for e in outbound)

    role = "neighboring_connected_node"
    if address == source:
        role = "source_wallet"
    elif any(c.get("address") == address for c in candidates):
        role = "vasp_candidate_cluster"
    else:
        for c in candidates:
            if address in (c.get("path") or []):
                role = "intermediate_relay_wallet"
                break

    matching_candidate = next((c for c in candidates if c.get("address") == address), None)

    return {
        "status": "success",
        "address": address,
        "hop_distance": target_node.get("hop_distance", 0),
        "tag": target_node.get("tag"),
        "forensic_role": role,
        "inbound_tx_count": len(inbound),
        "inbound_volume_btc": round(inbound_vol, 8),
        "outbound_tx_count": len(outbound),
        "outbound_volume_btc": round(outbound_vol, 8),
        "candidate_attribution": {
            "exchange": matching_candidate.get("exchange"),
            "confidence": round(float(matching_candidate.get("confidence", 0.0)) * 100, 2),
            "kind": matching_candidate.get("kind"),
            "mixer_obscured": matching_candidate.get("mixer_obscured", False),
        }
        if matching_candidate
        else None,
        "scoring_status": "Scored (Active Trace Path / Candidate)"
        if role != "neighboring_connected_node"
        else "Unscored (Neighboring Context Node)",
    }


def get_transaction_details(transaction_hash: str, investigation_id: str = "") -> dict[str, Any]:
    """Retrieve forensic details of a specific transaction by its hash.
    
    Args:
        transaction_hash: Blockchain transaction hash to look up.
        investigation_id: Optional ID of the investigation.
    """
    trace = _get_active_trace(investigation_id)
    if not trace:
        return {"status": "error", "message": "Investigation not found."}

    edges = (trace.get("graph") or {}).get("edges") or []
    target_edge = next(
        (
            e
            for e in edges
            if e.get("tx_hash") and (e.get("tx_hash") == transaction_hash or transaction_hash in e.get("tx_hash"))
        ),
        None,
    )

    if not target_edge:
        return {
            "status": "not_found",
            "message": f"Transaction hash {transaction_hash} was not found in the investigated graph.",
        }

    return {
        "status": "success",
        "tx_hash": target_edge.get("tx_hash"),
        "from_address": target_edge.get("src"),
        "to_address": target_edge.get("dst"),
        "value_btc": target_edge.get("value_btc"),
        "timestamp": target_edge.get("timestamp"),
    }


def get_transaction_path(investigation_id: str = "") -> dict[str, Any]:
    """Retrieve the primary chronological transaction path from the source wallet to the destination VASP.
    
    Args:
        investigation_id: Optional ID of the investigation.
    """
    trace = _get_active_trace(investigation_id)
    if not trace:
        return {"status": "error", "message": "Investigation not found."}

    candidates = trace.get("candidates") or []
    edges = (trace.get("graph") or {}).get("edges") or []

    if not candidates:
        return {
            "status": "success",
            "path_available": False,
            "message": "No VASP candidate paths identified in trace results.",
            "hops": [],
        }

    top_candidate = candidates[0]
    path_addresses: list[str] = top_candidate.get("path") or []

    hops = []
    for i in range(len(path_addresses) - 1):
        u, v = path_addresses[i], path_addresses[i + 1]
        matching_edge = next(
            (e for e in edges if e.get("src") == u and e.get("dst") == v),
            {"src": u, "dst": v, "tx_hash": "Unknown", "value_btc": None, "timestamp": None},
        )
        hops.append(
            {
                "hop_step": i + 1,
                "from_wallet": u,
                "to_wallet": v,
                "tx_hash": matching_edge.get("tx_hash"),
                "value_btc": matching_edge.get("value_btc"),
                "timestamp": matching_edge.get("timestamp"),
            }
        )

    return {
        "status": "success",
        "path_available": True,
        "destination_vasp": top_candidate.get("exchange"),
        "destination_address": top_candidate.get("address"),
        "total_hops": len(hops),
        "hops": hops,
    }


def get_vasp_attributions(investigation_id: str = "") -> dict[str, Any]:
    """List all candidate Virtual Asset Service Providers (VASPs) identified during the trace.
    
    Args:
        investigation_id: Optional ID of the investigation.
    """
    trace = _get_active_trace(investigation_id)
    if not trace:
        return {"status": "error", "message": "Investigation not found."}

    candidates = trace.get("candidates") or []
    formatted = []
    for c in candidates:
        formatted.append(
            {
                "exchange": c.get("exchange"),
                "address": c.get("address"),
                "confidence_percent": round(float(c.get("confidence", 0.0)) * 100, 2),
                "hop_distance": c.get("hop_distance"),
                "attribution_kind": c.get("kind"),
                "mixer_obscured": bool(c.get("mixer_obscured")),
                "path_length": len(c.get("path") or []),
            }
        )

    return {
        "status": "success",
        "candidates_count": len(formatted),
        "candidates": formatted,
    }


def get_evidence(investigation_id: str = "") -> dict[str, Any]:
    """Retrieve supporting on-chain evidence signals and attribution justifications.
    
    Args:
        investigation_id: Optional ID of the investigation.
    """
    trace = _get_active_trace(investigation_id)
    if not trace:
        return {"status": "error", "message": "Investigation not found."}

    nodes = (trace.get("graph") or {}).get("nodes") or []
    candidates = trace.get("candidates") or []

    signals = []
    tagged_nodes = [n for n in nodes if n.get("tag")]
    for tn in tagged_nodes:
        signals.append(
            {
                "category": "DIRECT_TAG_MATCH",
                "wallet": tn.get("address"),
                "exchange": tn["tag"].get("exchange"),
                "label": tn["tag"].get("label"),
                "hop_distance": tn.get("hop_distance"),
            }
        )

    for c in candidates:
        signals.append(
            {
                "category": "CANDIDATE_ATTRIBUTION",
                "exchange": c.get("exchange"),
                "destination_wallet": c.get("address"),
                "confidence_percent": round(float(c.get("confidence", 0.0)) * 100, 2),
                "kind": c.get("kind"),
                "hop_distance": c.get("hop_distance"),
                "mixer_obscured": bool(c.get("mixer_obscured")),
            }
        )

    db_evidence = []
    try:
        if investigation_id:
            db_evidence = db.list_evidence(investigation_id)
    except Exception:
        pass

    return {
        "status": "success",
        "signals_count": len(signals),
        "evidence_signals": signals,
        "case_file_evidence": db_evidence,
    }


def get_risk_analysis(investigation_id: str = "") -> dict[str, Any]:
    """Retrieve comprehensive risk scoring and AML/CFT categorization for the investigation.
    
    Args:
        investigation_id: Optional ID of the investigation.
    """
    trace = _get_active_trace(investigation_id)
    if not trace:
        return {"status": "error", "message": "Investigation not found."}

    risk_score, classification = classify_trace_result(trace)
    candidates = trace.get("candidates") or []
    top_candidate = candidates[0] if candidates else None

    return {
        "status": "success",
        "overall_risk_score": risk_score,
        "risk_classification": classification,
        "source_wallet_role": "Investigated Outflow Origin",
        "relay_hop_depth": top_candidate.get("hop_distance") if top_candidate else 0,
        "attribution_confidence_percent": round(float(top_candidate.get("confidence", 0.0)) * 100, 2)
        if top_candidate
        else 0.0,
        "metric_clarification": (
            "Attribution confidence measures statistical certainty of the identified VASP deposit cluster. "
            "It is distinct from the wallet's illicit risk score."
        ),
    }


def get_mixer_analysis(investigation_id: str = "") -> dict[str, Any]:
    """Evaluate transaction patterns for mixer, tumbler, peeling chains, or privacy pool obfuscation.
    
    Args:
        investigation_id: Optional ID of the investigation.
    """
    trace = _get_active_trace(investigation_id)
    if not trace:
        return {"status": "error", "message": "Investigation not found."}

    candidates = trace.get("candidates") or []
    mixer_flagged = any(bool(c.get("mixer_obscured")) for c in candidates)

    edges = (trace.get("graph") or {}).get("edges") or []

    out_degrees: dict[str, int] = {}
    for e in edges:
        src = e.get("src")
        if src:
            out_degrees[src] = out_degrees.get(src, 0) + 1

    fanout_suspects = [addr for addr, count in out_degrees.items() if count >= 5]

    return {
        "status": "success",
        "mixer_obscured_path": mixer_flagged,
        "high_fanout_nodes": fanout_suspects,
        "findings": (
            "Mixer or tumbler obfuscation signature detected along candidate pathway."
            if mixer_flagged
            else "No mixer or tumbler obfuscation pattern identified in the investigated graph."
        ),
    }


def build_tool_suite(investigation_id: str) -> tuple[list[Callable], list[str]]:
    """Create a suite of closed tool functions bound to the given investigation_id,
    with an audit log tracking which tools were executed."""
    executed_tools: list[str] = []

    def tool_get_investigation_summary() -> dict[str, Any]:
        """Retrieve high-level summary metrics of the current cryptocurrency investigation, including node count, volume, top VASP, and risk classification."""
        executed_tools.append("get_investigation_summary")
        return get_investigation_summary(investigation_id)

    def tool_get_wallet_details(address: str) -> dict[str, Any]:
        """Inspect specific wallet node details, including hop distance, inbound/outbound flows, and forensic role."""
        executed_tools.append("get_wallet_details")
        return get_wallet_details(address, investigation_id)

    def tool_get_transaction_details(transaction_hash: str) -> dict[str, Any]:
        """Retrieve forensic details of a specific transaction by its hash."""
        executed_tools.append("get_transaction_details")
        return get_transaction_details(transaction_hash, investigation_id)

    def tool_get_transaction_path() -> dict[str, Any]:
        """Retrieve the primary chronological transaction path from the source wallet to the destination VASP."""
        executed_tools.append("get_transaction_path")
        return get_transaction_path(investigation_id)

    def tool_get_vasp_attributions() -> dict[str, Any]:
        """List all candidate Virtual Asset Service Providers (VASPs) identified during the trace."""
        executed_tools.append("get_vasp_attributions")
        return get_vasp_attributions(investigation_id)

    def tool_get_evidence() -> dict[str, Any]:
        """Retrieve supporting on-chain evidence signals and attribution justifications."""
        executed_tools.append("get_evidence")
        return get_evidence(investigation_id)

    def tool_get_risk_analysis() -> dict[str, Any]:
        """Retrieve comprehensive risk scoring and AML/CFT categorization for the investigation."""
        executed_tools.append("get_risk_analysis")
        return get_risk_analysis(investigation_id)

    def tool_get_mixer_analysis() -> dict[str, Any]:
        """Evaluate transaction patterns for mixer, tumbler, peeling chains, or privacy pool obfuscation."""
        executed_tools.append("get_mixer_analysis")
        return get_mixer_analysis(investigation_id)

    tool_list = [
        tool_get_investigation_summary,
        tool_get_wallet_details,
        tool_get_transaction_details,
        tool_get_transaction_path,
        tool_get_vasp_attributions,
        tool_get_evidence,
        tool_get_risk_analysis,
        tool_get_mixer_analysis,
    ]

    return tool_list, executed_tools
