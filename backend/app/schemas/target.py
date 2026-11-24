from pydantic import BaseModel


class TargetOut(BaseModel):
    id: int
    user_id: int
    financial_year: str
    yearly_target: float
    quarterly_target: float
    monthly_target: float
    weekly_target: float

    model_config = {"from_attributes": True}


class TargetAchievement(BaseModel):
    financial_year: str
    yearly_target: float
    quarterly_target: float
    monthly_target: float
    weekly_target: float

    yearly_pnl: float
    current_quarter_pnl: float
    current_month_pnl: float
    current_week_pnl: float

    yearly_achieved: bool
    quarterly_achieved: bool
    monthly_achieved: bool
    weekly_achieved: bool

    yearly_pct: float
    quarterly_pct: float
    monthly_pct: float
    weekly_pct: float
