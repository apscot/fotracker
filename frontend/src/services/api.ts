import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(err)
  },
)

export default api

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { username: string; email: string; password: string; full_name?: string }) =>
    api.post('/auth/register', data),
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// ── Home ──────────────────────────────────────────────────────────────────────
export const homeApi = {
  getFinancialYears: () => api.get('/home/financial-years'),
  getSummary: (fy?: string) => api.get('/home/summary', { params: { financial_year: fy } }),
  addInvestment: (data: object) => api.post('/home/investment', data),
  getInvestments: (fy?: string) => api.get('/home/investments', { params: { financial_year: fy } }),
  deleteInvestment: (id: number) => api.delete(`/home/investment/${id}`),
  addInterest: (data: object) => api.post('/home/interest', data),
  getInterests: (fy?: string) => api.get('/home/interests', { params: { financial_year: fy } }),
}

// ── TradeBook ─────────────────────────────────────────────────────────────────
export const tradebookApi = {
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/tradebook/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getTrades: (params: {
    financial_year?: string
    page?: number
    page_size?: number
    symbol?: string
    trade_type?: string
  }) => api.get('/tradebook/trades', { params }),
}

// ── P&L ──────────────────────────────────────────────────────────────────────
export const pnlApi = {
  getSummary: (fy?: string) => api.get('/pnl/summary', { params: { financial_year: fy } }),
}

// ── Target ───────────────────────────────────────────────────────────────────
export const targetApi = {
  getAchievement: (fy?: string) =>
    api.get('/target/achievement', { params: { financial_year: fy } }),
  recalculate: (fy?: string) =>
    api.post('/target/recalculate', null, { params: { financial_year: fy } }),
}
