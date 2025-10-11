import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text
from app.db.base_class import Base

class AI_Recommendation(Base):
    __tablename__ = 'ai_recommendations'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    asset_symbol = Column(String, index=True)
    recommendation_type = Column(Enum("buy", "sell", "hold", name="recommendation_type_enum"))
    confidence_score = Column(Float)
    reasoning = Column(Text)
    target_price = Column(Float)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime)
