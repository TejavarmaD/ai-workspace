import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/app')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>AI Workspace</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handle}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="you@example.com"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder="••••••••"
              required
            />
          </div>
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.link}>
          Don't have an account? <Link to="/register" style={styles.a}>Register</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f0f0f' },
  card: { background:'#1a1a1a', border:'1px solid #333', borderRadius:'16px', padding:'2.5rem', width:'100%', maxWidth:'420px' },
  title: { fontSize:'1.8rem', fontWeight:'bold', color:'#fff', textAlign:'center', marginBottom:'0.5rem' },
  subtitle: { color:'#888', textAlign:'center', marginBottom:'2rem' },
  error: { background:'#3f0000', border:'1px solid #dc2626', borderRadius:'8px', padding:'0.75rem', marginBottom:'1rem', color:'#f87171', fontSize:'0.9rem' },
  field: { marginBottom:'1.25rem' },
  label: { display:'block', color:'#ccc', fontSize:'0.9rem', marginBottom:'0.4rem' },
  input: { width:'100%', padding:'0.75rem', background:'#111', border:'1px solid #444', borderRadius:'8px', color:'#fff', fontSize:'1rem', boxSizing:'border-box' },
  button: { width:'100%', padding:'0.85rem', background:'linear-gradient(to right,#3b82f6,#8b5cf6)', border:'none', borderRadius:'8px', color:'#fff', fontSize:'1rem', fontWeight:'600', cursor:'pointer', marginTop:'0.5rem' },
  link: { textAlign:'center', color:'#888', marginTop:'1.5rem', fontSize:'0.9rem' },
  a: { color:'#60a5fa' },
}