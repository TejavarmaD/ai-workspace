import { useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import { useTheme } from '../../lib/theme'
import { useAuth } from '../../lib/auth'
import { Sun, Moon, Monitor, User, Shield, Bell, Palette, Database, Code } from 'lucide-react'

const SECTIONS = [
  { id: 'general', label: 'General', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'account', label: 'Account', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'models', label: 'Models', icon: Database },
  { id: 'developer', label: 'API / Developer', icon: Code },
]

export default function SettingsPage() {
  const { theme, setLight, setDark } = useTheme()
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState('general')

  return (
    <AppShell>
      <div style={s.page}>
        <div style={s.header}>
          <h1 style={s.title}>Settings</h1>
        </div>

        <div style={s.body}>
          {/* Sidebar */}
          <div style={s.nav}>
            {SECTIONS.map(sec => {
              const Icon = sec.icon
              return (
                <button
                  key={sec.id}
                  style={{
                    ...s.navItem,
                    ...(activeSection === sec.id ? s.navActive : {})
                  }}
                  onClick={() => setActiveSection(sec.id)}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  {sec.label}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div style={s.content}>
            {activeSection === 'general' && (
              <div style={s.section}>
                <h2 style={s.sectionTitle}>General</h2>

                <div style={s.field}>
                  <label style={s.label}>Display Name</label>
                  <input style={s.input} defaultValue={user?.display_name || user?.first_name} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Email</label>
                  <input style={s.input} defaultValue={user?.email} disabled />
                  <p style={s.hint}>Email cannot be changed</p>
                </div>
                <button style={s.saveBtn}>Save Changes</button>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div style={s.section}>
                <h2 style={s.sectionTitle}>Appearance</h2>
                <p style={s.sectionDesc}>Choose how Axiom looks to you</p>

                <div style={s.themeGrid}>
                  <button
                    style={{ ...s.themeCard, ...(theme === 'light' ? s.themeActive : {}) }}
                    onClick={setLight}
                  >
                    <Sun size={22} />
                    <span style={s.themeLabel}>Light</span>
                    {theme === 'light' && <span style={s.themeCheck}>✓</span>}
                  </button>
                  <button
                    style={{ ...s.themeCard, ...(theme === 'dark' ? s.themeActive : {}) }}
                    onClick={setDark}
                  >
                    <Moon size={22} />
                    <span style={s.themeLabel}>Dark</span>
                    {theme === 'dark' && <span style={s.themeCheck}>✓</span>}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'account' && (
              <div style={s.section}>
                <h2 style={s.sectionTitle}>Account & Security</h2>
                <div style={s.infoCard}>
                  <div style={s.infoRow}>
                    <span style={s.infoLabel}>Name</span>
                    <span style={s.infoValue}>{user?.first_name} {user?.last_name}</span>
                  </div>
                  <div style={s.infoRow}>
                    <span style={s.infoLabel}>Email</span>
                    <span style={s.infoValue}>{user?.email}</span>
                  </div>
                  <div style={s.infoRow}>
                    <span style={s.infoLabel}>Status</span>
                    <span style={{ ...s.infoValue, color: '#22c55e' }}>
                      {user?.is_active ? '● Active' : '● Inactive'}
                    </span>
                  </div>
                </div>

                <h3 style={{ ...s.sectionTitle, fontSize: '1rem', marginTop: '1.5rem' }}>
                  Change Password
                </h3>
                <div style={s.field}>
                  <label style={s.label}>Current Password</label>
                  <input style={s.input} type="password" placeholder="••••••••" />
                </div>
                <div style={s.field}>
                  <label style={s.label}>New Password</label>
                  <input style={s.input} type="password" placeholder="••••••••" />
                </div>
                <button style={s.saveBtn}>Update Password</button>
              </div>
            )}

            {activeSection === 'models' && (
              <div style={s.section}>
                <h2 style={s.sectionTitle}>AI Models</h2>
                <p style={s.sectionDesc}>
                  Configure your AI providers and API keys. Keys are stored securely and never exposed to the browser.
                </p>
                <div style={s.infoCard}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    ✅ Google Gemini — Connected (gemini-3.1-flash-lite)<br/>
                    ⚠️ Anthropic Claude — API key required<br/>
                    ⚠️ OpenAI — API key required<br/>
                    🔵 Ollama — Local (not running)
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'developer' && (
              <div style={s.section}>
                <h2 style={s.sectionTitle}>API / Developer</h2>
                <p style={s.sectionDesc}>Access Axiom programmatically</p>
                <div style={s.infoCard}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.7' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Backend API:</strong><br/>
                    All endpoints available at <code style={s.code}>/api/v1/</code><br/><br/>
                    <strong style={{ color: 'var(--text-primary)' }}>Documentation:</strong><br/>
                    Interactive docs at <code style={s.code}>/docs</code>
                  </p>
                </div>
              </div>
            )}

            {!['general','appearance','account','models','developer'].includes(activeSection) && (
              <div style={s.section}>
                <h2 style={s.sectionTitle}>{SECTIONS.find(s => s.id === activeSection)?.label}</h2>
                <p style={s.sectionDesc}>Coming soon in a future update.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' },
  header: { padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', flexShrink: 0 },
  title: { fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)' },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  nav: { width: '200px', padding: '1rem 0.75rem', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0, overflowY: 'auto' },
  navItem: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.75rem', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'left' },
  navActive: { background: 'var(--bg-active)', color: 'var(--axiom-purple)' },
  content: { flex: 1, overflowY: 'auto', padding: '2rem' },
  section: { maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '1rem' },
  sectionTitle: { fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' },
  sectionDesc: { color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' },
  input: { padding: '0.65rem 0.875rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' },
  hint: { fontSize: '0.75rem', color: 'var(--text-muted)' },
  saveBtn: { padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start' },
  themeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  themeCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.25rem', background: 'var(--bg-secondary)', border: '2px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', color: 'var(--text-primary)', position: 'relative' },
  themeActive: { borderColor: 'var(--axiom-purple)', background: 'var(--bg-active)' },
  themeLabel: { fontSize: '0.875rem', fontWeight: '600' },
  themeCheck: { position: 'absolute', top: '0.5rem', right: '0.75rem', color: 'var(--axiom-purple)', fontWeight: '700' },
  infoCard: { background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' },
  infoLabel: { fontSize: '0.875rem', color: 'var(--text-muted)' },
  infoValue: { fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '500' },
  code: { background: 'var(--bg-hover)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85em', color: 'var(--axiom-purple)' },
}