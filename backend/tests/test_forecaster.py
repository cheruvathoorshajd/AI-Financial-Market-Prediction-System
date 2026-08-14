"""
Tests for the experimental LSTM forecaster.

These are light integration checks: that the model trains and returns a
well-formed result with its *honest* backtest attached, that ranking is ordered,
and that thin data degrades gracefully. Training a tiny LSTM on ~180 points is a
few seconds on CPU, so we keep the covered universe small.
"""
import pytest

from app.ml import forecaster

torch = pytest.importorskip("torch")  # skip cleanly if torch isn't installed


def test_too_short_series_returns_none():
    # Below the window + holdout requirement -> no forecast, no crash.
    assert forecaster._train_and_forecast([100.0, 101.0, 102.0]) is None


def test_forecast_symbol_shape_and_honest_metrics():
    result = forecaster.forecast_symbol("AAPL")
    assert result is not None
    # Core forecast fields.
    for key in ("symbol", "forecast_return_pct", "forecast_price", "last_price", "verdict"):
        assert key in result
    assert result["model"] == "LSTM"

    # The honesty contract: a real backtest against the naive baseline is present.
    bt = result["backtest"]
    for key in ("model_mae_pct", "naive_mae_pct", "skill_vs_naive_pct", "directional_accuracy"):
        assert key in bt
    assert 0.0 <= bt["directional_accuracy"] <= 1.0
    # Verdict must be honest about whether it beat naive.
    assert "naive" in result["verdict"]


def test_ranked_outlook_is_ordered_and_labelled():
    out = forecaster.ranked_outlook(limit=3)
    assert out["available"] is True
    assert out["model"] == "LSTM"
    assert out["honesty"] and "naive" in out["honesty"]
    returns = [r["forecast_return_pct"] for r in out["ranked"]]
    assert returns == sorted(returns, reverse=True)  # ranked best-expected first
