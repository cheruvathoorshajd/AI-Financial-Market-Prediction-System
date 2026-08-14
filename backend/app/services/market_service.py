"""
Market data service. Tries live Alpha Vantage first, then falls back to a
realistic saved snapshot when the free-tier quota is exhausted or a symbol is
unavailable. Every response carries a ``source`` field ("live" | "snapshot")
so the UI can be honest about what the user is looking at.
"""
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional

import requests

from app.core.config import settings
from app.data import seed


def _aggregate_source(items: List[dict]) -> str:
    """Roll up per-item sources into live / snapshot / mixed."""
    srcs = {i.get("source", "snapshot") for i in items if i}
    if not srcs:
        return "snapshot"
    if srcs == {"live"}:
        return "live"
    if srcs == {"snapshot"}:
        return "snapshot"
    return "mixed"


class MarketService:
    """Fetch market data with graceful live→snapshot fallback."""

    def __init__(self):
        self.api_key = settings.ALPHA_VANTAGE_API_KEY
        self.base_url = "https://www.alphavantage.co/query"
        self.cache: Dict[str, tuple] = {}
        # Alpha Vantage free tier is ~25 requests/day, so cache aggressively.
        self.cache_duration = timedelta(minutes=30)
        # When we hit a rate limit, stop calling the API for a cooldown so the
        # whole app doesn't crawl through 10 slow failing requests.
        self._live_disabled_until: Optional[datetime] = None
        self._cooldown = timedelta(minutes=15)

    # ---------------------------------------------------------------- helpers
    def _live_enabled(self) -> bool:
        if not self.api_key or self.api_key == "demo":
            return False
        if self._live_disabled_until and datetime.now() < self._live_disabled_until:
            return False
        return True

    def _trip_cooldown(self, reason: str):
        self._live_disabled_until = datetime.now() + self._cooldown
        print(f"Alpha Vantage live data disabled for {self._cooldown} — {reason}")

    def _enrich(self, quote: dict) -> dict:
        """Attach name/sector from the reference set when available."""
        row = seed.SNAPSHOT.get(quote["symbol"].upper())
        if row:
            quote["name"] = row["name"]
            quote["sector"] = row.get("sector")
            quote.setdefault("marketCap", row.get("marketCap"))
        return quote

    # ----------------------------------------------------------------- quotes
    def _fetch_live_quote(self, symbol: str) -> Optional[dict]:
        if not self._live_enabled():
            return None
        try:
            params = {"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": self.api_key}
            resp = requests.get(self.base_url, params=params, timeout=8)
            data = resp.json()

            if "Note" in data or "Information" in data:
                self._trip_cooldown("rate limit")
                return None
            if "Error Message" in data:
                return None

            quote = data.get("Global Quote") or {}
            if not quote or "05. price" not in quote:
                return None

            price = float(quote.get("05. price", 0))
            change = float(quote.get("09. change", 0))
            pct = float(quote.get("10. change percent", "0%").replace("%", ""))
            result = {
                "symbol": symbol.upper(),
                "name": symbol.upper(),
                "price": round(price, 2),
                "change": round(change, 2),
                "changePercent": round(pct, 2),
                "open": round(float(quote.get("02. open", 0)), 2),
                "high": round(float(quote.get("03. high", 0)), 2),
                "low": round(float(quote.get("04. low", 0)), 2),
                "volume": int(float(quote.get("06. volume", 0))),
                "marketCap": None,
                "sector": None,
                "timestamp": datetime.now().isoformat(),
                "source": "live",
            }
            return self._enrich(result)
        except Exception as e:  # network / parse errors → fall back
            print(f"Live quote error for {symbol}: {e}")
            return None

    def get_stock_price(self, symbol: str, allow_live: bool = True) -> Optional[dict]:
        """
        Fetch a quote. ``allow_live`` gates whether this call may spend part of
        the tiny Alpha Vantage daily budget — browse lists pass ``False`` and
        serve the snapshot, so the quota is reserved for the asset the user is
        actually looking at. Only live results are cached (snapshot is
        deterministic and free), so a snapshot never shadows a later live fetch.
        """
        symbol = (symbol or "").strip().upper()
        cache_key = f"{symbol}_quote"
        if cache_key in self.cache:
            cached, ts = self.cache[cache_key]
            if datetime.now() - ts < self.cache_duration:
                return cached

        result = None
        if allow_live:
            result = self._fetch_live_quote(symbol)
            if result:
                self.cache[cache_key] = (result, datetime.now())
        if not result:
            result = seed.snapshot_quote(symbol)
        return result

    def get_multiple_stocks(self, symbols: List[str], allow_live: bool = True) -> List[dict]:
        results: List[dict] = []
        for i, symbol in enumerate(symbols):
            data = self.get_stock_price(symbol, allow_live=allow_live)
            if data:
                results.append(data)
            # Only throttle when we're actually calling the live API.
            if allow_live and self._live_enabled() and i < len(symbols) - 1:
                time.sleep(0.4)
        return results

    # ---------------------------------------------------------------- indices
    def get_market_indices(self) -> dict:
        indices = {
            "SPY": ("S&P 500", 6321.44, 0.41),
            "QQQ": ("NASDAQ-100", 561.28, 0.63),
            "DIA": ("Dow Jones", 451.90, 0.19),
        }
        results = []
        for symbol, (name, fallback_val, fallback_pct) in indices.items():
            # Ambient backdrop — snapshot, so the scarce live budget stays with
            # the asset the user opens and their watchlist.
            live = self.get_stock_price(symbol, allow_live=False)
            if live and live.get("source") == "live":
                results.append({
                    "symbol": symbol, "name": name, "value": live["price"],
                    "change": live["change"], "changePercent": live["changePercent"],
                    "source": "live",
                })
            else:
                change = round(fallback_val * fallback_pct / 100, 2)
                results.append({
                    "symbol": symbol, "name": name, "value": fallback_val,
                    "change": change, "changePercent": fallback_pct, "source": "snapshot",
                })
        return {"indices": results, "source": _aggregate_source(results)}

    # -------------------------------------------------------- trending/movers
    def get_trending_stocks(self, limit: int = 8) -> dict:
        symbols = ["NVDA", "AAPL", "TSLA", "PLTR", "MSFT", "AMZN", "META", "AMD"]
        # Browse list — snapshot, to preserve the tiny live budget for the
        # single asset the user opens.
        stocks = self.get_multiple_stocks(symbols[:limit], allow_live=False)
        # Attach a snapshot sparkline series so cards don't each fetch history
        # (avoids an N+1 request fan-out on the trending grid).
        for stock in stocks:
            stock["spark"] = seed.spark_series(stock["symbol"])
        stocks.sort(key=lambda x: abs(x.get("changePercent", 0)), reverse=True)
        return {"stocks": stocks, "source": _aggregate_source(stocks)}

    def get_top_gainers_losers(self) -> dict:
        # ~24 symbols — always snapshot; fetching these live would exhaust the
        # entire daily Alpha Vantage quota in a single request.
        stocks = self.get_multiple_stocks(seed.all_symbols(), allow_live=False)
        ranked = sorted(stocks, key=lambda x: x.get("changePercent", 0), reverse=True)
        return {
            "gainers": ranked[:5],
            "losers": list(reversed(ranked[-5:])),
            "source": _aggregate_source(stocks),
        }

    # ---------------------------------------------------------------- history
    def get_stock_history(self, symbol: str, period: str = "6mo") -> dict:
        symbol = symbol.upper()
        days = {"1mo": 30, "3mo": 90, "6mo": 180, "1y": 365}.get(period, 180)
        # Live daily history requires the TIME_SERIES_DAILY endpoint; on the
        # free tier this is almost always rate-limited, so we serve the
        # deterministic snapshot series (clearly labelled) for a stable demo.
        history = seed.snapshot_history(symbol, days=days)
        return {"symbol": symbol, "history": history, "source": "snapshot"}

    # ----------------------------------------------------------------- search
    def search_stocks(self, query: str) -> dict:
        query = (query or "").strip()
        if not query:
            return {"results": [], "source": "snapshot"}

        q_upper = query.upper()
        q_lower = query.lower()
        matches: List[str] = []

        # Exact symbol first.
        if q_upper in seed.SNAPSHOT:
            matches.append(q_upper)
        # Then symbol-prefix and name-substring matches.
        for sym, row in seed.SNAPSHOT.items():
            if sym in matches:
                continue
            if q_upper in sym or q_lower in row["name"].lower():
                matches.append(sym)
            if len(matches) >= 12:
                break

        results = self.get_multiple_stocks(matches, allow_live=False)
        return {"results": results, "source": _aggregate_source(results)}


# Singleton instance
market_service = MarketService()
