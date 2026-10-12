import { useState, useEffect } from 'react'
import AppShell from '../../components/layout/AppShell'
import api from '../../lib/api'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { MessageSquare, Bot, BookOpen, FileText, TrendingUp, Zap } from 'lucide-react'

const COLORS = ['#7c3aed', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4']

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div style={s.statCard}>
      <div style={{ ...s.statIcon, background: `${color}18`, color }}>
        <Icon size={20} />
      </div>
      <div>
        <p style={s.statValue}>{value}</p>
        <p style={s.statLabel}>{label}</p>
        {sub && <p style={s.statSub}>{sub}</p>}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/v1/analytics/overview')
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppShell>
      <div style={s.page}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Analytics</h1>
            <p style={s.sub}>Your AI usage statistics</p>
          </div>
        </div>

        <div style={s.content}>
          {loading && (
            <div style={s.loading}>
              <div style={s.spinner} />
              <p>Loading analytics...</p>
            </div>
          )}

          {error && (
            <div style={s.error}>⚠️ {error}</div>
          )}

          {data && (
            <>
              {/* Stat Cards */}
              <div style={s.statsGrid}>
                <StatCard
                  icon={MessageSquare}
                  label="Total Conversations"
                  value={data.overview.total_conversations}
                  color="#7c3aed"
                  sub={`${data.overview.recent_conversations} this week`}
                />
                <StatCard
                  icon={Bot}
                  label="Total Messages"
                  value={data.overview.total_messages}
                  color="#3b82f6"
                  sub={`${data.overview.user_messages} sent by you`}
                />
                <StatCard
                  icon={BookOpen}
                  label="Knowledge Bases"
                  value={data.overview.knowledge_bases}
                  color="#22c55e"
                  sub={`${data.overview.documents} documents`}
                />
                <StatCard
                  icon={Zap}
                  label="AI Responses"
                  value={data.overview.ai_messages}
                  color="#f59e0b"
                  sub="Total AI messages"
                />
              </div>

              {/* Charts Row */}
              <div style={s.chartsRow}>
                {/* Daily Activity */}
                <div style={s.chartCard}>
                  <h2 style={s.chartTitle}>
                    <TrendingUp size={16} style={{ color: 'var(--axiom-purple)' }} />
                    Daily Activity (Last 7 Days)
                  </h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={data.daily_activity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="messages"
                        stroke="#7c3aed"
                        strokeWidth={2.5}
                        dot={{ fill: '#7c3aed', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Model Usage */}
                <div style={s.chartCard}>
                  <h2 style={s.chartTitle}>
                    <Bot size={16} style={{ color: 'var(--axiom-purple)' }} />
                    Provider Usage
                  </h2>
                  {data.model_usage.length === 0 ? (
                    <div style={s.chartEmpty}>
                      <p>No data yet — start chatting!</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={data.model_usage}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={85}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {data.model_usage.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Bar Chart - Messages per day */}
              <div style={s.chartCard}>
                <h2 style={s.chartTitle}>
                  <MessageSquare size={16} style={{ color: 'var(--axiom-purple)' }} />
                  Messages Per Day
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.daily_activity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                      }}
                    />
                    <Bar
                      dataKey="messages"
                      fill="#7c3aed"
                      radius={[6, 6, 0, 0]}
                      name="Messages"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' },
  header: { padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', flexShrink: 0 },
  title: { fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' },
  sub: { color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.15rem' },
  content: { flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '3rem', color: 'var(--text-muted)' },
  spinner: { width: '28px', height: '28px', border: '3px solid var(--border-color)', borderTop: '3px solid var(--axiom-purple)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  error: { background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '1rem', color: '#ef4444', fontSize: '0.875rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
  statCard: { background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' },
  statIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 },
  statLabel: { fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: '500' },
  statSub: { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  chartCard: { background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.25rem' },
  chartTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' },
  chartEmpty: { height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' },
}