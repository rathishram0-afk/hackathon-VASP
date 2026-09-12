"""Unit and integration tests for the VASP Trace Investigator Copilot."""
import pytest
from fastapi.testclient import TestClient

from Backend.app.main import app
from Backend.app.copilot.context import cache_trace_result
from Backend.app.copilot.tools import (
    get_investigation_summary,
    get_wallet_details,
    get_transaction_details,
    get_transaction_path,
    get_vasp_attributions,
    get_evidence,
    get_risk_analysis,
    get_mixer_analysis,
)
from Backend.app.copilot.service import query_copilot
from Backend.app.copilot.schemas import CopilotChatRequest, ChatMessage


SAMPLE_TRACE = {
    "source": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "truncated": False,
    "graph": {
        "nodes": [
            {"address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", "hop_distance": 0, "tag": None},
            {"address": "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy", "hop_distance": 1, "tag": None},
            {"address": "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq", "hop_distance": 2, "tag": {"exchange": "Binance", "label": "Hot Wallet"}},
            {"address": "1NeighborWalletContextOnly", "hop_distance": 1, "tag": None},
        ],
        "edges": [
            {
                "src": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
                "dst": "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
                "tx_hash": "txhash_step_1_abc1234567890",
                "value_btc": 2.5,
                "timestamp": "2026-03-01T10:00:00Z",
            },
            {
                "src": "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
                "dst": "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
                "tx_hash": "txhash_step_2_def0987654321",
                "value_btc": 2.49,
                "timestamp": "2026-03-01T11:00:00Z",
            },
            {
                "src": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
                "dst": "1NeighborWalletContextOnly",
                "tx_hash": "txhash_neighbor_unrelated",
                "value_btc": 0.01,
                "timestamp": "2026-03-01T09:00:00Z",
            },
        ],
    },
    "candidates": [
        {
            "exchange": "Binance",
            "address": "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
            "confidence": 0.95,
            "hop_distance": 2,
            "path": [
                "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
                "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
                "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
            ],
            "kind": "direct_hit",
            "mixer_obscured": False,
        }
    ],
}


@pytest.fixture(autouse=True)
def setup_trace():
    cache_trace_result("test-inv-001", SAMPLE_TRACE)


def test_investigation_summary_tool():
    summary = get_investigation_summary("test-inv-001")
    assert summary["status"] == "success"
    assert summary["source_wallet"] == "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
    assert summary["total_nodes"] == 4
    assert summary["total_edges"] == 3
    assert summary["top_vasp_candidate"] == "Binance"
    assert summary["attribution_confidence"] == 95.0
    assert summary["overall_risk_score"] == 95.0
    assert summary["mixer_obscured"] is False


def test_wallet_details_tool_roles_and_scoring():
    # Source wallet
    src = get_wallet_details("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", "test-inv-001")
    assert src["forensic_role"] == "source_wallet"
    assert "Scored" in src["scoring_status"]

    # Intermediate wallet
    relay = get_wallet_details("3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy", "test-inv-001")
    assert relay["forensic_role"] == "intermediate_relay_wallet"
    assert "Scored" in relay["scoring_status"]

    # Neighboring wallet
    neighbor = get_wallet_details("1NeighborWalletContextOnly", "test-inv-001")
    assert neighbor["forensic_role"] == "neighboring_connected_node"
    assert "Unscored" in neighbor["scoring_status"]


def test_transaction_path_tool():
    path = get_transaction_path("test-inv-001")
    assert path["status"] == "success"
    assert path["path_available"] is True
    assert path["destination_vasp"] == "Binance"
    assert len(path["hops"]) == 2
    assert path["hops"][0]["tx_hash"] == "txhash_step_1_abc1234567890"
    assert path["hops"][1]["tx_hash"] == "txhash_step_2_def0987654321"


def test_vasp_attributions_tool():
    vasps = get_vasp_attributions("test-inv-001")
    assert vasps["status"] == "success"
    assert vasps["candidates_count"] == 1
    assert vasps["candidates"][0]["exchange"] == "Binance"
    assert vasps["candidates"][0]["confidence_percent"] == 95.0


def test_evidence_tool():
    evidence = get_evidence("test-inv-001")
    assert evidence["status"] == "success"
    assert len(evidence["evidence_signals"]) >= 1


def test_risk_analysis_separates_confidence_from_risk():
    risk = get_risk_analysis("test-inv-001")
    assert risk["status"] == "success"
    assert "distinct" in risk["metric_clarification"].lower()
    assert risk["attribution_confidence_percent"] == 95.0


def test_mixer_analysis_clean():
    mixer = get_mixer_analysis("test-inv-001")
    assert mixer["status"] == "success"
    assert mixer["mixer_obscured_path"] is False


def test_copilot_service_query():
    req = CopilotChatRequest(
        investigation_id="test-inv-001",
        message="Explain why Binance is the candidate VASP and trace the path",
        trace_context=SAMPLE_TRACE,
    )
    res = query_copilot(req)
    assert res.response
    assert "Binance" in res.response or "binance" in res.response.lower()
    assert len(res.suggested_prompts) > 0


def test_copilot_chat_endpoint():
    client = TestClient(app)
    response = client.post(
        "/copilot/chat",
        json={
            "investigation_id": "test-inv-001",
            "message": "Give me a forensic overview of this case",
            "trace_context": SAMPLE_TRACE,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "citations" in data
    assert "suggested_prompts" in data
    assert len(data["suggested_prompts"]) > 0
    assert "gemini_calls_count" in data


def test_copilot_deduplication_cache_prevents_duplicate_calls():
    """Verify that submitting the identical query twice within the TTL window returns
    from cache with 0 new Gemini API calls."""
    req = CopilotChatRequest(
        investigation_id="test-inv-001",
        message="Deduplication test question: explain the fund flow",
        trace_context=SAMPLE_TRACE,
    )
    # First call
    res1 = query_copilot(req)
    assert res1.response

    # Second identical call
    res2 = query_copilot(req)
    assert res2.response == res1.response
    # Deduplication cache guarantees 0 new Gemini API calls
    assert res2.gemini_calls_count == 0


def test_copilot_quota_exhausted_fallback():
    """Verify that when a 429 ResourceExhausted occurs, it cleanly returns the quota notice
    without crashing and provides verified on-chain graph data."""
    from unittest.mock import patch
    from Backend.app.copilot import service

    with patch.object(service, "genai") as mock_genai:
        # Simulate client raising 429
        mock_client = mock_genai.Client.return_value
        mock_chat = mock_client.chats.create.return_value
        mock_chat.send_message.side_effect = Exception("429 RESOURCE_EXHAUSTED: quota exceeded (RPM 5/5)")

        req = CopilotChatRequest(
            investigation_id="test-inv-quota-001",
            message="Unique query testing 429 handling: what is the risk score?",
            trace_context=SAMPLE_TRACE,
        )
        with patch.dict("os.environ", {"GEMINI_API_KEY": "fake_key_for_testing"}):
            res = query_copilot(req)

        assert "AI Quota Temporarily Exhausted" in res.response
        assert "Binance" in res.response or "Forensic Investigation Summary" in res.response
        assert res.model == "gemini-quota-exhausted"

