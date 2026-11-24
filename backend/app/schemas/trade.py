from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal


class TradeBase(BaseModel):
    symbol: str
    isin: Optional[str] = None
    trade_date: date
    exchange: str
    segment: str
    series: Optional[str] = None
    trade_type: str
    auction: bool = False
    quantity: Decimal
    price: Decimal
    trade_id: str
    order_id: str
    order_execution_time: datetime
    expiry_date: Optional[date] = None


class TradeOut(TradeBase):
    id: int
    user_id: int
    financial_year: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TradeUploadResponse(BaseModel):
    total_rows: int
    inserted: int
    skipped_duplicates: int
    errors: List[str] = []


class TradeListResponse(BaseModel):
    trades: List[TradeOut]
    total: int
    page: int
    page_size: int
    total_pages: int
