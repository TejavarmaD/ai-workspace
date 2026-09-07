import { useAuth } from '../lib/auth'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../lib/api'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [workspaces, setWorkspaces] = useState([])
  const [creating, setCreating] = useState(false)
  const [newWs, setNewWs] = useState('')

  useEffect(() => {
    api.workspaces.list().then(data => setWorkspaces(data.workspaces || []))
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newWs.trim()) return
    setCreating(true)
    try {
      const ws = await api.workspaces.create({ name: newWs })
      setWorkspaces([...workspaces, ws])
      setNewWs('')
    } catch (err) {
      alert(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logo}>AI Workspace</div>
        <div style={s.userInfo}>
          <span style={s.userName}>
            {user?.display_name || user?.first_name || user?.email}
          </span>
          <button style={s.chatBtn} onClick={() => navigate('/chat')}>💬 Open Chat</button>
<button style={s.logoutBtn} onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>
        <div style={s.welcome}>
          <h1 style={s.h1}>Welcome back, {user?.first_name}! 👋</h1>
          <p style={s.sub}>Manage your workspaces below</p>
        </div>

        {/* User Card */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Your Profile</h2>
          <div style={s.profileGrid}>
            <div><span style={s.label}>Email</span><p style={s.val}>{user?.email}</p></div>
            <div><span style={s.label}>Name</span><p style={s.val}>{user?.first_name} {user?.last_name}</p></div>
            <div><span style={s.label}>Display Name</span><p style={s.val}>{user?.display_name}</p></div>
            <div><span style={s.label}>Status</span><p style={s.val}>{user?.is_active ? '🟢 Active' : '🔴 Inactive'}</p></div>
          </div>
        </div>

        {/* Workspaces */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Your Workspaces</h2>

          <form onSubmit={handleCreate} style={s.createForm}>
            <input
              style={s.input}
              value={newWs}
              onChange={e => setNewWs(e.target.value)}
              placeholder="New workspace name..."
            />
            <button style={s.createBtn} type="submit" disabled={creating}>
              {creating ? '...' : '+ Create'}
            </button>
          </form>

          <div style={s.wsList}>
            {workspaces.length === 0 && (
              <p style={s.empty}>No workspaces yet. Create one above!</p>
            )}
            {workspaces.map(ws => (
              <div key={ws.id} style={s.wsItem}>
                <div>
                  <p style={s.wsName}>{ws.name}</p>
                  <p style={s.wsSlug}>/{ws.slug}</p>
                </div>
                <span style={s.badge}>{ws.is_personal ? 'Personal' : 'Team'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight:'100vh', background:'#0f0f0f', color:'#fff' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 2rem', borderBottom:'1px solid #222', background:'#111' },
  logo: { fontSize:'1.3rem', fontWeight:'bold', background:'linear-gradient(to right,#60a5fa,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  userInfo: { display:'flex', alignItems:'center', gap:'1rem' },
  userName: { color:'#ccc', fontSize:'0.9rem' },
  logoutBtn: { padding:'0.4rem 1rem', background:'transparent', border:'1px solid #444', borderRadius:'6px', color:'#ccc', cursor:'pointer' },
  main: { maxWidth:'900px', margin:'0 auto', padding:'2rem' },
  welcome: { marginBottom:'2rem' },
  h1: { fontSize:'2rem', fontWeight:'bold', marginBottom:'0.5rem' },
  sub: { color:'#888' },
  card: { background:'#1a1a1a', border:'1px solid #333', borderRadius:'12px', padding:'1.5rem', marginBottom:'1.5rem' },
  cardTitle: { fontSize:'1.1rem', fontWeight:'600', marginBottom:'1.25rem', color:'#e5e5e5' },
  profileGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' },
  label: { color:'#666', fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'0.05em' },
  val: { color:'#fff', marginTop:'0.25rem', fontWeight:'500' },
  createForm: { display:'flex', gap:'0.75rem', marginBottom:'1rem' },
  input: { flex:1, padding:'0.65rem 1rem', background:'#111', border:'1px solid #444', borderRadius:'8px', color:'#fff', fontSize:'0.95rem' },
  createBtn: { padding:'0.65rem 1.25rem', background:'linear-gradient(to right,#3b82f6,#8b5cf6)', border:'none', borderRadius:'8px', color:'#fff', cursor:'pointer', fontWeight:'600' },
  wsList: { display:'flex', flexDirection:'column', gap:'0.75rem' },
  empty: { color:'#555', textAlign:'center', padding:'1rem' },
  wsItem: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem', background:'#111', borderRadius:'8px', border:'1px solid #2a2a2a' },
  wsName: { fontWeight:'600', marginBottom:'0.2rem' },
  wsSlug: { color:'#666', fontSize:'0.85rem' },
  badge: { fontSize:'0.75rem', background:'#2a2a2a', padding:'0.25rem 0.75rem', borderRadius:'20px', color:'#888' },
  chatBtn: { padding:'0.4rem 1rem', background:'linear-gradient(to right,#3b82f6,#8b5cf6)', border:'none', borderRadius:'6px', color:'#fff', cursor:'pointer' },
}
