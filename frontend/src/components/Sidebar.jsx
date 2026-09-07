import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Sidebar({
  user, conversations, activeConversation,
  onNewChat, onSelectConversation, onRename, onDelete
}) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const startRename = (conv, e) => {
    e.stopPropagation()
    setRenamingId(conv.id)
    setRenameValue(conv.title)
  }

  const submitRename = async (convId) => {
    if (renameValue.trim()) await onRename(convId, renameValue.trim())
    setRenamingId(null)
  }

  const handleDelete = (convId, e) => {
    e.stopPropagation()
    if (window.confirm('Delete this conversation?')) onDelete(convId)
  }

  return (
    <div style={s.sidebar}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.logo}>AI Workspace</span>
      </div>

      {/* New Chat Button */}
      <button style={s.newChat} onClick={onNewChat}>
        + New Chat
      </button>

      {/* Conversations */}
      <div style={s.convList}>
        {conversations.length === 0 && (
          <p style={s.empty}>No conversations yet</p>
        )}
        {conversations.map(conv => (
          <div
            key={conv.id}
            style={{
              ...s.convItem,
              ...(activeConversation?.id === conv.id ? s.activeConv : {})
            }}
            onClick={() => onSelectConversation(conv)}
          >
            {renamingId === conv.id ? (
              <input
                style={s.renameInput}
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={() => submitRename(conv.id)}
                onKeyDown={e => e.key === 'Enter' && submitRename(conv.id)}
                autoFocus
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <>
                <span style={s.convTitle}>{conv.title}</span>
                <div style={s.convActions}>
                  <button
                    style={s.actionBtn}
                    onClick={(e) => startRename(conv, e)}
                    title="Rename"
                  >✏️</button>
                  <button
                    style={s.actionBtn}
                    onClick={(e) => handleDelete(conv.id, e)}
                    title="Delete"
                  >🗑️</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* User Info */}
      <div style={s.footer}>
        <div style={s.userInfo}>
          <div style={s.avatar}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div>
            <p style={s.userName}>{user?.display_name || user?.first_name}</p>
            <p style={s.userEmail}>{user?.email}</p>
          </div>
        </div>
        <button style={s.logoutBtn} onClick={handleLogout}>Sign Out</button>
      </div>
    </div>
  )
}

const s = {
  sidebar: { width: '260px', minWidth: '260px', background: '#111', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column', height: '100vh' },
  header: { padding: '1rem', borderBottom: '1px solid #222' },
  logo: { fontSize: '1rem', fontWeight: 'bold', background: 'linear-gradient(to right,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  newChat: { margin: '0.75rem', padding: '0.65rem', background: 'linear-gradient(to right,#3b82f6,#8b5cf6)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  convList: { flex: 1, overflowY: 'auto', padding: '0.5rem' },
  empty: { color: '#555', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' },
  convItem: { padding: '0.65rem 0.75rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' },
  activeConv: { background: '#1e1e2e' },
  convTitle: { fontSize: '0.85rem', color: '#ccc', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  convActions: { display: 'flex', gap: '2px', opacity: 0 },
  actionBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.75rem', padding: '2px' },
  renameInput: { flex: 1, background: '#222', border: '1px solid #444', borderRadius: '4px', color: '#fff', padding: '0.2rem 0.4rem', fontSize: '0.85rem' },
  footer: { padding: '0.75rem', borderTop: '1px solid #222' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(to right,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 },
  userName: { fontSize: '0.85rem', fontWeight: '600', color: '#fff' },
  userEmail: { fontSize: '0.75rem', color: '#666' },
  logoutBtn: { width: '100%', padding: '0.4rem', background: 'transparent', border: '1px solid #333', borderRadius: '6px', color: '#888', cursor: 'pointer', fontSize: '0.8rem' },
}