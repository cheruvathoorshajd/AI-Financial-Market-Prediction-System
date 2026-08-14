"""Tests for the transparent heuristic signals — the auditable core."""
from app.ml.signals import compute_signals, confidence_from_signals


def test_empty_or_short_series_yields_no_signals():
    assert compute_signals([]) == []
    assert compute_signals([100.0, 101.0]) == []


def test_rising_series_reads_as_upward_momentum():
    series = [100 + i for i in range(60)]  # strictly increasing
    signals = compute_signals(series)
    by_key = {s["key"]: s for s in signals}

    assert by_key["momentum"]["direction"] == "up"
    # Price sits above its 50-day average on a rising series.
    assert by_key["ma50"]["direction"] == "up"
    # RSI on a monotonic rise is very high (overbought).
    assert float(by_key["rsi"]["value"]) > 70
    # Last point is the max → top of the range.
    assert by_key["range"]["direction"] == "up"


def test_falling_series_reads_as_downward_momentum():
    series = [200 - i for i in range(60)]
    by_key = {s["key"]: s for s in compute_signals(series)}
    assert by_key["momentum"]["direction"] == "down"
    assert by_key["ma50"]["direction"] == "down"


def test_confidence_reflects_agreement():
    aligned = [
        {"key": "a", "label": "", "value": "", "reading": "", "direction": "up"},
        {"key": "b", "label": "", "value": "", "reading": "", "direction": "up"},
        {"key": "c", "label": "", "value": "", "reading": "", "direction": "up"},
    ]
    assert confidence_from_signals(aligned)["level"] == "moderate"

    mixed = [
        {"key": "a", "label": "", "value": "", "reading": "", "direction": "up"},
        {"key": "b", "label": "", "value": "", "reading": "", "direction": "down"},
    ]
    assert confidence_from_signals(mixed)["level"] == "low"

    neutral = [{"key": "a", "label": "", "value": "", "reading": "", "direction": "neutral"}]
    assert confidence_from_signals(neutral)["level"] == "low"
