from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.target import TargetAchievement, TargetOut
from app.services.target_service import get_target_achievement, recalculate_targets_from_investment
from app.utils.financial_year import get_current_financial_year

router = APIRouter(prefix="/target", tags=["Target"])


@router.get("/achievement", response_model=TargetAchievement)
def target_achievement(
    financial_year: str = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fy = financial_year or get_current_financial_year()
    return get_target_achievement(db, current_user.id, fy)


@router.post("/recalculate", response_model=TargetOut)
def recalculate(
    financial_year: str = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fy = financial_year or get_current_financial_year()
    return recalculate_targets_from_investment(db, current_user.id, fy)
