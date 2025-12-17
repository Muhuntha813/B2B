import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const AdminRoute = ({ children }) => {
  const { token, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }
  if (!token || !isAdmin()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

export default AdminRoute