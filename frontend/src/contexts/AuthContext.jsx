import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider 
} from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'
import { getApiBaseUrlDynamic } from '../config/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('jwtToken') || null)
  const [role, setRole] = useState(() => localStorage.getItem('userRole') || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Database operations will be handled by backend API calls in production

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError(null)
      setLoading(true)

      // Guard against missing Firebase initialization
      if (!auth) {
        const msg = 'Firebase Auth not initialized. Set VITE_FIREBASE_* in frontend/.env'
        setError(msg)
        throw new Error(msg)
      }
      
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      // TODO: Store user data in database via backend API
      
      return result
    } catch (error) {
      console.error('Google sign-in error:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const logout = async () => {
    try {
      setError(null)
      // Clear local token and role
      localStorage.removeItem('jwtToken')
      localStorage.removeItem('userRole')
      setToken(null)
      setRole(null)
      setCurrentUser(null)
      // Sign out of Firebase if configured
      if (auth) {
        await signOut(auth)
      }
    } catch (error) {
      console.error('Sign out error:', error)
      setError(error.message)
      throw error
    }
  }

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token || currentUser !== null
  }

  // Backend email/password login (JWT)
  const loginWithPassword = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      const API_BASE_URL = getApiBaseUrlDynamic();
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      localStorage.setItem('jwtToken', data.token)
      localStorage.setItem('userRole', data.role)
      setToken(data.token)
      setRole(data.role)
      // Minimal currentUser representation for UI
      setCurrentUser({ uid: data.uid, email })
      return data
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = () => role === 'ADMIN'

  // TODO: Get user profile from backend API
  const getUserProfile = async (firebaseUid) => {
    // This will be implemented with backend API calls
    return null
  }

  // Listen for authentication state changes
  useEffect(() => {
    // Guard against missing Firebase initialization
    if (!auth) {
      setLoading(false)
      setError('Firebase Auth not initialized. Set VITE_FIREBASE_* in frontend/.env')
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // User is signed in
          setCurrentUser(user)
          
          // TODO: Update last login via backend API
        } else {
          // User is signed out
          setCurrentUser(null)
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    token,
    role,
    loading,
    error,
    signInWithGoogle,
    loginWithPassword,
    logout,
    isAuthenticated,
    isAdmin,
    getUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}