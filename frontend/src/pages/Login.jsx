import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { useNavigate, Link } from 'react-router-dom'
import ConstellationBackground from '../components/ConstellationBackground'
import './Login.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(form.email, form.password)
      navigate('/chat')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Animated constellation background */}
      <ConstellationBackground />

      {/* Login content */}
      <main className="login-content">
        <div className="login-card">

          {/* AXIOM branding */}
          <div className="axiom-brand">
            <div className="axiom-icon">✦</div>
            <div className="axiom-name">AXIOM</div>
          </div>

          {/* Heading */}
          <div className="login-heading">
            <h1>Welcome back</h1>
            <p>Continue to your intelligent workspace.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* Existing authentication form */}
          <form onSubmit={handle}>

            {/* Email */}
            <div className="login-field">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {/* Sign in */}
            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              <span>
                {loading ? 'Signing in...' : 'Sign In'}
              </span>

              {!loading && (
                <span className="login-arrow">
                  →
                </span>
              )}
            </button>
          </form>

          {/* Register */}
          <p className="login-register">
            Don't have an account?{' '}
            <Link to="/register">
              Create account
            </Link>
          </p>

          {/* Footer */}
          <div className="login-footer">
            <span></span>
            <small>AXIOM INTELLIGENCE</small>
            <span></span>
          </div>

        </div>
      </main>
    </div>
  )
}