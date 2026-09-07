import { useState, useRef } from 'react'

export default function MessageComposer({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    const content = value.trim()
    if (!content || disabled) return
    onSend(content)
    setValue('')
    textareaRef.current?.focus()
  }

  return (
    <div style={s.container}>
      <div style={s.box}>
        <textarea
          ref={textareaRef}
          style={s.textarea}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message AI Workspace... (Enter to send, Shift+Enter for new line)"
          disabled={disabled}
          rows={1}
        />
        <button
          style={{ ...s.sendBtn, opacity: disabled || !value.trim() ? 0.5 : 1 }}
          onClick={handleSend}
          disabled={disabled || !value.trim()}
        >
          {disabled ? '...' : '➤'}
        </button>
      </div>
      <p style={s.hint}>Enter to send • Shift+Enter for new line</p>
    </div>
  )
}

const s = {
  container: { padding: '1rem 1.5rem', borderTop: '1px solid #222', background: '#0f0f0f' },
  box: { display: 'flex', gap: '0.75rem', alignItems: 'flex-end', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '0.75rem' },
  textarea: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.95rem', resize: 'none', lineHeight: '1.5', maxHeight: '150px', overflow: 'auto' },
  sendBtn: { padding: '0.5rem 1rem', background: 'linear-gradient(to right,#3b82f6,#8b5cf6)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', flexShrink: 0 },
  hint: { color: '#555', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.5rem' },
}