// Shared TypeScript types mirroring the backend Pydantic schemas

export interface User {
  id: number
  username: string
  email: string
  full_name?: string
  is_active: boolean
  created_at: string
}

export interface Token {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface Trade {
  id: number
  user_id: number
  symbol: string
  isin?: string
  trade_date: string
  exchange: string
  segment: string
  series?: string
  trade_type: 'buy' | 'sell'
  auction: boolean
  quantity: number
  price: number
  trade_id: string
  order_id: string
  order_execution_time: string
  expiry_date?: string
  financial_year: string
  created_at: string
}

export interface TradeListResponse {
  trades: Trade[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface TradeUploadResponse {
  total_rows: number
  inserted: number
  skipped_duplicates: number
  errors: string[]
}

export interface Investment {
  id: number
  user_id: number
  instrument_type: string
  name: string
  invested_value: number
  investment_date: string
  financial_year: string
  notes?: string
  created_at: string
}

export interface Interest {
  id: number
  user_id: number
  investment_id?: number
  amount: number
  interest_date: string
  description?: string
  financial_year: string
  created_at: string
}

export interface GrowthDataPoint {
  date: string
  invested: number
  returns: number
  net_value: number
}

export interface HomeSummary {
  total_invested: number
  total_interest: number
  total_pnl: number
  net_value: number
  financial_year: string
  growth_data: GrowthDataPoint[]
}

export interface PnLByExpiry {
  expiry_date: string | null
  symbol_base: string
  total_buy_qty: number
  total_sell_qty: number
  buy_value: number
  sell_value: number
  realized_pnl: number
  status: 'profit' | 'loss' | 'breakeven'
}

export interface PnLSummary {
  total_profit: number
  total_loss: number
  net_pnl: number
  total_trades: number
  profitable_expiries: number
  losing_expiries: number
  financial_year: string
  by_expiry: PnLByExpiry[]
}

export interface TargetAchievement {
  financial_year: string
  yearly_target: number
  quarterly_target: number
  monthly_target: number
  weekly_target: number
  yearly_pnl: number
  current_quarter_pnl: number
  current_month_pnl: number
  current_week_pnl: number
  yearly_achieved: boolean
  quarterly_achieved: boolean
  monthly_achieved: boolean
  weekly_achieved: boolean
  yearly_pct: number
  quarterly_pct: number
  monthly_pct: number
  weekly_pct: number
}
