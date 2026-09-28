import { useEffect, useRef } from 'react'
import MessageComposer from './MessageComposer'
import ModelSelector from './ModelSelector'

export default function ChatWindow({
  conversation, messages, loading, sending,
  onSendMessage, onNewChat, selectedProvider,
  selectedModel, onSelectModel
}) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!conversation) return (
    <div style={s.empty}>
      <div style={s.emptyInner}>
        <div style={s.emptyIcon}>✦</div>
        <h1 style={s.emptyTitle}>AI Workspace</h1>
        <p style={s.emptyText}>Select a model and start a new conversation</p>
        <div style={{ marginBottom: '1.5rem' }}>
          <ModelSelector
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onSelect={onSelectModel}
          />
        </div>
        <button style={s.startBtn} onClick={onNewChat}>+ New Chat</button>
      </div>
    </div>
  )

  return (
    <div style={s.window}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <h2 style={s.title}>{conversation.title}</h2>
        </div>
        <ModelSelector
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          onSelect={onSelectModel}
        />
      </div>

      {/* Messages */}
      <div style={s.messages}>
        {loading && (
          <div style={s.loadingWrap}>
            <div style={s.loadingDot} />
            <span style={s.loadingText}>Loading messages...</span>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={msg.id || i} style={{
            ...s.msgRow,
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            {msg.role === 'assistant' && (
              <div style={s.aiAvatar}>✦</div>
            )}
            <div style={{
              ...s.bubble,
              ...(msg.role === 'user' ? s.userBubble : s.aiBubble)
            }}>
              <p style={s.msgContent}>{msg.content}</p>
              <div style={s.msgMeta}>
                <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                {msg.meta?.provider && (
                  <span style={s.providerTag}>
                    {msg.meta.provider} · {msg.meta.model}
                    {msg.meta.latency_ms && ` · ${msg.meta.latency_ms}ms`}
                  </span>
                )}
              </div>
            </div>
            {msg.role === 'user' && (
              <div style={s.userAvatar}>
                {msg.role === 'user' ? 'You' : 'AI'}
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div style={{ ...s.msgRow, justifyContent: 'flex-start' }}>
            <div style={s.aiAvatar}>✦</div>
            <div style={{ ...s.bubble, ...s.aiBubble }}>
              <div style={s.typingDots}>
                <span style={s.dot1} />
                <span style={s.dot2} />
                <span style={s.dot3} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageComposer onSend={onSendMessage} disabled={sending} />
    </div>
  )
}

const s = {
  empty: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' },
  emptyInner: { textAlign: 'center', maxWidth: '420px', padding: '2rem' },
  emptyIcon: { fontSize: '2.5rem', color: '#6366f1', marginBottom: '1rem' },
  emptyTitle: { fontSize: '1.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' },
  emptyText: { color: '#94a3b8', marginBottom: '2rem', fontSize: '0.95rem' },
  startBtn: { padding: '0.75rem 2rem', background: 'linear-gradient(to right, #6366f1, #8b5cf6)', border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' },
  window: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc' },
  header: { padding: '0.9rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  headerLeft: { flex: 1, overflow: 'hidden', marginRight: '1rem' },
  title: { fontSize: '0.95rem', fontWeight: '600', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  messages: { flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  loadingWrap: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', padding: '0.5rem' },
  loadingDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', animation: 'pulse 1s infinite' },
  loadingText: { fontSize: '0.875rem' },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: '0.6rem' },
  bubble: { maxWidth: '68%', padding: '0.85rem 1.1rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  userBubble: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', borderBottomRightRadius: '4px' },
  aiBubble: { background: '#ffffff', border: '1px solid #e8eaf6', color: '#1e293b', borderBottomLeftRadius: '4px' },
  msgContent: { margin: 0, lineHeight: '1.65', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.95rem' },
  msgMeta: { display: 'flex', gap: '0.5rem', marginTop: '0.35rem', fontSize: '0.7rem', opacity: 0.6, flexWrap: 'wrap' },
  providerTag: { color: '#6366f1' },
  aiAvatar: { width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #e0e7ff, #ede9fe)', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: '#6366f1', flexShrink: 0 },
  userAvatar: { width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#fff', flexShrink: 0, fontWeight: '600' },
  typingDots: { display: 'flex', gap: '4px', alignItems: 'center', padding: '0.2rem 0' },
  dot1: { width: '7px', height: '7px', borderRadius: '50%', background: '#94a3b8' },
  dot2: { width: '7px', height: '7px', borderRadius: '50%', background: '#94a3b8' },
  dot3: { width: '7px', height: '7px', borderRadius: '50%', background: '#94a3b8' },
}