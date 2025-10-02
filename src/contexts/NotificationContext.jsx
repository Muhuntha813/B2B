import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc,
  addDoc,
  serverTimestamp,
  limit
} from 'firebase/firestore'
import { db } from '../config/firebase'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Listen to notifications in real-time
  useEffect(() => {
    if (!currentUser) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setNotifications(notificationsList)
      setUnreadCount(notificationsList.filter(n => !n.read).length)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  // Create a new notification
  const createNotification = async (notification) => {
    if (!currentUser) return

    try {
      await addDoc(collection(db, 'notifications'), {
        userId: currentUser.uid,
        ...notification,
        read: false,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId)
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read)
      const promises = unreadNotifications.map(notification => 
        markAsRead(notification.id)
      )
      await Promise.all(promises)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Send notification to user (for admin use)
  const sendNotificationToUser = async (userId, notification) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        ...notification,
        read: false,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  // Notification types and their default configurations
  const notificationTypes = {
    MESSAGE: {
      icon: '💬',
      color: 'blue',
      title: 'New Message'
    },
    CHAT: {
      icon: '💬',
      color: 'green',
      title: 'Chat Update'
    },
    SYSTEM: {
      icon: '🔔',
      color: 'gray',
      title: 'System Notification'
    },
    WELCOME: {
      icon: '👋',
      color: 'purple',
      title: 'Welcome'
    },
    UPDATE: {
      icon: '📢',
      color: 'orange',
      title: 'Update'
    },
    REMINDER: {
      icon: '⏰',
      color: 'yellow',
      title: 'Reminder'
    }
  }

  // Helper function to create typed notifications
  const createTypedNotification = async (type, message, data = {}) => {
    const config = notificationTypes[type] || notificationTypes.SYSTEM
    
    await createNotification({
      type,
      title: config.title,
      message,
      icon: config.icon,
      color: config.color,
      data
    })
  }

  // Send welcome notification for new users
  const sendWelcomeNotification = async () => {
    await createTypedNotification(
      'WELCOME',
      'Welcome to B2B Plastics SRM! Explore materials, machinery, and connect with suppliers.',
      { action: 'explore' }
    )
  }

  // Send chat notification
  const sendChatNotification = async (senderName, message, conversationId) => {
    await createTypedNotification(
      'CHAT',
      `${senderName}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`,
      { 
        conversationId,
        senderName,
        action: 'view_chat'
      }
    )
  }

  // Send message notification
  const sendMessageNotification = async (title, message, data = {}) => {
    await createTypedNotification('MESSAGE', message, { title, ...data })
  }

  const value = {
    notifications,
    unreadCount,
    loading,
    createNotification,
    markAsRead,
    markAllAsRead,
    sendNotificationToUser,
    createTypedNotification,
    sendWelcomeNotification,
    sendChatNotification,
    sendMessageNotification,
    notificationTypes
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}