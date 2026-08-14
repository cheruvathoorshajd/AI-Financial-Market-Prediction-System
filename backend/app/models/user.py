from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum

from app.db.base_class import Base


def _utcnow() -> datetime:
    """Timezone-aware UTC now (datetime.utcnow() is deprecated in 3.12+)."""
    return datetime.now(timezone.utc)

class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    created_at = Column(DateTime, default=_utcnow)
    last_login = Column(DateTime, default=_utcnow)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    risk_tolerance = Column(Enum("low", "medium", "high", name="risk_tolerance_enum"), default="medium")

