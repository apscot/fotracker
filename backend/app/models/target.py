from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Target(Base):
    __tablename__ = "targets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    financial_year = Column(String(10), nullable=False)
    yearly_target = Column(Numeric(15, 2), nullable=False, default=0)
    quarterly_target = Column(Numeric(15, 2), nullable=False, default=0)
    monthly_target = Column(Numeric(15, 2), nullable=False, default=0)
    weekly_target = Column(Numeric(15, 2), nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="targets")

    __table_args__ = (
        UniqueConstraint("user_id", "financial_year", name="uq_user_target_fy"),
    )
