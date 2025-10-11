import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from app.db.base_class import Base

class Price_History(Base):
    __tablename__ = 'price_history'
    id = Column(Integer, primary_key=True, index=True)
    asset_symbol = Column(String, index=True)
    asset_type = Column(Enum("stock", "crypto", "forex", name="asset_type_enum_price_history"), index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    open_price = Column(Float)
    close_price = Column(Float)
    high_price = Column(Float)
    low_price = Column(Float)
    volume = Column(Float)
