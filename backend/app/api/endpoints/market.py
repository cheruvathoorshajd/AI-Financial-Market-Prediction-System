from typing import Literal

from fastapi import APIRouter, HTTPException, Query

from app.services.market_service import market_service, _aggregate_source

router = APIRouter()


@router.get("/stock/{symbol}")
def get_stock(symbol: str):
    """Current price and info for a single stock (live or snapshot)."""
    data = market_service.get_stock_price(symbol)
    if not data:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
    return data


@router.get("/stocks")
def get_stocks(symbols: str = Query(..., description="Comma-separated symbols")):
    """Current prices for multiple stocks."""
    symbol_list = [s.strip() for s in symbols.split(",") if s.strip()][:25]
    stocks = market_service.get_multiple_stocks(symbol_list)
    return {"stocks": stocks, "source": _aggregate_source(stocks)}


@router.get("/indices")
def get_indices():
    """Major market indices (S&P 500, NASDAQ, Dow)."""
    return market_service.get_market_indices()


@router.get("/trending")
def get_trending(limit: int = Query(8, ge=1, le=12)):
    """Trending stocks, ranked by absolute daily move."""
    return market_service.get_trending_stocks(limit)


@router.get("/movers")
def get_movers():
    """Top gainers and losers."""
    return market_service.get_top_gainers_losers()


@router.get("/history/{symbol}")
def get_history(
    symbol: str,
    period: Literal["1mo", "3mo", "6mo", "1y"] = Query("6mo"),
):
    """Historical daily prices for a stock."""
    result = market_service.get_stock_history(symbol, period)
    if not result["history"]:
        raise HTTPException(status_code=404, detail=f"No history found for {symbol}")
    return result


@router.get("/search")
def search_stocks(q: str = Query(..., min_length=1, max_length=64)):
    """Search stocks by symbol or name."""
    return market_service.search_stocks(q)
