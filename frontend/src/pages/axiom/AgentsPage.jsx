import AppShell from '../../components/layout/AppShell'
import { Bot, Plus, Search, Zap, Settings, Copy, Trash2 } from 'lucide-react'

const TABS = ['My Agents', 'Shared Agents', 'Axiom Agents']

export default function AgentsPage() {
  return (
    <AppShell>
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Agents</h1>
            <p style={s.sub}>Build and manage your AI agents</p>
          </div>
          <button style={s.primaryBtn}>
            <Plus size={16} /> New Agent
          </button>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {TABS.map((t, i) => (
            <button key={t} style={{ ...s.tab, ...(i === 0 ? s.tabActive : {}) }}>
              {t}
            </button>
          ))}
        </div>

        {/* Empty */}
        <div style={s.empty}>
          <div style={s.emptyIcon}><Bot size={40} strokeWidth={1.2} /></div>
          <h2 style={s.emptyTitle}>No agents yet</h2>
          <p style={s.emptyDesc}>Create an AI agent with custom instructions, tools, and knowledge bases</p>
          <button style={s.primaryBtn}>
            <Plus size={16} /> Create your first agent
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
  tabs: { display: 'flex', gap: '0.25rem', padding: '0.75rem 2rem', borderBottom: '1px solid var(--border-color)', flexShrink: 0 },
  tab: { padding: '0.4rem 0.9rem', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' },
  tabActive: { background: 'var(--bg-active)', color: 'var(--axiom-purple)' },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' },
  emptyIcon: { color: 'var(--text-muted)', opacity: 0.4 },
  emptyTitle: { fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' },
  emptyDesc: { fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '320px', textAlign: 'center' },
}