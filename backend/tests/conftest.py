"""
Shared test fixtures.

The market service is live-only in production (real Alpha Vantage calls). Unit
tests must not hit the network or depend on a daily quota, so we transparently
back the market service with the deterministic reference snapshot for the test
session. This keeps signals / portfolio / insights / forecaster tests offline
and reproducible while production stays live-only.
"""
import pytest

from app.data import seed
from app.services import market_service as market_mod


@pytest.fixture(autouse=True)
def offline_market(monkeypatch):
    def _price(symbol, allow_live=True):
        return seed.snapshot_quote(str(symbol).strip().upper())

    def _history(symbol, period="6mo"):
        days = {"1mo": 30, "3mo": 90, "6mo": 180, "1y": 365}.get(period, 180)
        return {
            "symbol": str(symbol).upper(),
            "history": seed.snapshot_history(str(symbol).upper(), days=days),
            "source": "snapshot",
        }

    monkeypatch.setattr(market_mod.market_service, "get_stock_price", _price)
    monkeypatch.setattr(market_mod.market_service, "get_stock_history", _history)
    yield
