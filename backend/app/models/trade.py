from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Numeric,
    ForeignKey, Date, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # CSV columns
    symbol = Column(String(100), nullable=False)
    isin = Column(String(20), nullable=True)
    trade_date = Column(Date, nullable=False)
    exchange = Column(String(20), nullable=False)
    segment = Column(String(20), nullable=False)
    series = Column(String(20), nullable=True)
    trade_type = Column(String(10), nullable=False)   # buy / sell
    auction = Column(Boolean, default=False)
    quantity = Column(Numeric(15, 6), nullable=False)
    price = Column(Numeric(15, 6), nullable=False)
    trade_id = Column(String(50), nullable=False)
    order_id = Column(String(50), nullable=False)
    order_execution_time = Column(DateTime, nullable=False)
    expiry_date = Column(Date, nullable=True)

    # Archival
    financial_year = Column(String(10), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="trades")

    __table_args__ = (
        UniqueConstraint("user_id", "trade_id", "order_id", name="uq_user_trade_order"),
    )
