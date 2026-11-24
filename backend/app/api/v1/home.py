from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.investment import Investment
from app.models.interest import Interest
from app.schemas.investment import (
    InvestmentCreate, InvestmentOut,
    InterestCreate, InterestOut, HomeSummary,
)
from app.services.portfolio_service import add_investment, add_interest, get_home_summary
from app.utils.financial_year import get_current_financial_year, get_available_financial_years

router = APIRouter(prefix="/home", tags=["Home"])


@router.get("/financial-years")
def financial_years():
    return {"years": get_available_financial_years()}


@router.get("/summary", response_model=HomeSummary)
def summary(
    financial_year: str = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fy = financial_year or get_current_financial_year()
    return get_home_summary(db, current_user.id, fy)


@router.post("/investment", response_model=InvestmentOut, status_code=201)
def create_investment(
    data: InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return add_investment(db, current_user.id, data)


@router.get("/investments", response_model=List[InvestmentOut])
def list_investments(
    financial_year: str = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fy = financial_year or get_current_financial_year()
    return (
        db.query(Investment)
        .filter(Investment.user_id == current_user.id, Investment.financial_year == fy)
        .order_by(Investment.investment_date.desc())
        .all()
    )


@router.delete("/investment/{inv_id}", status_code=204)
def delete_investment(
    inv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inv = db.query(Investment).filter(
        Investment.id == inv_id, Investment.user_id == current_user.id
    ).first()
    if not inv:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Investment not found")
    db.delete(inv)
    db.commit()


@router.post("/interest", response_model=InterestOut, status_code=201)
def create_interest(
    data: InterestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return add_interest(db, current_user.id, data)


@router.get("/interests", response_model=List[InterestOut])
def list_interests(
    financial_year: str = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fy = financial_year or get_current_financial_year()
    return (
        db.query(Interest)
        .filter(Interest.user_id == current_user.id, Interest.financial_year == fy)
        .order_by(Interest.interest_date.desc())
        .all()
    )
