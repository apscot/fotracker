from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import defaultdict
from app.models.investment import Investment
from app.models.interest import Interest
from app.models.trade import Trade
from app.schemas.investment import InvestmentCreate, InterestCreate
from app.services.pnl_service import calculate_pnl


def add_investment(db: Session, user_id: int, data: InvestmentCreate) -> Investment:
    inv = Investment(user_id=user_id, **data.model_dump())
    db.add(inv)
    db.commit()
    db.refresh(inv)
    # Auto-recalculate targets when a new investment is added
    from app.services.target_service import recalculate_targets_from_investment
    recalculate_targets_from_investment(db, user_id, data.financial_year)
    return inv


def add_interest(db: Session, user_id: int, data: InterestCreate) -> Interest:
    interest = Interest(user_id=user_id, **data.model_dump())
    db.add(interest)
    db.commit()
    db.refresh(interest)
    return interest


def get_home_summary(db: Session, user_id: int, financial_year: str) -> dict:
    total_invested = float(
        db.query(func.coalesce(func.sum(Investment.invested_value), 0))
        .filter(Investment.user_id == user_id, Investment.financial_year == financial_year)
        .scalar()
        or 0
    )
    total_interest = float(
        db.query(func.coalesce(func.sum(Interest.amount), 0))
        .filter(Interest.user_id == user_id, Interest.financial_year == financial_year)
        .scalar()
        or 0
    )

    pnl_data = calculate_pnl(db, user_id, financial_year)
    total_pnl = pnl_data["net_pnl"]

    growth_data = _build_growth_chart(db, user_id, financial_year, total_invested)

    return {
        "total_invested": total_invested,
        "total_interest": total_interest,
        "total_pnl": total_pnl,
        "net_value": total_invested + total_interest + total_pnl,
        "financial_year": financial_year,
        "growth_data": growth_data,
    }


def _build_growth_chart(db: Session, user_id: int, financial_year: str, total_invested: float) -> list:
    trades = (
        db.query(Trade)
        .filter(Trade.user_id == user_id, Trade.financial_year == financial_year)
        .order_by(Trade.trade_date)
        .all()
    )
    interests = (
        db.query(Interest)
        .filter(Interest.user_id == user_id, Interest.financial_year == financial_year)
        .order_by(Interest.interest_date)
        .all()
    )

    monthly_pnl: dict = defaultdict(float)
    monthly_int: dict = defaultdict(float)

    for t in trades:
        mk = t.trade_date.strftime("%Y-%m")
        val = float(t.quantity) * float(t.price)
        monthly_pnl[mk] += val if t.trade_type == "sell" else -val

    for i in interests:
        monthly_int[i.interest_date.strftime("%Y-%m")] += float(i.amount)

    all_months = sorted(set(list(monthly_pnl) + list(monthly_int)))
    cumulative = 0.0
    result = []
    for m in all_months:
        cumulative += monthly_pnl.get(m, 0) + monthly_int.get(m, 0)
        result.append({
            "date": m,
            "invested": total_invested,
            "returns": round(cumulative, 2),
            "net_value": round(total_invested + cumulative, 2),
        })
    return result
