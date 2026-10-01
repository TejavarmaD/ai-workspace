import AppShell from '../../components/layout/AppShell'
import { Clock, Plus, Play, Pause, Trash2, Edit3 } from 'lucide-react'

const STATUSES = {
  active: { label: 'Active', color: '#22c55e', bg: '#dcfce7' },
  paused: { label: 'Paused', color: '#f59e0b', bg: '#fef3c7' },
  failed: { label: 'Failed', color: '#ef4444', bg: '#fee2e2' },
}

export default function ScheduledPage() {
  return (
    <AppShell>
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Scheduled Tasks</h1>
            <p style={s.sub}>Automate recurring AI tasks</p>
          </div>
          <button style={s.primaryBtn}>
            <Plus size={16} /> New Task
          </button>
        </div>

        {/* Empty State */}
        <div style={s.empty}>
          <div style={s.emptyIcon}><Clock size={40} strokeWidth={1.2} /></div>
          <h2 style={s.emptyTitle}>No scheduled tasks</h2>
          <p style={s.emptyDesc}>
            Schedule AI tasks to run automatically.
            Example: "Every Monday, summarize my project updates."
          </p>
          <button style={s.primaryBtn}>
            <Plus size={16} /> Create your first task
          </button>
        </div>
      </div>
    </AppShell>
  )
}

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', flexShrink: 0, flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)' },
  sub: { color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' },
  primaryBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' },
  emptyIcon: { color: 'var(--text-muted)', opacity: 0.4 },
  emptyTitle: { fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' },
  emptyDesc: { fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '360px', textAlign: 'center', lineHeight: '1.6' },
}