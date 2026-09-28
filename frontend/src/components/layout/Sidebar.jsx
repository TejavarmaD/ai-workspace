import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { useTheme } from '../../lib/theme'
import {
  Search, Plus, Image, BookOpen, Clock, Puzzle,
  FolderOpen, Bot, ChevronLeft, ChevronRight,
  Sun, Moon, Settings, LogOut, MoreHorizontal,
  Pin, Archive, Trash2, Edit3, Share2
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'chat', label: 'New Chat', icon: Plus, path: '/chat', action: 'new-chat' },
  { id: 'images', label: 'Images', icon: Image, path: '/images' },
  { id: 'library', label: 'Library', icon: BookOpen, path: '/library' },
  { id: 'scheduled', label: 'Scheduled', icon: Clock, path: '/scheduled' },
  { id: 'apps', label: 'Apps', icon: Puzzle, path: '/apps' },
  { id: 'projects', label: 'Projects', icon: FolderOpen, path: '/projects' },
  { id: 'agents', label: 'Agents', icon: Bot, path: '/agents' },
]

export default function Sidebar({
  collapsed, onToggleCollapse, onCloseMobile,
  conversations = [], activeConvId,
  onNewChat, onSelectConv, onRename, onDelete, onPin, pinnedIds = []
}) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleNav = (item) => {
    if (item.action === 'new-chat') {
      onNewChat?.()
      navigate('/chat')
    } else {
      navigate(item.path)
    }
    onCloseMobile?.()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const startRename = (conv) => {
    setMenuOpenId(null)
    setRenamingId(conv.id)
    setRenameValue(conv.title)
  }

  const submitRename = async (id) => {
    if (renameValue.trim()) onRename?.(id, renameValue.trim())
    setRenamingId(null)
  }

  const filteredConvs = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pinned = filteredConvs.filter(c => pinnedIds.includes(c.id))
  const recent = filteredConvs.filter(c => !pinnedIds.includes(c.id))

  return (
    <div style={s.sidebar} onClick={() => { setMenuOpenId(null); setUserMenuOpen(false) }}>

      {/* Top Section */}
      <div style={s.top}>
        {/* Logo + Collapse */}
        <div style={s.logoRow}>
          {!collapsed && (
            <div style={s.logo}>
              <div style={s.logoIcon}>A</div>
              <span style={s.logoText}>AXIOM</span>
            </div>
          )}
          {collapsed && <div style={{ ...s.logoIcon, margin: '0 auto' }}>A</div>}
          <button
            style={s.collapseBtn}
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div style={s.searchWrap}>
            {searchOpen ? (
              <input
                style={s.searchInput}
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onBlur={() => { if (!searchQuery) setSearchOpen(false) }}
                autoFocus
              />
            ) : (
              <button style={s.searchBtn} onClick={() => setSearchOpen(true)} aria-label="Search">
                <Search size={15} />
                <span>Search</span>
                <span style={s.shortcut}>⌘K</span>
              </button>
            )}
          </div>
        )}

        {collapsed && (
          <button style={s.iconBtn} onClick={() => setSearchOpen(true)} title="Search" aria-label="Search">
            <Search size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div style={s.nav}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.id}
              style={{
                ...s.navItem,
                ...(isActive ? s.navActive : {}),
              }}
              onClick={() => handleNav(item)}
              title={collapsed ? item.label : ''}
              aria-label={item.label}
            >
              <Icon size={18} strokeWidth={1.8} />
              {!collapsed && <span style={s.navLabel}>{item.label}</span>}
            </button>
          )
        })}
      </div>

      {/* Divider */}
      {!collapsed && <div style={s.divider} />}

      {/* Conversations */}
      {!collapsed && (
        <div style={s.convSection}>
          {pinned.length > 0 && (
            <>
              <p style={s.sectionLabel}>Pinned</p>
              {pinned.map(conv => (
                <ConvItem
                  key={conv.id}
                  conv={conv}
                  isActive={activeConvId === conv.id}
                  isPinned={true}
                  menuOpenId={menuOpenId}
                  renamingId={renamingId}
                  renameValue={renameValue}
                  setMenuOpenId={setMenuOpenId}
                  setRenameValue={setRenameValue}
                  startRename={startRename}
                  submitRename={submitRename}
                  onSelect={() => onSelectConv?.(conv)}
                  onPin={() => { setMenuOpenId(null); onPin?.(conv.id) }}
                  onDelete={() => { setMenuOpenId(null); if (window.confirm('Delete?')) onDelete?.(conv.id) }}
                  onShare={() => { setMenuOpenId(null); navigator.clipboard.writeText(conv.title) }}
                />
              ))}
              <div style={s.divider} />
            </>
          )}

          {recent.length > 0 && (
            <>
              <p style={s.sectionLabel}>Recent</p>
              {recent.map(conv => (
                <ConvItem
                  key={conv.id}
                  conv={conv}
                  isActive={activeConvId === conv.id}
                  isPinned={false}
                  menuOpenId={menuOpenId}
                  renamingId={renamingId}
                  renameValue={renameValue}
                  setMenuOpenId={setMenuOpenId}
                  setRenameValue={setRenameValue}
                  startRename={startRename}
                  submitRename={submitRename}
                  onSelect={() => onSelectConv?.(conv)}
                  onPin={() => { setMenuOpenId(null); onPin?.(conv.id) }}
                  onDelete={() => { setMenuOpenId(null); if (window.confirm('Delete?')) onDelete?.(conv.id) }}
                  onShare={() => { setMenuOpenId(null); navigator.clipboard.writeText(conv.title) }}
                />
              ))}
            </>
          )}

          {filteredConvs.length === 0 && (
            <div style={s.emptyConvs}>
              <p>No conversations yet</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Start a new chat above</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={s.footer}>
        {/* Theme Toggle */}
        <button
          style={s.iconBtn}
          onClick={toggleTheme}
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          {!collapsed && <span style={{ fontSize: '0.85rem', marginLeft: '0.5rem' }}>
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </span>}
        </button>

        {/* Settings */}
        <button
          style={s.iconBtn}
          onClick={() => navigate('/settings')}
          title="Settings"
          aria-label="Settings"
        >
          <Settings size={17} />
          {!collapsed && <span style={{ fontSize: '0.85rem', marginLeft: '0.5rem' }}>Settings</span>}
        </button>

        {/* User */}
        <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
          <button
            style={s.userBtn}
            onClick={() => setUserMenuOpen(o => !o)}
            aria-label="User menu"
          >
            <div style={s.avatar}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            {!collapsed && (
              <div style={s.userInfo}>
                <span style={s.userName}>{user?.display_name || user?.first_name}</span>
                <span style={s.userEmail}>{user?.email}</span>
              </div>
            )}
          </button>

          {userMenuOpen && (
            <div style={s.userMenu}>
              <div style={s.userMenuHeader}>
                <p style={s.userMenuName}>{user?.first_name} {user?.last_name}</p>
                <p style={s.userMenuEmail}>{user?.email}</p>
              </div>
              <div style={s.menuDivider} />
              <button style={s.menuItem} onClick={() => navigate('/settings')}>
                <Settings size={15} /> Settings
              </button>
              <div style={s.menuDivider} />
              <button style={{ ...s.menuItem, color: '#ef4444' }} onClick={handleLogout}>
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ConvItem({ conv, isActive, isPinned, menuOpenId, renamingId, renameValue,
  setMenuOpenId, setRenameValue, startRename, submitRename,
  onSelect, onPin, onDelete, onShare }) {

  return (
    <div
      style={{
        ...cs.item,
        ...(isActive ? cs.active : {}),
      }}
      onClick={onSelect}
    >
      {isPinned && <Pin size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}

      {renamingId === conv.id ? (
        <input
          style={cs.renameInput}
          value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onBlur={() => submitRename(conv.id)}
          onKeyDown={e => e.key === 'Enter' && submitRename(conv.id)}
          autoFocus
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <span style={cs.title}>{conv.title}</span>
      )}

      <div style={{ position: 'relative', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button
          style={cs.dotBtn}
          onClick={() => setMenuOpenId(menuOpenId === conv.id ? null : conv.id)}
          aria-label="Conversation options"
        >
          <MoreHorizontal size={15} />
        </button>

        {menuOpenId === conv.id && (
          <div style={cs.menu}>
            <button style={cs.menuItem} onClick={() => { onPin(); }}>
              <Pin size={13} /> {isPinned ? 'Unpin' : 'Pin'}
            </button>
            <button style={cs.menuItem} onClick={() => startRename(conv)}>
              <Edit3 size={13} /> Rename
            </button>
            <button style={cs.menuItem} onClick={onShare}>
              <Share2 size={13} /> Share
            </button>
            <div style={cs.divider} />
            <button style={{ ...cs.menuItem, color: '#ef4444' }} onClick={onDelete}>
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  sidebar: { display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-sidebar)', overflow: 'hidden' },
  top: { padding: '0.75rem 0.75rem 0.5rem', flexShrink: 0 },
  logoRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' },
  logo: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  logoIcon: { width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '800', color: '#fff', flexShrink: 0 },
  logoText: { fontSize: '0.95rem', fontWeight: '800', letterSpacing: '0.12em', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  collapseBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.3rem', borderRadius: '6px', display: 'flex', alignItems: 'center' },
  searchWrap: { marginBottom: '0.25rem' },
  searchBtn: { width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.6rem', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' },
  shortcut: { marginLeft: 'auto', fontSize: '0.75rem', background: 'var(--bg-primary)', padding: '0.1rem 0.3rem', borderRadius: '4px', border: '1px solid var(--border-color)' },
  searchInput: { width: '100%', padding: '0.5rem 0.6rem', background: 'var(--bg-hover)', border: '1px solid var(--axiom-purple)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' },
  nav: { padding: '0.25rem 0.5rem', flexShrink: 0 },
  navItem: { width: '100%', display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.55rem 0.65rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500', transition: 'all 0.15s' },
  navActive: { background: 'var(--bg-active)', color: 'var(--axiom-purple)' },
  navLabel: { flex: 1, textAlign: 'left' },
  iconBtn: { width: '100%', display: 'flex', alignItems: 'center', padding: '0.5rem 0.65rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', borderRadius: '8px' },
  divider: { height: '1px', background: 'var(--border-color)', margin: '0.5rem 0.75rem' },
  convSection: { flex: 1, overflowY: 'auto', padding: '0 0.5rem' },
  sectionLabel: { fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0.5rem 0.5rem 0.3rem' },
  emptyConvs: { textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem 1rem' },
  footer: { padding: '0.5rem', borderTop: '1px solid var(--border-color)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  userBtn: { width: '100%', display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem 0.65rem', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px' },
  avatar: { width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700', color: '#fff', flexShrink: 0 },
  userInfo: { flex: 1, textAlign: 'left', overflow: 'hidden' },
  userName: { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userEmail: { display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userMenu: { position: 'absolute', bottom: '110%', left: 0, width: '220px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', padding: '0.5rem', zIndex: 200 },
  userMenuHeader: { padding: '0.5rem 0.75rem 0.75rem' },
  userMenuName: { fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' },
  userMenuEmail: { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' },
  menuDivider: { height: '1px', background: 'var(--border-color)', margin: '0.3rem 0' },
  menuItem: { width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: '6px', textAlign: 'left' },
}

const cs = {
  item: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.5rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '1px', position: 'relative' },
  active: { background: 'var(--bg-active)' },
  title: { flex: 1, fontSize: '0.875rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  renameInput: { flex: 1, background: 'var(--bg-hover)', border: '1px solid var(--axiom-purple)', borderRadius: '4px', color: 'var(--text-primary)', padding: '0.15rem 0.4rem', fontSize: '0.875rem', outline: 'none' },
  dotBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem', borderRadius: '4px', display: 'flex', alignItems: 'center', opacity: 0.7 },
  menu: { position: 'absolute', right: 0, top: '100%', width: '160px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', boxShadow: 'var(--shadow-lg)', zIndex: 1000, padding: '0.4rem' },
  menuItem: { width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.6rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)', borderRadius: '6px', textAlign: 'left' },
  divider: { height: '1px', background: 'var(--border-color)', margin: '0.3rem 0' },
}