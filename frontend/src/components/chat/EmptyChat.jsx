const SUGGESTIONS = [
  { icon: '💻', text: 'Write Python code to analyze data' },
  { icon: '🔍', text: 'Research the latest AI developments' },
  { icon: '📄', text: 'Analyze this document' },
  { icon: '🤖', text: 'Help me build an AI agent' },
  { icon: '🎨', text: 'Create an image of a futuristic city' },
  { icon: '📊', text: 'Analyze this dataset and find patterns' },
]

export default function EmptyChat({ onSuggestion, onNewChat }) {
  return (
    <div style={s.wrap}>
      <div style={s.inner}>
        {/* Logo */}
        <div style={s.logo}>
          <div style={s.logoIcon}>A</div>
        </div>

        <h1 style={s.title}>What can Axiom help you with?</h1>
        <p style={s.sub}>Choose a model and start a conversation</p>

        {/* Suggestions */}
        <div style={s.grid}>
          {SUGGESTIONS.map((s_, i) => (
            <button
              key={i}
              style={s.card}
              onClick={() => onSuggestion(s_.text)}
              aria-label={s_.text}
            >
              <span style={s.cardIcon}>{s_.icon}</span>
              <span style={s.cardText}>{s_.text}</span>
            </button>
          ))}
        </div>

        <button style={s.newBtn} onClick={onNewChat}>
          + New Conversation
        </button>
      </div>
    </div>
  )
}

const s = {
  wrap: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg-primary)', overflowY: 'auto' },
  inner: { textAlign: 'center', maxWidth: '640px', width: '100%' },
  logo: { display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' },
  logoIcon: { width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '800', color: '#fff', boxShadow: '0 8px 32px rgba(124,58,237,0.3)' },
  title: { fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' },
  sub: { color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '2rem' },
  card: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' },
  cardIcon: { fontSize: '1.1rem', flexShrink: 0 },
  cardText: { fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4', fontWeight: '500' },
  newBtn: { padding: '0.75rem 2rem', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' },
}