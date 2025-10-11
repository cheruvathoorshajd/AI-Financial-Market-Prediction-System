from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.market_service import market_service

router = APIRouter()

@router.get("/stock/{symbol}")
async def get_stock(symbol: str):
    """Get current price and info for a single stock"""
    data = market_service.get_stock_price(symbol)
    if not data:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
    return data

@router.get("/stocks")
async def get_stocks(symbols: str = Query(..., description="Comma-separated stock symbols")):
    """Get current prices for multiple stocks"""
    symbol_list = [s.strip() for s in symbols.split(",")]
    return market_service.get_multiple_stocks(symbol_list)

@router.get("/indices")
async def get_indices():
    """Get major market indices (S&P 500, NASDAQ, DOW)"""
    return market_service.get_market_indices()

@router.get("/trending")
async def get_trending(limit: int = Query(10, ge=1, le=20)):
    """Get trending stocks"""
    return market_service.get_trending_stocks(limit)

@router.get("/movers")
async def get_movers():
    """Get top gainers and losers"""
    return market_service.get_top_gainers_losers()

@router.get("/history/{symbol}")
async def get_history(
    symbol: str,
    period: str = Query("1mo", description="Period: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max")
):
    """Get historical price data for a stock"""
    history = market_service.get_stock_history(symbol, period)
    if not history:
        raise HTTPException(status_code=404, detail=f"No history found for {symbol}")
    return history

@router.get("/search")
async def search_stocks(q: str = Query(..., min_length=1)):
    """Search for stocks by symbol or name"""
    results = market_service.search_stocks(q)
    if not results:
        return {"message": "No stocks found", "results": []}
    return {"results": results}
