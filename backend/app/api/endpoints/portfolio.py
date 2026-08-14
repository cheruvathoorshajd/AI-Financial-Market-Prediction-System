from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_current_user_optional, get_db
from app.models.holding import Holding
from app.models.user import User
from app.services import portfolio_service

router = APIRouter()


class HoldingBody(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=12)
    shares: float = Field(..., gt=0, le=1e12, allow_inf_nan=False)
    avgCost: float = Field(..., ge=0, le=1e12, allow_inf_nan=False)


def _lots(db: Session, user_id: int) -> List[dict]:
    rows = (
        db.query(Holding)
        .filter(Holding.user_id == user_id)
        .order_by(Holding.created_at.asc())
        .all()
    )
    return [{"symbol": r.symbol, "shares": r.shares, "avgCost": r.avg_cost} for r in rows]


@router.get("")
@router.get("/")
async def get_portfolio(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Portfolio with live/snapshot valuations, per-holding P/L, sector allocation
    and sparklines. Signed in → the user's own holdings; otherwise the public
    demo portfolio, so the product stays explorable without an account.
    """
    if user:
        return portfolio_service.get_portfolio(lots=_lots(db, user.id))
    return portfolio_service.get_portfolio()


@router.post("/holdings")
@router.post("/holdings/")
async def upsert_holding(
    body: HoldingBody,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    """Add a holding, or update shares/avg cost if the symbol is already held."""
    symbol = body.symbol.strip().upper()
    row = (
        db.query(Holding)
        .filter(Holding.user_id == user.id, Holding.symbol == symbol)
        .first()
    )
    if row:
        row.shares = body.shares
        row.avg_cost = body.avgCost
    else:
        db.add(
            Holding(
                user_id=user.id,
                symbol=symbol,
                shares=body.shares,
                avg_cost=body.avgCost,
            )
        )
    db.commit()
    return portfolio_service.get_portfolio(lots=_lots(db, user.id))


@router.delete("/holdings/{symbol}")
async def delete_holding(
    symbol: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    db.query(Holding).filter(
        Holding.user_id == user.id, Holding.symbol == symbol.strip().upper()
    ).delete()
    db.commit()
    return portfolio_service.get_portfolio(lots=_lots(db, user.id))
