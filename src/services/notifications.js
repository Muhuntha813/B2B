// Notification service for B2B Plastics SRM
// Handles toast notifications, alerts, and user feedback

class NotificationService {
  constructor() {
    this.notifications = []
    this.listeners = []
    this.nextId = 1
  }

  // Add a listener for notification changes
  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Notify all listeners of changes
  notify() {
    this.listeners.forEach(listener => listener(this.notifications))
  }

  // Add a notification
  add(notification) {
    const newNotification = {
      id: this.nextId++,
      timestamp: new Date().toISOString(),
      ...notification
    }

    this.notifications.unshift(newNotification)
    this.notify()

    // Auto-remove after duration (if specified)
    if (notification.duration) {
      setTimeout(() => {
        this.remove(newNotification.id)
      }, notification.duration)
    }

    return newNotification.id
  }

  // Remove a notification
  remove(id) {
    this.notifications = this.notifications.filter(n => n.id !== id)
    this.notify()
  }

  // Clear all notifications
  clear() {
    this.notifications = []
    this.notify()
  }

  // Get all notifications
  getAll() {
    return this.notifications
  }

  // Predefined notification types
  success(message, options = {}) {
    return this.add({
      type: 'success',
      title: options.title || 'Success',
      message,
      duration: options.duration || 5000,
      ...options
    })
  }

  error(message, options = {}) {
    return this.add({
      type: 'error',
      title: options.title || 'Error',
      message,
      duration: options.duration || 8000,
      ...options
    })
  }

  warning(message, options = {}) {
    return this.add({
      type: 'warning',
      title: options.title || 'Warning',
      message,
      duration: options.duration || 6000,
      ...options
    })
  }

  info(message, options = {}) {
    return this.add({
      type: 'info',
      title: options.title || 'Info',
      message,
      duration: options.duration || 5000,
      ...options
    })
  }

  // Loading notification (doesn't auto-remove)
  loading(message, options = {}) {
    return this.add({
      type: 'loading',
      title: options.title || 'Loading',
      message,
      duration: null, // Don't auto-remove
      ...options
    })
  }

  // Update an existing notification
  update(id, updates) {
    const index = this.notifications.findIndex(n => n.id === id)
    if (index !== -1) {
      this.notifications[index] = {
        ...this.notifications[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      this.notify()
    }
  }

  // Mark notification as read
  markAsRead(id) {
    this.update(id, { read: true })
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true
      }
    })
    this.notify()
  }

  // Get unread count
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length
  }
}

// Create singleton instance
const notificationService = new NotificationService()

// Predefined notification templates
export const NotificationTemplates = {
  // Chat notifications
  messageReceived: (senderName) => ({
    type: 'info',
    title: 'New Message',
    message: `${senderName} sent you a message`,
    duration: 5000,
    action: {
      label: 'View',
      onClick: () => {
        // Navigate to chat
      }
    }
  }),

  // Quote notifications
  quoteReceived: (supplierName, machineName) => ({
    type: 'success',
    title: 'Quote Received',
    message: `${supplierName} sent a quote for ${machineName}`,
    duration: 8000,
    action: {
      label: 'View Quote',
      onClick: () => {
        // Navigate to quotes
      }
    }
  }),

  quoteRequested: (machineName) => ({
    type: 'success',
    title: 'Quote Requested',
    message: `Your quote request for ${machineName} has been sent`,
    duration: 5000
  }),

  // Favorites notifications
  addedToFavorites: (itemName) => ({
    type: 'success',
    title: 'Added to Favorites',
    message: `${itemName} has been added to your favorites`,
    duration: 3000
  }),

  removedFromFavorites: (itemName) => ({
    type: 'info',
    title: 'Removed from Favorites',
    message: `${itemName} has been removed from your favorites`,
    duration: 3000
  }),

  // Cart notifications
  addedToCart: (itemName) => ({
    type: 'success',
    title: 'Added to Cart',
    message: `${itemName} has been added to your cart`,
    duration: 3000,
    action: {
      label: 'View Cart',
      onClick: () => {
        // Navigate to cart
      }
    }
  }),

  // Error notifications
  networkError: () => ({
    type: 'error',
    title: 'Connection Error',
    message: 'Please check your internet connection and try again',
    duration: 8000
  }),

  serverError: () => ({
    type: 'error',
    title: 'Server Error',
    message: 'Something went wrong. Please try again later',
    duration: 8000
  }),

  // Form notifications
  formSubmitted: (formType) => ({
    type: 'success',
    title: 'Form Submitted',
    message: `Your ${formType} has been submitted successfully`,
    duration: 5000
  }),

  formError: (fieldName) => ({
    type: 'error',
    title: 'Form Error',
    message: `Please check the ${fieldName} field and try again`,
    duration: 6000
  }),

  // Search notifications
  searchCompleted: (resultsCount, query) => ({
    type: 'info',
    title: 'Search Results',
    message: `Found ${resultsCount} results for "${query}"`,
    duration: 4000
  }),

  noSearchResults: (query) => ({
    type: 'warning',
    title: 'No Results',
    message: `No results found for "${query}". Try different keywords`,
    duration: 5000
  })
}

// Utility functions for common notification patterns
export const notify = {
  success: (message, options) => notificationService.success(message, options),
  error: (message, options) => notificationService.error(message, options),
  warning: (message, options) => notificationService.warning(message, options),
  info: (message, options) => notificationService.info(message, options),
  loading: (message, options) => notificationService.loading(message, options),
  
  // Template-based notifications
  template: (template, ...args) => {
    const notification = template(...args)
    return notificationService.add(notification)
  },

  // Update loading notification to success/error
  updateLoading: (id, type, message, options = {}) => {
    notificationService.update(id, {
      type,
      message,
      duration: type === 'error' ? 8000 : 5000,
      ...options
    })
  },

  // Remove notification
  remove: (id) => notificationService.remove(id),
  
  // Clear all notifications
  clear: () => notificationService.clear()
}

export default notificationService