import { useState, useEffect } from 'react'
import api from '../lib/api'

export default function ModelSelector({ selectedProvider, selectedModel, onSelect }) {
  const [providers, setProviders] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/v1/chat/providers')
      .then(data => setProviders(data.providers || []))
      .catch(err => console.error('Failed to load providers:', err))
      .finally(() => setLoading(false))
  }, [])

  const currentProvider = providers.find(p => p.id === selectedProvider)
  const currentModel = currentProvider?.models?.find(m => m.id === selectedModel)

  return (
    <div style={s.wrapper}>
      <button style={s.trigger} onClick={() => setOpen(!open)}>
        <span style={s.dot(currentProvider?.is_configured)} />
        <span style={s.label}>
          {loading ? 'Loading...' : currentModel?.name || 'Select Model'}
        </span>
        <span style={s.arrow}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={s.dropdown}>
          {providers.map(provider => (
            <div key={provider.id}>
              <div style={s.providerHeader}>
                <span style={s.dot(provider.is_configured)} />
                <span style={s.providerName}>{provider.display_name}</span>
                {!provider.is_configured && (
                  <span style={s.badge}>No API Key</span>
                )}
              </div>
              {provider.models.map(model => (
                <div
                  key={model.id}
                  style={{
                    ...s.modelItem,
                    ...(selectedProvider === provider.id && selectedModel === model.id ? s.active : {}),
                    ...(!provider.is_configured ? s.disabled : {}),
                  }}
                  onClick={() => {
                    if (!provider.is_configured) return
                    onSelect(provider.id, model.id)
                    setOpen(false)
                  }}
                >
                  <div>
                    <span style={s.modelName}>{model.name}</span>
                    <div style={s.caps}>
                      {model.is_free && <span style={s.capBadge('#16a34a')}>Free</span>}
                      {model.supports_vision && <span style={s.capBadge('#2563eb')}>Vision</span>}
                      {model.supports_tools && <span style={s.capBadge('#7c3aed')}>Tools</span>}
                    </div>
                  </div>
                  {selectedProvider === provider.id && selectedModel === model.id && (
                    <span style={s.check}>✓</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s = {
  wrapper: { position: 'relative', zIndex: 100 },
  trigger: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#ccc', cursor: 'pointer', fontSize: '0.85rem' },
  dot: (configured) => ({ width: '8px', height: '8px', borderRadius: '50%', background: configured ? '#22c55e' : '#ef4444', flexShrink: 0 }),
  label: { maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  arrow: { fontSize: '0.7rem', color: '#666' },
  dropdown: { position: 'absolute', top: '110%', left: 0, width: '280px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '10px', padding: '0.5rem', maxHeight: '400px', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' },
  providerHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderBottom: '1px solid #222', marginBottom: '0.25rem' },
  providerName: { fontSize: '0.8rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', flex: 1 },
  badge: { fontSize: '0.65rem', background: '#3f1515', color: '#f87171', padding: '0.1rem 0.4rem', borderRadius: '4px' },
  modelItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', borderRadius: '6px', cursor: 'pointer', marginBottom: '2px' },
  active: { background: '#1e1e3a', border: '1px solid #4c4caa' },
  disabled: { opacity: 0.4, cursor: 'not-allowed' },
  modelName: { fontSize: '0.875rem', color: '#e5e5e5', fontWeight: '500' },
  caps: { display: 'flex', gap: '0.25rem', marginTop: '0.2rem' },
  capBadge: (color) => ({ fontSize: '0.65rem', background: `${color}22`, color: color, padding: '0.1rem 0.4rem', borderRadius: '4px', border: `1px solid ${color}44` }),
  check: { color: '#60a5fa', fontWeight: 'bold' },
}