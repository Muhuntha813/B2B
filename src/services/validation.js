// Validation service for B2B Plastics SRM
// Comprehensive validation rules and utilities

import { isValidEmail, isValidPhone } from './utils.js'

// Base validation rules
export const validationRules = {
  required: (value, message = 'This field is required') => {
    if (value === null || value === undefined || value === '') {
      return message
    }
    if (typeof value === 'string' && value.trim() === '') {
      return message
    }
    if (Array.isArray(value) && value.length === 0) {
      return message
    }
    return null
  },

  minLength: (min, message) => (value) => {
    if (value && value.length < min) {
      return message || `Minimum ${min} characters required`
    }
    return null
  },

  maxLength: (max, message) => (value) => {
    if (value && value.length > max) {
      return message || `Maximum ${max} characters allowed`
    }
    return null
  },

  email: (value, message = 'Please enter a valid email address') => {
    if (value && !isValidEmail(value)) {
      return message
    }
    return null
  },

  phone: (value, message = 'Please enter a valid phone number') => {
    if (value && !isValidPhone(value)) {
      return message
    }
    return null
  },

  number: (value, message = 'Please enter a valid number') => {
    if (value && isNaN(Number(value))) {
      return message
    }
    return null
  },

  min: (min, message) => (value) => {
    if (value && Number(value) < min) {
      return message || `Minimum value is ${min}`
    }
    return null
  },

  max: (max, message) => (value) => {
    if (value && Number(value) > max) {
      return message || `Maximum value is ${max}`
    }
    return null
  },

  pattern: (regex, message) => (value) => {
    if (value && !regex.test(value)) {
      return message || 'Invalid format'
    }
    return null
  },

  url: (value, message = 'Please enter a valid URL') => {
    if (value) {
      try {
        new URL(value)
      } catch {
        return message
      }
    }
    return null
  },

  date: (value, message = 'Please enter a valid date') => {
    if (value && isNaN(Date.parse(value))) {
      return message
    }
    return null
  },

  futureDate: (value, message = 'Date must be in the future') => {
    if (value) {
      const inputDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (inputDate <= today) {
        return message
      }
    }
    return null
  },

  pastDate: (value, message = 'Date must be in the past') => {
    if (value) {
      const inputDate = new Date(value)
      const today = new Date()
      
      if (inputDate >= today) {
        return message
      }
    }
    return null
  },

  match: (otherValue, message) => (value) => {
    if (value !== otherValue) {
      return message || 'Values do not match'
    }
    return null
  },

  oneOf: (options, message) => (value) => {
    if (value && !options.includes(value)) {
      return message || `Value must be one of: ${options.join(', ')}`
    }
    return null
  },

  custom: (validator, message) => (value) => {
    if (!validator(value)) {
      return message || 'Invalid value'
    }
    return null
  }
}

// Specific validation schemas for different forms
export const validationSchemas = {
  // User registration/profile
  userProfile: {
    firstName: [
      validationRules.required,
      validationRules.minLength(2, 'First name must be at least 2 characters'),
      validationRules.maxLength(50, 'First name must be less than 50 characters')
    ],
    lastName: [
      validationRules.required,
      validationRules.minLength(2, 'Last name must be at least 2 characters'),
      validationRules.maxLength(50, 'Last name must be less than 50 characters')
    ],
    email: [
      validationRules.required,
      validationRules.email
    ],
    phone: [
      validationRules.required,
      validationRules.phone
    ],
    company: [
      validationRules.required,
      validationRules.minLength(2, 'Company name must be at least 2 characters'),
      validationRules.maxLength(100, 'Company name must be less than 100 characters')
    ],
    designation: [
      validationRules.maxLength(100, 'Designation must be less than 100 characters')
    ]
  },

  // Contact form
  contact: {
    name: [
      validationRules.required,
      validationRules.minLength(2, 'Name must be at least 2 characters'),
      validationRules.maxLength(100, 'Name must be less than 100 characters')
    ],
    email: [
      validationRules.required,
      validationRules.email
    ],
    phone: [
      validationRules.phone
    ],
    subject: [
      validationRules.required,
      validationRules.minLength(5, 'Subject must be at least 5 characters'),
      validationRules.maxLength(200, 'Subject must be less than 200 characters')
    ],
    message: [
      validationRules.required,
      validationRules.minLength(10, 'Message must be at least 10 characters'),
      validationRules.maxLength(1000, 'Message must be less than 1000 characters')
    ]
  },

  // Job posting
  jobPost: {
    title: [
      validationRules.required,
      validationRules.minLength(5, 'Job title must be at least 5 characters'),
      validationRules.maxLength(100, 'Job title must be less than 100 characters')
    ],
    description: [
      validationRules.required,
      validationRules.minLength(50, 'Job description must be at least 50 characters'),
      validationRules.maxLength(2000, 'Job description must be less than 2000 characters')
    ],
    location: [
      validationRules.required,
      validationRules.minLength(2, 'Location must be at least 2 characters')
    ],
    budget: [
      validationRules.required,
      validationRules.number,
      validationRules.min(1000, 'Budget must be at least ₹1,000')
    ],
    deadline: [
      validationRules.required,
      validationRules.date,
      validationRules.futureDate
    ],
    category: [
      validationRules.required,
      validationRules.oneOf(['injection-molding', 'blow-molding', 'extrusion', 'thermoforming', 'other'])
    ]
  },

  // Quote request
  quoteRequest: {
    productName: [
      validationRules.required,
      validationRules.minLength(3, 'Product name must be at least 3 characters'),
      validationRules.maxLength(100, 'Product name must be less than 100 characters')
    ],
    quantity: [
      validationRules.required,
      validationRules.number,
      validationRules.min(1, 'Quantity must be at least 1')
    ],
    specifications: [
      validationRules.required,
      validationRules.minLength(20, 'Specifications must be at least 20 characters'),
      validationRules.maxLength(1000, 'Specifications must be less than 1000 characters')
    ],
    deliveryDate: [
      validationRules.required,
      validationRules.date,
      validationRules.futureDate
    ],
    deliveryLocation: [
      validationRules.required,
      validationRules.minLength(5, 'Delivery location must be at least 5 characters')
    ]
  },

  // Machine listing
  machineListing: {
    name: [
      validationRules.required,
      validationRules.minLength(3, 'Machine name must be at least 3 characters'),
      validationRules.maxLength(100, 'Machine name must be less than 100 characters')
    ],
    brand: [
      validationRules.required,
      validationRules.minLength(2, 'Brand must be at least 2 characters')
    ],
    model: [
      validationRules.required,
      validationRules.minLength(2, 'Model must be at least 2 characters')
    ],
    year: [
      validationRules.required,
      validationRules.number,
      validationRules.min(1990, 'Year must be 1990 or later'),
      validationRules.max(new Date().getFullYear(), 'Year cannot be in the future')
    ],
    price: [
      validationRules.required,
      validationRules.number,
      validationRules.min(10000, 'Price must be at least ₹10,000')
    ],
    condition: [
      validationRules.required,
      validationRules.oneOf(['new', 'excellent', 'good', 'fair', 'needs-repair'])
    ],
    location: [
      validationRules.required,
      validationRules.minLength(2, 'Location must be at least 2 characters')
    ],
    description: [
      validationRules.required,
      validationRules.minLength(50, 'Description must be at least 50 characters'),
      validationRules.maxLength(2000, 'Description must be less than 2000 characters')
    ]
  },

  // Material listing
  materialListing: {
    name: [
      validationRules.required,
      validationRules.minLength(3, 'Material name must be at least 3 characters'),
      validationRules.maxLength(100, 'Material name must be less than 100 characters')
    ],
    type: [
      validationRules.required,
      validationRules.oneOf(['thermoplastic', 'thermoset', 'elastomer', 'composite', 'additive'])
    ],
    grade: [
      validationRules.required,
      validationRules.minLength(2, 'Grade must be at least 2 characters')
    ],
    quantity: [
      validationRules.required,
      validationRules.number,
      validationRules.min(1, 'Quantity must be at least 1')
    ],
    unit: [
      validationRules.required,
      validationRules.oneOf(['kg', 'ton', 'bag', 'drum', 'pallet'])
    ],
    pricePerUnit: [
      validationRules.required,
      validationRules.number,
      validationRules.min(1, 'Price must be at least ₹1')
    ],
    location: [
      validationRules.required,
      validationRules.minLength(2, 'Location must be at least 2 characters')
    ],
    specifications: [
      validationRules.required,
      validationRules.minLength(20, 'Specifications must be at least 20 characters'),
      validationRules.maxLength(1000, 'Specifications must be less than 1000 characters')
    ]
  }
}

// Validation utility functions
export const validateField = (value, rules) => {
  if (!Array.isArray(rules)) {
    rules = [rules]
  }

  for (const rule of rules) {
    const error = rule(value)
    if (error) {
      return error
    }
  }
  
  return null
}

export const validateForm = (data, schema) => {
  const errors = {}
  let isValid = true

  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(data[field], rules)
    if (error) {
      errors[field] = error
      isValid = false
    }
  }

  return { isValid, errors }
}

// Real-time validation hook for React components
export const useFormValidation = (initialData, schema) => {
  const [data, setData] = useState(initialData)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validateField = useCallback((field, value) => {
    if (schema[field]) {
      const error = validateField(value, schema[field])
      setErrors(prev => ({
        ...prev,
        [field]: error
      }))
      return error
    }
    return null
  }, [schema])

  const handleChange = useCallback((field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }))

    // Validate if field has been touched
    if (touched[field]) {
      validateField(field, value)
    }
  }, [touched, validateField])

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))
    validateField(field, data[field])
  }, [data, validateField])

  const validateAll = useCallback(() => {
    const { isValid, errors: allErrors } = validateForm(data, schema)
    setErrors(allErrors)
    setTouched(Object.keys(schema).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {}))
    return isValid
  }, [data, schema])

  const reset = useCallback(() => {
    setData(initialData)
    setErrors({})
    setTouched({})
  }, [initialData])

  return {
    data,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0
  }
}

// Export validation utilities
export default {
  validationRules,
  validationSchemas,
  validateField,
  validateForm,
  useFormValidation
}