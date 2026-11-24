import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Typography, Space } from 'antd'
import {
  HomeOutlined,
  UnorderedListOutlined,
  FundOutlined,
  AimOutlined,
  LogoutOutlined,
  UserOutlined,
  StockOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store/authStore'
import type { MenuProps } from 'antd'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const NAV_ITEMS = [
  { key: '/home',      icon: <HomeOutlined />,          label: 'Home' },
  { key: '/tradebook', icon: <UnorderedListOutlined />,  label: 'Trade Book' },
  { key: '/pnl',       icon: <FundOutlined />,           label: 'P & L' },
  { key: '/target',    icon: <AimOutlined />,            label: 'Target' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const userMenu: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: () => { logout(); navigate('/login') },
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}
      >
        {/* Logo */}
        <div style={{
          height: 64, display: 'flex', alignItems: 'center',
          justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Space>
            <StockOutlined style={{ color: '#4361ee', fontSize: 22 }} />
            <Text strong style={{ color: '#fff', fontSize: 16 }}>FO Tracker</Text>
          </Space>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={NAV_ITEMS.map((i) => ({ ...i, onClick: () => navigate(i.key) }))}
          style={{ marginTop: 8, border: 'none' }}
        />
      </Sider>

      <Layout style={{ marginLeft: 220 }}>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 99,
        }}>
          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ background: '#4361ee' }} />
              <Text style={{ fontSize: 14 }}>{user?.full_name || user?.username}</Text>
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ margin: 24, minHeight: 'calc(100vh - 112px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
