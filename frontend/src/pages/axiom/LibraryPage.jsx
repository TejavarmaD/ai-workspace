import { useState, useEffect, useRef } from 'react'
import AppShell from '../../components/layout/AppShell'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import {
  BookOpen, Plus, Upload, Trash2, FileText,
  File, Search, ChevronRight, X, Loader
} from 'lucide-react'

export default function LibraryPage() {
  const [workspaceId, setWorkspaceId] = useState(null)
  const [kbs, setKbs] = useState([])
  const [selectedKb, setSelectedKb] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newKbName, setNewKbName] = useState('')
  const [newKbDesc, setNewKbDesc] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef(null)

  // Load workspace on mount
  useEffect(() => {
    api.workspaces.list().then(data => {
      if (data?.workspaces?.length > 0) {
        setWorkspaceId(data.workspaces[0].id)
      }
    })
  }, [])

  // Load knowledge bases when workspace is ready
  useEffect(() => {
    if (!workspaceId) return
    loadKbs()
  }, [workspaceId])

  const loadKbs = async () => {
    setLoading(true)
    try {
      const data = await api.get(`/api/v1/knowledge/bases?workspace_id=${workspaceId}`)
      setKbs(data.knowledge_bases || [])
    } catch {
      toast.error('Failed to load knowledge bases')
    } finally {
      setLoading(false)
    }
  }

  const loadDocuments = async (kb) => {
    setSelectedKb(kb)
    try {
      const data = await api.get(`/api/v1/knowledge/bases/${kb.id}/documents`)
      setDocuments(data.documents || [])
    } catch {
      toast.error('Failed to load documents')
    }
  }

  const handleCreateKb = async (e) => {
    e.preventDefault()
    if (!newKbName.trim()) return
    setCreating(true)
    try {
      await api.post('/api/v1/knowledge/bases', {
        workspace_id: workspaceId,
        name: newKbName.trim(),
        description: newKbDesc.trim() || null,
      })
      toast.success('Knowledge base created!')
      setNewKbName('')
      setNewKbDesc('')
      setShowCreateForm(false)
      loadKbs()
    } catch (err) {
      toast.error(err.message || 'Failed to create')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteKb = async (kb) => {
    if (!window.confirm(`Delete "${kb.name}" and all its documents?`)) return
    try {
      await api.delete(`/api/v1/knowledge/bases/${kb.id}`)
      toast.success('Deleted')
      if (selectedKb?.id === kb.id) {
        setSelectedKb(null)
        setDocuments([])
      }
      loadKbs()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !selectedKb) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const token = localStorage.getItem('access_token')
      const BACKEND = api.BACKEND || 'https://glowing-cod-jpv657v75jwf7x4-8000.app.github.dev'
      const res = await fetch(
        `${BACKEND}/api/v1/knowledge/bases/${selectedKb.id}/documents`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        }
      )
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Upload failed')
      }
      toast.success(`"${file.name}" uploaded and processing!`)
      loadDocuments(selectedKb)
      loadKbs()
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const getStatusColor = (status) => {
    if (status === 'ready') return '#22c55e'
    if (status === 'failed') return '#ef4444'
    return '#f59e0b'
  }

  const getStatusLabel = (status) => {
    if (status === 'ready') return 'Ready'
    if (status === 'failed') return 'Failed'
    return 'Processing...'
  }

  const filteredKbs = kbs.filter(kb =>
    kb.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AppShell>
      <div style={s.page}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Library</h1>
            <p style={s.sub}>Upload documents and build knowledge bases for your AI</p>
          </div>
          <button style={s.primaryBtn} onClick={() => setShowCreateForm(true)}>
            <Plus size={16} /> New Knowledge Base
          </button>
        </div>

        <div style={s.body}>
          {/* Left Panel — KB List */}
          <div style={s.leftPanel}>
            {/* Search */}
            <div style={s.searchBox}>
              <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                style={s.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <div style={s.createForm}>
                <div style={s.createHeader}>
                  <span style={s.createTitle}>New Knowledge Base</span>
                  <button style={s.closeBtn} onClick={() => setShowCreateForm(false)}>
                    <X size={14} />
                  </button>
                </div>
                <form onSubmit={handleCreateKb}>
                  <input
                    style={s.input}
                    placeholder="Name (e.g. Product Docs)"
                    value={newKbName}
                    onChange={e => setNewKbName(e.target.value)}
                    required
                    autoFocus
                  />
                  <input
                    style={{ ...s.input, marginTop: '0.5rem' }}
                    placeholder="Description (optional)"
                    value={newKbDesc}
                    onChange={e => setNewKbDesc(e.target.value)}
                  />
                  <button
                    style={{ ...s.primaryBtn, width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
                    type="submit"
                    disabled={creating}
                  >
                    {creating ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </form>
              </div>
            )}

            {/* KB List */}
            {loading ? (
              <div style={s.loadingState}>
                <Loader size={20} style={{ color: 'var(--text-muted)' }} />
                <p>Loading...</p>
              </div>
            ) : filteredKbs.length === 0 ? (
              <div style={s.emptyState}>
                <BookOpen size={32} strokeWidth={1.2} style={{ opacity: 0.3 }} />
                <p>No knowledge bases yet</p>
                <button style={s.linkBtn} onClick={() => setShowCreateForm(true)}>
                  Create one
                </button>
              </div>
            ) : (
              filteredKbs.map(kb => (
                <div
                  key={kb.id}
                  style={{
                    ...s.kbItem,
                    ...(selectedKb?.id === kb.id ? s.kbActive : {})
                  }}
                  onClick={() => loadDocuments(kb)}
                >
                  <div style={s.kbIcon}>
                    <BookOpen size={16} />
                  </div>
                  <div style={s.kbInfo}>
                    <p style={s.kbName}>{kb.name}</p>
                    <p style={s.kbMeta}>
                      {kb.document_count} document{kb.document_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div style={s.kbActions}>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                    <button
                      style={s.deleteBtn}
                      onClick={e => { e.stopPropagation(); handleDeleteKb(kb) }}
                      title="Delete knowledge base"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Panel — Documents */}
          <div style={s.rightPanel}>
            {!selectedKb ? (
              <div style={s.selectState}>
                <BookOpen size={48} strokeWidth={1} style={{ opacity: 0.2 }} />
                <h2 style={s.selectTitle}>Select a Knowledge Base</h2>
                <p style={s.selectDesc}>
                  Choose a knowledge base from the left to view and upload documents
                </p>
              </div>
            ) : (
              <>
                {/* KB Header */}
                <div style={s.kbHeader}>
                  <div>
                    <h2 style={s.kbTitle}>{selectedKb.name}</h2>
                    {selectedKb.description && (
                      <p style={s.kbDesc}>{selectedKb.description}</p>
                    )}
                  </div>
                  <div style={s.kbHeaderActions}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt,.md,.docx,.doc"
                      style={{ display: 'none' }}
                      onChange={handleUploadFile}
                    />
                    <button
                      style={s.uploadBtn}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading
                        ? <><Loader size={15} /> Uploading...</>
                        : <><Upload size={15} /> Upload Document</>
                      }
                    </button>
                  </div>
                </div>

                {/* Supported formats */}
                <div style={s.formatHint}>
                  Supported: PDF, TXT, Markdown, Word (.docx) • Max 10MB per file
                </div>

                {/* Documents List */}
                {documents.length === 0 ? (
                  <div style={s.emptyDocs}>
                    <File size={36} strokeWidth={1.2} style={{ opacity: 0.3 }} />
                    <p style={s.emptyDocsTitle}>No documents yet</p>
                    <p style={s.emptyDocsDesc}>
                      Upload a PDF, Word document, or text file to get started
                    </p>
                    <button
                      style={s.primaryBtn}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={15} /> Upload your first document
                    </button>
                  </div>
                ) : (
                  <div style={s.docList}>
                    {documents.map(doc => (
                      <div key={doc.id} style={s.docItem}>
                        <div style={s.docIcon}>
                          <FileText size={18} />
                        </div>
                        <div style={s.docInfo}>
                          <p style={s.docName}>{doc.filename}</p>
                          <p style={s.docMeta}>
                            {doc.chunk_count > 0 ? `${doc.chunk_count} chunks` : 'Processing...'}
                            {doc.file_size && ` • ${(doc.file_size / 1024).toFixed(1)} KB`}
                            {` • ${doc.file_type.toUpperCase()}`}
                          </p>
                        </div>
                        <div style={s.docStatus}>
                          <span style={{
                            ...s.statusBadge,
                            color: getStatusColor(doc.status),
                            background: `${getStatusColor(doc.status)}18`,
                          }}>
                            {doc.status === 'processing' && (
                              <Loader size={11} style={{ display: 'inline', marginRight: '3px' }} />
                            )}
                            {getStatusLabel(doc.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', flexShrink: 0, flexWrap: 'wrap', gap: '0.75rem' },
  title: { fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' },
  sub: { color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.15rem' },
  primaryBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  leftPanel: { width: '280px', minWidth: '280px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.75rem', overflowY: 'auto', background: 'var(--bg-secondary)' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.6rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '0.25rem' },
  searchInput: { background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', width: '100%' },
  createForm: { background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.875rem', marginBottom: '0.5rem' },
  createHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  createTitle: { fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' },
  closeBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' },
  input: { width: '100%', padding: '0.55rem 0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' },
  linkBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--axiom-purple)', fontWeight: '600', fontSize: '0.875rem' },
  kbItem: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.75rem', borderRadius: '8px', cursor: 'pointer', background: 'transparent' },
  kbActive: { background: 'var(--bg-active)', border: '1px solid var(--border-color)' },
  kbIcon: { width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#7c3aed22,#3b82f622)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--axiom-purple)', flexShrink: 0 },
  kbInfo: { flex: 1, minWidth: 0 },
  kbName: { fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  kbMeta: { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' },
  kbActions: { display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 },
  deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '0.2rem', borderRadius: '4px', opacity: 0.6 },
  rightPanel: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  selectState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' },
  selectTitle: { fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' },
  selectDesc: { fontSize: '0.875rem', maxWidth: '300px', lineHeight: '1.5' },
  kbHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', flexShrink: 0, flexWrap: 'wrap', gap: '0.75rem' },
  kbTitle: { fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' },
  kbDesc: { fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' },
  kbHeaderActions: { display: 'flex', gap: '0.5rem' },
  uploadBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', background: 'var(--bg-active)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--axiom-purple)', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' },
  formatHint: { padding: '0.5rem 1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' },
  emptyDocs: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' },
  emptyDocsTitle: { fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' },
  emptyDocsDesc: { fontSize: '0.875rem', maxWidth: '280px', lineHeight: '1.5' },
  docList: { flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  docItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px' },
  docIcon: { width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 },
  docInfo: { flex: 1, minWidth: 0 },
  docName: { fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  docMeta: { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' },
  docStatus: { flexShrink: 0 },
  statusBadge: { fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.25rem' },
}