from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from app.models.target import Target
from app.models.investment import Investment
from app.models.trade import Trade
from app.services.pnl_service import calculate_period_pnl


def _recalculate(db: Session, user_id: int, financial_year: str) -> Target:
    total_invested = (
        db.query(func.coalesce(func.sum(Investment.invested_value), 0))
        .filter(Investment.user_id == user_id, Investment.financial_year == financial_year)
        .scalar()
        or 0
    )
    yearly = float(total_invested) * 0.10

    target = (
        db.query(Target)
        .filter(Target.user_id == user_id, Target.financial_year == financial_year)
        .first()
    )
    if target:
        target.yearly_target = yearly
        target.quarterly_target = yearly / 4
        target.monthly_target = yearly / 12
        target.weekly_target = yearly / 52
    else:
        target = Target(
            user_id=user_id,
            financial_year=financial_year,
            yearly_target=yearly,
            quarterly_target=yearly / 4,
            monthly_target=yearly / 12,
            weekly_target=yearly / 52,
        )
        db.add(target)
    db.commit()
    db.refresh(target)
    return target


def get_or_create_target(db: Session, user_id: int, financial_year: str) -> Target:
    target = (
        db.query(Target)
        .filter(Target.user_id == user_id, Target.financial_year == financial_year)
        .first()
    )
    if not target:
        target = _recalculate(db, user_id, financial_year)
    return target


def recalculate_targets_from_investment(db: Session, user_id: int, financial_year: str) -> Target:
    return _recalculate(db, user_id, financial_year)


def _current_quarter_range(today: date):
    m = today.month
    if 4 <= m <= 6:
        return date(today.year, 4, 1), date(today.year, 6, 30)
    elif 7 <= m <= 9:
        return date(today.year, 7, 1), date(today.year, 9, 30)
    elif 10 <= m <= 12:
        return date(today.year, 10, 1), date(today.year, 12, 31)
    else:
        return date(today.year, 1, 1), date(today.year, 3, 31)


def get_target_achievement(db: Session, user_id: int, financial_year: str) -> dict:
    target = get_or_create_target(db, user_id, financial_year)
    today = date.today()

    all_trades = db.query(Trade).filter(
        Trade.user_id == user_id,
        Trade.financial_year == financial_year,
    ).all()

    # Yearly
    fy_start_yr = int(financial_year.split("-")[0])
    yearly_pnl = calculate_period_pnl(all_trades, date(fy_start_yr, 4, 1), today)

    # Quarterly
    q_start, q_end = _current_quarter_range(today)
    quarterly_pnl = calculate_period_pnl(all_trades, q_start, min(q_end, today))

    # Monthly
    monthly_pnl = calculate_period_pnl(all_trades, today.replace(day=1), today)

    # Weekly (Mon–today)
    week_start = today - timedelta(days=today.weekday())
    weekly_pnl = calculate_period_pnl(all_trades, week_start, today)

    def pct(actual, tgt):
        return round((actual / tgt) * 100, 2) if tgt else 0.0

    yt, qt, mt, wt = (
        float(target.yearly_target),
        float(target.quarterly_target),
        float(target.monthly_target),
        float(target.weekly_target),
    )

    return {
        "financial_year": financial_year,
        "yearly_target": yt,
        "quarterly_target": qt,
        "monthly_target": mt,
        "weekly_target": wt,
        "yearly_pnl": yearly_pnl,
        "current_quarter_pnl": quarterly_pnl,
        "current_month_pnl": monthly_pnl,
        "current_week_pnl": weekly_pnl,
        "yearly_achieved": yearly_pnl >= yt,
        "quarterly_achieved": quarterly_pnl >= qt,
        "monthly_achieved": monthly_pnl >= mt,
        "weekly_achieved": weekly_pnl >= wt,
        "yearly_pct": pct(yearly_pnl, yt),
        "quarterly_pct": pct(quarterly_pnl, qt),
        "monthly_pct": pct(monthly_pnl, mt),
        "weekly_pct": pct(weekly_pnl, wt),
    }
