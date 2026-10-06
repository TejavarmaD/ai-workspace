import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../lib/auth'
import api from '../../lib/api'
import AppShell from '../../components/layout/AppShell'
import MessageList from '../../components/chat/MessageList'
import Composer from '../../components/chat/Composer'
import EmptyChat from '../../components/chat/EmptyChat'
import ModelSelector from '../../components/models/ModelSelector'
import { Share2, MoreHorizontal, Edit3, Pin, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const { user } = useAuth()
  const [workspaceId, setWorkspaceId] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [pinnedIds, setPinnedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('axiom-pinned') || '[]') }
    catch { return [] }
  })
  const [selectedProvider, setSelectedProvider] = useState('gemini')
  const [selectedModel, setSelectedModel] = useState('gemini-flash-latest')
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)

  // Load workspace
  useEffect(() => {
    if (!user) return
    api.workspaces.list()
      .then(data => {
        const ws = data?.workspaces
        if (ws?.length > 0) {
          setWorkspaceId(ws[0].id)
        } else {
          toast.error('No workspace found. Please refresh.')
        }
      })
      .catch(() => toast.error('Failed to load workspace'))
  }, [user])

  // Load conversations whenever workspaceId changes
  const loadConversations = useCallback(async () => {
    if (!workspaceId) return
    try {
      const data = await api.chat.listConversations(workspaceId)
      setConversations(data.conversations || [])
    } catch (err) {
      console.error('Failed to load conversations:', err)
    }
  }, [workspaceId])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Auto-refresh conversations every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadConversations, 30000)
    return () => clearInterval(interval)
  }, [loadConversations])

  const handleNewChat = () => {
    setActiveConv(null)
    setMessages([])
    setHeaderMenuOpen(false)
  }

  const handleSelectConv = async (conv) => {
    setActiveConv(conv)
    setLoading(true)
    setMessages([])
    try {
      const data = await api.chat.getConversation(conv.id)
      setMessages(data.messages || [])
      if (conv.provider) setSelectedProvider(conv.provider)
      if (conv.model) setSelectedModel(conv.model)
    } catch {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (content, attachments, mode) => {
    if (sending || !content.trim()) return
    setSending(true)

    let convId = activeConv?.id

    if (!convId) {
      try {
        const conv = await api.post('/api/v1/chat/conversations', {
          workspace_id: workspaceId,
          title: 'New Conversation',
          provider: selectedProvider,
          model: selectedModel,
        })
        setActiveConv(conv)
        convId = conv.id
        // Add to list immediately
        setConversations(prev => [conv, ...prev])
      } catch {
        toast.error('Failed to create conversation')
        setSending(false)
        return
      }
    }

    // Optimistic user message
    const userMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const response = await api.post(
        `/api/v1/chat/conversations/${convId}/messages`,
        {
          content,
          conversation_id: convId,
          provider: selectedProvider,
          model: selectedModel,
        }
      )
      setMessages(prev => [...prev, response])
      // Refresh conversation list to update title and ordering
      await loadConversations()
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${err.message || 'Something went wrong. Please try again.'}`,
        created_at: new Date().toISOString(),
      }])
    } finally {
      setSending(false)
    }
  }

  const handleSuggestion = (text) => {
    handleNewChat()
    setTimeout(() => handleSend(text, [], null), 100)
  }

  const handleRename = async (convId, title) => {
    try {
      await api.chat.renameConversation(convId, title)
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, title } : c))
      if (activeConv?.id === convId) setActiveConv(prev => ({ ...prev, title }))
      toast.success('Renamed')
    } catch {
      toast.error('Failed to rename')
    }
  }

  const handleDelete = async (convId) => {
    try {
      await api.chat.deleteConversation(convId)
      setConversations(prev => prev.filter(c => c.id !== convId))
      if (activeConv?.id === convId) handleNewChat()
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handlePin = (convId) => {
    setPinnedIds(prev => {
      const next = prev.includes(convId)
        ? prev.filter(id => id !== convId)
        : [...prev, convId]
      localStorage.setItem('axiom-pinned', JSON.stringify(next))
      return next
    })
    toast.success(pinnedIds.includes(convId) ? 'Unpinned' : 'Pinned')
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
    setHeaderMenuOpen(false)
  }

  return (
    <AppShell
      conversations={conversations}
      activeConvId={activeConv?.id}
      pinnedIds={pinnedIds}
      onNewChat={handleNewChat}
      onSelectConv={handleSelectConv}
      onRename={handleRename}
      onDelete={handleDelete}
      onPin={handlePin}
    >
      <div style={s.page}>
        {/* Header */}
        <div style={s.header} onClick={() => setHeaderMenuOpen(false)}>
          <div style={s.headerLeft}>
            <ModelSelector
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              onSelect={(p, m) => { setSelectedProvider(p); setSelectedModel(m) }}
            />
            {activeConv && (
              <span style={s.convTitle}>{activeConv.title}</span>
            )}
          </div>
          <div style={s.headerRight}>
            <button style={s.headerBtn} onClick={handleShare} title="Share">
              <Share2 size={15} />
              <span>Share</span>
            </button>
            {activeConv && (
              <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                <button
                  style={s.headerBtn}
                  onClick={() => setHeaderMenuOpen(o => !o)}
                  title="More options"
                >
                  <MoreHorizontal size={15} />
                </button>
                {headerMenuOpen && (
                  <div style={s.headerMenu}>
                    <button style={s.menuItem} onClick={() => {
                      const t = prompt('New title:', activeConv.title)
                      if (t) handleRename(activeConv.id, t)
                      setHeaderMenuOpen(false)
                    }}>
                      <Edit3 size={13} /> Rename
                    </button>
                    <button style={s.menuItem} onClick={() => {
                      handlePin(activeConv.id)
                      setHeaderMenuOpen(false)
                    }}>
                      <Pin size={13} />
                      {pinnedIds.includes(activeConv.id) ? 'Unpin' : 'Pin'}
                    </button>
                    <button style={s.menuItem} onClick={handleShare}>
                      <Share2 size={13} /> Share
                    </button>
                    <div style={s.menuDivider} />
                    <button style={{ ...s.menuItem, color: '#ef4444' }} onClick={() => {
                      if (window.confirm('Delete this conversation?')) handleDelete(activeConv.id)
                      setHeaderMenuOpen(false)
                    }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={s.chatArea}>
          {!activeConv && messages.length === 0 ? (
            <EmptyChat onSuggestion={handleSuggestion} onNewChat={handleNewChat} />
          ) : (
            <MessageList messages={messages} sending={sending} loading={loading} />
          )}
        </div>

        {/* Composer */}
        <Composer onSend={handleSend} disabled={false} sending={sending} />
      </div>
    </AppShell>
  )
}

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1.25rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)', flexShrink: 0 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 },
  convTitle: { fontSize: '0.875rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  headerBtn: { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.82rem' },
  headerMenu: { position: 'absolute', right: 0, top: '110%', width: '175px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', boxShadow: 'var(--shadow-lg)', padding: '0.4rem', zIndex: 200 },
  menuItem: { width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.6rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: '6px', textAlign: 'left' },
  menuDivider: { height: '1px', background: 'var(--border-color)', margin: '0.3rem 0' },
  chatArea: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
}