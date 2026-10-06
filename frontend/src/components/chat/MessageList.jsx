import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const CHART_COLORS = ['#7c3aed', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4']

function detectAndRenderChart(content) {
  try {
    const jsonMatch = content.match(/```(?:json|chart)\n([\s\S]*?)\n```/)
    if (!jsonMatch) return null
    const data = JSON.parse(jsonMatch[1])
    if (!data.type || !data.data) return null

    const { type, data: chartData, title, xKey, yKey, nameKey, valueKey } = data

    if (type === 'bar') return (
      <div style={cs.chartWrap}>
        {title && <p style={cs.chartTitle}>{title}</p>}
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey={xKey || 'name'} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
            <Legend />
            <Bar dataKey={yKey || 'value'} fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )

    if (type === 'line') return (
      <div style={cs.chartWrap}>
        {title && <p style={cs.chartTitle}>{title}</p>}
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey={xKey || 'name'} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
            <Legend />
            <Line type="monotone" dataKey={yKey || 'value'} stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )

    if (type === 'pie') return (
      <div style={cs.chartWrap}>
        {title && <p style={cs.chartTitle}>{title}</p>}
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey={valueKey || 'value'}
              nameKey={nameKey || 'name'}
              cx="50%" cy="50%" outerRadius={100}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  } catch {
    return null
  }
  return null
}

export default function MessageList({ messages, sending, loading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  if (loading) return (
    <div style={s.loading}>
      <div style={s.dots}>
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <p style={s.loadingText}>Loading messages...</p>
    </div>
  )

  return (
    <div style={s.list}>
      {messages.length === 0 && !sending && (
        <div style={s.emptyMsg}>
          <p>Send a message to start the conversation</p>
        </div>
      )}

      {messages.map((msg, i) => (
        <MessageItem key={msg.id || i} msg={msg} />
      ))}

      {sending && (
        <div style={s.thinkingRow}>
          <div style={s.aiAvatar}>A</div>
          <div style={s.thinkingBubble}>
            <div style={s.dots}>
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}

function MessageItem({ msg }) {
  const isUser = msg.role === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content)
    toast.success('Copied!')
  }

  const chart = !isUser ? detectAndRenderChart(msg.content) : null

  if (isUser) return (
    <div style={s.userRow} className="animate-fade-in">
      <div style={s.userBubble}>
        <p style={s.userText}>{msg.content}</p>
        <div style={s.userActions}>
          <button style={s.actionBtn} onClick={handleCopy} title="Copy">
            <Copy size={12} />
          </button>
        </div>
      </div>
    </div>
  )

  // Clean content — remove JSON chart block from text display
  const displayContent = msg.content.replace(/```(?:json|chart)\n[\s\S]*?\n```/, '').trim()

  return (
    <div style={s.aiRow} className="animate-fade-in">
      <div style={s.aiAvatar}>A</div>
      <div style={s.aiContent}>
        {displayContent && (
          <div className="axiom-message">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayContent}
            </ReactMarkdown>
          </div>
        )}

        {chart && chart}

        {msg.meta?.provider && (
          <div style={s.meta}>
            {msg.meta.provider} · {msg.meta.model}
            {msg.meta.latency_ms && ` · ${msg.meta.latency_ms}ms`}
          </div>
        )}

        <div style={s.aiActions}>
          <button style={s.actionBtn} onClick={handleCopy} title="Copy"><Copy size={13} /></button>
          <button style={s.actionBtn} title="Good response"><ThumbsUp size={13} /></button>
          <button style={s.actionBtn} title="Bad response"><ThumbsDown size={13} /></button>
          <button style={s.actionBtn} title="Regenerate"><RefreshCw size={13} /></button>
        </div>
      </div>
    </div>
  )
}

const s = {
  list: { flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '860px', width: '100%', margin: '0 auto' },
  loading: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' },
  loadingText: { color: 'var(--text-muted)', fontSize: '0.875rem' },
  emptyMsg: { textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem' },
  dots: { display: 'flex', gap: '0.3rem', alignItems: 'center' },
  userRow: { display: 'flex', justifyContent: 'flex-end' },
  userBubble: { maxWidth: '70%', background: 'var(--bg-hover)', borderRadius: '16px 16px 4px 16px', padding: '0.75rem 1rem' },
  userText: { color: 'var(--text-primary)', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  userActions: { display: 'flex', gap: '0.25rem', marginTop: '0.4rem', justifyContent: 'flex-end', opacity: 0.5 },
  aiRow: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start' },
  aiAvatar: { width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '800', color: '#fff', flexShrink: 0, marginTop: '2px' },
  aiContent: { flex: 1, minWidth: 0 },
  meta: { fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' },
  aiActions: { display: 'flex', gap: '0.25rem', marginTop: '0.5rem', opacity: 0.5 },
  actionBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem', borderRadius: '4px', display: 'flex', alignItems: 'center' },
  thinkingRow: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start' },
  thinkingBubble: { background: 'var(--bg-hover)', borderRadius: '12px', padding: '0.75rem 1rem' },
}

const cs = {
  chartWrap: { background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', margin: '0.75rem 0' },
  chartTitle: { fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.75rem', textAlign: 'center' },
}