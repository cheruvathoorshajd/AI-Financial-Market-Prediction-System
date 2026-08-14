"""
Finance news service.

Honest, degrading provider chain — mirroring the market service's live→snapshot
pattern so the UI can always say where a headline came from:

  1. Finnhub (if FINNHUB_API_KEY)      — generous free tier, doesn't touch the
                                          Alpha Vantage quote budget.
  2. Alpha Vantage NEWS_SENTIMENT      — reuses the existing key; shares the tiny
     (if a real ALPHA_VANTAGE key)      ~25/day budget, so it's cached hard.
  3. Labelled snapshot                 — curated market commentary, dated to the
                                          snapshot day. Always available.

Every response carries ``source`` ("live" | "snapshot") and ``provider`` so the
client is never guessing what it's showing.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

import requests

from app.core.config import settings
from app.data import seed

# Alpha Vantage NEWS_SENTIMENT topic vocabulary we map our simple topics onto.
_AV_TOPICS = {
    "technology": "technology",
    "earnings": "earnings",
    "economy": "economy_macro",
    "monetary_policy": "economy_monetary",
    "financials": "finance",
    "energy": "energy_transportation",
    "ipo": "ipo",
    "crypto": "blockchain",
}
# A finance-broad default so the feed is always investing-relevant.
_AV_DEFAULT_TOPICS = "financial_markets,economy_macro,earnings,finance"


class NewsService:
    """Fetch finance news with a graceful, clearly-labelled fallback chain."""

    def __init__(self) -> None:
        self.finnhub_key = settings.FINNHUB_API_KEY
        self.av_key = settings.ALPHA_VANTAGE_API_KEY
        self.cache: Dict[str, Tuple[dict, datetime]] = {}
        # News changes slowly relative to our tiny quotas; cache aggressively.
        self.cache_duration = timedelta(minutes=20)
        self._av_disabled_until: Optional[datetime] = None
        self._cooldown = timedelta(minutes=15)

    # ---------------------------------------------------------------- helpers
    def _av_live(self) -> bool:
        if not self.av_key or self.av_key == "demo":
            return False
        if self._av_disabled_until and datetime.now() < self._av_disabled_until:
            return False
        return True

    def _trip_av_cooldown(self, reason: str) -> None:
        self._av_disabled_until = datetime.now() + self._cooldown
        print(f"Alpha Vantage news disabled for {self._cooldown} — {reason}")

    @staticmethod
    def _cache_key(topics: Optional[List[str]], tickers: Optional[List[str]], limit: int) -> str:
        t = ",".join(sorted(topics)) if topics else "-"
        k = ",".join(sorted(tickers)) if tickers else "-"
        return f"news::{t}::{k}::{limit}"

    # ------------------------------------------------------------- providers
    def _from_finnhub(
        self, tickers: Optional[List[str]], topics: Optional[List[str]], limit: int
    ) -> Optional[List[dict]]:
        if not self.finnhub_key:
            return None
        try:
            resp = requests.get(
                "https://finnhub.io/api/v1/news",
                params={"category": "general", "token": self.finnhub_key},
                timeout=8,
            )
            data = resp.json()
            if not isinstance(data, list) or not data:
                return None
            articles: List[dict] = []
            want_t = {t.upper() for t in tickers} if tickers else None
            for item in data:
                related = [
                    s.strip().upper()
                    for s in str(item.get("related", "")).split(",")
                    if s.strip()
                ]
                if want_t and not (want_t & set(related)):
                    continue
                ts = item.get("datetime")
                published = (
                    datetime.fromtimestamp(ts).isoformat()
                    if isinstance(ts, (int, float)) and ts
                    else datetime.now().isoformat()
                )
                articles.append(
                    {
                        "title": item.get("headline", "").strip(),
                        "url": item.get("url", ""),
                        "source": item.get("source", "Finnhub"),
                        "summary": (item.get("summary") or "").strip(),
                        "published": published,
                        "tickers": related,
                        "sentiment": None,  # Finnhub general news carries no label
                        "image": item.get("image") or None,
                        "topics": [item.get("category", "general")],
                    }
                )
                if len(articles) >= limit:
                    break
            return articles or None
        except Exception as e:  # network / parse → try the next provider
            print(f"Finnhub news error: {e}")
            return None

    def _from_alpha_vantage(
        self, tickers: Optional[List[str]], topics: Optional[List[str]], limit: int
    ) -> Optional[List[dict]]:
        if not self._av_live():
            return None
        try:
            params = {
                "function": "NEWS_SENTIMENT",
                "apikey": self.av_key,
                "sort": "LATEST",
                "limit": str(min(limit, 50)),
            }
            if tickers:
                params["tickers"] = ",".join(t.upper() for t in tickers)
            mapped = [_AV_TOPICS[t] for t in (topics or []) if t in _AV_TOPICS]
            params["topics"] = ",".join(mapped) if mapped else _AV_DEFAULT_TOPICS

            resp = requests.get(
                "https://www.alphavantage.co/query", params=params, timeout=8
            )
            data = resp.json()
            if "Note" in data or "Information" in data:
                self._trip_av_cooldown("rate limit")
                return None
            feed = data.get("feed")
            if not isinstance(feed, list) or not feed:
                return None

            articles: List[dict] = []
            for item in feed:
                tp = item.get("time_published", "")
                try:
                    published = datetime.strptime(tp, "%Y%m%dT%H%M%S").isoformat()
                except (ValueError, TypeError):
                    published = datetime.now().isoformat()
                articles.append(
                    {
                        "title": (item.get("title") or "").strip(),
                        "url": item.get("url", ""),
                        "source": item.get("source", "Alpha Vantage"),
                        "summary": (item.get("summary") or "").strip(),
                        "published": published,
                        "tickers": [
                            t.get("ticker")
                            for t in item.get("ticker_sentiment", [])
                            if t.get("ticker")
                        ][:6],
                        "sentiment": (
                            item.get("overall_sentiment_label") or None
                        ),
                        "image": item.get("banner_image") or None,
                        "topics": [
                            t.get("topic")
                            for t in item.get("topics", [])
                            if t.get("topic")
                        ],
                    }
                )
                if len(articles) >= limit:
                    break
            return articles or None
        except Exception as e:
            print(f"Alpha Vantage news error: {e}")
            return None

    # ----------------------------------------------------------------- public
    def get_news(
        self,
        tickers: Optional[List[str]] = None,
        topics: Optional[List[str]] = None,
        limit: int = 20,
    ) -> dict:
        key = self._cache_key(topics, tickers, limit)
        cached = self.cache.get(key)
        if cached and datetime.now() - cached[1] < self.cache_duration:
            return cached[0]

        provider = "snapshot"
        articles = self._from_finnhub(tickers, topics, limit)
        if articles:
            provider = "finnhub"
        else:
            articles = self._from_alpha_vantage(tickers, topics, limit)
            if articles:
                provider = "alphavantage"

        if articles:
            result = {"articles": articles, "source": "live", "provider": provider}
            self.cache[key] = (result, datetime.now())
            return result

        # Snapshot — always available; not cached (deterministic and free).
        return {
            "articles": seed.snapshot_news(tickers=tickers, topics=topics, limit=limit),
            "source": "snapshot",
            "provider": "snapshot",
            "asOf": seed.NEWS_AS_OF,
        }


# Singleton instance
news_service = NewsService()
