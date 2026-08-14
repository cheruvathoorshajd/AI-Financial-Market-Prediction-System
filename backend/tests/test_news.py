"""
Tests for the finance news service. With no news API keys configured it must
degrade to the labelled snapshot — always available, finance-only, honestly
sourced — and its topic/ticker filters must work.
"""
from app.services import news_service as news_mod
from app.services.news_service import NewsService

REQUIRED = {"title", "url", "source", "summary", "published", "tickers", "sentiment", "topics"}


def _snapshot_only() -> NewsService:
    svc = NewsService()
    svc.finnhub_key = ""          # no Finnhub
    svc.av_key = "demo"           # "demo" AV key => not live
    return svc


def test_snapshot_when_no_keys():
    svc = _snapshot_only()
    res = svc.get_news(limit=5)
    assert res["source"] == "snapshot"
    assert res["provider"] == "snapshot"
    assert res["articles"], "snapshot must always return headlines"
    for a in res["articles"]:
        assert REQUIRED <= set(a), "every article carries the normalised fields"
        assert a["title"] and a["source"]


def test_topic_filter():
    svc = _snapshot_only()
    res = svc.get_news(topics=["technology"], limit=10)
    assert res["articles"]
    for a in res["articles"]:
        assert "technology" in [t.lower() for t in a["topics"]]


def test_ticker_filter():
    svc = _snapshot_only()
    res = svc.get_news(tickers=["XOM"], limit=10)
    assert res["articles"]
    for a in res["articles"]:
        assert "XOM" in [t.upper() for t in a["tickers"]]


def test_singleton_exposed():
    assert hasattr(news_mod, "news_service")
