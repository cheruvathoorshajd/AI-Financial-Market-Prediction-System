"""
Grounded insights assistant.

Design in one sentence: the *facts* (labelled heuristic signals) are computed
here in Python, and the natural-language narrative is a deterministic,
clearly-labelled explanation built strictly from those same numbers. Nothing is
faked, no data is invented, and the assistant explains rather than advises —
no buy/sell.
"""
from __future__ import annotations

import re
from typing import List, Optional

from app.data import seed
from app.ml import forecaster
from app.ml.signals import Signal, compute_signals, confidence_from_signals
from app.services.market_service import market_service

# Questions that ask for a ranking / "best performer" / model outlook.
_RANK_RE = re.compile(
    r"\b(best|top|highest|winner|winners|outperform\w*|lead(?:er|ers|ing)?|strongest|"
    r"which\s+stock|what\s+stock|which\s+asset|rank\w*|expected|forecast\w*|outlook|"
    r"perform\w*|gainer|gainers|pick|picks|buy)\b",
    re.I,
)
# Horizons the next-day model explicitly cannot see — triggers an honest caveat
# plus a backward-looking trend read.
_HORIZON_RE = re.compile(
    r"\b(quarter|quarterly|q[1-4]|next\s+year|this\s+year|annual|year\s*ahead|"
    r"months?|long[-\s]?term|long\s+run|coming\s+(?:weeks|months)|"
    r"rest\s+of\s+the\s+year|h[12]|next\s+few)\b",
    re.I,
)

DISCLAIMER = (
    "This is an explanation to aid understanding, not financial advice. "
    "Markets are uncertain; nothing here is a recommendation to buy or sell."
)


def _signal_lines(signals: List[Signal]) -> str:
    return "\n".join(f"- {s['label']}: {s['value']} ({s['reading']})" for s in signals)


# --------------------------------------------------------------------------- #
# Asset reading
# --------------------------------------------------------------------------- #
def asset_insight(symbol: str) -> Optional[dict]:
    """A grounded reading of a single asset. Returns None if the symbol is unknown."""
    quote = market_service.get_stock_price(symbol)
    if not quote:
        return None
    hist = market_service.get_stock_history(symbol, "6mo")
    closes = [h["close"] for h in hist.get("history", [])]
    signals = compute_signals(closes)
    confidence = confidence_from_signals(signals)

    narrative = _heuristic_asset_narrative(quote, signals, confidence)

    return {
        "symbol": quote["symbol"],
        "name": quote.get("name", quote["symbol"]),
        "method": "heuristic",
        "headline": str(narrative.get("headline", "")),
        "summary": str(narrative.get("summary", "")),
        "reasoning": str(narrative.get("reasoning", "")),
        "limits": str(narrative.get("limits", "")),
        "enough": bool(narrative.get("enough", bool(signals))),
        "observations": signals,
        "confidence": confidence,
        "source": hist.get("source", quote.get("source", "snapshot")),
        "disclaimer": DISCLAIMER,
    }


def _heuristic_asset_narrative(quote: dict, signals: List[Signal], confidence: dict) -> dict:
    if not signals:
        return {
            "headline": "Not enough data to read",
            "summary": f"There isn't enough price history for {quote['symbol']} to say anything meaningful yet.",
            "reasoning": "A reading needs a longer series of prices than we currently have.",
            "limits": "No interpretation is possible from this little data.",
            "enough": False,
        }
    lead = signals[0]
    return {
        "headline": f"{quote['symbol']} is {lead['reading']}",
        "summary": (
            f"{quote['name']} last traded at {quote['price']} "
            f"({quote['changePercent']:+.2f}% today). Over recent months it is {lead['reading']}, "
            f"and {signals[-1]['label'].lower()} reads {signals[-1]['value']} — {signals[-1]['reading']}."
        ),
        "reasoning": (
            "This reading weighs several plain technical signals: "
            + "; ".join(f"{s['label'].lower()} {s['value']}" for s in signals)
            + f". {confidence['rationale']}"
        ),
        "limits": (
            "These are backward-looking technical signals only — they carry no "
            "information about earnings, news, or what happens next."
        ),
        "enough": True,
    }


# --------------------------------------------------------------------------- #
# Ranked "best performer" / model-outlook answers
# --------------------------------------------------------------------------- #
def _outlook_rows(outlook: dict) -> List[dict]:
    """Shape the LSTM outlook into compact ranking rows for the UI."""
    rows: List[dict] = []
    for r in outlook.get("ranked", []):
        rows.append(
            {
                "symbol": r["symbol"],
                "name": r["name"],
                "valuePct": r["forecast_return_pct"],
                "note": (
                    f"dir. acc {round(r['directional_accuracy'] * 100)}%"
                    f" · skill {r['skill_vs_naive_pct']:+g}%"
                ),
            }
        )
    return rows


def _trend_rows(symbols: List[str], look_days: int = 63) -> List[dict]:
    """Rank symbols by plain price change over a lookback window (backward-looking).

    This is deterministic snapshot history — a momentum measure, not a model
    output — so it's honest to show for questions the forecaster can't answer.
    """
    rows: List[dict] = []
    for sym in symbols:
        hist = market_service.get_stock_history(sym, "6mo")
        closes = [h["close"] for h in hist.get("history", [])]
        if len(closes) < 20:
            continue
        look = min(look_days, len(closes) - 1)
        base = closes[-1 - look]
        if not base:
            continue
        chg = (closes[-1] - base) / base * 100.0
        rows.append(
            {
                "symbol": sym,
                "name": seed.SNAPSHOT.get(sym, {}).get("name", sym),
                "valuePct": round(chg, 2),
            }
        )
    rows.sort(key=lambda r: r["valuePct"], reverse=True)
    return rows


def _ranking_answer(question: str, long_horizon: bool) -> dict:
    """Answer a 'best performer / what does the model expect' question honestly.

    The LSTM only forecasts the next trading day; when asked about a longer
    horizon we say so plainly and add a labelled backward-looking trend read.
    """
    rankings: List[dict] = []
    outlook = forecaster.ranked_outlook(limit=6)
    model_ok = bool(outlook.get("available")) and bool(outlook.get("ranked"))

    if model_ok:
        rankings.append(
            {
                "title": "LSTM next-day outlook",
                "caption": outlook["honesty"],
                "rows": _outlook_rows(outlook),
            }
        )

    # A backward-looking trend is the honest answer to any longer horizon, and
    # the sensible fallback when the model can't run.
    trend_needed = long_horizon or not model_ok
    trend_rows = _trend_rows(seed.all_symbols(), look_days=63) if trend_needed else []
    if trend_rows:
        rankings.append(
            {
                "title": "Recent trend — past ~3 months (backward-looking)",
                "caption": (
                    "Price change over roughly the last quarter. This is history, "
                    "not a forecast — momentum does not reliably carry forward."
                ),
                "rows": trend_rows[:6],
            }
        )

    if model_ok:
        top = outlook["ranked"][0]
        if long_horizon:
            headline = "No one can honestly call the best stock a quarter out — here's what the data can say"
            summary = (
                "Nothing here can predict a quarter ahead: daily moves are near-random, "
                "and this LSTM only forecasts one trading day. What it *can* say — for the "
                f"next session it ranks {top['symbol']} ({top['name']}) highest, about "
                f"{top['forecast_return_pct']:+.2f}% expected — though on average it barely "
                f"beats a naive guess (avg skill vs naive {outlook['avg_skill_vs_naive_pct']:+g}%). "
                "For a longer look, the backward-looking trend over the past quarter is below."
            )
        else:
            headline = f"The model's top next-day pick is {top['symbol']}"
            summary = (
                f"An experimental LSTM ranks {top['symbol']} ({top['name']}) highest for the "
                f"next trading day, at about {top['forecast_return_pct']:+.2f}% expected. On "
                f"average, though, it barely beats a naive 'no change' guess "
                f"(avg skill vs naive {outlook['avg_skill_vs_naive_pct']:+g}%) — read the "
                "ranking as a demonstration, not a signal."
            )
        reasoning = (
            "Each symbol's next-day return is forecast by a small LSTM trained on its own "
            "daily log-returns, then scored with a walk-forward backtest (skill vs. a naive "
            "guess, directional accuracy). The ranking is by the model's expected return, "
            "with the honest backtest numbers next to it."
        )
    elif trend_rows:
        top = trend_rows[0]
        headline = f"{top['symbol']} leads the recent trend"
        summary = (
            "The forecasting model isn't available right now, so here's a backward-looking "
            f"read: over roughly the past quarter, {top['symbol']} ({top['name']}) has the "
            f"strongest price trend ({top['valuePct']:+.2f}%). This is history, not a prediction."
        )
        reasoning = (
            "With the LSTM offline, this ranks the snapshot universe by price change over the "
            "lookback window — a plain, backward-looking momentum measure, not a model output."
        )
    else:  # no snapshot data at all — extremely unlikely
        headline = "Not enough data to rank right now"
        summary = (
            "I couldn't load enough price history to rank anything at the moment. "
            "Try again shortly, or ask about a specific ticker."
        )
        reasoning = ""

    limits = (
        "These are near-term or backward-looking reads only. "
        + (
            "The model forecasts just one trading day ahead — it cannot project a quarter, a "
            "year, or 'Q4'; the trend list is past performance, which does not reliably carry "
            "forward. "
            if long_horizon
            else ""
        )
        + "Nothing here accounts for news, earnings, or valuation."
    )

    return {
        "question": question,
        "symbol": None,
        "method": "heuristic",
        "headline": headline,
        "summary": summary,
        "reasoning": reasoning,
        "limits": limits,
        "enough": True,
        "grounding": [],
        "rankings": rankings,
        "disclaimer": DISCLAIMER,
    }


# --------------------------------------------------------------------------- #
# Free-form question
# --------------------------------------------------------------------------- #
def answer_question(question: str, symbol: Optional[str] = None) -> dict:
    """Answer a natural-language question, grounded in real data on hand.

    There is no language model: the assistant routes the question to the real
    figures relevant to it — an LSTM outlook + backward-looking trend for
    "best performer" questions, otherwise the labelled signals / today's moves —
    so nothing it shows is invented.
    """
    # "Best performing / what does the model expect" questions get the outlook.
    if not symbol and _RANK_RE.search(question or ""):
        return _ranking_answer(question, bool(_HORIZON_RE.search(question or "")))

    grounding_facts = ""
    grounding: List[dict] = []

    if symbol:
        quote = market_service.get_stock_price(symbol)
        if quote:
            hist = market_service.get_stock_history(symbol, "6mo")
            closes = [h["close"] for h in hist.get("history", [])]
            signals = compute_signals(closes)
            grounding = signals  # type: ignore[assignment]
            grounding_facts = (
                f"{quote['symbol']} ({quote.get('name')}), sector {quote.get('sector')}, "
                f"price {quote['price']} ({quote['changePercent']:+.2f}% today).\n"
                f"Signals:\n{_signal_lines(signals)}"
            )
    if not grounding_facts:
        movers = market_service.get_top_gainers_losers()
        top = movers.get("gainers", [])[:3] + movers.get("losers", [])[:3]
        grounding = [
            {"symbol": m["symbol"], "changePercent": m["changePercent"], "sector": m.get("sector")}
            for m in top
        ]
        grounding_facts = "Today's notable moves:\n" + "\n".join(
            f"- {m['symbol']} {m['changePercent']:+.2f}% ({m.get('sector') or 'n/a'})" for m in top
        )

    return {
        "question": question,
        "symbol": symbol,
        "method": "heuristic",
        "headline": "Here's the data on hand",
        "summary": (
            "This assistant surfaces the real figures relevant to your question "
            "rather than a written narrative. Below are the data points the "
            "reading is grounded in — the same signals it reasons over."
        ),
        "reasoning": grounding_facts,
        "limits": (
            "These are backward-looking signals and today's moves only — they "
            "carry no information about news, earnings, or what happens next."
        ),
        "enough": False,
        "grounding": grounding,
        "rankings": [],
        "disclaimer": DISCLAIMER,
    }
