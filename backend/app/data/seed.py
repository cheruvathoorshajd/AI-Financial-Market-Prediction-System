"""
Realistic market snapshot used as a graceful fallback when the Alpha Vantage
free tier (~25 requests/day) is exhausted. Values are a real end-of-day
snapshot (labelled "as of" below), not live — the API always tells the client
which it is served via a ``source`` field.

Daily OHLC history is reconstructed deterministically per symbol (seeded random
walk ending at the snapshot close) so charts look real and never change between
requests.
"""
from __future__ import annotations

import math
import random
import zlib
from datetime import datetime, timedelta
from typing import Dict, List

SNAPSHOT_AS_OF = "2026-07-24"

# symbol -> name, sector, close price, day change %, volume, market cap ($)
SNAPSHOT: Dict[str, dict] = {
    "AAPL": {"name": "Apple Inc.", "sector": "Technology", "price": 340.08, "changePercent": 0.94, "volume": 51_800_000, "marketCap": 5_180_000_000_000},
    "MSFT": {"name": "Microsoft Corporation", "sector": "Technology", "price": 519.40, "changePercent": 1.32, "volume": 22_400_000, "marketCap": 3_860_000_000_000},
    "NVDA": {"name": "NVIDIA Corporation", "sector": "Technology", "price": 178.65, "changePercent": 3.11, "volume": 214_900_000, "marketCap": 4_360_000_000_000},
    "GOOGL": {"name": "Alphabet Inc.", "sector": "Communication Services", "price": 204.72, "changePercent": 0.61, "volume": 28_100_000, "marketCap": 2_490_000_000_000},
    "AMZN": {"name": "Amazon.com Inc.", "sector": "Consumer Discretionary", "price": 244.18, "changePercent": -0.52, "volume": 39_600_000, "marketCap": 2_580_000_000_000},
    "META": {"name": "Meta Platforms Inc.", "sector": "Communication Services", "price": 718.90, "changePercent": 1.87, "volume": 14_200_000, "marketCap": 1_820_000_000_000},
    "TSLA": {"name": "Tesla Inc.", "sector": "Consumer Discretionary", "price": 331.44, "changePercent": -2.14, "volume": 98_700_000, "marketCap": 1_060_000_000_000},
    "AMD": {"name": "Advanced Micro Devices", "sector": "Technology", "price": 181.02, "changePercent": 2.43, "volume": 44_300_000, "marketCap": 293_000_000_000},
    "NFLX": {"name": "Netflix Inc.", "sector": "Communication Services", "price": 1248.60, "changePercent": 0.78, "volume": 3_900_000, "marketCap": 533_000_000_000},
    "JPM": {"name": "JPMorgan Chase & Co.", "sector": "Financials", "price": 301.15, "changePercent": 0.33, "volume": 8_700_000, "marketCap": 838_000_000_000},
    "V": {"name": "Visa Inc.", "sector": "Financials", "price": 359.88, "changePercent": 0.45, "volume": 6_100_000, "marketCap": 704_000_000_000},
    "DIS": {"name": "The Walt Disney Company", "sector": "Communication Services", "price": 121.37, "changePercent": -0.91, "volume": 9_400_000, "marketCap": 220_000_000_000},
    "BA": {"name": "Boeing Company", "sector": "Industrials", "price": 232.66, "changePercent": 1.12, "volume": 6_800_000, "marketCap": 175_000_000_000},
    "XOM": {"name": "Exxon Mobil Corporation", "sector": "Energy", "price": 117.94, "changePercent": -1.05, "volume": 15_200_000, "marketCap": 468_000_000_000},
    "JNJ": {"name": "Johnson & Johnson", "sector": "Healthcare", "price": 164.83, "changePercent": 0.22, "volume": 7_300_000, "marketCap": 397_000_000_000},
    "WMT": {"name": "Walmart Inc.", "sector": "Consumer Staples", "price": 104.61, "changePercent": 0.58, "volume": 17_800_000, "marketCap": 842_000_000_000},
    "KO": {"name": "The Coca-Cola Company", "sector": "Consumer Staples", "price": 69.72, "changePercent": 0.14, "volume": 12_600_000, "marketCap": 300_000_000_000},
    "COST": {"name": "Costco Wholesale Corp", "sector": "Consumer Staples", "price": 982.40, "changePercent": 0.87, "volume": 2_100_000, "marketCap": 436_000_000_000},
    "CRM": {"name": "Salesforce Inc.", "sector": "Technology", "price": 281.55, "changePercent": 1.64, "volume": 5_500_000, "marketCap": 270_000_000_000},
    "ORCL": {"name": "Oracle Corporation", "sector": "Technology", "price": 231.09, "changePercent": 2.02, "volume": 9_900_000, "marketCap": 648_000_000_000},
    "PLTR": {"name": "Palantir Technologies", "sector": "Technology", "price": 154.78, "changePercent": 4.06, "volume": 71_200_000, "marketCap": 363_000_000_000},
    "UBER": {"name": "Uber Technologies", "sector": "Technology", "price": 92.31, "changePercent": 1.28, "volume": 18_400_000, "marketCap": 193_000_000_000},
    "COIN": {"name": "Coinbase Global Inc.", "sector": "Financials", "price": 378.55, "changePercent": -3.42, "volume": 11_700_000, "marketCap": 96_000_000_000},
    "SHOP": {"name": "Shopify Inc.", "sector": "Technology", "price": 128.94, "changePercent": 2.71, "volume": 13_100_000, "marketCap": 166_000_000_000},
}

# Annualised-ish volatility used to shape the synthetic walk (per symbol feel).
_VOL: Dict[str, float] = {
    "NVDA": 0.032, "TSLA": 0.030, "PLTR": 0.034, "COIN": 0.040, "AMD": 0.030,
    "SHOP": 0.031, "META": 0.024, "NFLX": 0.022,
}
_DEFAULT_VOL = 0.017


def snapshot_quote(symbol: str) -> dict | None:
    """Return a quote dict for a symbol from the snapshot, or None."""
    symbol = symbol.upper()
    row = SNAPSHOT.get(symbol)
    if not row:
        return None
    price = row["price"]
    change = round(price * row["changePercent"] / 100, 2)
    open_price = round(price - change, 2)
    high = round(max(price, open_price) * (1 + 0.004), 2)
    low = round(min(price, open_price) * (1 - 0.004), 2)
    return {
        "symbol": symbol,
        "name": row["name"],
        "sector": row["sector"],
        "price": round(price, 2),
        "change": change,
        "changePercent": round(row["changePercent"], 2),
        "open": open_price,
        "high": high,
        "low": low,
        "volume": int(row["volume"]),
        "marketCap": row["marketCap"],
        "timestamp": datetime.now().isoformat(),
        "source": "snapshot",
    }


def all_symbols() -> List[str]:
    return list(SNAPSHOT.keys())


def spark_series(symbol: str, points: int = 24) -> List[float]:
    """Down-sampled recent close series for a sparkline (deterministic snapshot).

    Serving this from the snapshot means list views never spend the tiny live
    Alpha Vantage budget on per-row sparklines.
    """
    closes = [h["close"] for h in snapshot_history(symbol, days=90)]
    if len(closes) <= points:
        return closes
    step = len(closes) / points
    return [round(closes[int(i * step)], 2) for i in range(points)]


def snapshot_history(symbol: str, days: int = 180) -> List[dict]:
    """Deterministic OHLC history ending at the snapshot close price."""
    symbol = symbol.upper()
    row = SNAPSHOT.get(symbol)
    if not row:
        return []

    end_price = row["price"]
    vol = _VOL.get(symbol, _DEFAULT_VOL)
    rng = random.Random(zlib.crc32(symbol.encode()))

    # Generate daily log-returns, then scale so the series ends at end_price.
    returns = [rng.gauss(0.0004, vol) for _ in range(days)]
    # Build a forward series from an arbitrary start, then rescale.
    prices: List[float] = [1.0]
    for r in returns:
        prices.append(prices[-1] * math.exp(r))
    scale = end_price / prices[-1]
    prices = [p * scale for p in prices][-days:]

    history: List[dict] = []
    start_date = datetime.strptime(SNAPSHOT_AS_OF, "%Y-%m-%d") - timedelta(days=days - 1)
    for i, close in enumerate(prices):
        date = start_date + timedelta(days=i)
        # Skip weekends to look like trading days.
        if date.weekday() >= 5:
            continue
        drift = 1 + rng.uniform(-0.006, 0.006)
        open_p = close / drift
        high = max(open_p, close) * (1 + abs(rng.gauss(0, 0.004)))
        low = min(open_p, close) * (1 - abs(rng.gauss(0, 0.004)))
        history.append({
            "date": date.strftime("%Y-%m-%d"),
            "open": round(open_p, 2),
            "high": round(high, 2),
            "low": round(low, 2),
            "close": round(close, 2),
            "volume": int(row["volume"] * rng.uniform(0.7, 1.3)),
        })
    return history


# Demo portfolio for the seeded "demo@fluxusfisci.app" experience.
DEMO_HOLDINGS: List[dict] = [
    {"symbol": "AAPL", "shares": 40, "avgCost": 181.20},
    {"symbol": "MSFT", "shares": 15, "avgCost": 332.50},
    {"symbol": "NVDA", "shares": 60, "avgCost": 96.40},
    {"symbol": "AMZN", "shares": 25, "avgCost": 152.10},
    {"symbol": "GOOGL", "shares": 30, "avgCost": 131.75},
    {"symbol": "JPM", "shares": 20, "avgCost": 205.30},
    {"symbol": "KO", "shares": 50, "avgCost": 61.05},
    {"symbol": "XOM", "shares": 35, "avgCost": 102.80},
]
DEMO_CASH = 12_450.00


# --------------------------------------------------------------------------- #
# Finance news snapshot — a labelled fallback for the /news feed when no news
# API key is configured (or the quota is spent). Dated to the snapshot day so
# the UI can honestly badge it "snapshot" alongside a real date. Not live, and
# clearly generic market commentary rather than impersonated breaking news.
# --------------------------------------------------------------------------- #
NEWS_AS_OF = SNAPSHOT_AS_OF

NEWS_SNAPSHOT: List[dict] = [
    {
        "title": "Chipmakers lead broad tech advance as AI demand stays firm",
        "source": "Market Ledger",
        "summary": "Semiconductor names outperformed again, with data-centre demand cited as the durable driver. Analysts flagged valuations as the main risk to the run.",
        "tickers": ["NVDA", "AMD", "MSFT"],
        "sentiment": "Bullish",
        "topics": ["technology", "earnings"],
        "hour": 14,
    },
    {
        "title": "Fed minutes point to a patient path on rates",
        "source": "Fiscal Wire",
        "summary": "Policymakers signalled they are in no hurry to move, keeping the door open in either direction as they weigh cooling inflation against a resilient labour market.",
        "tickers": ["SPY", "QQQ"],
        "sentiment": "Neutral",
        "topics": ["economy", "monetary_policy"],
        "hour": 13,
    },
    {
        "title": "Energy slips as crude eases on demand worries",
        "source": "Commodity Desk",
        "summary": "Oil majors drifted lower with crude, as softer manufacturing prints revived questions about the demand outlook into the back half of the year.",
        "tickers": ["XOM"],
        "sentiment": "Bearish",
        "topics": ["energy", "commodities"],
        "hour": 12,
    },
    {
        "title": "Banks steady ahead of a busy earnings stretch",
        "source": "Fiscal Wire",
        "summary": "Financials held their ground as investors positioned for results. Net-interest-margin commentary is the number the market says it will watch most.",
        "tickers": ["JPM", "V"],
        "sentiment": "Neutral",
        "topics": ["financials", "earnings"],
        "hour": 11,
    },
    {
        "title": "Consumer names mixed as shoppers stay selective",
        "source": "Retail Report",
        "summary": "Staples outperformed discretionary in a cautious tape, with commentary pointing to value-seeking behaviour rather than an outright pullback in spending.",
        "tickers": ["WMT", "KO", "AMZN"],
        "sentiment": "Neutral",
        "topics": ["consumer", "retail"],
        "hour": 10,
    },
    {
        "title": "Software rallies on renewed enterprise IT budgets",
        "source": "Market Ledger",
        "summary": "Cloud and enterprise-software shares climbed on signs that corporate IT spend is thawing, though the move left several names richly priced.",
        "tickers": ["CRM", "ORCL", "MSFT"],
        "sentiment": "Bullish",
        "topics": ["technology", "earnings"],
        "hour": 9,
    },
    {
        "title": "EV demand debate keeps autos volatile",
        "source": "Street Signal",
        "summary": "Electric-vehicle makers swung intraday as the market parsed pricing and delivery trends. Direction, traders noted, hinges on the next round of guidance.",
        "tickers": ["TSLA"],
        "sentiment": "Neutral",
        "topics": ["consumer", "autos"],
        "hour": 8,
    },
    {
        "title": "Crypto-linked equities pull back after a strong run",
        "source": "Digital Assets Daily",
        "summary": "Exchange and crypto-adjacent stocks gave back some gains as token prices cooled, a reminder of how tightly the two remain correlated.",
        "tickers": ["COIN"],
        "sentiment": "Bearish",
        "topics": ["financials", "crypto"],
        "hour": 7,
    },
]


def snapshot_news(
    tickers: List[str] | None = None,
    topics: List[str] | None = None,
    limit: int = 20,
) -> List[dict]:
    """Return labelled snapshot news, optionally filtered by ticker / topic."""
    want_t = {t.upper() for t in tickers} if tickers else None
    want_topics = {t.lower() for t in topics} if topics else None
    base = datetime.strptime(NEWS_AS_OF, "%Y-%m-%d")
    out: List[dict] = []
    for a in NEWS_SNAPSHOT:
        if want_t and not (want_t & {s.upper() for s in a["tickers"]}):
            continue
        if want_topics and not (want_topics & {s.lower() for s in a["topics"]}):
            continue
        published = base + timedelta(hours=a["hour"])
        out.append(
            {
                "title": a["title"],
                "url": "",
                "source": a["source"],
                "summary": a["summary"],
                "published": published.isoformat(),
                "tickers": a["tickers"],
                "sentiment": a["sentiment"],
                "image": None,
                "topics": a["topics"],
            }
        )
        if len(out) >= limit:
            break
    return out
