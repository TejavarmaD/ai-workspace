import { useAuth } from '../lib/auth'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f0f0f' }}>
      <p style={{ color:'#888' }}>Loading...</p>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  return children
}