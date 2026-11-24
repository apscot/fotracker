import { useState, useEffect } from 'react'
import {
  Row, Col, Card, Statistic, Select, Button, Form, Input,
  InputNumber, DatePicker, Table, Divider, Typography, Space,
  message, Collapse, Tag, Spin,
} from 'antd'
import {
  PlusOutlined, DeleteOutlined, RiseOutlined, FallOutlined,
  DollarOutlined, BankOutlined,
} from '@ant-design/icons'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import dayjs from 'dayjs'
import { homeApi } from '@/services/api'
import type { HomeSummary, Investment, Interest } from '@/types'

const { Title, Text } = Typography
const { Option } = Select
const { Panel } = Collapse

const INSTRUMENT_TYPES = ['GSec', 'Mutual Fund', 'Fixed Deposit', 'Equity', 'ETF', 'PPF', 'NPS', 'Other']

function fmt(val: number) {
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

export default function HomePage() {
  const [financialYears, setFinancialYears] = useState<string[]>([])
  const [fy, setFy] = useState<string>('')
  const [summary, setSummary] = useState<HomeSummary | null>(null)
  const [investments, setInvestments] = useState<Investment[]>([])
  const [interests, setInterests] = useState<Interest[]>([])
  const [loading, setLoading] = useState(true)
  const [invForm] = Form.useForm()
  const [intForm] = Form.useForm()

  useEffect(() => {
    homeApi.getFinancialYears().then(({ data }) => {
      setFinancialYears(data.years)
      setFy(data.years[0])
    })
  }, [])

  useEffect(() => {
    if (!fy) return
    setLoading(true)
    Promise.all([
      homeApi.getSummary(fy),
      homeApi.getInvestments(fy),
      homeApi.getInterests(fy),
    ]).then(([s, inv, int]) => {
      setSummary(s.data)
      setInvestments(inv.data)
      setInterests(int.data)
    }).finally(() => setLoading(false))
  }, [fy])

  async function addInvestment(values: any) {
    try {
      const payload = {
        ...values,
        investment_date: values.investment_date.format('YYYY-MM-DD'),
        financial_year: fy,
      }
      await homeApi.addInvestment(payload)
      message.success('Investment added')
      invForm.resetFields()
      refreshData()
    } catch (err: any) {
      message.error(err?.response?.data?.detail || 'Failed to add investment')
    }
  }

  async function addInterest(values: any) {
    try {
      const payload = {
        ...values,
        interest_date: values.interest_date.format('YYYY-MM-DD'),
        financial_year: fy,
      }
      await homeApi.addInterest(payload)
      message.success('Interest entry added')
      intForm.resetFields()
      refreshData()
    } catch (err: any) {
      message.error(err?.response?.data?.detail || 'Failed to add interest')
    }
  }

  async function deleteInvestment(id: number) {
    try {
      await homeApi.deleteInvestment(id)
      message.success('Investment removed')
      refreshData()
    } catch {
      message.error('Failed to delete')
    }
  }

  function refreshData() {
    if (!fy) return
    Promise.all([
      homeApi.getSummary(fy),
      homeApi.getInvestments(fy),
      homeApi.getInterests(fy),
    ]).then(([s, inv, int]) => {
      setSummary(s.data)
      setInvestments(inv.data)
      setInterests(int.data)
    })
  }

  const invColumns = [
    { title: 'Type', dataIndex: 'instrument_type', key: 'type', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Amount (₹)', dataIndex: 'invested_value', key: 'amount', render: (v: number) => fmt(v), align: 'right' as const },
    { title: 'Date', dataIndex: 'investment_date', key: 'date' },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', render: (v: string) => v || '—' },
    {
      title: '', key: 'action',
      render: (_: any, row: Investment) => (
        <Button danger icon={<DeleteOutlined />} size="small" onClick={() => deleteInvestment(row.id)} />
      ),
    },
  ]

  const intColumns = [
    { title: 'Amount (₹)', dataIndex: 'amount', key: 'amount', render: (v: number) => fmt(v), align: 'right' as const },
    { title: 'Date', dataIndex: 'interest_date', key: 'date' },
    { title: 'Description', dataIndex: 'description', key: 'desc', render: (v: string) => v || '—' },
  ]

  return (
    <Spin spinning={loading}>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 24 }} wrap>
        <Title level={3} style={{ margin: 0 }}>Portfolio Overview</Title>
        <Space>
          <Text type="secondary">Financial Year:</Text>
          <Select value={fy} onChange={setFy} style={{ width: 120 }}>
            {financialYears.map((y) => <Option key={y} value={y}>{y}</Option>)}
          </Select>
        </Space>
      </Space>

      {/* Summary cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Invested', val: summary?.total_invested ?? 0, cls: 'stat-card-blue', icon: <BankOutlined /> },
          { label: 'Interest Earned', val: summary?.total_interest ?? 0, cls: 'stat-card-green', icon: <DollarOutlined /> },
          { label: 'Trading P&L', val: summary?.total_pnl ?? 0, cls: summary?.total_pnl ?? 0 >= 0 ? 'stat-card-green' : 'stat-card-red', icon: summary?.total_pnl ?? 0 >= 0 ? <RiseOutlined /> : <FallOutlined /> },
          { label: 'Net Portfolio Value', val: summary?.net_value ?? 0, cls: 'stat-card-orange', icon: <RiseOutlined /> },
        ].map((s) => (
          <Col xs={24} sm={12} lg={6} key={s.label}>
            <Card className={s.cls} style={{ borderRadius: 12, border: 'none' }}>
              <Statistic
                title={<Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>{s.label}</Text>}
                value={Math.abs(s.val)}
                prefix={s.val < 0 ? '- ₹' : '₹'}
                valueStyle={{ color: '#fff', fontSize: 22, fontWeight: 700 }}
                formatter={(v) => Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Growth Chart */}
      <Card title="Portfolio Growth" style={{ marginBottom: 24, borderRadius: 12 }}>
        {summary?.growth_data && summary.growth_data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={summary.growth_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Legend />
              <Line type="monotone" dataKey="invested" stroke="#4361ee" strokeWidth={2} dot={false} name="Invested" />
              <Line type="monotone" dataKey="returns" stroke="#52c41a" strokeWidth={2} dot={false} name="Returns" />
              <Line type="monotone" dataKey="net_value" stroke="#f7971e" strokeWidth={2} dot={false} name="Net Value" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            No trade / interest data for this FY yet. Add investments to see growth.
          </div>
        )}
      </Card>

      {/* Add forms */}
      <Collapse defaultActiveKey={[]} style={{ marginBottom: 24 }}>
        <Panel header="➕ Add Investment (GSec, Mutual Fund, FD etc.)" key="investment">
          <Form form={invForm} layout="inline" onFinish={addInvestment}>
            <Form.Item name="instrument_type" rules={[{ required: true }]}>
              <Select placeholder="Type" style={{ width: 150 }}>
                {INSTRUMENT_TYPES.map((t) => <Option key={t} value={t}>{t}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="name" rules={[{ required: true, message: 'Name required' }]}>
              <Input placeholder="Name / Scheme" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="invested_value" rules={[{ required: true }]}>
              <InputNumber placeholder="Amount (₹)" prefix="₹" style={{ width: 160 }} min={0} />
            </Form.Item>
            <Form.Item name="investment_date" rules={[{ required: true }]}>
              <DatePicker placeholder="Date" />
            </Form.Item>
            <Form.Item name="notes">
              <Input placeholder="Notes (optional)" style={{ width: 160 }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>Add</Button>
            </Form.Item>
          </Form>
        </Panel>

        <Panel header="➕ Add Interest / Returns" key="interest">
          <Form form={intForm} layout="inline" onFinish={addInterest}>
            <Form.Item name="amount" rules={[{ required: true }]}>
              <InputNumber placeholder="Amount (₹)" prefix="₹" style={{ width: 160 }} min={0} />
            </Form.Item>
            <Form.Item name="interest_date" rules={[{ required: true }]}>
              <DatePicker placeholder="Date" />
            </Form.Item>
            <Form.Item name="description">
              <Input placeholder="Description (optional)" style={{ width: 220 }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>Add</Button>
            </Form.Item>
          </Form>
        </Panel>
      </Collapse>

      {/* Investments table */}
      <Card title="Investments" style={{ marginBottom: 24, borderRadius: 12 }}>
        <Table
          dataSource={investments}
          columns={invColumns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Interest table */}
      <Card title="Interest / Returns" style={{ borderRadius: 12 }}>
        <Table
          dataSource={interests}
          columns={intColumns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </Spin>
  )
}
