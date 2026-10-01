import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { ThemeProvider } from './lib/theme'
import ProtectedRoute from './router/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import ChatPage from './pages/axiom/ChatPage'
import ImagesPage from './pages/axiom/ImagesPage'
import LibraryPage from './pages/axiom/LibraryPage'
import ProjectsPage from './pages/axiom/ProjectsPage'
import AgentsPage from './pages/axiom/AgentsPage'
import AppsPage from './pages/axiom/AppsPage'
import ScheduledPage from './pages/axiom/ScheduledPage'
import SettingsPage from './pages/axiom/SettingsPage'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/images" element={<ProtectedRoute><ImagesPage /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
            <Route path="/agents" element={<ProtectedRoute><AgentsPage /></ProtectedRoute>} />
            <Route path="/apps" element={<ProtectedRoute><AppsPage /></ProtectedRoute>} />
            <Route path="/scheduled" element={<ProtectedRoute><ScheduledPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/chat" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)