// Utility functions for B2B Plastics SRM
// Common helper functions used across the application

// Format currency values
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  } catch (error) {
    // Fallback for unsupported currencies
    return `₹${amount.toLocaleString()}`
  }
}

// Format numbers with commas
export const formatNumber = (number, locale = 'en-IN') => {
  try {
    return new Intl.NumberFormat(locale).format(number)
  } catch (error) {
    return number.toLocaleString()
  }
}

// Format dates
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  
  try {
    return new Intl.DateTimeFormat('en-IN', { ...defaultOptions, ...options }).format(new Date(date))
  } catch (error) {
    return new Date(date).toLocaleDateString()
  }
}

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now - targetDate) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
  }
  
  return formatDate(date)
}

// Debounce function
export const debounce = (func, wait, immediate = false) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Generate unique ID
export const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substr(2, 5)
  return `${prefix}${timestamp}${randomStr}`
}

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number (Indian format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

// Format phone number
export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  return phone
}

// Truncate text
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + suffix
}

// Capitalize first letter
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Convert to title case
export const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

// Generate slug from text
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

// Deep clone object
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

// Check if object is empty
export const isEmpty = (obj) => {
  if (obj == null) return true
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0
  return Object.keys(obj).length === 0
}

// Get nested object property safely
export const getNestedProperty = (obj, path, defaultValue = undefined) => {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue
    }
    result = result[key]
  }
  
  return result !== undefined ? result : defaultValue
}

// Set nested object property
export const setNestedProperty = (obj, path, value) => {
  const keys = path.split('.')
  const lastKey = keys.pop()
  let current = obj
  
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[lastKey] = value
  return obj
}

// Array utilities
export const arrayUtils = {
  // Remove duplicates from array
  unique: (arr, key = null) => {
    if (key) {
      const seen = new Set()
      return arr.filter(item => {
        const value = getNestedProperty(item, key)
        if (seen.has(value)) return false
        seen.add(value)
        return true
      })
    }
    return [...new Set(arr)]
  },

  // Group array by property
  groupBy: (arr, key) => {
    return arr.reduce((groups, item) => {
      const value = getNestedProperty(item, key)
      if (!groups[value]) groups[value] = []
      groups[value].push(item)
      return groups
    }, {})
  },

  // Sort array by property
  sortBy: (arr, key, direction = 'asc') => {
    return [...arr].sort((a, b) => {
      const aVal = getNestedProperty(a, key)
      const bVal = getNestedProperty(b, key)
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
      return 0
    })
  },

  // Paginate array
  paginate: (arr, page = 1, limit = 10) => {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    return {
      data: arr.slice(startIndex, endIndex),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(arr.length / limit),
        totalItems: arr.length,
        itemsPerPage: limit,
        hasNext: endIndex < arr.length,
        hasPrev: page > 1
      }
    }
  }
}

// URL utilities
export const urlUtils = {
  // Build query string from object
  buildQueryString: (params) => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else {
          searchParams.append(key, value)
        }
      }
    })
    
    return searchParams.toString()
  },

  // Parse query string to object
  parseQueryString: (queryString) => {
    const params = new URLSearchParams(queryString)
    const result = {}
    
    for (const [key, value] of params.entries()) {
      if (result[key]) {
        if (Array.isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [result[key], value]
        }
      } else {
        result[key] = value
      }
    }
    
    return result
  }
}

// File utilities
export const fileUtils = {
  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // Get file extension
  getFileExtension: (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
  },

  // Check if file is image
  isImage: (filename) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp']
    const extension = fileUtils.getFileExtension(filename).toLowerCase()
    return imageExtensions.includes(extension)
  }
}

// Color utilities
export const colorUtils = {
  // Convert hex to RGB
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },

  // Convert RGB to hex
  rgbToHex: (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  },

  // Generate random color
  randomColor: () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16)
  }
}

// Export all utilities
export default {
  formatCurrency,
  formatNumber,
  formatDate,
  formatRelativeTime,
  debounce,
  throttle,
  generateId,
  isValidEmail,
  isValidPhone,
  formatPhone,
  truncateText,
  capitalize,
  toTitleCase,
  generateSlug,
  deepClone,
  isEmpty,
  getNestedProperty,
  setNestedProperty,
  arrayUtils,
  urlUtils,
  fileUtils,
  colorUtils
}