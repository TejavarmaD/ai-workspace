import AppShell from '../../components/layout/AppShell'
import { Puzzle, Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const APPS = [
  { id: 'github', name: 'GitHub', desc: 'Connect repositories and code', icon: '🐙', status: 'disconnected' },
  { id: 'gdrive', name: 'Google Drive', desc: 'Access your documents and files', icon: '📁', status: 'disconnected' },
  { id: 'notion', name: 'Notion', desc: 'Sync your Notion workspace', icon: '📝', status: 'disconnected' },
  { id: 'slack', name: 'Slack', desc: 'Connect your Slack workspace', icon: '💬', status: 'disconnected' },
  { id: 'jira', name: 'Jira', desc: 'Manage issues and projects', icon: '📋', status: 'disconnected' },
  { id: 'gmail', name: 'Gmail', desc: 'Access your emails', icon: '📧', status: 'disconnected' },
  { id: 'onedrive', name: 'OneDrive', desc: 'Access Microsoft files', icon: '☁️', status: 'disconnected' },
  { id: 'outlook', name: 'Outlook', desc: 'Manage your calendar and email', icon: '📆', status: 'disconnected' },
]

const StatusIcon = ({ status }) => {
  if (status === 'connected') return <CheckCircle size={15} style={{ color: '#22c55e' }} />
  if (status === 'error') return <AlertCircle size={15} style={{ color: '#ef4444' }} />
  return <XCircle size={15} style={{ color: 'var(--text-muted)' }} />
}

export default function AppsPage() {
  return (
    <AppShell>
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Apps & Plugins</h1>
            <p style={s.sub}>Connect external tools and services to Axiom</p>
          </div>
          <div style={s.searchBox}>
            <Search size={15} style={{ color: 'var(--text-muted)' }} />
            <input style={s.searchInput} placeholder="Search apps..." />
          </div>
        </div>

        <div style={s.grid}>
          {APPS.map(app => (
            <div key={app.id} style={s.card}>
              <div style={s.cardTop}>
                <div style={s.appIcon}>{app.icon}</div>
                <div style={s.appInfo}>
                  <div style={s.appName}>
                    {app.name}
                    <StatusIcon status={app.status} />
                  </div>
                  <p style={s.appDesc}>{app.desc}</p>
                </div>
              </div>
              <div style={s.cardActions}>
                <span style={{
                  ...s.statusBadge,
                  ...(app.status === 'connected' ? s.connectedBadge : s.disconnectedBadge)
                }}>
                  {app.status === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
                <button style={s.connectBtn}>
                  {app.status === 'connected' ? 'Configure' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
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
  searchBox: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px' },
  searchInput: { background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', width: '180px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', padding: '1.5rem 2rem', overflowY: 'auto' },
  card: { background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  cardTop: { display: 'flex', alignItems: 'flex-start', gap: '0.875rem' },
  appIcon: { fontSize: '1.75rem', flexShrink: 0 },
  appInfo: { flex: 1 },
  appName: { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' },
  appDesc: { fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' },
  cardActions: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  statusBadge: { fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: '500' },
  connectedBadge: { background: '#dcfce7', color: '#16a34a' },
  disconnectedBadge: { background: 'var(--bg-hover)', color: 'var(--text-muted)' },
  connectBtn: { padding: '0.4rem 0.875rem', background: 'var(--bg-active)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--axiom-purple)', fontWeight: '600' },
}