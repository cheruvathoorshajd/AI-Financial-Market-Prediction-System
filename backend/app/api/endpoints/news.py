from typing import Optional

from fastapi import APIRouter, Query

from app.services.news_service import news_service

router = APIRouter()


def _split(csv: Optional[str]):
    if not csv:
        return None
    items = [p.strip() for p in csv.split(",") if p.strip()]
    return items or None


@router.get("")
@router.get("/")
def get_news(
    topics: Optional[str] = Query(None, description="Comma-separated finance topics"),
    tickers: Optional[str] = Query(None, description="Comma-separated tickers"),
    limit: int = Query(20, ge=1, le=50),
):
    """Finance/investing news with an honest live→snapshot provider chain."""
    return news_service.get_news(
        tickers=_split(tickers), topics=_split(topics), limit=limit
    )
