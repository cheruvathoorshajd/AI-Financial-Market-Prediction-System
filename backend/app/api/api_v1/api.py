from fastapi import APIRouter

from app.api.endpoints import auth, users, market, ml_predictions

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(market.router, prefix="/market", tags=["market"])
api_router.include_router(ml_predictions.router, prefix="/ml", tags=["machine-learning"])
