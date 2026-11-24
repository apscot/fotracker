from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.pnl import PnLSummary
from app.services.pnl_service import calculate_pnl
from app.utils.financial_year import get_current_financial_year

router = APIRouter(prefix="/pnl", tags=["P&L"])


@router.get("/summary", response_model=PnLSummary)
def pnl_summary(
    financial_year: str = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fy = financial_year or get_current_financial_year()
    return calculate_pnl(db, current_user.id, fy)
