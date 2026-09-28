import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, MoreHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MessageList({ messages, sending, loading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  if (loading) return (
    <div style={s.loading}>
      <div style={s.loadingDots}>
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <p style={s.loadingText}>Loading messages...</p>
    </div>
  )

  return (
    <div style={s.list}>
      {messages.map((msg, i) => (
        <MessageItem key={msg.id || i} msg={msg} />
      ))}

      {sending && (
        <div style={s.thinkingRow}>
          <div style={s.aiAvatar}>A</div>
          <div style={s.thinkingBubble}>
            <div style={s.dots}>
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

function MessageItem({ msg }) {
  const isUser = msg.role === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content)
    toast.success('Copied to clipboard')
  }

  if (isUser) return (
    <div style={s.userRow} className="animate-fade-in">
      <div style={s.userBubble}>
        <p style={s.userText}>{msg.content}</p>
        <div style={s.userActions}>
          <button style={s.actionBtn} onClick={handleCopy} title="Copy" aria-label="Copy message">
            <Copy size={13} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={s.aiRow} className="animate-fade-in">
      <div style={s.aiAvatar}>A</div>
      <div style={s.aiContent}>
        <div className="axiom-message">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {msg.content}
          </ReactMarkdown>
        </div>

        {msg.meta?.provider && (
          <div style={s.meta}>
            {msg.meta.provider} · {msg.meta.model}
            {msg.meta.latency_ms && ` · ${msg.meta.latency_ms}ms`}
          </div>
        )}

        <div style={s.aiActions}>
          <button style={s.actionBtn} onClick={handleCopy} title="Copy" aria-label="Copy response">
            <Copy size={13} />
          </button>
          <button style={s.actionBtn} title="Good response" aria-label="Good response">
            <ThumbsUp size={13} />
          </button>
          <button style={s.actionBtn} title="Bad response" aria-label="Bad response">
            <ThumbsDown size={13} />
          </button>
          <button style={s.actionBtn} title="Regenerate" aria-label="Regenerate response">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  list: { flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '860px', width: '100%', margin: '0 auto' },
  loading: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' },
  loadingDots: { display: 'flex', gap: '0.3rem' },
  loadingText: { color: 'var(--text-muted)', fontSize: '0.875rem' },
  userRow: { display: 'flex', justifyContent: 'flex-end' },
  userBubble: { maxWidth: '70%', background: 'var(--bg-hover)', borderRadius: '16px 16px 4px 16px', padding: '0.75rem 1rem' },
  userText: { color: 'var(--text-primary)', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  userActions: { display: 'flex', gap: '0.25rem', marginTop: '0.4rem', justifyContent: 'flex-end', opacity: 0.5 },
  aiRow: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start' },
  aiAvatar: { width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '800', color: '#fff', flexShrink: 0, marginTop: '2px' },
  aiContent: { flex: 1, minWidth: 0 },
  meta: { fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' },
  aiActions: { display: 'flex', gap: '0.25rem', marginTop: '0.5rem', opacity: 0.5 },
  actionBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem', borderRadius: '4px', display: 'flex', alignItems: 'center' },
  thinkingRow: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start' },
  thinkingBubble: { background: 'var(--bg-hover)', borderRadius: '12px', padding: '0.75rem 1rem' },
  dots: { display: 'flex', gap: '0.3rem', alignItems: 'center' },
}