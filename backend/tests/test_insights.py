"""
Tests for the grounded insights layer. With no ANTHROPIC_API_KEY set (the test
default), the assistant must degrade to the honest heuristic path — never fake
an LLM answer, always carry the not-advice disclaimer, and expose the real
signals it reasoned over.
"""
from app.ml import insights_service


def test_asset_insight_falls_back_to_heuristic_without_key(monkeypatch):
    monkeypatch.setattr(insights_service.settings, "ANTHROPIC_API_KEY", "")
    result = insights_service.asset_insight("AAPL")

    assert result is not None
    assert result["method"] == "heuristic"  # honestly labelled, not "llm"
    assert result["observations"], "should expose the real signals it looked at"
    assert result["disclaimer"].startswith("This is an explanation")
    assert "confidence" in result and "level" in result["confidence"]


def test_asset_insight_unknown_symbol_returns_none():
    assert insights_service.asset_insight("NOTAREALTICKER") is None


def test_answer_question_fallback_is_honest_and_grounded(monkeypatch):
    monkeypatch.setattr(insights_service.settings, "ANTHROPIC_API_KEY", "")
    result = insights_service.answer_question("what's moving today?")

    assert result["method"] == "heuristic"
    assert result["enough"] is False  # can't write a free-form answer without the model
    assert result["grounding"], "should still surface the data it would reason over"
    assert "not financial advice" in result["disclaimer"].lower()


def test_no_recommendation_language_in_fallback(monkeypatch):
    monkeypatch.setattr(insights_service.settings, "ANTHROPIC_API_KEY", "")
    result = insights_service.asset_insight("NVDA")
    blob = " ".join(
        [result["headline"], result["summary"], result["reasoning"], result["limits"]]
    ).lower()
    for banned in ("strong buy", "buy now", "you should sell", "sell now", "price target"):
        assert banned not in blob
