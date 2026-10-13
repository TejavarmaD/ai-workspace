import { useState, useEffect } from 'react'
import { useTheme } from '../../lib/theme'
import Sidebar from './Sidebar'
import { Toaster } from 'react-hot-toast'
import { Menu, X } from 'lucide-react'

export default function AppShell({
  children, conversations, activeConvId, pinnedIds,
  onNewChat, onSelectConv, onRename, onDelete, onPin
}) {
  const { theme } = useTheme()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      const mobile = w < 768
      const tablet = w < 1024
      setIsMobile(mobile)
      setIsTablet(tablet)
      if (mobile) {
        setSidebarCollapsed(false)
        setMobileSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [activeConvId])

  const sidebarWidth = sidebarCollapsed ? '64px' : isTablet ? '240px' : '280px'

  return (
    <div style={s.shell} data-theme={theme}>
      {/* Mobile Overlay */}
      {isMobile && mobileSidebarOpen && (
        <div
          style={s.overlay}
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div style={{
        ...s.sidebarWrap,
        width: sidebarWidth,
        transform: isMobile
          ? mobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
          : 'translateX(0)',
        boxShadow: isMobile && mobileSidebarOpen ? 'var(--shadow-lg)' : 'none',
      }}>
        <Sidebar
          collapsed={sidebarCollapsed && !isMobile}
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
        marginLeft: isMobile ? 0 : sidebarWidth,
      }}>
        {/* Mobile Header */}
        {isMobile && (
          <div style={s.mobileHeader}>
            <button
              style={s.mobileMenuBtn}
              onClick={() => setMobileSidebarOpen(o => !o)}
              aria-label={mobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span style={s.mobileLogo}>AXIOM</span>
            <div style={{ width: '36px' }} />
          </div>
        )}
        {children}
      </div>

      <Toaster
        position={isMobile ? 'top-center' : 'bottom-right'}
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
          duration: 2500,
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
    left: 0, top: 0, bottom: 0,
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
    minWidth: 0,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 99,
    backdropFilter: 'blur(2px)',
  },
  mobileHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--bg-primary)',
    flexShrink: 0,
  },
  mobileMenuBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    padding: '0.25rem',
    borderRadius: '6px',
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