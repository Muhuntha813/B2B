// Mock API service for B2B Plastics SRM
// This simulates backend API calls with localStorage persistence

const API_BASE_URL = '/api'
const STORAGE_KEYS = {
  CHAT_MESSAGES: 'b2b_chat_messages',
  USER_PREFERENCES: 'b2b_user_preferences',
  FAVORITES: 'b2b_favorites',
  CART_ITEMS: 'b2b_cart_items',
  QUOTES: 'b2b_quotes',
  INQUIRIES: 'b2b_inquiries'
}

// Utility functions for localStorage
const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Error writing to localStorage:', error)
      return false
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Error removing from localStorage:', error)
      return false
    }
  }
}

// Simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API responses
const mockResponse = (data, success = true, message = '') => ({
  success,
  data,
  message,
  timestamp: new Date().toISOString()
})

// Chat API
export const chatAPI = {
  // Get chat messages for a conversation
  getMessages: async (conversationId) => {
    await delay(300)
    const allMessages = storage.get(STORAGE_KEYS.CHAT_MESSAGES) || {}
    const messages = allMessages[conversationId] || []
    return mockResponse(messages)
  },

  // Send a message
  sendMessage: async (conversationId, message) => {
    await delay(400)
    const allMessages = storage.get(STORAGE_KEYS.CHAT_MESSAGES) || {}
    
    if (!allMessages[conversationId]) {
      allMessages[conversationId] = []
    }
    
    const newMessage = {
      id: Date.now(),
      ...message,
      timestamp: new Date().toISOString()
    }
    
    allMessages[conversationId].push(newMessage)
    storage.set(STORAGE_KEYS.CHAT_MESSAGES, allMessages)
    
    return mockResponse(newMessage, true, 'Message sent successfully')
  },

  // Get conversation list
  getConversations: async (userId) => {
    await delay(300)
    const allMessages = storage.get(STORAGE_KEYS.CHAT_MESSAGES) || {}
    const conversations = Object.keys(allMessages).map(conversationId => {
      const messages = allMessages[conversationId]
      const lastMessage = messages[messages.length - 1]
      
      return {
        id: conversationId,
        lastMessage: lastMessage?.text || '',
        lastMessageTime: lastMessage?.timestamp || '',
        unreadCount: 0, // Mock unread count
        participants: ['user', 'supplier'] // Mock participants
      }
    })
    
    return mockResponse(conversations)
  }
}

// Favorites API
export const favoritesAPI = {
  // Get user favorites
  getFavorites: async (userId) => {
    await delay(200)
    const favorites = storage.get(STORAGE_KEYS.FAVORITES) || []
    return mockResponse(favorites)
  },

  // Add to favorites
  addFavorite: async (userId, item) => {
    await delay(300)
    const favorites = storage.get(STORAGE_KEYS.FAVORITES) || []
    
    const newFavorite = {
      id: Date.now(),
      userId,
      itemId: item.id,
      itemType: item.type, // 'material', 'machine', 'job', 'mould'
      addedAt: new Date().toISOString(),
      ...item
    }
    
    favorites.push(newFavorite)
    storage.set(STORAGE_KEYS.FAVORITES, favorites)
    
    return mockResponse(newFavorite, true, 'Added to favorites')
  },

  // Remove from favorites
  removeFavorite: async (userId, itemId) => {
    await delay(300)
    const favorites = storage.get(STORAGE_KEYS.FAVORITES) || []
    const updatedFavorites = favorites.filter(fav => fav.itemId !== itemId)
    
    storage.set(STORAGE_KEYS.FAVORITES, updatedFavorites)
    
    return mockResponse(null, true, 'Removed from favorites')
  }
}

// Quotes API
export const quotesAPI = {
  // Request a quote
  requestQuote: async (quoteData) => {
    await delay(500)
    const quotes = storage.get(STORAGE_KEYS.QUOTES) || []
    
    const newQuote = {
      id: Date.now(),
      ...quoteData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    quotes.push(newQuote)
    storage.set(STORAGE_KEYS.QUOTES, quotes)
    
    return mockResponse(newQuote, true, 'Quote request submitted successfully')
  },

  // Get user quotes
  getQuotes: async (userId) => {
    await delay(300)
    const quotes = storage.get(STORAGE_KEYS.QUOTES) || []
    const userQuotes = quotes.filter(quote => quote.userId === userId)
    
    return mockResponse(userQuotes)
  },

  // Update quote status
  updateQuoteStatus: async (quoteId, status, supplierResponse = null) => {
    await delay(400)
    const quotes = storage.get(STORAGE_KEYS.QUOTES) || []
    const quoteIndex = quotes.findIndex(quote => quote.id === quoteId)
    
    if (quoteIndex === -1) {
      return mockResponse(null, false, 'Quote not found')
    }
    
    quotes[quoteIndex] = {
      ...quotes[quoteIndex],
      status,
      supplierResponse,
      updatedAt: new Date().toISOString()
    }
    
    storage.set(STORAGE_KEYS.QUOTES, quotes)
    
    return mockResponse(quotes[quoteIndex], true, 'Quote updated successfully')
  }
}

// Inquiries API
export const inquiriesAPI = {
  // Submit an inquiry
  submitInquiry: async (inquiryData) => {
    await delay(500)
    const inquiries = storage.get(STORAGE_KEYS.INQUIRIES) || []
    
    const newInquiry = {
      id: Date.now(),
      ...inquiryData,
      status: 'open',
      createdAt: new Date().toISOString(),
      responses: []
    }
    
    inquiries.push(newInquiry)
    storage.set(STORAGE_KEYS.INQUIRIES, inquiries)
    
    return mockResponse(newInquiry, true, 'Inquiry submitted successfully')
  },

  // Get inquiries
  getInquiries: async (userId) => {
    await delay(300)
    const inquiries = storage.get(STORAGE_KEYS.INQUIRIES) || []
    const userInquiries = inquiries.filter(inquiry => inquiry.userId === userId)
    
    return mockResponse(userInquiries)
  },

  // Add response to inquiry
  addInquiryResponse: async (inquiryId, response) => {
    await delay(400)
    const inquiries = storage.get(STORAGE_KEYS.INQUIRIES) || []
    const inquiryIndex = inquiries.findIndex(inquiry => inquiry.id === inquiryId)
    
    if (inquiryIndex === -1) {
      return mockResponse(null, false, 'Inquiry not found')
    }
    
    const newResponse = {
      id: Date.now(),
      ...response,
      timestamp: new Date().toISOString()
    }
    
    inquiries[inquiryIndex].responses.push(newResponse)
    storage.set(STORAGE_KEYS.INQUIRIES, inquiries)
    
    return mockResponse(newResponse, true, 'Response added successfully')
  }
}

// User preferences API
export const userAPI = {
  // Get user preferences
  getPreferences: async (userId) => {
    await delay(200)
    const preferences = storage.get(STORAGE_KEYS.USER_PREFERENCES) || {}
    return mockResponse(preferences[userId] || {})
  },

  // Update user preferences
  updatePreferences: async (userId, preferences) => {
    await delay(300)
    const allPreferences = storage.get(STORAGE_KEYS.USER_PREFERENCES) || {}
    
    allPreferences[userId] = {
      ...allPreferences[userId],
      ...preferences,
      updatedAt: new Date().toISOString()
    }
    
    storage.set(STORAGE_KEYS.USER_PREFERENCES, allPreferences)
    
    return mockResponse(allPreferences[userId], true, 'Preferences updated successfully')
  }
}

// Analytics API (for tracking user interactions)
export const analyticsAPI = {
  // Track page view
  trackPageView: async (page, userId = null) => {
    await delay(100)
    // In a real app, this would send data to analytics service
    // Page view tracked silently
    return mockResponse(null, true, 'Page view tracked')
  },

  // Track user action
  trackAction: async (action, data = {}, userId = null) => {
    await delay(100)
    // In a real app, this would send data to analytics service
    // Action tracked silently
    return mockResponse(null, true, 'Action tracked')
  }
}

// Search API
export const searchAPI = {
  // Enhanced search with filters and sorting
  search: async (query, filters = {}, sortBy = 'relevance', page = 1, limit = 12) => {
    await delay(400)
    
    // This would normally make a real API call
    // For now, we'll return a mock response
    const mockResults = {
      query,
      filters,
      sortBy,
      page,
      limit,
      totalResults: 0,
      totalPages: 0,
      results: [],
      suggestions: [],
      facets: {
        categories: [],
        locations: [],
        priceRanges: []
      }
    }
    
    return mockResponse(mockResults, true, 'Search completed')
  },

  // Get search suggestions
  getSuggestions: async (query) => {
    await delay(200)
    
    // Mock suggestions based on query
    const suggestions = [
      { text: `${query} machines`, type: 'machine', count: 15 },
      { text: `${query} materials`, type: 'material', count: 8 },
      { text: `${query} jobs`, type: 'job', count: 3 }
    ]
    
    return mockResponse(suggestions)
  }
}

// Export all APIs
export default {
  chat: chatAPI,
  favorites: favoritesAPI,
  quotes: quotesAPI,
  inquiries: inquiriesAPI,
  user: userAPI,
  analytics: analyticsAPI,
  search: searchAPI
}