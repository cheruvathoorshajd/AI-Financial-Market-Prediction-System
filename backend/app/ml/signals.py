"""
Transparent technical signals.

Every value here is a plain, auditable arithmetic computation over the price
history — momentum, moving averages, volatility, RSI, range position. These are
*heuristics*, and the app labels them as such. They are never presented as a
trained model or a prediction; they are the observable facts the insights layer
reasons over (and the assistant is grounded in exactly these numbers).
"""
from __future__ import annotations

from typing import List, Optional, TypedDict

import numpy as np


class Signal(TypedDict):
    key: str
    label: str
    value: str
    reading: str
    direction: str  # "up" | "down" | "neutral"


def _pct(a: float, b: float) -> float:
    return ((a - b) / b) * 100 if b else 0.0


def _rsi(closes: np.ndarray, period: int = 14) -> Optional[float]:
    if len(closes) <= period:
        return None
    deltas = np.diff(closes)
    gains = np.clip(deltas, 0, None)
    losses = np.clip(-deltas, 0, None)
    avg_gain = gains[-period:].mean()
    avg_loss = losses[-period:].mean()
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return float(100 - (100 / (1 + rs)))


def compute_signals(closes: List[float]) -> List[Signal]:
    """Compute the labelled heuristic signals from a close-price series."""
    if not closes or len(closes) < 5:
        return []

    arr = np.asarray(closes, dtype=float)
    last = float(arr[-1])
    signals: List[Signal] = []

    # --- Momentum over ~1 month (20 trading days) ---
    look = min(20, len(arr) - 1)
    mom = _pct(last, float(arr[-1 - look]))
    signals.append(
        {
            "key": "momentum",
            "label": f"{look}-day momentum",
            "value": f"{mom:+.1f}%",
            "reading": (
                "rising over the period" if mom > 1
                else "falling over the period" if mom < -1
                else "roughly flat over the period"
            ),
            "direction": "up" if mom > 1 else "down" if mom < -1 else "neutral",
        }
    )

    # --- Price vs 50-day moving average ---
    if len(arr) >= 50:
        ma50 = float(arr[-50:].mean())
        rel = _pct(last, ma50)
        signals.append(
            {
                "key": "ma50",
                "label": "Price vs 50-day average",
                "value": f"{rel:+.1f}%",
                "reading": (
                    "trading above its 50-day average" if rel > 0.5
                    else "trading below its 50-day average" if rel < -0.5
                    else "sitting near its 50-day average"
                ),
                "direction": "up" if rel > 0.5 else "down" if rel < -0.5 else "neutral",
            }
        )

    # --- Annualised volatility (stdev of daily log returns) ---
    rets = np.diff(np.log(arr))
    if len(rets) >= 5:
        vol = float(rets.std() * np.sqrt(252) * 100)
        signals.append(
            {
                "key": "volatility",
                "label": "Annualised volatility",
                "value": f"{vol:.0f}%",
                "reading": (
                    "unusually choppy" if vol > 45
                    else "fairly steady" if vol < 20
                    else "moderately volatile"
                ),
                "direction": "neutral",
            }
        )

    # --- RSI (14) ---
    rsi = _rsi(arr)
    if rsi is not None:
        signals.append(
            {
                "key": "rsi",
                "label": "RSI (14)",
                "value": f"{rsi:.0f}",
                "reading": (
                    "in overbought territory (>70)" if rsi > 70
                    else "in oversold territory (<30)" if rsi < 30
                    else "in a neutral range"
                ),
                "direction": "down" if rsi > 70 else "up" if rsi < 30 else "neutral",
            }
        )

    # --- Position within the observed range ---
    lo, hi = float(arr.min()), float(arr.max())
    if hi > lo:
        pos = (last - lo) / (hi - lo) * 100
        signals.append(
            {
                "key": "range",
                "label": "Position in period range",
                "value": f"{pos:.0f}%",
                "reading": (
                    "near the top of its recent range" if pos > 75
                    else "near the bottom of its recent range" if pos < 25
                    else "in the middle of its recent range"
                ),
                "direction": "up" if pos > 75 else "down" if pos < 25 else "neutral",
            }
        )

    return signals


def confidence_from_signals(signals: List[Signal]) -> dict:
    """
    An *honest* qualitative confidence — how much the signals agree, not a
    fabricated model accuracy. Returns a level + a plain rationale.
    """
    directional = [s for s in signals if s["direction"] in ("up", "down")]
    if not directional:
        return {
            "level": "low",
            "rationale": "The signals are mixed or neutral, with no clear direction.",
        }
    ups = sum(1 for s in directional if s["direction"] == "up")
    downs = len(directional) - ups
    agreement = max(ups, downs) / len(directional)
    if agreement >= 0.8:
        level = "moderate"
        rationale = f"{max(ups, downs)} of {len(directional)} directional signals point the same way."
    elif agreement >= 0.6:
        level = "tentative"
        rationale = f"A slight majority ({max(ups, downs)} of {len(directional)}) of signals lean one way."
    else:
        level = "low"
        rationale = "The signals disagree with each other, so read this cautiously."
    return {"level": level, "rationale": rationale}
