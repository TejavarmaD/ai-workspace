import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'', first_name:'', last_name:'', display_name:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/app')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const f = (key) => ({ value: form[key], onChange: e => setForm({...form, [key]: e.target.value}) })

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join AI Workspace today</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handle}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            <div style={styles.field}>
              <label style={styles.label}>First Name</label>
              <input style={styles.input} {...f('first_name')} placeholder="John" required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Last Name</label>
              <input style={styles.input} {...f('last_name')} placeholder="Doe" required />
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" {...f('email')} placeholder="you@example.com" required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Display Name (optional)</label>
            <input style={styles.input} {...f('display_name')} placeholder="How should we call you?" />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" {...f('password')} placeholder="Min 8 chars, uppercase, number" required />
          </div>
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.link}>
          Already have an account? <Link to="/login" style={styles.a}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f0f0f', padding:'1rem' },
  card: { background:'#1a1a1a', border:'1px solid #333', borderRadius:'16px', padding:'2.5rem', width:'100%', maxWidth:'480px' },
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