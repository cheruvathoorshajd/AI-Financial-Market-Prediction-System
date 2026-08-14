from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.ml import forecaster, insights_service

router = APIRouter()


@router.get("/asset/{symbol}")
def asset_insight(symbol: str):
    """A grounded, transparent reading of a single asset (explanation, not advice)."""
    result = insights_service.asset_insight(symbol)
    if not result:
        raise HTTPException(status_code=404, detail=f"No data available for {symbol}")
    return result


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=400)
    symbol: Optional[str] = Field(None, max_length=12)


@router.post("/ask")
def ask(body: AskRequest):
    """Answer a natural-language question grounded in the live data on hand."""
    symbol = body.symbol.strip().upper() if body.symbol else None
    return insights_service.answer_question(body.question.strip(), symbol)


@router.get("/outlook")
def outlook(limit: int = Query(8, ge=1, le=12)):
    """
    An experimental LSTM's ranked next-day outlook, with honest backtest metrics.

    Sync (``def``) on purpose: training is CPU-bound and would block the event
    loop as ``async`` — FastAPI runs sync handlers in a threadpool instead.
    """
    return forecaster.ranked_outlook(limit=limit)


@router.get("/forecast/{symbol}")
def forecast(symbol: str):
    """An experimental LSTM forecast for one asset (illustrative, not advice)."""
    result = forecaster.forecast_symbol(symbol)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"No forecast available for {symbol} (insufficient data or model unavailable).",
        )
    return result
