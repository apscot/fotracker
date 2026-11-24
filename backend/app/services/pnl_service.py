from sqlalchemy.orm import Session
from app.models.trade import Trade
from datetime import date


def _get_symbol_base(symbol: str) -> str:
    """Strip expiry+strike+CE/PE suffix to get the base index name."""
    for i, ch in enumerate(symbol):
        if ch.isdigit():
            return symbol[:i]
    return symbol


def calculate_pnl(db: Session, user_id: int, financial_year: str) -> dict:
    trades = (
        db.query(Trade)
        .filter(Trade.user_id == user_id, Trade.financial_year == financial_year)
        .all()
    )

    # Group by (expiry_date, symbol_base)
    groups: dict = {}
    for t in trades:
        key = (t.expiry_date, _get_symbol_base(t.symbol))
        groups.setdefault(key, {"buys": [], "sells": []})
        groups[key]["buys" if t.trade_type == "buy" else "sells"].append(t)

    pnl_records, total_profit, total_loss = [], 0.0, 0.0
    profitable_expiries = losing_expiries = 0

    for (expiry_date, symbol_base), data in groups.items():
        buy_qty = sum(float(t.quantity) for t in data["buys"])
        sell_qty = sum(float(t.quantity) for t in data["sells"])
        buy_value = sum(float(t.quantity) * float(t.price) for t in data["buys"])
        sell_value = sum(float(t.quantity) * float(t.price) for t in data["sells"])
        realized_pnl = sell_value - buy_value

        if realized_pnl > 0:
            total_profit += realized_pnl
            profitable_expiries += 1
        elif realized_pnl < 0:
            total_loss += abs(realized_pnl)
            losing_expiries += 1

        pnl_records.append({
            "expiry_date": expiry_date,
            "symbol_base": symbol_base,
            "total_buy_qty": buy_qty,
            "total_sell_qty": sell_qty,
            "buy_value": buy_value,
            "sell_value": sell_value,
            "realized_pnl": realized_pnl,
            "status": "profit" if realized_pnl > 0 else ("loss" if realized_pnl < 0 else "breakeven"),
        })

    pnl_records.sort(key=lambda x: x["expiry_date"] or date.min, reverse=True)

    return {
        "total_profit": round(total_profit, 2),
        "total_loss": round(total_loss, 2),
        "net_pnl": round(total_profit - total_loss, 2),
        "total_trades": len(trades),
        "profitable_expiries": profitable_expiries,
        "losing_expiries": losing_expiries,
        "financial_year": financial_year,
        "by_expiry": pnl_records,
    }


def calculate_period_pnl(trades: list, start_date: date, end_date: date) -> float:
    period = [t for t in trades if start_date <= t.trade_date <= end_date]
    buy = sum(float(t.quantity) * float(t.price) for t in period if t.trade_type == "buy")
    sell = sum(float(t.quantity) * float(t.price) for t in period if t.trade_type == "sell")
    return round(sell - buy, 2)
