import datetime
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from app.db.base_class import Base

class Watchlist(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    asset_symbol = Column(String, index=True)
    asset_type = Column(Enum("stock", "crypto", "forex", name="asset_type_enum_watchlist"), index=True)
    added_at = Column(DateTime, default=datetime.datetime.utcnow)
