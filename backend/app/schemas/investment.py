from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal


class InvestmentCreate(BaseModel):
    instrument_type: str
    name: str
    invested_value: Decimal
    investment_date: date
    financial_year: str
    notes: Optional[str] = None


class InvestmentOut(InvestmentCreate):
    id: int
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class InterestCreate(BaseModel):
    investment_id: Optional[int] = None
    amount: Decimal
    interest_date: date
    description: Optional[str] = None
    financial_year: str


class InterestOut(InterestCreate):
    id: int
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class GrowthDataPoint(BaseModel):
    date: str
    invested: float
    returns: float
    net_value: float


class HomeSummary(BaseModel):
    total_invested: float
    total_interest: float
    total_pnl: float
    net_value: float
    financial_year: str
    growth_data: List[GrowthDataPoint]
