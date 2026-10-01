import AppShell from '../../components/layout/AppShell'
import { Image, Download, Trash2, Plus, Search } from 'lucide-react'

const EMPTY_STATE = {
  icon: <Image size={40} strokeWidth={1.2} />,
  title: 'No images yet',
  desc: 'Generate your first image using the composer in Chat',
}

export default function ImagesPage() {
  return (
    <AppShell>
      <div style={s.page}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Images</h1>
            <p style={s.sub}>Your AI-generated images</p>
          </div>
          <div style={s.headerActions}>
            <div style={s.searchBox}>
              <Search size={15} style={{ color: 'var(--text-muted)' }} />
              <input style={s.searchInput} placeholder="Search images..." />
            </div>
            <button style={s.primaryBtn}>
              <Plus size={16} /> Generate Image
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div style={s.empty}>
          <div style={s.emptyIcon}>{EMPTY_STATE.icon}</div>
          <h2 style={s.emptyTitle}>{EMPTY_STATE.title}</h2>
          <p style={s.emptyDesc}>{EMPTY_STATE.desc}</p>
          <button style={s.primaryBtn}>
            <Plus size={16} /> Create your first image
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
  headerActions: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px' },
  searchInput: { background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', width: '180px' },
  primaryBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)' },
  emptyIcon: { color: 'var(--text-muted)', opacity: 0.4 },
  emptyTitle: { fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' },
  emptyDesc: { fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '300px', textAlign: 'center' },
}