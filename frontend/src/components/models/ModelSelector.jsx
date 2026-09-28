import { useState, useEffect } from 'react'
import { ChevronDown, Search, Zap, Eye, Wrench, Brain } from 'lucide-react'
import api from '../../lib/api'

const CAPABILITY_ICONS = {
  vision: <Eye size={11} />,
  tools: <Wrench size={11} />,
  reasoning: <Brain size={11} />,
  streaming: <Zap size={11} />,
}

export default function ModelSelector({ selectedProvider, selectedModel, onSelect }) {
  const [open, setOpen] = useState(false)
  const [providers, setProviders] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/v1/chat/providers')
      .then(data => setProviders(data.providers || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const currentProvider = providers.find(p => p.id === selectedProvider)
  const currentModel = currentProvider?.models?.find(m => m.id === selectedModel)

  const filtered = providers.map(p => ({
    ...p,
    models: p.models.filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      p.display_name.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(p => p.models.length > 0)

  return (
    <div style={s.wrap}>
      <button
        style={s.trigger}
        onClick={() => setOpen(o => !o)}
        aria-label="Select AI model"
        aria-expanded={open}
      >
        <div style={s.dot(currentProvider?.is_configured)} />
        <span style={s.triggerText}>
          {loading ? 'Loading...' : currentModel?.name || 'Select Model'}
        </span>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      </button>

      {open && (
        <>
          <div style={s.overlay} onClick={() => setOpen(false)} />
          <div style={s.dropdown}>
            {/* Search */}
            <div style={s.searchWrap}>
              <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                style={s.searchInput}
                placeholder="Search models..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
                aria-label="Search models"
              />
            </div>

            <div style={s.list}>
              {/* Auto option */}
              <button
                style={{
                  ...s.autoItem,
                  ...(selectedModel === 'auto' ? s.autoActive : {}),
                }}
                onClick={() => { onSelect('auto', 'auto'); setOpen(false) }}
              >
                <div style={s.autoIcon}><Zap size={14} /></div>
                <div>
                  <p style={s.autoLabel}>Auto</p>
                  <p style={s.autoDesc}>Best model for your task</p>
                </div>
              </button>

              <div style={s.divider} />

              {filtered.map(provider => (
                <div key={provider.id}>
                  <div style={s.providerHeader}>
                    <div style={s.dot(provider.is_configured)} />
                    <span style={s.providerName}>{provider.display_name}</span>
                    {!provider.is_configured && (
                      <span style={s.noKey}>No API Key</span>
                    )}
                  </div>

                  {provider.models.map(model => {
                    const isSelected = selectedProvider === provider.id && selectedModel === model.id
                    return (
                      <button
                        key={model.id}
                        style={{
                          ...s.modelItem,
                          ...(isSelected ? s.modelActive : {}),
                          ...(!provider.is_configured ? s.modelDisabled : {}),
                        }}
                        onClick={() => {
                          if (!provider.is_configured) return
                          onSelect(provider.id, model.id)
                          setOpen(false)
                        }}
                        disabled={!provider.is_configured}
                        aria-label={`Select ${model.name}`}
                      >
                        <div style={s.modelLeft}>
                          <span style={s.modelName}>{model.name}</span>
                          <div style={s.caps}>
                            {model.is_free && <span style={s.freeBadge}>Free</span>}
                            {model.supports_vision && (
                              <span style={s.cap} title="Vision">{CAPABILITY_ICONS.vision}</span>
                            )}
                            {model.supports_tools && (
                              <span style={s.cap} title="Tools">{CAPABILITY_ICONS.tools}</span>
                            )}
                          </div>
                        </div>
                        {isSelected && <span style={s.check}>✓</span>}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const s = {
  wrap: { position: 'relative', zIndex: 50 },
  trigger: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: '500' },
  dot: (ok) => ({ width: '7px', height: '7px', borderRadius: '50%', background: ok ? '#22c55e' : '#94a3b8', flexShrink: 0 }),
  triggerText: { maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  overlay: { position: 'fixed', inset: 0, zIndex: 49 },
  dropdown: { position: 'absolute', top: '110%', left: 0, width: '300px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', boxShadow: 'var(--shadow-lg)', zIndex: 50, overflow: 'hidden' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border-color)' },
  searchInput: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem' },
  list: { maxHeight: '360px', overflowY: 'auto', padding: '0.5rem' },
  autoItem: { width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px', textAlign: 'left' },
  autoActive: { background: 'var(--bg-active)' },
  autoIcon: { width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 },
  autoLabel: { fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' },
  autoDesc: { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' },
  divider: { height: '1px', background: 'var(--border-color)', margin: '0.4rem 0' },
  providerHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', marginTop: '0.3rem' },
  providerName: { fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', flex: 1 },
  noKey: { fontSize: '0.68rem', background: '#fee2e2', color: '#ef4444', padding: '0.1rem 0.4rem', borderRadius: '4px' },
  modelItem: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px', marginBottom: '2px' },
  modelActive: { background: 'var(--bg-active)' },
  modelDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  modelLeft: { display: 'flex', flexDirection: 'column', gap: '0.2rem', textAlign: 'left' },
  modelName: { fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500' },
  caps: { display: 'flex', gap: '0.3rem', alignItems: 'center' },
  freeBadge: { fontSize: '0.65rem', background: '#dcfce7', color: '#16a34a', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: '600' },
  cap: { color: 'var(--text-muted)', display: 'flex', alignItems: 'center' },
  check: { color: 'var(--axiom-purple)', fontWeight: '700', fontSize: '0.9rem' },
}