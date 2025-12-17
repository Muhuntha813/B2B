import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import useWebSocket from '../hooks/useWebSocket'
import { getApiBaseUrlDynamic, getWebSocketUrl } from '../config/api'

// Helper to create timeout signal (fallback for older browsers)
const createTimeoutSignal = (timeoutMs = 5000) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  // Cleanup timeout if signal is already aborted
  controller.signal.addEventListener('abort', () => clearTimeout(timeoutId))
  return controller.signal
}

const AdminContext = createContext()

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

export const AdminProvider = ({ children }) => {
  const [testimonials, setTestimonials] = useState([])
  const [banners, setBanners] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [machinery, setMachinery] = useState([])
  const [jobs, setJobs] = useState([])
  const [products, setProducts] = useState([])
  const [forumPosts, setForumPosts] = useState([])
  const [forumComments, setForumComments] = useState([])
  const [chatRequests, setChatRequests] = useState([])
  const [dbStats, setDbStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalMessages: 0,
    totalConversations: 0
  })
  const [loading, setLoading] = useState(false) // Start false so UI shows immediately

  // WebSocket setup for real-time updates
  const { on, off } = useWebSocket(getWebSocketUrl())

  // Load functions - memoized to prevent infinite loops (must be defined before useEffect)
  const loadTestimonials = useCallback(async () => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/testimonials`, {
        signal: createTimeoutSignal(5000)
      })
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data)
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error loading testimonials:', error)
      }
    }
  }, [])

  const loadBanners = useCallback(async () => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/banners`, {
        signal: createTimeoutSignal(5000)
      })
      if (response.ok) {
        const data = await response.json()
        setBanners(data)
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error loading banners:', error)
      }
    }
  }, [])

  const loadSponsors = useCallback(async () => {
    try {
      // Use admin endpoint to include inactive sponsors for management
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/admin/sponsors`, {
        signal: createTimeoutSignal(5000)
      })
      if (response.ok) {
        const data = await response.json()
        setSponsors(data)
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error loading sponsors:', error)
      }
    }
  }, [])

  const loadUsersAndStats = useCallback(async (search = '') => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      // Fetch users and stats in parallel with shorter timeout
      const usersUrl = search 
        ? `${API_BASE_URL}/admin/users?search=${encodeURIComponent(search)}`
        : `${API_BASE_URL}/admin/users`;
      const [usersResponse, statsResponse] = await Promise.allSettled([
        fetch(usersUrl, { signal: createTimeoutSignal(3000) }),
        fetch(`${API_BASE_URL}/admin/stats`, { signal: createTimeoutSignal(3000) })
      ])
      
      if (usersResponse.status === 'fulfilled' && usersResponse.value.ok) {
        const usersData = await usersResponse.value.json()
        setUsers(usersData || [])
      } else if (usersResponse.status === 'rejected') {
        console.warn('Users fetch failed:', usersResponse.reason)
      }

      if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
        const statsData = await statsResponse.value.json()
        setDbStats(statsData || {
          totalUsers: 0,
          totalJobs: 0,
          totalMessages: 0,
          totalConversations: 0
        })
      } else if (statsResponse.status === 'rejected') {
        console.warn('Stats fetch failed:', statsResponse.reason)
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error loading admin data:', error)
      }
    }
  }, [])

  const updateUser = useCallback(async (userId, updatedUser) => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });
      
      if (response.ok) {
        await loadUsersAndStats();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }, [loadUsersAndStats])

  const loadOrders = useCallback(async (page = 1, pageSize = 20) => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/admin/orders?page=${page}&pageSize=${pageSize}`, {
        signal: createTimeoutSignal(5000)
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error loading orders:', error)
      }
    }
  }, [])

  const loadMachinery = useCallback(async (search = '') => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const url = search 
        ? `${API_BASE_URL}/admin/machinery?search=${encodeURIComponent(search)}`
        : `${API_BASE_URL}/admin/machinery`;
      const response = await fetch(url, {
        signal: createTimeoutSignal(5000)
      });
      if (response.ok) {
        const data = await response.json();
        setMachinery(data);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error loading machinery:', error);
      }
    }
  }, [])

  const updateMachinery = useCallback(async (id, updatedMachinery) => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/admin/machinery/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMachinery),
      });
      
      if (response.ok) {
        await loadMachinery();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating machinery:', error);
      return false;
    }
  }, [loadMachinery])

  const loadJobs = useCallback(async (search = '') => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const url = search 
        ? `${API_BASE_URL}/admin/jobs?search=${encodeURIComponent(search)}`
        : `${API_BASE_URL}/admin/jobs`;
      const response = await fetch(url, {
        signal: createTimeoutSignal(5000)
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data || []);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error loading jobs:', error);
      }
    }
  }, [])

  const updateJob = useCallback(async (jobId, updatedJob) => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedJob),
      });
      
      if (response.ok) {
        await loadJobs();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating job:', error);
      return false;
    }
  }, [loadJobs])

  // Load all data on mount (non-blocking) - defined after all load functions
  useEffect(() => {
    // Start loading immediately without blocking
    setLoading(false) // Start with false so UI shows immediately
    
    // Verify all functions exist before calling
    if (!loadTestimonials || !loadBanners || !loadSponsors || !loadUsersAndStats || !loadMachinery || !loadJobs) {
      console.warn('AdminContext: Some load functions are not ready yet')
      return
    }
    
    // Load all data in parallel without blocking
    Promise.allSettled([
      loadTestimonials(),
      loadBanners(),
      loadSponsors(),
      loadUsersAndStats(),
      loadMachinery(),
      loadJobs()
    ]).catch(error => {
      console.error('Error loading admin data:', error)
    })
  }, [loadTestimonials, loadBanners, loadSponsors, loadUsersAndStats, loadMachinery, loadJobs])

  // Setup WebSocket event listeners for real-time updates
  useEffect(() => {
    if (!loadTestimonials || !loadBanners || !loadSponsors) return;
    
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
  }, [on, off, loadTestimonials, loadBanners, loadSponsors])

  // Refresh when the document becomes visible again
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Light revalidation of key lists
        loadTestimonials()
        loadBanners()
        loadSponsors()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [loadTestimonials, loadBanners, loadSponsors])

  // Testimonials functions
  const updateTestimonial = async (id, updatedTestimonial) => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
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
      const API_BASE_URL = getApiBaseUrlDynamic();
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
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        console.error('Delete testimonial failed:', errorData)
        return false
      }
      
      const result = await response.json()
      if (result.success) {
        setTestimonials(prev => prev.filter(item => item.id !== id))
        return true
      }
      console.error('Delete testimonial failed - no success flag:', result)
      return false
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      return false
    }
  }

  // Banners functions
  const updateBanner = async (id, updatedBanner) => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
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
      const API_BASE_URL = getApiBaseUrlDynamic();
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
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        console.error('Delete banner failed:', errorData)
        return false
      }
      
      const result = await response.json()
      if (result.success) {
        setBanners(prev => prev.filter(item => item.id !== id))
        return true
      }
      console.error('Delete banner failed - no success flag:', result)
      return false
    } catch (error) {
      console.error('Error deleting banner:', error)
      return false
    }
  }

  // Sponsors functions
  const updateSponsor = async (id, updatedSponsor) => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
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
      const API_BASE_URL = getApiBaseUrlDynamic();
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
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/sponsors/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        console.error('Delete sponsor failed:', errorData)
        return false
      }
      
      const result = await response.json()
      if (result.success) {
        setSponsors(prev => prev.filter(item => item.id !== id))
        return true
      }
      console.error('Delete sponsor failed - no success flag:', result)
      return false
    } catch (error) {
      console.error('Error deleting sponsor:', error)
      return false
    }
  }

  // User management functions
  const deleteUser = async (userId) => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        console.error('Delete user failed:', errorData)
        return false
      }
      
      const result = await response.json()
      if (result.success) {
        setUsers(prev => prev.filter(user => user.id !== userId))
        loadUsersAndStats() // Refresh stats
        return true
      }
      console.error('Delete user failed - no success flag:', result)
      return false
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  }

  const deleteMachinery = async (id) => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const machineryId = Number(id);
      if (isNaN(machineryId)) {
        throw new Error('Invalid machinery ID');
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/machinery/${machineryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        console.error('Delete machinery failed:', errorData)
        throw new Error(errorData.error || `Failed to delete machinery: ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success) {
        // Remove from state immediately
        setMachinery(prev => prev.filter(item => Number(item.id) !== machineryId));
        // Reload to ensure consistency
        await loadMachinery()
        return true;
      }
      throw new Error('Delete response did not indicate success')
    } catch (error) {
      console.error('Error deleting machinery:', error);
      throw error;
    }
  }

  const updateJobPriority = async (jobId, priority) => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}/priority`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priority })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        console.error('Update job priority failed:', errorData)
        return false
      }
      
      const result = await response.json()
      if (result.success) {
        await loadJobs() // Reload jobs to show updated priority
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating job priority:', error)
      return false
    }
  }

  const approveBoostRequest = async (jobId, approved) => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}/boost`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approved })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        console.error('Update boost status failed:', errorData)
        return false
      }
      
      const result = await response.json()
      if (result.success) {
        await loadJobs() // Reload jobs to show updated status
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating boost status:', error)
      return false
    }
  }

  const loadProducts = useCallback(async () => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        signal: createTimeoutSignal(10000)
      })
      if (!response.ok) {
        console.error('Failed to load products:', response.status, response.statusText)
        setProducts([])
        return
      }
      const data = await response.json()
      console.log('Loaded products:', data?.length || 0)
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error loading products:', error)
        setProducts([])
      }
    }
  }, [])

  const deleteProduct = async (id) => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const productId = Number(id);
      if (isNaN(productId)) {
        throw new Error('Invalid product ID');
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        console.error('Delete product failed:', errorData)
        throw new Error(errorData.error || `Failed to delete product: ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success) {
        // Remove from state immediately
        setProducts(prev => prev.filter(item => Number(item.id) !== productId));
        // Reload to ensure consistency
        await loadProducts()
        return true;
      }
      throw new Error('Delete response did not indicate success')
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  const deleteJob = async (id) => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        console.error('Delete job failed:', errorData)
        return false
      }
      
      const result = await response.json()
      if (result.success) {
        setJobs(prev => prev.filter(item => item.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting job:', error);
      return false;
    }
  }

  const loadForumPosts = useCallback(async () => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/admin/forum/posts`, {
        signal: createTimeoutSignal(10000)
      })
      if (!response.ok) {
        console.error('Failed to load forum posts:', response.status, response.statusText)
        setForumPosts([])
        return
      }
      const data = await response.json()
      console.log('Loaded forum posts:', data?.length || 0)
      setForumPosts(Array.isArray(data) ? data : [])
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error loading forum posts:', error)
        setForumPosts([])
      }
    }
  }, [])

  const deleteForumPost = async (id) => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const postId = Number(id);
      if (isNaN(postId)) {
        throw new Error('Invalid post ID');
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/forum/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        console.error('Delete forum post failed:', errorData)
        throw new Error(errorData.error || `Failed to delete post: ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success) {
        // Remove from state immediately
        setForumPosts(prev => prev.filter(item => Number(item.id) !== postId));
        // Reload to ensure consistency
        await loadForumPosts()
        return true;
      }
      throw new Error('Delete response did not indicate success')
    } catch (error) {
      console.error('Error deleting forum post:', error);
      throw error;
    }
  }

  const loadForumComments = useCallback(async () => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/admin/forum/comments`, {
        signal: createTimeoutSignal(10000)
      })
      if (!response.ok) {
        console.error('Failed to load forum comments:', response.status, response.statusText)
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error('Error response:', errorText)
        setForumComments([])
        return
      }
      const data = await response.json()
      console.log('Loaded forum comments:', data?.length || 0)
      setForumComments(Array.isArray(data) ? data : [])
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error loading forum comments:', error)
        setForumComments([])
      }
    }
  }, [])

  const deleteForumComment = async (id) => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const commentId = Number(id);
      if (isNaN(commentId)) {
        throw new Error('Invalid comment ID');
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/forum/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        console.error('Delete forum comment failed:', errorData)
        throw new Error(errorData.error || `Failed to delete comment: ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success) {
        // Remove from state immediately
        setForumComments(prev => prev.filter(item => Number(item.id) !== commentId));
        // Reload to ensure consistency
        await loadForumComments()
        return true;
      }
      throw new Error('Delete response did not indicate success')
    } catch (error) {
      console.error('Error deleting forum comment:', error);
      throw error;
    }
  }

  const loadChatRequests = useCallback(async (status = null) => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const url = status 
        ? `${API_BASE_URL}/admin/chat-requests?status=${status}`
        : `${API_BASE_URL}/admin/chat-requests`;
      const response = await fetch(url, {
        signal: createTimeoutSignal(5000)
      })
      if (response.ok) {
        const data = await response.json()
        setChatRequests(data || [])
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error loading chat requests:', error)
      }
    }
  }, [])

  const updateChatRequest = async (id, status, notes = null) => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic();
      const response = await fetch(`${API_BASE_URL}/admin/chat-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, notes })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        console.error('Update chat request failed:', errorData)
        return false
      }
      
      const result = await response.json()
      if (result.success) {
        await loadChatRequests()
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating chat request:', error)
      return false
    }
  }

  const value = {
    // Data
    testimonials,
    banners,
    sponsors,
    users,
    orders,
    machinery,
    jobs,
    products,
    forumPosts,
    forumComments,
    chatRequests,
    dbStats,
    loading,
    
    // Load functions
    loadTestimonials,
    loadBanners,
    loadSponsors,
    loadUsersAndStats,
    loadOrders,
    loadMachinery,
    loadJobs,
    loadProducts,
    loadForumPosts,
    loadForumComments,
    loadChatRequests,
    
    // Jobs functions
    updateJobPriority,
    approveBoostRequest,
    deleteJob,
    
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
    deleteUser,
    updateUser,
    
    // Machinery management
    deleteMachinery,
    updateMachinery,
    
    // Job management
    updateJob,
    
    // Products management
    deleteProduct,
    
    // Forum management
    deleteForumPost,
    deleteForumComment,
    
    // Chat requests management
    updateChatRequest
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}