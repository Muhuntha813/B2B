import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore'
import { db } from '../config/firebase'

const UserActivityContext = createContext()

export const useUserActivity = () => {
  const context = useContext(UserActivityContext)
  if (!context) {
    throw new Error('useUserActivity must be used within a UserActivityProvider')
  }
  return context
}

export const UserActivityProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const [userSession, setUserSession] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  // Track page visits
  const trackPageVisit = async (page, data = {}) => {
    if (!currentUser) return

    try {
      const activityData = {
        userId: currentUser.uid,
        type: 'page_visit',
        page,
        data,
        timestamp: serverTimestamp()
      }

      await addDoc(collection(db, 'userActivity'), activityData)
      
      // Update user session with last page
      await updateUserSession({ lastPage: page, lastPageData: data })
    } catch (error) {
      console.error('Error tracking page visit:', error)
    }
  }

  // Track user interactions
  const trackInteraction = async (type, data = {}) => {
    if (!currentUser) return

    try {
      const activityData = {
        userId: currentUser.uid,
        type,
        data,
        timestamp: serverTimestamp()
      }

      await addDoc(collection(db, 'userActivity'), activityData)
    } catch (error) {
      console.error('Error tracking interaction:', error)
    }
  }

  // Update user session
  const updateUserSession = async (updates) => {
    if (!currentUser) return

    try {
      const sessionRef = doc(db, 'userSessions', currentUser.uid)
      await updateDoc(sessionRef, {
        ...updates,
        lastActive: serverTimestamp()
      })
      
      setUserSession(prev => ({ ...prev, ...updates }))
    } catch (error) {
      console.error('Error updating user session:', error)
    }
  }

  // Load user session and recent activity
  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    const loadUserData = async () => {
      try {
        // Load user session
        const sessionRef = doc(db, 'userSessions', currentUser.uid)
        const sessionSnap = await getDoc(sessionRef)
        
        if (sessionSnap.exists()) {
          setUserSession(sessionSnap.data())
        } else {
          // Create new session
          const newSession = {
            userId: currentUser.uid,
            createdAt: serverTimestamp(),
            lastActive: serverTimestamp(),
            lastPage: '/',
            lastPageData: {}
          }
          await setDoc(sessionRef, newSession)
          setUserSession(newSession)
        }

        // Load recent activity
        const activityQuery = query(
          collection(db, 'userActivity'),
          where('userId', '==', currentUser.uid),
          orderBy('timestamp', 'desc'),
          limit(20)
        )
        
        const activitySnap = await getDocs(activityQuery)
        const activities = activitySnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        setRecentActivity(activities)
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [currentUser])

  // Track session start
  useEffect(() => {
    if (currentUser && userSession) {
      updateUserSession({ sessionStart: serverTimestamp() })
    }
  }, [currentUser, userSession])

  // Track page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (currentUser) {
        if (document.hidden) {
          updateUserSession({ lastSeen: serverTimestamp() })
        } else {
          updateUserSession({ lastActive: serverTimestamp() })
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [currentUser])

  // Get where user left off
  const getWhereLeftOff = () => {
    if (!userSession) return null

    return {
      page: userSession.lastPage,
      data: userSession.lastPageData,
      lastActive: userSession.lastActive
    }
  }

  // Get recent views by type
  const getRecentViews = (type, limit = 5) => {
    return recentActivity
      .filter(activity => activity.type === 'page_visit' && activity.page === type)
      .slice(0, limit)
  }

  // Save user preferences
  const saveUserPreferences = async (preferences) => {
    if (!currentUser) return

    try {
      const userRef = doc(db, 'userPreferences', currentUser.uid)
      await setDoc(userRef, {
        userId: currentUser.uid,
        preferences,
        updatedAt: serverTimestamp()
      }, { merge: true })
    } catch (error) {
      console.error('Error saving user preferences:', error)
    }
  }

  // Load user preferences
  const loadUserPreferences = async () => {
    if (!currentUser) return null

    try {
      const userRef = doc(db, 'userPreferences', currentUser.uid)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        return userSnap.data().preferences
      }
      return null
    } catch (error) {
      console.error('Error loading user preferences:', error)
      return null
    }
  }

  const value = {
    userSession,
    recentActivity,
    loading,
    trackPageVisit,
    trackInteraction,
    updateUserSession,
    getWhereLeftOff,
    getRecentViews,
    saveUserPreferences,
    loadUserPreferences
  }

  return (
    <UserActivityContext.Provider value={value}>
      {children}
    </UserActivityContext.Provider>
  )
}