from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.ml.predictor import ml_predictor

router = APIRouter()

@router.get("/predict/{symbol}")
async def predict_stock(
    symbol: str,
    days: int = Query(7, ge=1, le=30, description="Number of days to predict")
):
    """
    Get ML-based price predictions for a stock
    Uses LSTM neural network trained on historical data
    """
    try:
        result = ml_predictor.predict_next_days(symbol.upper(), days)
        if not result:
            raise HTTPException(status_code=404, detail=f"Unable to generate predictions for {symbol}")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analyze/{symbol}")
async def analyze_stock_ml(symbol: str):
    """
    Get comprehensive ML analysis and recommendation for a stock
    Includes 7-day price prediction, trend analysis, and action recommendation
    """
    try:
        result = ml_predictor.analyze_stock_ml(symbol.upper())
        if not result:
            raise HTTPException(status_code=404, detail=f"Unable to analyze {symbol}")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/train/{symbol}")
async def train_model(
    symbol: str,
    epochs: int = Query(50, ge=10, le=200, description="Number of training epochs")
):
    """
    Train the LSTM model for a specific stock
    This endpoint allows custom training for better predictions
    """
    try:
        success = ml_predictor.train_model(symbol.upper(), epochs=epochs)
        if not success:
            raise HTTPException(status_code=500, detail=f"Failed to train model for {symbol}")
        return {
            "message": f"Model successfully trained for {symbol}",
            "symbol": symbol,
            "epochs": epochs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/batch-analyze")
async def batch_analyze(symbols: str = Query(..., description="Comma-separated stock symbols")):
    """
    Analyze multiple stocks at once
    Returns ML predictions and recommendations for each
    """
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(",")]
        results = []
        
        for symbol in symbol_list[:10]:  # Limit to 10 stocks
            analysis = ml_predictor.analyze_stock_ml(symbol)
            if analysis:
                results.append(analysis)
        
        if not results:
            raise HTTPException(status_code=404, detail="Unable to analyze any of the provided symbols")
        
        # Sort by confidence score
        results.sort(key=lambda x: x['confidence'], reverse=True)
        
        return {
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
