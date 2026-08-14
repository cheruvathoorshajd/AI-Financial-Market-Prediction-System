from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.models.watchlist import WatchlistItem

router = APIRouter()


class WatchlistBody(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=12)


def _symbols(db: Session, user_id: int) -> list[str]:
    rows = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.user_id == user_id)
        .order_by(WatchlistItem.created_at.asc())
        .all()
    )
    return [r.symbol for r in rows]


@router.get("")
@router.get("/")
async def get_watchlist(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    return {"symbols": _symbols(db, user.id)}


@router.post("")
@router.post("/")
async def add_to_watchlist(
    body: WatchlistBody,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    symbol = body.symbol.strip().upper()
    exists = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.user_id == user.id, WatchlistItem.symbol == symbol)
        .first()
    )
    if not exists:
        db.add(WatchlistItem(user_id=user.id, symbol=symbol))
        db.commit()
    return {"symbols": _symbols(db, user.id)}


@router.delete("/{symbol}")
async def remove_from_watchlist(
    symbol: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    db.query(WatchlistItem).filter(
        WatchlistItem.user_id == user.id,
        WatchlistItem.symbol == symbol.strip().upper(),
    ).delete()
    db.commit()
    return {"symbols": _symbols(db, user.id)}
