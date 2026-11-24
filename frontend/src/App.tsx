import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { useAuthStore } from '@/store/authStore'
import AppLayout from '@/components/Layout/AppLayout'
import LoginPage from '@/pages/Login/Login'
import HomePage from '@/pages/Home/Home'
import TradeBookPage from '@/pages/TradeBook/TradeBook'
import PnLPage from '@/pages/PnL/PnL'
import TargetPage from '@/pages/Target/Target'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#4361ee',
          colorSuccess: '#52c41a',
          colorError: '#ff4d4f',
          colorWarning: '#faad14',
          borderRadius: 8,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        components: {
          Layout: { siderBg: '#001529' },
          Menu: { darkItemBg: '#001529', darkSubMenuItemBg: '#000c17' },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<HomePage />} />
            <Route path="tradebook" element={<TradeBookPage />} />
            <Route path="pnl" element={<PnLPage />} />
            <Route path="target" element={<TargetPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}
