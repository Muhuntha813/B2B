import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUsers, FaChartBar, FaImage, FaStar, FaHandshake, FaWifi, FaCog, FaBriefcase, FaArrowUp } from 'react-icons/fa'
import { useAdmin } from '../contexts/AdminContext'
import useWebSocket from '../hooks/useWebSocket'
import ImageUpload from '../components/ImageUpload'
import SafeImage from '../components/SafeImage'
import { getApiBaseUrlDynamic } from '../config/api'

const Admin = () => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [editingItem, setEditingItem] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  const {
    testimonials, banners, sponsors, users, dbStats,
    updateTestimonial, addTestimonial, deleteTestimonial,
    updateBanner, addBanner, deleteBanner,
    updateSponsor, addSponsor, deleteSponsor,
    deleteUser, updateUser, loadUsersAndStats,
    loadTestimonials, loadBanners, loadSponsors,
    orders, loadOrders, machinery, loadMachinery, deleteMachinery, updateMachinery,
    jobs, loadJobs, updateJobPriority, approveBoostRequest, updateJob, deleteJob,
    products, loadProducts, deleteProduct,
    forumPosts, loadForumPosts, deleteForumPost,
    forumComments, loadForumComments, deleteForumComment,
    chatRequests, loadChatRequests, updateChatRequest
  } = useAdmin()

  const [searchTerms, setSearchTerms] = useState({
    machinery: '',
    users: '',
    jobs: ''
  })

  const { isConnected } = useWebSocket()

  // Notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Check if already authenticated on component mount
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuthenticated')
    if (adminAuth === 'true') {
      setIsAuthenticated(true)
      // Load data in background without blocking
      loadUsersAndStats().catch(err => console.warn('Background data load failed:', err))
    }
  }, [loadUsersAndStats])

  const handleLogin = (e) => {
    e.preventDefault()
    if (loginData.username === 'admin' && loginData.password === 'admin123') {
      setIsAuthenticated(true)
      localStorage.setItem('adminAuthenticated', 'true')
      setLoginError('')
      loadUsersAndStats()
    } else {
      setLoginError('Invalid credentials')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('adminAuthenticated')
    navigate('/')
  }

  // Revalidate data when switching tabs to keep lists fresh
  useEffect(() => {
    const revalidate = async () => {
      try {
        if (activeTab === 'banners') {
          await loadBanners()
        } else if (activeTab === 'testimonials') {
          await loadTestimonials()
        } else if (activeTab === 'sponsors') {
          await loadSponsors()
        } else if (activeTab === 'users') {
          await loadUsersAndStats(searchTerms.users)
        } else if (activeTab === 'orders') {
          await loadOrders()
        } else if (activeTab === 'machinery') {
          await loadMachinery(searchTerms.machinery)
        } else         if (activeTab === 'jobs') {
          await loadJobs(searchTerms.jobs)
        } else if (activeTab === 'products') {
          await loadProducts()
        } else if (activeTab === 'forum') {
          await loadForumPosts()
        } else if (activeTab === 'comments') {
          await loadForumComments()
        } else if (activeTab === 'chat-requests') {
          await loadChatRequests()
        }
      } catch (e) {
        // Non-blocking refresh
        console.warn('Tab revalidation failed:', e)
      }
    }
    revalidate()
  }, [activeTab, loadBanners, loadTestimonials, loadSponsors, loadUsersAndStats, loadOrders, loadMachinery, loadJobs, loadProducts, loadForumPosts, loadForumComments, loadChatRequests, searchTerms.jobs])

  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (editingItem.type === 'testimonials') {
        // Validation
        const name = (editingItem.name || '').trim()
        const company = (editingItem.company || '').trim()
        const image = (editingItem.image || '').trim()
        const testimonial = (editingItem.testimonial || '').trim()
        const rating = Number(editingItem.rating || 5)

        if (!name || !company || !image || !testimonial) {
          showNotification('Please fill name, company, image and testimonial', 'error')
          return
        }
        if (rating < 1 || rating > 5) {
          showNotification('Rating must be between 1 and 5', 'error')
          return
        }

        const payload = { name, company, image, testimonial, rating }
        if (editingItem.id) {
          await updateTestimonial(editingItem.id, payload)
          showNotification('Testimonial updated successfully!')
        } else {
          await addTestimonial(payload)
          showNotification('Testimonial created successfully!')
        }
        await loadTestimonials()
      } else if (editingItem.type === 'banners') {
        // Validation
        const title = (editingItem.title || '').trim()
        const image = (editingItem.image || '').trim()
        const active = editingItem.active !== undefined ? !!editingItem.active : true

        if (!title || !image) {
          showNotification('Please provide a banner title and image', 'error')
          return
        }

        const payload = { title, image, active }
        if (editingItem.id) {
          await updateBanner(editingItem.id, payload)
          showNotification('Banner updated successfully!')
        } else {
          await addBanner(payload)
          showNotification('Banner created successfully!')
        }
        await loadBanners()
      } else if (editingItem.type === 'sponsors') {
        // Basic validation
        const name = (editingItem.name || '').trim()
        const logo = (editingItem.logo || '').trim()
        const website = (editingItem.website || '').trim()
        const active = !!editingItem.active

        if (!name || !logo) {
          showNotification('Please provide a sponsor name and logo', 'error')
          return
        }

        const payload = { name, logo, website, active }
        if (editingItem.id) {
          await updateSponsor(editingItem.id, payload)
          showNotification('Sponsor updated successfully!')
        } else {
          await addSponsor(payload)
          showNotification('Sponsor created successfully!')
        }
      } else if (editingItem.type === 'users') {
        const email = (editingItem.email || '').trim()
        const display_name = (editingItem.display_name || '').trim()
        const role = editingItem.role || 'USER'

        if (!email) {
          showNotification('Email is required', 'error')
          return
        }

        const payload = { email, display_name, role }
        if (editingItem.id) {
          const success = await updateUser(editingItem.id, payload)
          if (success) {
            showNotification('User updated successfully!')
          } else {
            showNotification('Failed to update user', 'error')
          }
        }
      } else if (editingItem.type === 'machinery') {
        const name = (editingItem.name || '').trim()
        const category = (editingItem.category || '').trim()
        const price = Number(editingItem.price || 0)

        if (!name || !category || !price) {
          showNotification('Name, category, and price are required', 'error')
          return
        }

        const payload = {
          name, category, capacity: editingItem.capacity, price, unit: editingItem.unit || 'piece',
          image: editingItem.image, location: editingItem.location, supplier: editingItem.supplier,
          rating: Number(editingItem.rating || 0), in_stock: editingItem.in_stock !== undefined ? editingItem.in_stock : true,
          year: editingItem.year, condition: editingItem.condition, description: editingItem.description,
          specifications: editingItem.specifications, features: editingItem.features
        }
        
        if (editingItem.id) {
          const success = await updateMachinery(editingItem.id, payload)
          if (success) {
            showNotification('Machinery updated successfully!')
          } else {
            showNotification('Failed to update machinery', 'error')
          }
        }
      } else if (editingItem.type === 'jobs') {
        const title = (editingItem.title || '').trim()
        const category = (editingItem.category || '').trim()
        const budget = Number(editingItem.budget || 0)

        if (!title || !category || !budget) {
          showNotification('Title, category, and budget are required', 'error')
          return
        }

        const payload = {
          title, category, material: editingItem.material, quantity: Number(editingItem.quantity || 0),
          budget, location: editingItem.location, client: editingItem.client, deadline: editingItem.deadline,
          description: editingItem.description, requirements: editingItem.requirements,
          specifications: editingItem.specifications, estimated_duration: editingItem.estimated_duration,
          status: editingItem.status
        }
        
        if (editingItem.id) {
          const success = await updateJob(editingItem.id, payload)
          if (success) {
            showNotification('Job updated successfully!')
          } else {
            showNotification('Failed to update job', 'error')
          }
        }
      }
      setEditingItem(null)
    } catch (error) {
      showNotification('Failed to save changes', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, type) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setLoading(true)
      try {
        let success = false
        if (type === 'testimonials') {
          success = await deleteTestimonial(id)
        } else if (type === 'banners') {
          success = await deleteBanner(id)
        } else if (type === 'sponsors') {
          success = await deleteSponsor(id)
        } else if (type === 'users') {
          success = await deleteUser(id)
        } else if (type === 'machinery') {
          try {
            success = await deleteMachinery(id)
          } catch (error) {
            showNotification(`Failed to delete machinery: ${error.message}`, 'error')
            success = false
          }
        } else if (type === 'products') {
          try {
            success = await deleteProduct(id)
          } catch (error) {
            showNotification(`Failed to delete product: ${error.message}`, 'error')
            success = false
          }
        } else if (type === 'forum-posts') {
          try {
            success = await deleteForumPost(id)
          } catch (error) {
            showNotification(`Failed to delete forum post: ${error.message}`, 'error')
            success = false
          }
        } else if (type === 'forum-comments') {
          try {
            success = await deleteForumComment(id)
          } catch (error) {
            showNotification(`Failed to delete comment: ${error.message}`, 'error')
            success = false
          }
        } else if (type === 'jobs') {
          try {
            success = await deleteJob(id)
          } catch (error) {
            showNotification(`Failed to delete job: ${error.message}`, 'error')
            success = false
          }
        }
        
        if (success) {
          showNotification(`${type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')} deleted successfully!`)
        } else {
          showNotification(`Failed to delete ${type}. Please check console for details.`, 'error')
        }
      } catch (error) {
        console.error('Delete error:', error)
        showNotification(`Failed to delete item: ${error.message}`, 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleAdd = async (type) => {
    setLoading(true)
    try {
      if (type === 'testimonials') {
        // Create a client-side draft; persist only on Save
        const draft = {
          id: null,
          name: '',
          company: '',
          image: '',
          testimonial: '',
          rating: 5,
          type
        }
        setEditingItem(draft)
        showNotification('Enter testimonial details and click Save to create')
      } else if (type === 'banners') {
        // Create a client-side draft; persist only on Save
        const draft = {
          id: null,
          title: '',
          image: '',
          active: true,
          type
        }
        setEditingItem(draft)
        showNotification('Enter banner details and click Save to create')
      } else if (type === 'sponsors') {
        // Create a client-side draft; persist only on Save
        const draft = {
          id: null,
          name: '',
          logo: '',
          website: '',
          active: true,
          type
        }
        setEditingItem(draft)
        showNotification('Enter sponsor details and click Save to create')
      }
    } catch (error) {
      showNotification('Failed to create new item', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Username
              </label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            {loginError && (
              <p className="text-red-500 text-sm mb-4">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </form>
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>Demo credentials:</p>
            <p>Username: admin | Password: admin123</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="flex items-center gap-2">
                <FaWifi className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Processing...</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: FaChartBar },
              { id: 'users', label: 'Users', icon: FaUsers },
              { id: 'jobs', label: 'Jobs', icon: FaBriefcase },
              { id: 'products', label: 'Products', icon: FaCog },
              { id: 'machinery', label: 'Machinery', icon: FaCog },
              { id: 'forum', label: 'Forum Posts', icon: FaBriefcase },
              { id: 'comments', label: 'Comments', icon: FaStar },
              { id: 'chat-requests', label: 'Chat Requests', icon: FaUsers },
              { id: 'orders', label: 'Orders', icon: FaChartBar },
              { id: 'banners', label: 'Banners', icon: FaImage },
              { id: 'testimonials', label: 'Testimonials', icon: FaStar },
              { id: 'sponsors', label: 'Sponsors', icon: FaHandshake }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Database Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <FaUsers className="text-blue-500 text-2xl mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{dbStats.totalUsers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <FaChartBar className="text-green-500 text-2xl mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Jobs</p>
                    <p className="text-2xl font-bold">{dbStats.totalJobs}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <FaHandshake className="text-purple-500 text-2xl mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Conversations</p>
                    <p className="text-2xl font-bold">{dbStats.totalConversations}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <FaStar className="text-yellow-500 text-2xl mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Messages</p>
                    <p className="text-2xl font-bold">{dbStats.totalMessages}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Content Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{banners.length}</p>
                  <p className="text-sm text-gray-600">Active Banners</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{testimonials.length}</p>
                  <p className="text-sm text-gray-600">Testimonials</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{sponsors.length}</p>
                  <p className="text-sm text-gray-600">Sponsors</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Job Management</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search jobs by title, category..."
                  value={searchTerms.jobs}
                  onChange={(e) => {
                    setSearchTerms({ ...searchTerms, jobs: e.target.value })
                    loadJobs(e.target.value)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => loadJobs(searchTerms.jobs)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>

            {jobs.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No jobs found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Boost Requests Section */}
                {jobs.filter(job => job.boost_requested && !job.boost_approved).length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                      Boost Requests Pending ({jobs.filter(job => job.boost_requested && !job.boost_approved).length})
                    </h3>
                    <div className="space-y-2">
                      {jobs.filter(job => job.boost_requested && !job.boost_approved).map((job) => (
                        <div key={job.id} className="bg-white rounded p-3 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{job.title}</p>
                            <p className="text-sm text-gray-500">Requested: {new Date(job.boost_requested_at).toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                setLoading(true)
                                const success = await approveBoostRequest(job.id, true)
                                if (success) {
                                  showNotification('Boost approved! Job priority set to high.', 'success')
                                } else {
                                  showNotification('Failed to approve boost', 'error')
                                }
                                setLoading(false)
                              }}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                              disabled={loading}
                            >
                              Approve
                            </button>
                            <button
                              onClick={async () => {
                                setLoading(true)
                                const success = await approveBoostRequest(job.id, false)
                                if (success) {
                                  showNotification('Boost request rejected', 'success')
                                } else {
                                  showNotification('Failed to reject boost', 'error')
                                }
                                setLoading(false)
                              }}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                              disabled={loading}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Jobs Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Boost</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {jobs.map((job) => (
                          <tr key={job.id}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{job.title}</div>
                              <div className="text-sm text-gray-500">{job.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {job.client || job.user_name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{Number(job.budget).toLocaleString('en-IN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                job.status === 'active' || job.status === 'Open' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {job.status || 'Open'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={job.priority || 'normal'}
                                onChange={async (e) => {
                                  setLoading(true)
                                  const success = await updateJobPriority(job.id, e.target.value)
                                  if (success) {
                                    showNotification(`Job priority set to ${e.target.value}`, 'success')
                                  } else {
                                    showNotification('Failed to update priority', 'error')
                                  }
                                  setLoading(false)
                                }}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                                disabled={loading}
                              >
                                <option value="high">High</option>
                                <option value="normal">Normal</option>
                                <option value="low">Low</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {job.boost_requested && !job.boost_approved ? (
                                <span className="text-yellow-600 font-medium">Pending</span>
                              ) : job.boost_approved ? (
                                <span className="text-green-600 font-medium">Approved</span>
                              ) : (
                                <span className="text-gray-400">None</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={async () => {
                                    if (window.confirm('Are you sure you want to delete this job?')) {
                                      setLoading(true)
                                      const success = await deleteJob(job.id)
                                      if (success) {
                                        showNotification('Job deleted successfully', 'success')
                                        await loadJobs(searchTerms.jobs)
                                      } else {
                                        showNotification('Failed to delete job', 'error')
                                      }
                                      setLoading(false)
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                  disabled={loading}
                                  title="Delete Job"
                                >
                                  <FaTrash />
                                </button>
                                <button
                                  onClick={() => handleEdit(job, 'jobs')}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <FaEdit />
                                </button>
                                <a
                                  href={`/job/${job.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  View
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User Management</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search users by name, email..."
                  value={searchTerms.users}
                  onChange={(e) => {
                    setSearchTerms({ ...searchTerms, users: e.target.value })
                    loadUsersAndStats(e.target.value)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => loadUsersAndStats(searchTerms.users)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.display_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                        {user.role === 'ADMIN' && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
                            ADMIN
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className={`inline-block px-2 py-0.5 rounded ${user.can_chat ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            Chat: {user.can_chat ? '✓' : '✗'}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded ${user.can_buy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            Buy: {user.can_buy ? '✓' : '✗'}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded ${user.can_sell ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            Sell: {user.can_sell ? '✓' : '✗'}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded ${user.is_seller_approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            Seller: {user.is_seller_approved ? '✓' : '✗'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(user, 'users')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, 'users')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-8 text-gray-500">No users found</div>
              )}
            </div>
            
            {/* Edit User Form */}
            {editingItem && editingItem.type === 'users' && editingItem.id && (
              <div className="bg-white border rounded-lg p-6 mt-4">
                <h3 className="text-lg font-semibold mb-4">Edit User</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editingItem.email || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={editingItem.display_name || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, display_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={editingItem.role || 'USER'}
                      onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  
                  {/* Permissions Section */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-md font-semibold mb-3">User Permissions</h4>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingItem.can_chat === true}
                          onChange={(e) => setEditingItem({ ...editingItem, can_chat: e.target.checked })}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Can Chat</span>
                        <span className="text-xs text-gray-500">(Allow user to send/receive messages)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingItem.can_buy === true}
                          onChange={(e) => setEditingItem({ ...editingItem, can_buy: e.target.checked })}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Can Buy</span>
                        <span className="text-xs text-gray-500">(Allow user to purchase products/machinery)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingItem.can_sell === true}
                          onChange={(e) => setEditingItem({ ...editingItem, can_sell: e.target.checked })}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Can Sell</span>
                        <span className="text-xs text-gray-500">(Allow user to list items for sale)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingItem.is_seller_approved === true}
                          onChange={(e) => setEditingItem({ ...editingItem, is_seller_approved: e.target.checked })}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Seller Approved</span>
                        <span className="text-xs text-gray-500">(Approve user as a seller - required for selling)</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Machinery Tab */}
        {activeTab === 'machinery' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Machinery Management</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search machinery by name, category..."
                  value={searchTerms.machinery}
                  onChange={(e) => {
                    setSearchTerms({ ...searchTerms, machinery: e.target.value })
                    loadMachinery(e.target.value)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const API_BASE_URL = getApiBaseUrlDynamic();
                      const response = await fetch(`${API_BASE_URL}/admin/seed/machinery`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        }
                      });
                      
                      if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(errorText || `HTTP ${response.status}`);
                      }
                      
                      const result = await response.json();
                      if (result.success) {
                        showNotification(`Seed complete: ${result.inserted} inserted, ${result.skipped} skipped`);
                        await loadMachinery();
                      } else {
                        showNotification(result.error || 'Failed to seed machinery', 'error');
                      }
                    } catch (error) {
                      console.error('Seed machinery error:', error);
                      showNotification(`Error seeding machinery: ${error.message}`, 'error');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Seed Machinery
                </button>
                <button
                  onClick={loadMachinery}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>

            {machinery.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 mb-4">No machinery found in database</p>
                <p className="text-sm text-gray-400 mb-4">
                  Click "Seed Machinery" to import machinery data from the frontend data file
                </p>
              </div>
            ) : (
              // Group machinery by category
              (() => {
                const groupedMachinery = machinery.reduce((acc, item) => {
                  const category = item.category || 'Uncategorized';
                  if (!acc[category]) {
                    acc[category] = [];
                  }
                  acc[category].push(item);
                  return acc;
                }, {});

                return Object.entries(groupedMachinery).map(([category, items]) => (
                  <div key={category} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {category} ({items.length})
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {items.map((machine) => (
                            <tr key={machine.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {machine.image && (
                                    <img 
                                      src={machine.image} 
                                      alt={machine.name}
                                      className="w-12 h-12 object-cover rounded mr-3"
                                      onError={(e) => {
                                        e.target.src = '/placeholder-banner.svg';
                                      }}
                                    />
                                  )}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{machine.name}</div>
                                    {machine.capacity && (
                                      <div className="text-sm text-gray-500">Capacity: {machine.capacity}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₹{Number(machine.price).toLocaleString('en-IN')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {machine.location || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {machine.supplier || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  machine.is_approved 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {machine.is_approved ? 'Approved' : 'Pending'}
                                </span>
                                {!machine.is_approved && (
                                  <button
                                    onClick={async () => {
                                      setLoading(true);
                                      try {
                                        const success = await updateMachinery(machine.id, { ...machine, is_approved: true });
                                        if (success) {
                                          showNotification('Machinery approved successfully', 'success');
                                          await loadMachinery(searchTerms.machinery);
                                        } else {
                                          showNotification('Failed to approve machinery', 'error');
                                        }
                                      } catch (error) {
                                        showNotification('Error approving machinery', 'error');
                                      } finally {
                                        setLoading(false);
                                      }
                                    }}
                                    className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                                    disabled={loading}
                                  >
                                    Approve
                                  </button>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  machine.in_stock 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {machine.in_stock ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {machine.created_at ? new Date(machine.created_at).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEdit(machine, 'machinery')}
                                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                  >
                                    <FaEdit />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(machine.id, 'machinery')}
                                    className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                  >
                                    <FaTrash />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ));
              })()
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Orders</h2>
              <button
                onClick={() => loadOrders()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.user_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{Number(order.total).toFixed(0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="text-center py-8 text-gray-500">No orders found</div>
              )}
            </div>
          </div>
        )}

        {/* Banners Tab */}
        {activeTab === 'banners' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Banner Management</h2>
              <button
                onClick={() => handleAdd('banners')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FaPlus /> Add Banner
              </button>
            </div>
            {/* New Banner Draft Form */}
            {editingItem && editingItem.type === 'banners' && editingItem.id === null && (
              <div className="bg-white border rounded-lg p-4">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="Banner Title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Image
                    </label>
                    <ImageUpload
                      value={editingItem.image}
                      onChange={(imageUrl) => setEditingItem({ ...editingItem, image: imageUrl })}
                      placeholder="Upload banner image"
                      accept="image/*"
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingItem.active}
                      onChange={(e) => setEditingItem({ ...editingItem, active: e.target.checked })}
                    />
                    Active
                  </label>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSave} 
                      disabled={loading}
                      className={`px-3 py-1 rounded flex items-center gap-1 text-white ${
                        loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave /> Save
                        </>
                      )}
                    </button>
                    <button onClick={() => setEditingItem(null)} className="bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-1">
                      <FaTimes /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {banners.map((banner) => (
                <div key={banner.id} className="bg-white border rounded-lg p-4">
                  {editingItem && editingItem.id === banner.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        placeholder="Banner Title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Banner Image
                        </label>
                        <ImageUpload
                          value={editingItem.image}
                          onChange={(imageUrl) => setEditingItem({ ...editingItem, image: imageUrl })}
                          placeholder="Upload banner image"
                          accept="image/*"
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingItem.active}
                          onChange={(e) => setEditingItem({ ...editingItem, active: e.target.checked })}
                        />
                        Active
                      </label>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleSave} 
                          disabled={loading}
                          className={`px-3 py-1 rounded flex items-center gap-1 text-white ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave /> Save
                            </>
                          )}
                        </button>
                        <button onClick={() => setEditingItem(null)} className="bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-1">
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={banner.image} alt={banner.title} className="w-20 h-12 object-cover rounded" />
                        <div>
                          <h3 className="font-semibold">{banner.title}</h3>
                          <p className="text-sm text-gray-500">Status: {banner.active ? 'Active' : 'Inactive'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(banner, 'banners')} className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1">
                          <FaEdit /> Edit
                        </button>
                        <button onClick={() => handleDelete(banner.id, 'banners')} className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1">
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Testimonial Management</h2>
              <button
                onClick={() => handleAdd('testimonials')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FaPlus /> Add Testimonial
              </button>
            </div>
            {/* New Testimonial Draft Form */}
            {editingItem && editingItem.type === 'testimonials' && editingItem.id === null && (
              <div className="bg-white border rounded-lg p-4">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={editingItem.company}
                    onChange={(e) => setEditingItem({ ...editingItem, company: e.target.value })}
                    placeholder="Company"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Image
                    </label>
                    <ImageUpload
                      value={editingItem.image}
                      onChange={(imageUrl) => setEditingItem({ ...editingItem, image: imageUrl })}
                      placeholder="Upload profile image"
                      accept="image/*"
                    />
                  </div>
                  <textarea
                    value={editingItem.testimonial}
                    onChange={(e) => setEditingItem({ ...editingItem, testimonial: e.target.value })}
                    placeholder="Testimonial"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={editingItem.rating}
                    onChange={(e) => setEditingItem({ ...editingItem, rating: parseInt(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {[1, 2, 3, 4, 5].map(rating => (
                      <option key={rating} value={rating}>{rating} Star{rating !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSave} 
                      disabled={loading}
                      className={`px-3 py-1 rounded flex items-center gap-1 text-white ${
                        loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave /> Save
                        </>
                      )}
                    </button>
                    <button onClick={() => setEditingItem(null)} className="bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-1">
                      <FaTimes /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white border rounded-lg p-4">
                  {editingItem && editingItem.id === testimonial.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        placeholder="Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={editingItem.company}
                        onChange={(e) => setEditingItem({ ...editingItem, company: e.target.value })}
                        placeholder="Company"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile Image
                        </label>
                        <ImageUpload
                          value={editingItem.image}
                          onChange={(imageUrl) => setEditingItem({ ...editingItem, image: imageUrl })}
                          placeholder="Upload profile image"
                          accept="image/*"
                        />
                      </div>
                      <textarea
                        value={editingItem.testimonial}
                        onChange={(e) => setEditingItem({ ...editingItem, testimonial: e.target.value })}
                        placeholder="Testimonial"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <select
                        value={editingItem.rating}
                        onChange={(e) => setEditingItem({ ...editingItem, rating: parseInt(e.target.value) })}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {[1, 2, 3, 4, 5].map(rating => (
                          <option key={rating} value={rating}>{rating} Star{rating !== 1 ? 's' : ''}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleSave} 
                          disabled={loading}
                          className={`px-3 py-1 rounded flex items-center gap-1 text-white ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave /> Save
                            </>
                          )}
                        </button>
                        <button onClick={() => setEditingItem(null)} className="bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-1">
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full object-cover" />
                        <div>
                          <h3 className="font-semibold">{testimonial.name}</h3>
                          <p className="text-sm text-gray-600">{testimonial.company}</p>
                          <p className="text-sm mt-2">"{testimonial.testimonial}"</p>
                          <div className="flex mt-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(testimonial, 'testimonials')} className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1">
                          <FaEdit /> Edit
                        </button>
                        <button onClick={() => handleDelete(testimonial.id, 'testimonials')} className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1">
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sponsors Tab */}
        {activeTab === 'sponsors' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Sponsor Management</h2>
              <button
                onClick={() => handleAdd('sponsors')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FaPlus /> Add Sponsor
              </button>
            </div>
            {/* New Sponsor Draft Form */}
            {editingItem && editingItem.type === 'sponsors' && editingItem.id === null && (
              <div className="bg-white border rounded-lg p-4">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="Sponsor Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Logo
                    </label>
                    <ImageUpload
                      value={editingItem.logo}
                      onChange={(logoUrl) => setEditingItem({ ...editingItem, logo: logoUrl })}
                      placeholder="Upload company logo"
                      accept="image/*"
                    />
                  </div>
                  <input
                    type="url"
                    value={editingItem.website}
                    onChange={(e) => setEditingItem({ ...editingItem, website: e.target.value })}
                    placeholder="Website URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingItem.active}
                      onChange={(e) => setEditingItem({ ...editingItem, active: e.target.checked })}
                    />
                    Active
                  </label>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSave} 
                      disabled={loading}
                      className={`px-3 py-1 rounded flex items-center gap-1 text-white ${
                        loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave /> Save
                        </>
                      )}
                    </button>
                    <button onClick={() => setEditingItem(null)} className="bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-1">
                      <FaTimes /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {sponsors.map((sponsor) => (
                <div key={sponsor.id} className="bg-white border rounded-lg p-4">
                  {editingItem && editingItem.id === sponsor.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        placeholder="Sponsor Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Logo
                        </label>
                        <ImageUpload
                          value={editingItem.logo}
                          onChange={(logoUrl) => setEditingItem({ ...editingItem, logo: logoUrl })}
                          placeholder="Upload company logo"
                          accept="image/*"
                        />
                      </div>
                      <input
                        type="url"
                        value={editingItem.website}
                        onChange={(e) => setEditingItem({ ...editingItem, website: e.target.value })}
                        placeholder="Website URL"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingItem.active}
                          onChange={(e) => setEditingItem({ ...editingItem, active: e.target.checked })}
                        />
                        Active
                      </label>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleSave} 
                          disabled={loading}
                          className={`px-3 py-1 rounded flex items-center gap-1 text-white ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave /> Save
                            </>
                          )}
                        </button>
                        <button onClick={() => setEditingItem(null)} className="bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-1">
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <SafeImage 
                          src={sponsor.logo}
                          alt={sponsor.name}
                          fallbackSrc={'/placeholder-banner.svg'}
                          className="w-20 h-12 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-semibold">{sponsor.name}</h3>
                          <p className="text-sm text-gray-500">Website: {sponsor.website}</p>
                          <p className="text-sm text-gray-500">Status: {sponsor.active ? 'Active' : 'Inactive'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(sponsor, 'sponsors')} className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1">
                          <FaEdit /> Edit
                        </button>
                        <button onClick={() => handleDelete(sponsor.id, 'sponsors')} className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1">
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Products Management</h2>
              <button
                onClick={loadProducts}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>

            {loading && products.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 mb-2">No products found</p>
                <p className="text-sm text-gray-400 mb-4">Click Refresh to load products from the database</p>
                <button
                  onClick={async () => {
                    setLoading(true)
                    try {
                      await loadProducts()
                    } finally {
                      setLoading(false)
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Load Products
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {product.image && (
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded mr-3"
                                onError={(e) => {
                                  e.target.src = '/placeholder-banner.svg';
                                }}
                              />
                            )}
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.is_approved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {product.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(product.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDelete(product.id, 'products')}
                            className="text-red-600 hover:text-red-900"
                            disabled={loading}
                            title="Delete Product"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Forum Posts Tab */}
        {activeTab === 'forum' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Forum Posts Management</h2>
              <button
                onClick={loadForumPosts}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>

            {loading && forumPosts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading forum posts...</p>
              </div>
            ) : forumPosts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 mb-2">No forum posts found</p>
                <p className="text-sm text-gray-400 mb-4">Click Refresh to load posts from the database</p>
                <button
                  onClick={async () => {
                    setLoading(true)
                    try {
                      await loadForumPosts()
                    } finally {
                      setLoading(false)
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Load Posts
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {forumPosts.map((post) => (
                      <tr key={post.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{post.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{post.display_name || post.email || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{post.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-md truncate">{post.content}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.comment_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDelete(post.id, 'forum-posts')}
                            className="text-red-600 hover:text-red-900"
                            disabled={loading}
                            title="Delete Post"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Forum Comments Tab */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Forum Comments Management</h2>
              <button
                onClick={async () => {
                  setLoading(true)
                  try {
                    await loadForumComments()
                    showNotification('Comments refreshed', 'success')
                  } catch (error) {
                    showNotification('Failed to load comments', 'error')
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {loading && forumComments.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading comments...</p>
              </div>
            ) : forumComments.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 mb-2">No forum comments found</p>
                <p className="text-sm text-gray-400 mb-4">Click Refresh to load comments from the database</p>
                <button
                  onClick={async () => {
                    setLoading(true)
                    try {
                      await loadForumComments()
                    } finally {
                      setLoading(false)
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Load Comments
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Post</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {forumComments.map((comment) => (
                      <tr key={comment.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-md truncate">{comment.content}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{comment.display_name || comment.email || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{comment.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{comment.post_title || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDelete(comment.id, 'forum-comments')}
                            className="text-red-600 hover:text-red-900"
                            disabled={loading}
                            title="Delete Comment"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Chat Requests Tab */}
        {activeTab === 'chat-requests' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Chat Requests</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => loadChatRequests('pending')}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Pending Only
                </button>
                <button
                  onClick={() => loadChatRequests()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>

            {chatRequests.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No chat requests found</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {chatRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{request.user_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{request.user_email || request.user_uid}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.job_title || 'N/A'}</div>
                          {request.job_client && (
                            <div className="text-sm text-gray-500">Client: {request.job_client}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{request.reason || 'No reason provided'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            request.status === 'approved' 
                              ? 'bg-green-100 text-green-800'
                              : request.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.requested_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {request.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  if (window.confirm('Approve this chat request?')) {
                                    setLoading(true)
                                    const success = await updateChatRequest(request.id, 'approved')
                                    if (success) {
                                      showNotification('Chat request approved', 'success')
                                      await loadChatRequests()
                                    } else {
                                      showNotification('Failed to approve request', 'error')
                                    }
                                    setLoading(false)
                                  }
                                }}
                                className="text-green-600 hover:text-green-900"
                                disabled={loading}
                              >
                                Approve
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('Reject this chat request?')) {
                                    setLoading(true)
                                    const success = await updateChatRequest(request.id, 'rejected')
                                    if (success) {
                                      showNotification('Chat request rejected', 'success')
                                      await loadChatRequests()
                                    } else {
                                      showNotification('Failed to reject request', 'error')
                                    }
                                    setLoading(false)
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                                disabled={loading}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">
                              {request.reviewed_at ? `Reviewed ${new Date(request.reviewed_at).toLocaleDateString()}` : 'N/A'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin