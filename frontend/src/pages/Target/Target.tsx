import { useState, useEffect } from 'react'
import {
  Row, Col, Card, Progress, Statistic, Select, Button,
  Typography, Space, Tag, Spin, Tooltip, message,
} from 'antd'
import {
  CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined,
  CalendarOutlined, AimOutlined,
} from '@ant-design/icons'
import { targetApi, homeApi } from '@/services/api'
import type { TargetAchievement } from '@/types'

const { Title, Text } = Typography
const { Option } = Select

function fmt(v: number) {
  return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

function TargetCard({
  title, target, actual, achieved, pct, icon,
}: {
  title: string
  target: number
  actual: number
  achieved: boolean
  pct: number
  icon: React.ReactNode
}) {
  const clampedPct = Math.min(Math.abs(pct), 100)
  const strokeColor = achieved ? '#52c41a' : actual >= 0 ? '#4361ee' : '#ff4d4f'

  return (
    <Card
      className={achieved ? 'target-card-achieved' : 'target-card-pending'}
      style={{ borderRadius: 12, height: '100%' }}
      title={
        <Space>
          {icon}
          <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
          {achieved ? (
            <Tag icon={<CheckCircleOutlined />} color="success">ACHIEVED</Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color="error">PENDING</Tag>
          )}
        </Space>
      }
    >
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Tooltip title={`${pct.toFixed(1)}% of target achieved`}>
            <Progress
              percent={clampedPct}
              strokeColor={strokeColor}
              trailColor="#f0f0f0"
              format={() => `${pct.toFixed(1)}%`}
              strokeWidth={10}
            />
          </Tooltip>
        </Col>
        <Col span={12}>
          <Statistic
            title={<Text type="secondary" style={{ fontSize: 12 }}>Target</Text>}
            value={target}
            prefix="₹"
            valueStyle={{ fontSize: 18, fontWeight: 600 }}
            formatter={(v) => Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title={<Text type="secondary" style={{ fontSize: 12 }}>Achieved P&L</Text>}
            value={Math.abs(actual)}
            prefix={actual >= 0 ? '+₹' : '-₹'}
            valueStyle={{
              fontSize: 18, fontWeight: 600,
              color: actual >= 0 ? '#52c41a' : '#ff4d4f',
            }}
            formatter={(v) => Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          />
        </Col>
        <Col span={24}>
          <div style={{
            background: achieved ? '#f6ffed' : '#fff2f0',
            border: `1px solid ${achieved ? '#b7eb8f' : '#ffccc7'}`,
            borderRadius: 8,
            padding: '8px 12px',
            textAlign: 'center',
          }}>
            {achieved ? (
              <Text style={{ color: '#52c41a', fontWeight: 600 }}>
                🎉 Target met! Surplus: {fmt(actual - target)}
              </Text>
            ) : (
              <Text style={{ color: '#ff4d4f', fontWeight: 600 }}>
                Still need: {fmt(Math.max(0, target - actual))} more
              </Text>
            )}
          </div>
        </Col>
      </Row>
    </Card>
  )
}

export default function TargetPage() {
  const [financialYears, setFinancialYears] = useState<string[]>([])
  const [fy, setFy] = useState('')
  const [achievement, setAchievement] = useState<TargetAchievement | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    homeApi.getFinancialYears().then(({ data }) => {
      setFinancialYears(data.years)
      setFy(data.years[0])
    })
  }, [])

  useEffect(() => {
    if (fy) fetchAchievement()
  }, [fy])

  async function fetchAchievement() {
    setLoading(true)
    try {
      const { data } = await targetApi.getAchievement(fy)
      setAchievement(data)
    } finally {
      setLoading(false)
    }
  }

  async function recalculate() {
    setLoading(true)
    try {
      await targetApi.recalculate(fy)
      message.success('Targets recalculated from investments')
      fetchAchievement()
    } catch {
      message.error('Recalculation failed')
    } finally {
      setLoading(false)
    }
  }

  const a = achievement

  return (
    <Spin spinning={loading}>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 24 }} wrap>
        <Space>
          <AimOutlined style={{ fontSize: 24, color: '#4361ee' }} />
          <Title level={3} style={{ margin: 0 }}>Targets</Title>
        </Space>
        <Space>
          <Text type="secondary">Financial Year:</Text>
          <Select value={fy} onChange={setFy} style={{ width: 120 }}>
            {financialYears.map((y) => <Option key={y} value={y}>{y}</Option>)}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={recalculate}>
            Recalculate from Investments
          </Button>
        </Space>
      </Space>

      {/* Info banner */}
      <Card style={{ marginBottom: 24, borderRadius: 12, background: '#f0f5ff', border: '1px solid #adc6ff' }}>
        <Space wrap>
          <CalendarOutlined style={{ color: '#4361ee' }} />
          <Text>
            Targets are auto-calculated as <Text strong>10% of total investments</Text> per FY.
            Yearly → Quarterly → Monthly → Weekly targets are derived proportionally.
            Click <Text strong>Recalculate</Text> after adding new investments.
          </Text>
        </Space>
      </Card>

      {/* 4 Target Cards */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <TargetCard
            title="Yearly Target"
            target={a?.yearly_target ?? 0}
            actual={a?.yearly_pnl ?? 0}
            achieved={a?.yearly_achieved ?? false}
            pct={a?.yearly_pct ?? 0}
            icon={<CalendarOutlined style={{ color: '#4361ee' }} />}
          />
        </Col>
        <Col xs={24} lg={12}>
          <TargetCard
            title="Quarterly Target"
            target={a?.quarterly_target ?? 0}
            actual={a?.current_quarter_pnl ?? 0}
            achieved={a?.quarterly_achieved ?? false}
            pct={a?.quarterly_pct ?? 0}
            icon={<CalendarOutlined style={{ color: '#52c41a' }} />}
          />
        </Col>
        <Col xs={24} lg={12}>
          <TargetCard
            title="Monthly Target"
            target={a?.monthly_target ?? 0}
            actual={a?.current_month_pnl ?? 0}
            achieved={a?.monthly_achieved ?? false}
            pct={a?.monthly_pct ?? 0}
            icon={<CalendarOutlined style={{ color: '#faad14' }} />}
          />
        </Col>
        <Col xs={24} lg={12}>
          <TargetCard
            title="Weekly Target"
            target={a?.weekly_target ?? 0}
            actual={a?.current_week_pnl ?? 0}
            achieved={a?.weekly_achieved ?? false}
            pct={a?.weekly_pct ?? 0}
            icon={<CalendarOutlined style={{ color: '#ff4d4f' }} />}
          />
        </Col>
      </Row>
    </Spin>
  )
}
