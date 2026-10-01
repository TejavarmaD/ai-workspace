import AppShell from '../../components/layout/AppShell'
import { BookOpen, Upload, Search, Filter, FileText, File, Image, Code } from 'lucide-react'

const FILE_TYPES = [
  { id: 'all', label: 'All Files' },
  { id: 'documents', label: 'Documents' },
  { id: 'pdfs', label: 'PDFs' },
  { id: 'images', label: 'Images' },
  { id: 'code', label: 'Code' },
]

export default function LibraryPage() {
  return (
    <AppShell>
      <div style={s.page}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Library</h1>
            <p style={s.sub}>Your uploaded files and documents</p>
          </div>
          <div style={s.headerActions}>
            <div style={s.searchBox}>
              <Search size={15} style={{ color: 'var(--text-muted)' }} />
              <input style={s.searchInput} placeholder="Search files..." />
            </div>
            <button style={s.primaryBtn}>
              <Upload size={16} /> Upload File
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={s.tabs}>
          {FILE_TYPES.map((t, i) => (
            <button key={t.id} style={{ ...s.tab, ...(i === 0 ? s.tabActive : {}) }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Empty State */}
        <div style={s.empty}>
          <div style={s.emptyIcon}><BookOpen size={40} strokeWidth={1.2} /></div>
          <h2 style={s.emptyTitle}>Your library is empty</h2>
          <p style={s.emptyDesc}>Upload files to use them in conversations, projects, and agents</p>
          <button style={s.primaryBtn}>
            <Upload size={16} /> Upload your first file
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
  tabs: { display: 'flex', gap: '0.25rem', padding: '0.75rem 2rem', borderBottom: '1px solid var(--border-color)', flexShrink: 0 },
  tab: { padding: '0.4rem 0.9rem', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' },
  tabActive: { background: 'var(--bg-active)', color: 'var(--axiom-purple)' },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)' },
  emptyIcon: { color: 'var(--text-muted)', opacity: 0.4 },
  emptyTitle: { fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' },
  emptyDesc: { fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '320px', textAlign: 'center' },
}