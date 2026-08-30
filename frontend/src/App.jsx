import { useState, useEffect } from 'react'

const API = 'https://glowing-cod-jpv657v75jwf7x4-8000.app.github.dev'

export default function App() {
  const [health, setHealth] = useState(null)
  const [dbStatus, setDbStatus] = useState('checking...')
  const [providers, setProviders] = useState([])
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [h, db, p, m] = await Promise.all([
          fetch(`${API}/api/v1/health`).then(r => r.json()),
          fetch(`${API}/api/v1/health/db`).then(r => r.json()),
          fetch(`${API}/api/v1/providers`).then(r => r.json()),
          fetch(`${API}/api/v1/models`).then(r => r.json()),
        ])
        setHealth(h)
        setDbStatus(db.database)
        setProviders(p.providers)
        setModels(m.models)
      } catch (err) {
        setError('Failed to connect to backend')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:'#888'}}>Connecting to AI Workspace...</p>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',padding:'2rem',maxWidth:'900px',margin:'0 auto',fontFamily:'sans-serif',background:'#0f0f0f',color:'#fff'}}>
      <div style={{textAlign:'center',marginBottom:'3rem'}}>
        <h1 style={{fontSize:'3rem',fontWeight:'bold',background:'linear-gradient(to right, #60a5fa, #a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AI Workspace</h1>
        <p style={{color:'#888',marginTop:'0.5rem'}}>Phase 1 — Technical Verification</p>
      </div>

      {error && <div style={{background:'#3f0000',border:'1px solid #dc2626',borderRadius:'8px',padding:'1rem',marginBottom:'1rem',color:'#f87171'}}>⚠️ {error}</div>}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'2rem'}}>
        {[
          {label:'BACKEND', value: health ? '🟢 Connected' : '🔴 Disconnected', sub: `v${health?.version} · ${health?.environment}`},
          {label:'DATABASE', value: dbStatus === 'connected' ? '🟢 Connected' : '🔴 ' + dbStatus, sub: 'PostgreSQL 16'},
          {label:'PROVIDERS', value: providers.length, sub: 'Registered in registry', color:'#60a5fa'},
          {label:'MODELS', value: models.length, sub: 'Available models', color:'#a78bfa'},
        ].map((card, i) => (
          <div key={i} style={{background:'#1a1a1a',border:'1px solid #333',borderRadius:'12px',padding:'1.5rem'}}>
            <div style={{color:'#666',fontSize:'0.7rem',letterSpacing:'0.1em',marginBottom:'0.5rem'}}>{card.label}</div>
            <div style={{fontSize:'1.5rem',fontWeight:'bold',color:card.color||'#fff'}}>{card.value}</div>
            <div style={{color:'#666',fontSize:'0.8rem',marginTop:'0.25rem'}}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div style={{background:'#1a1a1a',border:'1px solid #333',borderRadius:'12px',padding:'1.5rem',marginBottom:'1rem'}}>
        <h2 style={{fontSize:'1.2rem',marginBottom:'1rem',color:'#e5e5e5'}}>Registered Providers</h2>
        {providers.map((p) => (
          <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem 0',borderBottom:'1px solid #222'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
              <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#22c55e'}}></div>
              <span style={{fontWeight:'500'}}>{p.display_name}</span>
              <span style={{color:'#666',fontSize:'0.85rem'}}>{p.name}</span>
            </div>
            <span style={{fontSize:'0.75rem',background:'#2a2a2a',padding:'0.25rem 0.5rem',borderRadius:'4px',color:'#888'}}>{p.requires_api_key ? 'API Key' : 'Local'}</span>
          </div>
        ))}
      </div>

      <div style={{background:'#1a1a1a',border:'1px solid #333',borderRadius:'12px',padding:'1.5rem'}}>
        <h2 style={{fontSize:'1.2rem',marginBottom:'1rem',color:'#e5e5e5'}}>Registered Models</h2>
        {models.map((m) => (
          <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem 0',borderBottom:'1px solid #222'}}>
            <div>
              <span style={{fontWeight:'500'}}>{m.display_name}</span>
              <span style={{color:'#666',fontSize:'0.85rem',marginLeft:'0.5rem'}}>{m.provider_model_id}</span>
            </div>
            <div style={{display:'flex',gap:'0.5rem'}}>
              {m.supports_streaming && <span style={{fontSize:'0.7rem',background:'#1e3a5f',color:'#93c5fd',padding:'0.2rem 0.5rem',borderRadius:'4px'}}>Stream</span>}
              {m.supports_tools && <span style={{fontSize:'0.7rem',background:'#3b1f5e',color:'#c4b5fd',padding:'0.2rem 0.5rem',borderRadius:'4px'}}>Tools</span>}
              {m.supports_vision && <span style={{fontSize:'0.7rem',background:'#14532d',color:'#86efac',padding:'0.2rem 0.5rem',borderRadius:'4px'}}>Vision</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{textAlign:'center',color:'#444',fontSize:'0.8rem',marginTop:'2rem'}}>AI Workspace · Phase 1 Foundation · 2026</div>
    </div>
  )
}
