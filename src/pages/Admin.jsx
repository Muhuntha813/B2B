import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUsers, FaChartBar, FaImage, FaStar, FaHandshake, FaWifi } from 'react-icons/fa'
import { useAdmin } from '../contexts/AdminContext'
import useWebSocket from '../hooks/useWebSocket'
import ImageUpload from '../components/ImageUpload'
import SafeImage from '../components/SafeImage'

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
    deleteUser, loadUsersAndStats
  } = useAdmin()

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
      loadUsersAndStats()
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

  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (editingItem.type === 'testimonials') {
        await updateTestimonial(editingItem.id, editingItem)
        showNotification('Testimonial updated successfully!')
      } else if (editingItem.type === 'banners') {
        await updateBanner(editingItem.id, editingItem)
        showNotification('Banner updated successfully!')
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
        if (type === 'testimonials') {
          await deleteTestimonial(id)
          showNotification('Testimonial deleted successfully!')
        } else if (type === 'banners') {
          await deleteBanner(id)
          showNotification('Banner deleted successfully!')
        } else if (type === 'sponsors') {
          await deleteSponsor(id)
          showNotification('Sponsor deleted successfully!')
        } else if (type === 'users') {
          await deleteUser(id)
          showNotification('User deleted successfully!')
        }
      } catch (error) {
        showNotification('Failed to delete item', 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleAdd = async (type) => {
    setLoading(true)
    try {
      if (type === 'testimonials') {
        const newTestimonial = {
          name: '',
          company: '',
          image: '',
          testimonial: '',
          rating: 5
        }
        const added = await addTestimonial(newTestimonial)
        setEditingItem({ ...added, type })
        showNotification('New testimonial created!')
      } else if (type === 'banners') {
        const newBanner = {
          title: '',
          image: '',
          active: true
        }
        const added = await addBanner(newBanner)
        setEditingItem({ ...added, type })
        showNotification('New banner created!')
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
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User Management</h2>
              <button
                onClick={loadUsersAndStats}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(user.id, 'users')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-8 text-gray-500">No users found</div>
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
      </div>
    </div>
  )
}

export default Admin