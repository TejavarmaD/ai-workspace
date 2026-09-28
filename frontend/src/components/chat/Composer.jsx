import { useState, useRef, useEffect } from 'react'
import { Send, Square, Mic, Plus, X, Image, BookOpen, Search, Globe, FlaskConical } from 'lucide-react'

const PLUS_MENU = [
  { id: 'files', icon: Plus, label: 'Add photos & files', desc: 'Upload from computer' },
  { id: 'library', icon: BookOpen, label: 'Add from Library', desc: 'Browse your files' },
  { id: 'image', icon: Image, label: 'Create Image', desc: 'Generate an image' },
  { id: 'search', icon: Globe, label: 'Web Search', desc: 'Search current information' },
  { id: 'research', icon: FlaskConical, label: 'Deep Research', desc: 'Get a detailed report' },
]

export default function Composer({ onSend, disabled, sending }) {
  const [value, setValue] = useState('')
  const [plusOpen, setPlusOpen] = useState(false)
  const [listening, setListening] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [activeMode, setActiveMode] = useState(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [value])

  const handleSend = () => {
    const content = value.trim()
    if ((!content && attachments.length === 0) || disabled) return
    onSend(content, attachments, activeMode)
    setValue('')
    setAttachments([])
    setActiveMode(null)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape') setPlusOpen(false)
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    const newAttachments = files.map(f => ({
      id: Date.now() + Math.random(),
      file: f,
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
      type: f.type,
      status: 'ready',
    }))
    setAttachments(prev => [...prev, ...newAttachments])
    setPlusOpen(false)
  }

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser. Try Chrome or Edge.')
      return
    }
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('')
      setValue(transcript)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const handlePlusItem = (id) => {
    if (id === 'files') {
      fileInputRef.current?.click()
    } else if (id === 'search' || id === 'research') {
      setActiveMode(id === 'search' ? 'web-search' : 'deep-research')
      setPlusOpen(false)
    } else {
      setPlusOpen(false)
    }
  }

  const canSend = (value.trim() || attachments.length > 0) && !disabled

  return (
    <div style={s.wrap}>
      {/* Active Mode Banner */}
      {activeMode && (
        <div style={s.modeBanner}>
          {activeMode === 'web-search' ? <Globe size={14} /> : <FlaskConical size={14} />}
          <span>{activeMode === 'web-search' ? 'Web Search enabled' : 'Deep Research enabled'}</span>
          <button style={s.modeClose} onClick={() => setActiveMode(null)}><X size={13} /></button>
        </div>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <div style={s.attachments}>
          {attachments.map(att => (
            <div key={att.id} style={s.chip}>
              <span style={s.chipName}>{att.name}</span>
              <span style={s.chipSize}>{att.size}</span>
              <button
                style={s.chipRemove}
                onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                aria-label="Remove attachment"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Composer Box */}
      <div style={s.box}>
        {/* Plus Button */}
        <div style={{ position: 'relative' }}>
          <button
            style={s.plusBtn}
            onClick={() => setPlusOpen(o => !o)}
            aria-label="Add files or tools"
            title="Add files or tools"
          >
            <Plus size={18} strokeWidth={2} />
          </button>

          {/* Plus Menu */}
          {plusOpen && (
            <div style={s.plusMenu}>
              {PLUS_MENU.map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    style={s.plusMenuItem}
                    onClick={() => handlePlusItem(item.id)}
                  >
                    <div style={s.plusIcon}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p style={s.plusLabel}>{item.label}</p>
                      <p style={s.plusDesc}>{item.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
          aria-hidden="true"
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          style={s.textarea}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          disabled={disabled}
          rows={1}
          aria-label="Message input"
        />

        {/* Mic Button */}
        <button
          style={{
            ...s.iconAction,
            ...(listening ? s.micActive : {}),
          }}
          onClick={handleVoice}
          aria-label={listening ? 'Stop listening' : 'Start voice input'}
          title={listening ? 'Stop listening' : 'Voice input'}
        >
          <Mic size={17} strokeWidth={1.8} />
        </button>

        {/* Send / Stop Button */}
        <button
          style={{
            ...s.sendBtn,
            ...(canSend || sending ? s.sendActive : {}),
          }}
          onClick={sending ? () => {} : handleSend}
          disabled={!canSend && !sending}
          aria-label={sending ? 'Stop generation' : 'Send message'}
          title={sending ? 'Stop' : 'Send'}
        >
          {sending ? <Square size={15} fill="currentColor" /> : <Send size={15} />}
        </button>
      </div>

      <p style={s.hint}>
        {listening
          ? '🎤 Listening... click mic to stop'
          : 'Enter to send · Shift+Enter for new line'}
      </p>
    </div>
  )
}

const s = {
  wrap: { padding: '0.75rem 1rem 0.5rem', background: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)', flexShrink: 0 },
  modeBanner: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', background: '#ede9fe', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.82rem', color: '#7c3aed', border: '1px solid #c4b5fd' },
  modeClose: { background: 'transparent', border: 'none', cursor: 'pointer', color: '#7c3aed', marginLeft: 'auto', display: 'flex', alignItems: 'center' },
  attachments: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' },
  chip: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.6rem', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '20px', fontSize: '0.8rem' },
  chipName: { color: 'var(--text-primary)', fontWeight: '500', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  chipSize: { color: 'var(--text-muted)', fontSize: '0.72rem' },
  chipRemove: { background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '1px' },
  box: { display: 'flex', alignItems: 'flex-end', gap: '0.5rem', background: 'var(--composer-bg)', border: '1px solid var(--composer-border)', borderRadius: '14px', padding: '0.6rem 0.75rem', position: 'relative' },
  plusBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0 },
  plusMenu: { position: 'absolute', bottom: '100%', left: 0, width: '260px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', padding: '0.5rem', zIndex: 200, marginBottom: '0.5rem' },
  plusMenuItem: { width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px', textAlign: 'left' },
  plusIcon: { width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--axiom-purple)', flexShrink: 0 },
  plusLabel: { fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' },
  plusDesc: { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' },
  textarea: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.95rem', resize: 'none', lineHeight: '1.5', maxHeight: '200px', overflow: 'auto', fontFamily: 'inherit' },
  iconAction: { background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0 },
  micActive: { color: '#ef4444', background: '#fee2e2' },
  sendBtn: { background: 'var(--bg-hover)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, transition: 'all 0.15s' },
  sendActive: { background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', color: '#fff', cursor: 'pointer' },
  hint: { textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.4rem' },
}