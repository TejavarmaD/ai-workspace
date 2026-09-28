import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { ThemeProvider } from './lib/theme'
import ProtectedRoute from './router/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import ChatPage from './pages/axiom/ChatPage'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chat" element={
              <ProtectedRoute><ChatPage /></ProtectedRoute>
            } />
            <Route path="/images" element={
              <ProtectedRoute><ChatPage /></ProtectedRoute>
            } />
            <Route path="/library" element={
              <ProtectedRoute><ChatPage /></ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute><ChatPage /></ProtectedRoute>
            } />
            <Route path="/agents" element={
              <ProtectedRoute><ChatPage /></ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute><ChatPage /></ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/chat" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)