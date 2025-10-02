import React, { createContext, useContext, useState, useEffect } from 'react'
import useWebSocket from '../hooks/useWebSocket'

const AdminContext = createContext()

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

const API_BASE_URL = 'http://localhost:3001/api'

export const AdminProvider = ({ children }) => {
  const [testimonials, setTestimonials] = useState([])
  const [banners, setBanners] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [users, setUsers] = useState([])
  const [dbStats, setDbStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalMessages: 0,
    totalConversations: 0
  })
  const [loading, setLoading] = useState(true)

  // WebSocket setup for real-time updates
  const { on, off } = useWebSocket('http://localhost:3001')

  // Load all data on mount
  useEffect(() => {
    loadAllData()
  }, [])

  // Ensure sponsors load independently
  useEffect(() => {
    loadSponsors()
  }, [])

  // Setup WebSocket event listeners for real-time updates
  useEffect(() => {
    const handleTestimonialsUpdate = () => {
      console.log('Testimonials updated - refreshing data')
      loadTestimonials()
    }

    const handleBannersUpdate = () => {
      console.log('Banners updated - refreshing data')
      loadBanners()
    }

    const handleSponsorsUpdate = () => {
      console.log('Sponsors updated - refreshing data')
      loadSponsors()
    }

    // Listen for real-time updates
    on('testimonials_updated', handleTestimonialsUpdate)
    on('banners_updated', handleBannersUpdate)
    on('sponsors_updated', handleSponsorsUpdate)

    // Cleanup listeners on unmount
    return () => {
      off('testimonials_updated', handleTestimonialsUpdate)
      off('banners_updated', handleBannersUpdate)
      off('sponsors_updated', handleSponsorsUpdate)
    }
  }, [on, off])

  const loadAllData = async () => {
    setLoading(true)
    try {
      // Load core data that should always work
      await Promise.allSettled([
        loadTestimonials(),
        loadBanners(),
        loadSponsors()
      ])
      
      // Load admin data separately to prevent it from blocking other functionality
      try {
        await loadUsersAndStats()
      } catch (adminError) {
        console.warn('Admin data loading failed, but continuing with other functionality:', adminError)
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load functions
  const loadTestimonials = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials`)
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data)
      }
    } catch (error) {
      console.error('Error loading testimonials:', error)
    }
  }

  const loadBanners = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/banners`)
      if (response.ok) {
        const data = await response.json()
        setBanners(data)
      }
    } catch (error) {
      console.error('Error loading banners:', error)
    }
  }

  const loadSponsors = async () => {
    try {
      // Use admin endpoint to include inactive sponsors for management
      const response = await fetch(`${API_BASE_URL}/admin/sponsors`)
      if (response.ok) {
        const data = await response.json()
        setSponsors(data)
      }
    } catch (error) {
      console.error('Error loading sponsors:', error)
    }
  }

  const loadUsersAndStats = async () => {
    try {
      // Fetch users from backend
      const usersResponse = await fetch(`${API_BASE_URL}/admin/users`)
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }

      // Fetch database statistics
      const statsResponse = await fetch(`${API_BASE_URL}/admin/stats`)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setDbStats(statsData)
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    }
  }

  // Testimonials functions
  const updateTestimonial = async (id, updatedTestimonial) => {
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTestimonial),
      })
      
      if (response.ok) {
        // Reload testimonials data from server to ensure consistency
        await loadTestimonials()
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating testimonial:', error)
      return false
    }
  }

  const addTestimonial = async (testimonial) => {
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonial),
      })
      
      if (response.ok) {
        const result = await response.json()
        const newTestimonial = { ...testimonial, id: result.id }
        setTestimonials(prev => [...prev, newTestimonial])
        return newTestimonial
      }
      return null
    } catch (error) {
      console.error('Error adding testimonial:', error)
      return null
    }
  }

  const deleteTestimonial = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setTestimonials(prev => prev.filter(item => item.id !== id))
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      return false
    }
  }

  // Banners functions
  const updateBanner = async (id, updatedBanner) => {
    try {
      const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBanner),
      })
      
      if (response.ok) {
        // Reload banners data from server to ensure consistency
        await loadBanners()
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating banner:', error)
      return false
    }
  }

  const addBanner = async (banner) => {
    try {
      const response = await fetch(`${API_BASE_URL}/banners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(banner),
      })
      
      if (response.ok) {
        const result = await response.json()
        const newBanner = { ...banner, id: result.id }
        setBanners(prev => [...prev, newBanner])
        return newBanner
      }
      return null
    } catch (error) {
      console.error('Error adding banner:', error)
      return null
    }
  }

  const deleteBanner = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setBanners(prev => prev.filter(item => item.id !== id))
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting banner:', error)
      return false
    }
  }

  // Sponsors functions
  const updateSponsor = async (id, updatedSponsor) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sponsors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSponsor),
      })
      
      if (response.ok) {
        // Reload sponsors data from server to ensure consistency
        await loadSponsors()
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating sponsor:', error)
      return false
    }
  }

  const addSponsor = async (sponsor) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sponsors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sponsor),
      })
      
      if (response.ok) {
        const result = await response.json()
        const newSponsor = { ...sponsor, id: result.id }
        setSponsors(prev => [...prev, newSponsor])
        return newSponsor
      }
      return null
    } catch (error) {
      console.error('Error adding sponsor:', error)
      return null
    }
  }

  const deleteSponsor = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sponsors/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setSponsors(prev => prev.filter(item => item.id !== id))
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting sponsor:', error)
      return false
    }
  }

  // User management functions
  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setUsers(prev => prev.filter(user => user.id !== userId))
        loadUsersAndStats() // Refresh stats
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  }

  const value = {
    // Data
    testimonials,
    banners,
    sponsors,
    users,
    dbStats,
    loading,
    
    // Load functions
    loadAllData,
    loadTestimonials,
    loadBanners,
    loadSponsors,
    loadUsersAndStats,
    
    // Testimonials functions
    updateTestimonial,
    addTestimonial,
    deleteTestimonial,
    
    // Banners functions
    updateBanner,
    addBanner,
    deleteBanner,
    
    // Sponsors functions
    updateSponsor,
    addSponsor,
    deleteSponsor,
    
    // User management
    deleteUser
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}