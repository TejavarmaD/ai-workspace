import { useEffect, useRef } from 'react'
import MessageComposer from './MessageComposer'

export default function ChatWindow({ conversation, messages, loading, sending, onSendMessage, onNewChat }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!conversation) return (
    <div style={s.empty}>
      <div style={s.emptyInner}>
        <h1 style={s.emptyTitle}>AI Workspace</h1>
        <p style={s.emptyText}>Start a new conversation to begin chatting with AI</p>
        <button style={s.startBtn} onClick={onNewChat}>+ Start New Chat</button>
      </div>
    </div>
  )

  return (
    <div style={s.window}>
      {/* Header */}
      <div style={s.header}>
        <h2 style={s.title}>{conversation.title}</h2>
        <span style={s.model}>claude-sonnet-4-5</span>
      </div>

      {/* Messages */}
      <div style={s.messages}>
        {loading && <div style={s.loading}>Loading messages...</div>}
        {messages.map((msg, i) => (
          <div key={msg.id || i} style={{ ...s.msgRow, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && <div style={s.aiAvatar}>AI</div>}
            <div style={{ ...s.bubble, ...(msg.role === 'user' ? s.userBubble : s.aiBubble) }}>
              <p style={s.msgContent}>{msg.content}</p>
              <p style={s.timestamp}>{new Date(msg.created_at).toLocaleTimeString()}</p>
            </div>
            {msg.role === 'user' && <div style={s.userAvatar}>You</div>}
          </div>
        ))}
        {sending && (
          <div style={{ ...s.msgRow, justifyContent: 'flex-start' }}>
            <div style={s.aiAvatar}>AI</div>
            <div style={{ ...s.bubble, ...s.aiBubble }}>
              <p style={s.typing}>Thinking...</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <MessageComposer onSend={onSendMessage} disabled={sending} />
    </div>
  )
}

const s = {
  empty: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f' },
  emptyInner: { textAlign: 'center', maxWidth: '400px' },
  emptyTitle: { fontSize: '2rem', fontWeight: 'bold', background: 'linear-gradient(to right,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' },
  emptyText: { color: '#888', marginBottom: '2rem' },
  startBtn: { padding: '0.75rem 2rem', background: 'linear-gradient(to right,#3b82f6,#8b5cf6)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' },
  window: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f0f' },
  header: { padding: '1rem 1.5rem', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111' },
  title: { fontSize: '1rem', fontWeight: '600', color: '#fff', margin: 0 },
  model: { fontSize: '0.75rem', color: '#666', background: '#1a1a1a', padding: '0.2rem 0.6rem', borderRadius: '20px' },
  messages: { flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  loading: { color: '#666', textAlign: 'center', padding: '1rem' },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: '0.5rem' },
  bubble: { maxWidth: '70%', padding: '0.75rem 1rem', borderRadius: '12px' },
  userBubble: { background: 'linear-gradient(to right,#3b82f6,#8b5cf6)', color: '#fff', borderBottomRightRadius: '4px' },
  aiBubble: { background: '#1a1a1a', border: '1px solid #333', color: '#e5e5e5', borderBottomLeftRadius: '4px' },
  msgContent: { margin: 0, lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  timestamp: { margin: '0.25rem 0 0', fontSize: '0.7rem', opacity: 0.6 },
  aiAvatar: { width: '28px', height: '28px', borderRadius: '50%', background: '#1e1e2e', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#60a5fa', flexShrink: 0 },
  userAvatar: { width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(to right,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#fff', flexShrink: 0 },
  typing: { margin: 0, color: '#888', fontStyle: 'italic' },
}