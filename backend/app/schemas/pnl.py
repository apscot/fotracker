from pydantic import BaseModel
from typing import List, Optional
from datetime import date


class PnLByExpiry(BaseModel):
    expiry_date: Optional[date]
    symbol_base: str
    total_buy_qty: float
    total_sell_qty: float
    buy_value: float
    sell_value: float
    realized_pnl: float
    status: str   # profit / loss / breakeven


class PnLSummary(BaseModel):
    total_profit: float
    total_loss: float
    net_pnl: float
    total_trades: int
    profitable_expiries: int
    losing_expiries: int
    financial_year: str
    by_expiry: List[PnLByExpiry]
