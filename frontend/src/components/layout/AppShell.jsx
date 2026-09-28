import { useState, useEffect } from 'react'
import { useTheme } from '../../lib/theme'
import Sidebar from './Sidebar'
import { Toaster } from 'react-hot-toast'

export default function AppShell({ children, conversations, activeConvId, pinnedIds, onNewChat, onSelectConv, onRename, onDelete, onPin }) {
  const { theme } = useTheme()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setSidebarCollapsed(true)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div style={s.shell} data-theme={theme}>
      {/* Mobile Overlay */}
      {isMobile && mobileSidebarOpen && (
        <div style={s.overlay} onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div style={{
        ...s.sidebarWrap,
        width: sidebarCollapsed ? '64px' : '280px',
        transform: isMobile
          ? mobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
          : 'translateX(0)',
      }}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(c => !c)}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          conversations={conversations || []}
          activeConvId={activeConvId}
          pinnedIds={pinnedIds || []}
          onNewChat={onNewChat}
          onSelectConv={onSelectConv}
          onRename={onRename}
          onDelete={onDelete}
          onPin={onPin}
        />
      </div>

      {/* Main Content */}
      <div style={{
        ...s.main,
        marginLeft: isMobile ? 0 : sidebarCollapsed ? '64px' : '280px',
      }}>
        {/* Mobile Header */}
        {isMobile && (
          <div style={s.mobileHeader}>
            <button
              style={s.mobileMenuBtn}
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              ☰
            </button>
            <span style={s.mobileLogo}>AXIOM</span>
          </div>
        )}
        {children}
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
        }}
      />
    </div>
  )
}

const s = {
  shell: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    position: 'relative',
  },
  sidebarWrap: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    transition: 'width 0.25s ease, transform 0.25s ease',
    background: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-color)',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    transition: 'margin-left 0.25s ease',
    background: 'var(--bg-primary)',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 99,
  },
  mobileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--bg-primary)',
  },
  mobileMenuBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.2rem',
    color: 'var(--text-primary)',
    padding: '0.25rem',
  },
  mobileLogo: {
    fontSize: '1rem',
    fontWeight: '800',
    letterSpacing: '0.15em',
    background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
}