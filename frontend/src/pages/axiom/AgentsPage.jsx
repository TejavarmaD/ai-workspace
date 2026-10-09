import { useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import { Bot, Plus, X, Save, Play, Zap, Globe, Code, Search, FileText } from 'lucide-react'

const AVAILABLE_TOOLS = [
  { id: 'web-search', icon: <Globe size={14} />, label: 'Web Search' },
  { id: 'code-exec', icon: <Code size={14} />, label: 'Code Execution' },
  { id: 'file-read', icon: <FileText size={14} />, label: 'File Reading' },
  { id: 'calculator', icon: <Zap size={14} />, label: 'Calculator' },
]

const MODELS = [
  { id: 'gemini:gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite' },
  { id: 'anthropic:claude-sonnet-4-5', label: 'Claude Sonnet' },
  { id: 'openai:gpt-4o', label: 'GPT-4o' },
]

const TABS = ['My Agents', 'Shared Agents', 'Axiom Agents']

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState('My Agents')
  const [showBuilder, setShowBuilder] = useState(false)
  const [agents, setAgents] = useState([])
  const [form, setForm] = useState({
    name: '', description: '', instructions: '',
    expected_output: '', model: 'gemini:gemini-2.5-flash-lite',
    tools: [], is_public: false,
  })

  const f = (key) => ({
    value: form[key],
    onChange: e => setForm({ ...form, [key]: e.target.value })
  })

  const toggleTool = (toolId) => {
    setForm(prev => ({
      ...prev,
      tools: prev.tools.includes(toolId)
        ? prev.tools.filter(t => t !== toolId)
        : [...prev.tools, toolId]
    }))
  }

  const handleSave = () => {
    if (!form.name.trim()) return alert('Agent name is required')
    const agent = {
      id: Date.now().toString(),
      ...form,
      status: 'draft',
      created_at: new Date().toISOString(),
    }
    setAgents(prev => [agent, ...prev])
    setShowBuilder(false)
    setForm({
      name: '', description: '', instructions: '',
      expected_output: '', model: 'gemini:gemini-2.5-flash-lite',
      tools: [], is_public: false,
    })
  }

  return (
    <AppShell>
      <div style={s.page}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Agents</h1>
            <p style={s.sub}>Build and manage your AI agents</p>
          </div>
          <button style={s.primaryBtn} onClick={() => setShowBuilder(true)}>
            <Plus size={16} /> New Agent
          </button>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {TABS.map(tab => (
            <button
              key={tab}
              style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Agent List or Empty */}
        <div style={s.content}>
          {agents.length === 0 ? (
            <div style={s.empty}>
              <Bot size={44} strokeWidth={1.1} style={{ opacity: 0.25 }} />
              <h2 style={s.emptyTitle}>No agents yet</h2>
              <p style={s.emptyDesc}>
                Create an AI agent with custom instructions, tools, and a specific model
              </p>
              <button style={s.primaryBtn} onClick={() => setShowBuilder(true)}>
                <Plus size={16} /> Create your first agent
              </button>
            </div>
          ) : (
            <div style={s.grid}>
              {agents.map(agent => (
                <div key={agent.id} style={s.card}>
                  <div style={s.cardTop}>
                    <div style={s.agentIcon}><Bot size={20} /></div>
                    <div style={s.cardInfo}>
                      <p style={s.agentName}>{agent.name}</p>
                      <p style={s.agentDesc}>{agent.description || 'No description'}</p>
                    </div>
                    <span style={s.draftBadge}>Draft</span>
                  </div>
                  <div style={s.cardFooter}>
                    <span style={s.modelTag}>
                      {MODELS.find(m => m.id === agent.model)?.label || agent.model}
                    </span>
                    <button style={s.testBtn}><Play size={13} /> Test</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agent Builder Modal */}
        {showBuilder && (
          <div style={s.modalOverlay} onClick={() => setShowBuilder(false)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              {/* Modal Header */}
              <div style={s.modalHeader}>
                <div style={s.modalTitle}>
                  <Bot size={20} style={{ color: 'var(--axiom-purple)' }} />
                  <span>Agent Builder</span>
                </div>
                <button style={s.closeBtn} onClick={() => setShowBuilder(false)}>
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={s.modalBody}>
                {/* Name */}
                <div style={s.field}>
                  <label style={s.label}>Agent Name *</label>
                  <input style={s.input} placeholder="e.g. Research Assistant" {...f('name')} />
                </div>

                {/* Description */}
                <div style={s.field}>
                  <label style={s.label}>Description</label>
                  <input style={s.input} placeholder="What does this agent do?" {...f('description')} />
                </div>

                {/* Instructions */}
                <div style={s.field}>
                  <label style={s.label}>Instructions</label>
                  <textarea
                    style={s.textarea}
                    placeholder="You are a helpful research assistant. Your job is to..."
                    rows={4}
                    {...f('instructions')}
                  />
                </div>

                {/* Expected Output */}
                <div style={s.field}>
                  <label style={s.label}>Expected Output</label>
                  <input
                    style={s.input}
                    placeholder="A detailed report with sources and citations"
                    {...f('expected_output')}
                  />
                </div>

                {/* Model */}
                <div style={s.field}>
                  <label style={s.label}>Model</label>
                  <select style={s.select} {...f('model')}>
                    {MODELS.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {/* Tools */}
                <div style={s.field}>
                  <label style={s.label}>Tools</label>
                  <div style={s.toolGrid}>
                    {AVAILABLE_TOOLS.map(tool => (
                      <button
                        key={tool.id}
                        style={{
                          ...s.toolBtn,
                          ...(form.tools.includes(tool.id) ? s.toolActive : {})
                        }}
                        onClick={() => toggleTool(tool.id)}
                        type="button"
                      >
                        {tool.icon} {tool.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visibility */}
                <div style={s.toggleRow}>
                  <span style={s.toggleLabel}>Make this agent public</span>
                  <button
                    style={{
                      ...s.toggle,
                      background: form.is_public ? 'var(--axiom-purple)' : 'var(--bg-hover)'
                    }}
                    onClick={() => setForm(p => ({ ...p, is_public: !p.is_public }))}
                    type="button"
                  >
                    <div style={{
                      ...s.toggleDot,
                      transform: form.is_public ? 'translateX(20px)' : 'translateX(2px)'
                    }} />
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={s.modalFooter}>
                <button style={s.cancelBtn} onClick={() => setShowBuilder(false)}>
                  Cancel
                </button>
                <button style={s.primaryBtn} onClick={handleSave}>
                  <Save size={15} /> Save Agent
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', flexShrink: 0 },
  title: { fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' },
  sub: { color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.15rem' },
  primaryBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' },
  tabs: { display: 'flex', gap: '0.25rem', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', flexShrink: 0 },
  tab: { padding: '0.4rem 0.875rem', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' },
  tabActive: { background: 'var(--bg-active)', color: 'var(--axiom-purple)' },
  content: { flex: 1, overflowY: 'auto', padding: '1.5rem' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', height: '100%', color: 'var(--text-muted)', textAlign: 'center' },
  emptyTitle: { fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' },
  emptyDesc: { fontSize: '0.875rem', maxWidth: '320px', lineHeight: '1.5' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' },
  card: { background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' },
  cardTop: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem' },
  agentIcon: { width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg,#7c3aed22,#3b82f622)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--axiom-purple)', flexShrink: 0 },
  cardInfo: { flex: 1 },
  agentName: { fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' },
  agentDesc: { fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' },
  draftBadge: { fontSize: '0.7rem', background: 'var(--bg-hover)', color: 'var(--text-muted)', padding: '0.2rem 0.5rem', borderRadius: '20px', fontWeight: '600' },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  modelTag: { fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '0.2rem 0.5rem', borderRadius: '6px' },
  testBtn: { display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', background: 'var(--bg-active)', border: 'none', borderRadius: '6px', color: 'var(--axiom-purple)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' },
  modalTitle: { display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' },
  closeBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' },
  modalBody: { flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' },
  input: { padding: '0.6rem 0.875rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' },
  textarea: { padding: '0.6rem 0.875rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' },
  select: { padding: '0.6rem 0.875rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' },
  toolGrid: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  toolBtn: { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500' },
  toolActive: { background: 'var(--bg-active)', border: '1px solid var(--axiom-purple)', color: 'var(--axiom-purple)' },
  toggleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' },
  toggle: { width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' },
  toggleDot: { position: 'absolute', top: '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'transform 0.2s' },
  modalFooter: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)' },
  cancelBtn: { padding: '0.55rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer' },
}