import { useState, useEffect } from 'react'
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
  const [pinnedIds, setPinnedIds] = useState([])
  const [selectedProvider, setSelectedProvider] = useState('gemini')
  const [selectedModel, setSelectedModel] = useState('gemini-flash-latest')
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)

  useEffect(() => {
    api.workspaces.list().then(data => {
      if (data?.workspaces?.length > 0) {
        setWorkspaceId(data.workspaces[0].id)
      }
    }).catch(() => toast.error('Failed to load workspace'))
  }, [])

  useEffect(() => {
    if (!workspaceId) return
    loadConversations()
  }, [workspaceId])

  const loadConversations = async () => {
    try {
      const data = await api.chat.listConversations(workspaceId)
      setConversations(data.conversations || [])
    } catch {
      toast.error('Failed to load conversations')
    }
  }

  const handleNewChat = async () => {
    setActiveConv(null)
    setMessages([])
  }

  const handleSelectConv = async (conv) => {
    setActiveConv(conv)
    setLoading(true)
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
    if (sending) return
    setSending(true)

    let convId = activeConv?.id

    // Create conversation if none exists
    if (!convId) {
      try {
        const conv = await api.post('/api/v1/chat/conversations', {
          workspace_id: workspaceId,
          title: 'New Conversation',
          provider: selectedProvider,
          model: selectedModel,
        })
        setActiveConv(conv)
        setConversations(prev => [conv, ...prev])
        convId = conv.id
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
        { content, conversation_id: convId, provider: selectedProvider, model: selectedModel }
      )
      setMessages(prev => [...prev, response])
      loadConversations()
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

  const handleSuggestion = async (text) => {
    await handleNewChat()
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
      if (activeConv?.id === convId) {
        setActiveConv(null)
        setMessages([])
      }
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handlePin = (convId) => {
    setPinnedIds(prev =>
      prev.includes(convId) ? prev.filter(id => id !== convId) : [...prev, convId]
    )
    toast.success(pinnedIds.includes(convId) ? 'Unpinned' : 'Pinned')
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard')
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
        {/* Top Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <ModelSelector
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              onSelect={(p, m) => { setSelectedProvider(p); setSelectedModel(m) }}
            />
          </div>

          <div style={s.headerRight}>
            <button
              style={s.headerBtn}
              onClick={handleShare}
              aria-label="Share conversation"
              title="Share"
            >
              <Share2 size={16} />
              {activeConv && <span>Share</span>}
            </button>

            {activeConv && (
              <div style={{ position: 'relative' }}>
                <button
                  style={s.headerBtn}
                  onClick={() => setHeaderMenuOpen(o => !o)}
                  aria-label="More options"
                  title="More options"
                >
                  <MoreHorizontal size={16} />
                </button>

                {headerMenuOpen && (
                  <div style={s.headerMenu}>
                    <button style={s.menuItem} onClick={() => {
                      const title = prompt('New title:', activeConv.title)
                      if (title) handleRename(activeConv.id, title)
                      setHeaderMenuOpen(false)
                    }}>
                      <Edit3 size={14} /> Rename
                    </button>
                    <button style={s.menuItem} onClick={() => {
                      handlePin(activeConv.id)
                      setHeaderMenuOpen(false)
                    }}>
                      <Pin size={14} /> {pinnedIds.includes(activeConv.id) ? 'Unpin' : 'Pin'}
                    </button>
                    <button style={s.menuItem} onClick={handleShare}>
                      <Share2 size={14} /> Share
                    </button>
                    <div style={s.menuDivider} />
                    <button style={{ ...s.menuItem, color: '#ef4444' }} onClick={() => {
                      if (window.confirm('Delete this conversation?')) {
                        handleDelete(activeConv.id)
                      }
                      setHeaderMenuOpen(false)
                    }}>
                      <Trash2 size={14} /> Delete
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
            <EmptyChat
              onSuggestion={handleSuggestion}
              onNewChat={handleNewChat}
            />
          ) : (
            <MessageList
              messages={messages}
              sending={sending}
              loading={loading}
            />
          )}
        </div>

        {/* Composer */}
        <Composer
          onSend={handleSend}
          disabled={false}
          sending={sending}
        />
      </div>
    </AppShell>
  )
}

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1.25rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)', flexShrink: 0 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  headerBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.85rem' },
  headerMenu: { position: 'absolute', right: 0, top: '110%', width: '180px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', boxShadow: 'var(--shadow-lg)', padding: '0.4rem', zIndex: 200 },
  menuItem: { width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.6rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', borderRadius: '6px', textAlign: 'left' },
  menuDivider: { height: '1px', background: 'var(--border-color)', margin: '0.3rem 0' },
  chatArea: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
}