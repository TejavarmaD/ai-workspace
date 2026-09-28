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
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [pinnedIds, setPinnedIds] = useState([])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const startRename = (conv) => {
    setMenuOpenId(null)
    setRenamingId(conv.id)
    setRenameValue(conv.title)
  }

  const submitRename = async (convId) => {
    if (renameValue.trim()) await onRename(convId, renameValue.trim())
    setRenamingId(null)
  }

  const handleDelete = (convId) => {
    setMenuOpenId(null)
    if (window.confirm('Delete this conversation?')) onDelete(convId)
  }

  const handlePin = (convId) => {
    setMenuOpenId(null)
    setPinnedIds(prev =>
      prev.includes(convId) ? prev.filter(id => id !== convId) : [...prev, convId]
    )
  }

  const handleShare = (conv) => {
    setMenuOpenId(null)
    navigator.clipboard.writeText(`Conversation: ${conv.title}`)
    alert('Conversation title copied to clipboard!')
  }

  const pinned = conversations.filter(c => pinnedIds.includes(c.id))
  const recent = conversations.filter(c => !pinnedIds.includes(c.id))

  const ConvItem = ({ conv }) => (
    <div
      style={{
        ...s.convItem,
        ...(activeConversation?.id === conv.id ? s.activeConv : {}),
      }}
      onClick={() => { if (renamingId !== conv.id) onSelectConversation(conv) }}
    >
      {pinnedIds.includes(conv.id) && <span style={s.pinIcon}>📌</span>}

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
        <span style={s.convTitle}>{conv.title}</span>
      )}

      {/* Three dot menu */}
      <div style={s.menuWrapper} onClick={e => e.stopPropagation()}>
        <button
          style={s.dotBtn}
          onClick={() => setMenuOpenId(menuOpenId === conv.id ? null : conv.id)}
        >⋯</button>

        {menuOpenId === conv.id && (
          <div style={s.menu}>
            <button style={s.menuItem} onClick={() => handlePin(conv.id)}>
              📌 {pinnedIds.includes(conv.id) ? 'Unpin' : 'Pin'}
            </button>
            <button style={s.menuItem} onClick={() => startRename(conv)}>
              ✏️ Rename
            </button>
            <button style={s.menuItem} onClick={() => handleShare(conv)}>
              🔗 Share
            </button>
            <div style={s.menuDivider} />
            <button style={{ ...s.menuItem, ...s.deleteItem }} onClick={() => handleDelete(conv.id)}>
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div style={s.sidebar} onClick={() => setMenuOpenId(null)}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.logo}>AI Workspace</span>
      </div>

      {/* New Chat */}
      <div style={s.newChatWrap}>
        <button style={s.newChat} onClick={onNewChat}>
          + New Chat
        </button>
      </div>

      {/* Pinned */}
      {pinned.length > 0 && (
        <div style={s.section}>
          <p style={s.sectionLabel}>📌 Pinned</p>
          {pinned.map(conv => <ConvItem key={conv.id} conv={conv} />)}
        </div>
      )}

      {/* Recent */}
      <div style={s.section}>
        {pinned.length > 0 && <p style={s.sectionLabel}>Recent</p>}
        <div style={s.convList}>
          {recent.length === 0 && pinned.length === 0 && (
            <p style={s.empty}>No conversations yet</p>
          )}
          {recent.map(conv => <ConvItem key={conv.id} conv={conv} />)}
        </div>
      </div>

      {/* User Footer */}
      <div style={s.footer}>
        <div style={s.userRow}>
          <div style={s.avatar}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div style={s.userText}>
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
  sidebar: { width: '270px', minWidth: '270px', background: '#f8f9fa', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' },
  header: { padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' },
  logo: { fontSize: '1.1rem', fontWeight: '700', background: 'linear-gradient(to right,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  newChatWrap: { padding: '0.75rem 1rem' },
  newChat: { width: '100%', padding: '0.65rem', background: 'linear-gradient(to right,#6366f1,#8b5cf6)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  section: { flex: 1, overflowY: 'auto', padding: '0 0.75rem' },
  sectionLabel: { fontSize: '0.72rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0.5rem 0.25rem 0.25rem' },
  convList: { display: 'flex', flexDirection: 'column', gap: '2px' },
  empty: { color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' },
  convItem: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 0.75rem', borderRadius: '8px', cursor: 'pointer', position: 'relative', background: 'transparent' },
  activeConv: { background: '#e0e7ff', border: '1px solid #c7d2fe' },
  pinIcon: { fontSize: '0.7rem', flexShrink: 0 },
  convTitle: { fontSize: '0.875rem', color: '#334155', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  renameInput: { flex: 1, background: '#fff', border: '1px solid #6366f1', borderRadius: '4px', color: '#1e293b', padding: '0.2rem 0.4rem', fontSize: '0.875rem', outline: 'none' },
  menuWrapper: { position: 'relative', flexShrink: 0 },
  dotBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.1rem', padding: '0.1rem 0.3rem', borderRadius: '4px', lineHeight: 1 },
  menu: { position: 'absolute', right: 0, top: '100%', width: '160px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 1000, padding: '0.4rem', overflow: 'hidden' },
  menuItem: { width: '100%', padding: '0.5rem 0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#334155', textAlign: 'left', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  menuDivider: { height: '1px', background: '#f1f5f9', margin: '0.3rem 0' },
  deleteItem: { color: '#ef4444' },
  footer: { padding: '0.75rem 1rem', borderTop: '1px solid #e2e8f0', background: '#f8f9fa' },
  userRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' },
  avatar: { width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(to right,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#fff', flexShrink: 0 },
  userText: { flex: 1, overflow: 'hidden' },
  userName: { fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userEmail: { fontSize: '0.75rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logoutBtn: { width: '100%', padding: '0.45rem', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem' },
}