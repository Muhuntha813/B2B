import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { FaUser, FaCog, FaHistory, FaHeart, FaComments, FaBell, FaSignOutAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa'
import LoadingSpinner from '../components/LoadingSpinner'
import Avatar from '../components/Avatar'

const Account = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    bio: ''
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [savedItems, setSavedItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setUserProfile({
        displayName: user.displayName || '',
        email: user.email || '',
        phone: '',
        company: '',
        location: '',
        bio: ''
      })
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      // Load user's recent activity from localStorage for now
      const activity = JSON.parse(localStorage.getItem(`activity_${user.uid}`)) || []
      const saved = JSON.parse(localStorage.getItem(`saved_${user.uid}`)) || []
      
      setRecentActivity(activity.slice(0, 10)) // Last 10 activities
      setSavedItems(saved)
      setLoading(false)
    } catch (error) {
      console.error('Error loading user data:', error)
      setLoading(false)
    }
  }

  const handleSaveProfile = () => {
    // Save profile data to localStorage (in production, this would be saved to Firebase)
    localStorage.setItem(`profile_${user.uid}`, JSON.stringify(userProfile))
    setIsEditing(false)
    
    // Show success message
    alert('Profile updated successfully!')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'activity', label: 'Recent Activity', icon: FaHistory },
    { id: 'saved', label: 'Saved Items', icon: FaHeart },
    { id: 'messages', label: 'Messages', icon: FaComments },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner variant="bounce" text="Loading your account..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Avatar
              src={user?.photoURL}
              alt="Profile"
              size="2xl"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.displayName || 'User'}
              </h1>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(user?.metadata?.creationTime).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaSignOutAlt />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FaEdit />
                        <span>Edit Profile</span>
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveProfile}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FaSave />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <FaTimes />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={userProfile.displayName}
                          onChange={(e) => setUserProfile({...userProfile, displayName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{userProfile.displayName || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <p className="text-gray-900">{userProfile.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={userProfile.phone}
                          onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{userProfile.phone || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={userProfile.company}
                          onChange={(e) => setUserProfile({...userProfile, company: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{userProfile.company || 'Not set'}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={userProfile.location}
                          onChange={(e) => setUserProfile({...userProfile, location: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{userProfile.location || 'Not set'}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      {isEditing ? (
                        <textarea
                          value={userProfile.bio}
                          onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <p className="text-gray-900">{userProfile.bio || 'No bio added yet'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activity Tab */}
              {activeTab === 'activity' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-500">{activity.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaHistory className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No recent activity</p>
                    </div>
                  )}
                </div>
              )}

              {/* Saved Items Tab */}
              {activeTab === 'saved' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Saved Items</h2>
                  {savedItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedItems.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{item.type}</p>
                          <p className="text-xs text-gray-400 mt-2">Saved on {item.savedAt}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaHeart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No saved items yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Messages Tab */}
              {activeTab === 'messages' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Messages</h2>
                  <div className="text-center py-8">
                    <FaComments className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Chat system will be implemented next</p>
                    <p className="text-sm text-gray-400">You'll be able to see all your conversations here</p>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                          <span className="ml-2 text-gray-700">Email notifications for new messages</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                          <span className="ml-2 text-gray-700">Push notifications for important updates</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="ml-2 text-gray-700">Weekly newsletter</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                          <span className="ml-2 text-gray-700">Make profile visible to other users</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                          <span className="ml-2 text-gray-700">Allow direct messages from other users</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account