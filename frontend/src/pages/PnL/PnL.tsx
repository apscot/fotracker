import { useState, useEffect } from 'react'
import {
  Row, Col, Card, Statistic, Select, Table, Tag, Typography, Space, Spin,
} from 'antd'
import {
  ArrowUpOutlined, ArrowDownOutlined, SwapOutlined,
} from '@ant-design/icons'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { pnlApi, homeApi } from '@/services/api'
import type { PnLSummary, PnLByExpiry } from '@/types'

const { Title, Text } = Typography
const { Option } = Select

const COLORS = ['#52c41a', '#ff4d4f', '#faad14']

function fmt(v: number) {
  return `₹${Math.abs(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

export default function PnLPage() {
  const [financialYears, setFinancialYears] = useState<string[]>([])
  const [fy, setFy] = useState('')
  const [summary, setSummary] = useState<PnLSummary | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    homeApi.getFinancialYears().then(({ data }) => {
      setFinancialYears(data.years)
      setFy(data.years[0])
    })
  }, [])

  useEffect(() => {
    if (!fy) return
    setLoading(true)
    pnlApi.getSummary(fy)
      .then(({ data }) => setSummary(data))
      .finally(() => setLoading(false))
  }, [fy])

  const pieData = summary
    ? [
        { name: 'Profit', value: summary.total_profit },
        { name: 'Loss', value: summary.total_loss },
      ].filter((d) => d.value > 0)
    : []

  const barData = (summary?.by_expiry ?? []).slice(0, 20).map((e) => ({
    name: `${e.symbol_base} ${e.expiry_date ?? '—'}`,
    pnl: e.realized_pnl,
  }))

  const columns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol_base',
      key: 'sym',
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiry_date',
      key: 'expiry',
      render: (v: string | null) => v ?? '—',
    },
    {
      title: 'Buy Qty',
      dataIndex: 'total_buy_qty',
      key: 'bq',
      align: 'right' as const,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: 'Sell Qty',
      dataIndex: 'total_sell_qty',
      key: 'sq',
      align: 'right' as const,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: 'Buy Value (₹)',
      dataIndex: 'buy_value',
      key: 'bv',
      align: 'right' as const,
      render: (v: number) => fmt(v),
    },
    {
      title: 'Sell Value (₹)',
      dataIndex: 'sell_value',
      key: 'sv',
      align: 'right' as const,
      render: (v: number) => fmt(v),
    },
    {
      title: 'Realized P&L (₹)',
      dataIndex: 'realized_pnl',
      key: 'pnl',
      align: 'right' as const,
      render: (v: number) => (
        <Text strong style={{ color: v >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {v >= 0 ? '+' : '-'}{fmt(v)}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => (
        <Tag color={v === 'profit' ? 'success' : v === 'loss' ? 'error' : 'default'}>
          {v.toUpperCase()}
        </Tag>
      ),
    },
  ]

  return (
    <Spin spinning={loading}>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 24 }} wrap>
        <Title level={3} style={{ margin: 0 }}>Profit & Loss</Title>
        <Space>
          <Text type="secondary">Financial Year:</Text>
          <Select value={fy} onChange={setFy} style={{ width: 120 }}>
            {financialYears.map((y) => <Option key={y} value={y}>{y}</Option>)}
          </Select>
        </Space>
      </Space>

      {/* Summary cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg,#11998e,#38ef7d)', border: 'none' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,.85)', fontSize: 13 }}>Total Profit</Text>}
              value={summary?.total_profit ?? 0}
              prefix="₹"
              valueStyle={{ color: '#fff', fontSize: 20, fontWeight: 700 }}
              formatter={(v) => Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              suffix={<ArrowUpOutlined style={{ color: '#fff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg,#f953c6,#b91d73)', border: 'none' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,.85)', fontSize: 13 }}>Total Loss</Text>}
              value={summary?.total_loss ?? 0}
              prefix="₹"
              valueStyle={{ color: '#fff', fontSize: 20, fontWeight: 700 }}
              formatter={(v) => Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              suffix={<ArrowDownOutlined style={{ color: '#fff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{
            borderRadius: 12,
            background: (summary?.net_pnl ?? 0) >= 0
              ? 'linear-gradient(135deg,#667eea,#764ba2)'
              : 'linear-gradient(135deg,#ff416c,#ff4b2b)',
            border: 'none',
          }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,.85)', fontSize: 13 }}>Net P&L</Text>}
              value={Math.abs(summary?.net_pnl ?? 0)}
              prefix={(summary?.net_pnl ?? 0) >= 0 ? '+₹' : '-₹'}
              valueStyle={{ color: '#fff', fontSize: 20, fontWeight: 700 }}
              formatter={(v) => Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg,#f7971e,#ffd200)', border: 'none' }}>
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,.85)', fontSize: 13 }}>Total Trades</Text>}
              value={summary?.total_trades ?? 0}
              valueStyle={{ color: '#fff', fontSize: 20, fontWeight: 700 }}
              suffix={<SwapOutlined style={{ color: '#fff' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card title="Profit vs Loss" style={{ borderRadius: 12, height: '100%' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>No data</div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="P&L by Expiry (Top 20)" style={{ borderRadius: 12 }}>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="pnl" name="P&L" radius={[4, 4, 0, 0]}>
                    {barData.map((d, i) => (
                      <Cell key={i} fill={d.pnl >= 0 ? '#52c41a' : '#ff4d4f'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>No data</div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Detail table */}
      <Card title="P&L by Expiry (Detail)" style={{ borderRadius: 12 }}>
        <Table
          dataSource={summary?.by_expiry ?? []}
          columns={columns}
          rowKey={(r: PnLByExpiry) => `${r.symbol_base}-${r.expiry_date}`}
          size="small"
          pagination={{ pageSize: 15, showTotal: (t) => `Total ${t} records` }}
          scroll={{ x: 900 }}
        />
      </Card>
    </Spin>
  )
}
