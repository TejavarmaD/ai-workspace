import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '', display_name: '' })
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

  const f = (key) => ({ value: form[key], onChange: e => setForm({...form, [key]: e.target.value}) })

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoIcon}>✦</div>
          <h1 style={s.logoText}>AI Workspace</h1>
        </div>
        <p style={s.subtitle}>Create your account</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handle}>
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>First Name</label>
              <input style={s.input} {...f('first_name')} placeholder="John" required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Last Name</label>
              <input style={s.input} {...f('last_name')} placeholder="Doe" required />
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" {...f('email')} placeholder="you@example.com" required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Display Name <span style={s.optional}>(optional)</span></label>
            <input style={s.input} {...f('display_name')} placeholder="How should we call you?" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" {...f('password')} placeholder="Min 8 chars, uppercase, number" required />
          </div>
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={s.link}>
          Already have an account?{' '}
          <Link to="/login" style={s.a}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)', padding: '1rem' },
  card: { background: '#fff', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '480px', boxShadow: '0 4px 24px rgba(99,102,241,0.08)', border: '1px solid #e8eaf6' },
  logo: { display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center', marginBottom: '0.5rem' },
  logoIcon: { fontSize: '1.5rem', color: '#6366f1' },
  logoText: { fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' },
  subtitle: { color: '#94a3b8', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' },
  error: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { marginBottom: '1.1rem' },
  label: { display: 'block', color: '#475569', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.4rem' },
  optional: { color: '#94a3b8', fontWeight: '400' },
  input: { width: '100%', padding: '0.7rem 1rem', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '8px', color: '#1e293b', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '0.8rem', background: 'linear-gradient(to right, #6366f1, #8b5cf6)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' },
  link: { textAlign: 'center', color: '#94a3b8', marginTop: '1.5rem', fontSize: '0.875rem' },
  a: { color: '#6366f1', fontWeight: '500', textDecoration: 'none' },
}