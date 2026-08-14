"""
Tests for the grounded insights layer. The assistant is heuristic-only: it must
expose the real signals it reasoned over, always carry the not-advice
disclaimer, and never emit recommendation language.
"""
from app.ml import insights_service


def test_asset_insight_is_heuristic_and_grounded():
    result = insights_service.asset_insight("AAPL")

    assert result is not None
    assert result["method"] == "heuristic"  # honestly labelled: a signals reading
    assert result["observations"], "should expose the real signals it looked at"
    assert result["disclaimer"].startswith("This is an explanation")
    assert "confidence" in result and "level" in result["confidence"]


def test_asset_insight_unknown_symbol_returns_none():
    assert insights_service.asset_insight("NOTAREALTICKER") is None


def test_answer_question_is_honest_and_grounded():
    result = insights_service.answer_question("what's moving today?")

    assert result["method"] == "heuristic"
    assert result["enough"] is False  # surfaces data, doesn't write a free-form answer
    assert result["grounding"], "should still surface the data it would reason over"
    assert "not financial advice" in result["disclaimer"].lower()


def test_no_recommendation_language():
    result = insights_service.asset_insight("NVDA")
    blob = " ".join(
        [result["headline"], result["summary"], result["reasoning"], result["limits"]]
    ).lower()
    for banned in ("strong buy", "buy now", "you should sell", "sell now", "price target"):
        assert banned not in blob


# --- "best performer" / model-outlook routing -------------------------------
_FAKE_OUTLOOK = {
    "model": "LSTM",
    "available": True,
    "horizon": "next trading day",
    "ranked": [
        {
            "symbol": "NVDA", "name": "NVIDIA Corporation", "last_price": 178.0,
            "forecast_return_pct": 1.20, "forecast_price": 180.1,
            "directional_accuracy": 0.60, "skill_vs_naive_pct": 5.0,
        }
    ],
    "avg_skill_vs_naive_pct": 2.0,
    "honesty": "barely beats a naive guess",
    "disclaimer": "not advice",
}


def test_ranking_uses_model_outlook_when_available(monkeypatch):
    monkeypatch.setattr(insights_service.forecaster, "ranked_outlook", lambda limit=6: _FAKE_OUTLOOK)
    r = insights_service.answer_question("which stock is the best pick right now?")

    assert r["rankings"], "should return a ranked list"
    assert r["rankings"][0]["title"] == "LSTM next-day outlook"
    assert "NVDA" in r["headline"]
    assert r["method"] == "heuristic"
    assert "not financial advice" in r["disclaimer"].lower()


def test_ranking_long_horizon_is_honest_about_the_model(monkeypatch):
    # Model unavailable -> must degrade to a labelled backward-looking trend,
    # and a quarter-ahead question must earn the explicit caveat.
    monkeypatch.setattr(
        insights_service.forecaster, "ranked_outlook",
        lambda limit=6: {"available": False, "ranked": []},
    )
    r = insights_service.answer_question("best performing stock next quarter 4?")

    titles = [x["title"].lower() for x in r["rankings"]]
    assert any("trend" in t for t in titles), "should show a backward-looking trend"
    assert "quarter" in r["limits"].lower(), "must say it can't project a quarter"
    assert r["method"] == "heuristic"


def test_plain_question_is_not_treated_as_ranking():
    r = insights_service.answer_question("what's moving today?")
    assert r["rankings"] == []
