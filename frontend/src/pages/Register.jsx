import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { useNavigate, Link } from 'react-router-dom'
import ConstellationBackground from '../components/ConstellationBackground'
import '../components/ConstellationBackground.css'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '', password: '', first_name: '', last_name: '', display_name: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/chat')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const f = (key) => ({
    value: form[key],
    onChange: e => setForm({ ...form, [key]: e.target.value })
  })

  return (
    <div className="constellation-root">
      <ConstellationBackground />
      <div className="constellation-content">
        <div style={s.card}>
          {/* Logo */}
          <div style={s.logoWrap}>
            <div style={s.logoIcon}>A</div>
            <span style={s.logoText}>AXIOM</span>
          </div>

          <h1 style={s.title}>Create your account</h1>
          <p style={s.sub}>Join Axiom and start building with AI</p>

          {error && (
            <div style={s.error}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handle} style={s.form}>
            {/* Name Row */}
            <div style={s.row}>
              <div style={s.field}>
                <label style={s.label}>First Name</label>
                <input
                  style={s.input}
                  {...f('first_name')}
                  placeholder="John"
                  required
                  autoComplete="given-name"
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Last Name</label>
                <input
                  style={s.input}
                  {...f('last_name')}
                  placeholder="Doe"
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input
                style={s.input}
                type="email"
                {...f('email')}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Display Name <span style={s.optional}>(optional)</span></label>
              <input
                style={s.input}
                {...f('display_name')}
                placeholder="How should we call you?"
                autoComplete="nickname"
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                style={s.input}
                type="password"
                {...f('password')}
                placeholder="Min 8 chars, uppercase, number"
                required
                autoComplete="new-password"
              />
              <p style={s.hint}>At least 8 characters with uppercase and a number</p>
            </div>

            <button
              style={{ ...s.btn, ...(loading ? s.btnLoading : {}) }}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span style={s.spinner}>⟳ Creating account...</span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p style={s.footer}>
            Already have an account?{' '}
            <Link to="/login" style={s.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const s = {
  card: {
    background: 'rgba(15, 15, 25, 0.85)',
    border: '1px solid rgba(124, 58, 237, 0.25)',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '480px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(124,58,237,0.1)',
  },
  logoWrap: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    justifyContent: 'center', marginBottom: '1.5rem',
  },
  logoIcon: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem', fontWeight: '800', color: '#fff',
    boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
  },
  logoText: {
    fontSize: '1.2rem', fontWeight: '800', letterSpacing: '0.15em',
    background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  title: {
    fontSize: '1.5rem', fontWeight: '700', color: '#f1f5f9',
    textAlign: 'center', marginBottom: '0.4rem',
  },
  sub: {
    color: '#94a3b8', textAlign: 'center',
    fontSize: '0.875rem', marginBottom: '1.75rem',
  },
  error: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px', padding: '0.75rem 1rem',
    color: '#fca5a5', fontSize: '0.875rem',
    marginBottom: '1rem', display: 'flex', gap: '0.5rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '0.82rem', fontWeight: '500', color: '#94a3b8' },
  optional: { color: '#64748b', fontWeight: '400' },
  input: {
    padding: '0.7rem 0.9rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: '#f1f5f9',
    fontSize: '0.9rem', outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  },
  hint: { fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' },
  btn: {
    padding: '0.8rem',
    background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
    border: 'none', borderRadius: '12px',
    color: '#fff', fontSize: '0.95rem',
    fontWeight: '600', cursor: 'pointer',
    marginTop: '0.5rem',
    boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
    transition: 'opacity 0.2s',
  },
  btnLoading: { opacity: 0.7, cursor: 'not-allowed' },
  spinner: { display: 'inline-block' },
  footer: {
    textAlign: 'center', color: '#64748b',
    fontSize: '0.875rem', marginTop: '1.5rem',
  },
  link: { color: '#a78bfa', fontWeight: '500', textDecoration: 'none' },
}