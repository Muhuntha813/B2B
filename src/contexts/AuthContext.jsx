import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider 
} from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Database operations will be handled by backend API calls in production

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError(null)
      setLoading(true)
      
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
      await signOut(auth)
      setCurrentUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
      setError(error.message)
      throw error
    }
  }

  // Check if user is authenticated
  const isAuthenticated = () => {
    return currentUser !== null
  }

  // TODO: Get user profile from backend API
  const getUserProfile = async (firebaseUid) => {
    // This will be implemented with backend API calls
    return null
  }

  // Listen for authentication state changes
  useEffect(() => {
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
    loading,
    error,
    signInWithGoogle,
    logout,
    isAuthenticated,
    getUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}