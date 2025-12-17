import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import SearchBar from '../components/SearchBar'
import LoadingSpinner from '../components/LoadingSpinner'
import useIndustryNews from '../hooks/useIndustryNews'
import { useAuth } from '../contexts/AuthContext'
import { useAdmin } from '../contexts/AdminContext'
import WhereYouLeftOff from '../components/WhereYouLeftOff'
import AdBannerCarousel from '../components/AdBannerCarousel'
import SafeImage from '../components/SafeImage'
import { getApiBaseUrlDynamic } from '../config/api'

const Home = () => {
  const { currentUser, token } = useAuth()
  const { testimonials, banners, sponsors, loadTestimonials, loadBanners, loadSponsors } = useAdmin()
  const { news: newsItems, loading: newsLoading, error: newsError } = useIndustryNews()
  const services = [
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Manpower',
      description: 'Find skilled professionals for your plastics business',
      link: '/jobs'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      ),
      title: 'Machineries',
      description: 'Discover wide range of machinery for plastics manufacturing',
      link: '/machinery'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
      title: 'Material',
      description: 'Source high-quality materials for your production needs',
      link: '/materials'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      title: 'Mould Design and Makers',
      description: 'Connect with experts in mould design and manufacturing',
      link: '/moulds'
    }
  ]

  const [forumPosts, setForumPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [expandedPost, setExpandedPost] = useState(null)
  const [comments, setComments] = useState({})
  const [newComments, setNewComments] = useState({})
  const [postingComment, setPostingComment] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // WebSocket listeners for real-time updates
  // Removed sponsors WebSocket update effect

  // Note: AdminContext already loads banners, testimonials, and sponsors on mount
  // No need to reload them here - this was causing infinite loop

  // Load forum posts on mount
  useEffect(() => {
    loadForumPosts()
  }, [])
  
  // Set up polling to refresh comments for expanded posts every 3 seconds
  useEffect(() => {
    if (!expandedPost) return
    
    const pollingInterval = setInterval(() => {
      loadComments(expandedPost, true)
    }, 3000) // Poll every 3 seconds
    
    return () => clearInterval(pollingInterval)
  }, [expandedPost])

  const loadForumPosts = async () => {
    setLoadingPosts(true)
    try {
      const API_BASE_URL = getApiBaseUrlDynamic()
      console.log('[Forum] Loading posts from:', `${API_BASE_URL}/forum/posts`)
      const response = await fetch(`${API_BASE_URL}/forum/posts?page=1&pageSize=3`)
      console.log('[Forum] Load posts response:', response.status, response.statusText)
      
      if (response.ok) {
        const posts = await response.json()
        console.log('[Forum] Loaded posts:', posts.length)
        setForumPosts(posts)
        // Load comment counts for each post (only if expanded)
        // Don't load all comments upfront - only load when expanded
      } else {
        const errorText = await response.text()
        console.error('[Forum] Failed to load posts:', response.status, errorText)
        setErrorMessage(`Failed to load posts: ${response.status} ${response.statusText}`)
        setTimeout(() => setErrorMessage(''), 5000)
      }
    } catch (error) {
      console.error('[Forum] Error loading forum posts:', error)
      setErrorMessage(`Network error loading posts: ${error.message}`)
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setLoadingPosts(false)
    }
  }

  const loadComments = async (postId, force = false) => {
    try {
      const API_BASE_URL = getApiBaseUrlDynamic()
      // Add cache-busting parameter to force fresh data
      const cacheBuster = force ? `?t=${Date.now()}` : ''
      const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}/comments${cacheBuster}`)
      if (response.ok) {
        const commentsData = await response.json()
        // Force update by creating a new object reference
        setComments(prev => {
          const newComments = { ...prev }
          newComments[postId] = commentsData
          return newComments
        })
        console.log(`[Forum] Loaded ${commentsData.length} comments for post ${postId}`)
      } else {
        console.error(`[Forum] Failed to load comments: ${response.status}`)
      }
    } catch (error) {
      console.error('[Forum] Error loading comments:', error)
    }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!currentUser) {
      alert('Please log in to create a post')
      return
    }

    if (!currentUser.uid) {
      alert('User authentication error. Please log out and log in again.')
      console.error('[Forum] currentUser.uid is missing:', currentUser)
      return
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert('Please fill in both title and content')
      return
    }

    setPosting(true)
    try {
      const API_BASE_URL = getApiBaseUrlDynamic()
      const requestBody = {
        user_uid: currentUser.uid,
        title: newPostTitle.trim(),
        content: newPostContent.trim()
      }
      
      console.log('[Forum] Creating post:', {
        API_BASE_URL,
        user_uid: currentUser.uid,
        title: requestBody.title.substring(0, 50),
        hasContent: !!requestBody.content
      })
      
      const response = await fetch(`${API_BASE_URL}/forum/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log('[Forum] Response status:', response.status, response.statusText)

      if (response.ok) {
        const result = await response.json()
        setNewPostTitle('')
        setNewPostContent('')
        setShowNewPostForm(false)
        setSuccessMessage('Post created successfully!')
        setErrorMessage('')
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
        await loadForumPosts()
      } else {
        let errorMessage = 'Failed to create post'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
          console.error('[Forum] Error response:', errorData)
        } catch (parseError) {
          const errorText = await response.text()
          console.error('[Forum] Error response text:', errorText)
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`
        }
        setErrorMessage(errorMessage)
        setSuccessMessage('')
        // Clear error message after 5 seconds
        setTimeout(() => setErrorMessage(''), 5000)
        alert(errorMessage) // Also show alert for immediate feedback
      }
    } catch (error) {
      console.error('[Forum] Error creating post:', error)
      console.error('[Forum] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      const errorMsg = `Failed to create post: ${error.message || 'Network error. Please check your connection and try again.'}`
      setErrorMessage(errorMsg)
      setSuccessMessage('')
      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(''), 5000)
      alert(errorMsg) // Also show alert for immediate feedback
    } finally {
      setPosting(false)
    }
  }

  const handleAddComment = async (postId) => {
    if (!currentUser) {
      alert('Please log in to comment')
      return
    }

    const commentText = newComments[postId] || ''
    if (!commentText.trim()) {
      alert('Please enter a comment')
      return
    }

    setPostingComment(prev => ({ ...prev, [postId]: true }))
    try {
      const API_BASE_URL = getApiBaseUrlDynamic()
      const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_uid: currentUser.uid,
          content: (newComments[postId] || '').trim()
        })
      })

      if (response.ok) {
        const result = await response.json()
        setNewComments(prev => ({ ...prev, [postId]: '' }))
        setSuccessMessage('Comment added successfully!')
        setErrorMessage('')
        setTimeout(() => setSuccessMessage(''), 3000)
        
        // Immediately reload comments to show the new one (with cache busting)
        await loadComments(postId, true)
        
        // Force a small delay and reload again to ensure we get the latest from server
        setTimeout(async () => {
          await loadComments(postId, true)
        }, 500)
      } else {
        let errorMsg = 'Failed to add comment'
        try {
          const errorData = await response.json()
          errorMsg = errorData.error || errorMsg
        } catch (parseError) {
          const errorText = await response.text()
          errorMsg = errorText || `HTTP ${response.status}`
        }
        setErrorMessage(errorMsg)
        setSuccessMessage('')
        setTimeout(() => setErrorMessage(''), 5000)
        alert(errorMsg)
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      const errorMsg = `Failed to add comment: ${error.message || 'Please try again.'}`
      setErrorMessage(errorMsg)
      setSuccessMessage('')
      setTimeout(() => setErrorMessage(''), 5000)
      alert(errorMsg)
    } finally {
      setPostingComment(prev => ({ ...prev, [postId]: false }))
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const getUserInitials = (user, title) => {
    // If we have display_name from the API, use it
    if (user && user.display_name) {
      const words = user.display_name.split(' ')
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase()
      }
      return words[0][0].toUpperCase()
    }
    // Fallback to title or user_id
    if (title) {
      const words = title.split(' ')
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase()
      }
      return words[0][0].toUpperCase()
    }
    const userId = user?.user_id || user?.id || user
    return userId ? userId.toString().slice(0, 2).toUpperCase() : 'U'
  }

  const getUserDisplayName = (user) => {
    if (user && user.display_name) {
      return user.display_name
    }
    if (user && user.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-primary to-blue-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              India's First Online Plastics Market
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              Connecting plastics professionals with their industrial requirements. 
              Find manpower, machinery, materials, and mould design services all in one place.
            </p>
            
            <div className="max-w-2xl mx-auto">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* Where You Left Off Section - Only for logged-in users */}
      {currentUser && (
        <section className="py-8 bg-gray-50">
          <div className="container">
            <WhereYouLeftOff />
          </div>
        </section>
      )}

      {/* Sponsors Section */}
      {sponsors && sponsors.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800">
              Our Trusted Partners
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {sponsors.filter(s => s.active).map((sponsor) => (
                <a
                  key={sponsor.id}
                  href={sponsor.website || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 overflow-hidden"
                >
                  <div className="w-full h-32 md:h-40 relative">
                    {sponsor.logo && sponsor.logo.trim() ? (
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name || 'Sponsor'}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          e.target.src = '/placeholder-banner.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-center px-2">{sponsor.name || 'No Logo'}</span>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            Our Key Services
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Link
                key={index}
                to={service.link}
                className="card p-6 text-center group hover:scale-105 transition-all duration-300"
              >
                <div className="text-primary mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors Section removed as requested */}

      {/* Mobile Ad Banner Section */}
      <section className="py-8 bg-white xl:hidden">
        <div className="container">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sponsored</h3>
            <div className="flex justify-center">
              {banners && banners.filter(b => b.active && b.image).length > 0 ? (
                <AdBannerCarousel 
                  images={banners.filter(b => b.active && b.image).map(b => b.image)}
                  width={300}
                  className="max-w-full"
                />
              ) : (
                <AdBannerCarousel 
                  images={['/placeholder-ad.svg']}
                  width={300}
                  className="max-w-full"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Community Forum Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className={`grid grid-cols-1 ${banners && banners.filter(b => b.active && b.image).length > 0 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'} lg:grid-cols-3 gap-8`}>
            {/* Ad Banner - Left Side (Desktop) - Only show if banners exist */}
            {banners && banners.filter(b => b.active && b.image).length > 0 && (
              <div className="hidden xl:block xl:col-span-1 order-1">
                <div className="sticky top-24">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Sponsored</h3>
                  <AdBannerCarousel 
                    images={banners.filter(b => b.active && b.image).map(b => b.image)}
                    width={280}
                    className="w-full"
                  />
                </div>
              </div>
            )}
            {/* Show placeholder if no banners */}
            {(!banners || banners.filter(b => b.active && b.image).length === 0) && (
              <div className="hidden xl:block xl:col-span-1 order-1">
                <div className="sticky top-24">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Sponsored</h3>
                  <AdBannerCarousel 
                    images={['/placeholder-ad.svg']}
                    width={280}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Forum Posts */}
            <div className="xl:col-span-2 lg:col-span-2 order-2">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Community Forum</h2>
                <Link to="/forum" className="text-primary hover:text-blue-600 font-medium">
                  View All
                </Link>
              </div>

              {/* Success/Error Messages */}
              {successMessage && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{successMessage}</span>
                  </div>
                  <button
                    onClick={() => setSuccessMessage('')}
                    className="text-green-700 hover:text-green-900"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
              {errorMessage && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    onClick={() => setErrorMessage('')}
                    className="text-red-700 hover:text-red-900"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}

              {/* New Post Form */}
              {showNewPostForm && (
                <div className="card p-6 mb-6 bg-blue-50 border border-blue-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Start a New Discussion</h3>
                  <form onSubmit={handleCreatePost}>
                    <input
                      type="text"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="Post title..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="What would you like to discuss?"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={posting}
                        className="btn btn-primary flex-1 disabled:opacity-50"
                      >
                        {posting ? 'Posting...' : 'Post Discussion'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewPostForm(false)
                          setNewPostTitle('')
                          setNewPostContent('')
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {loadingPosts ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner variant="pulse" text="Loading discussions..." />
                </div>
              ) : (
                <div className="space-y-6">
                  {forumPosts.length === 0 ? (
                    <div className="card p-8 text-center text-gray-500">
                      <p className="mb-4">No discussions yet. Be the first to start one!</p>
                      {!currentUser && (
                        <Link to="/login" className="text-primary hover:text-blue-600">
                          Log in to post
                        </Link>
                      )}
                    </div>
                  ) : (
                    forumPosts.map((post) => {
                      const postComments = comments[post.id] || []
                      const isExpanded = expandedPost === post.id
                      const userInitials = getUserInitials(post, post.title)
                      const userName = getUserDisplayName(post)

                      return (
                        <div key={post.id} className="card p-6 hover:shadow-lg transition-shadow duration-300">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                              {userInitials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-800">{post.title}</h4>
                                <span className="text-xs text-gray-500">by {userName}</span>
                              </div>
                              <p className="text-gray-700 mb-2 whitespace-pre-wrap">{post.content}</p>
                              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                <div className="flex items-center space-x-4">
                                  <span>{formatTimeAgo(post.created_at)}</span>
                                  <span>{postComments.length} {postComments.length === 1 ? 'Reply' : 'Replies'}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    const newExpanded = isExpanded ? null : post.id
                                    setExpandedPost(newExpanded)
                                    // Always load comments when expanding (even if cached)
                                    if (newExpanded) {
                                      loadComments(newExpanded, true)
                                    }
                                  }}
                                  className="text-primary hover:text-blue-600 font-medium"
                                >
                                  {isExpanded ? 'Hide Comments' : 'View Comments'}
                                </button>
                              </div>

                              {/* Comments Section */}
                              {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="space-y-3 mb-4">
                                    {postComments.length === 0 ? (
                                      <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
                                    ) : (
                                      postComments.map((comment) => (
                                        <div key={comment.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
                                          <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                            {getUserInitials(comment, comment.content)}
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-xs text-gray-600 mb-1 font-medium">{getUserDisplayName(comment)}</p>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                                            <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(comment.created_at)}</p>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>

                                  {/* Add Comment Form */}
                                  {currentUser ? (
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={newComments[post.id] || ''}
                                        onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                                        placeholder="Add a comment..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleAddComment(post.id)
                                          }
                                        }}
                                      />
                                      <button
                                        onClick={() => handleAddComment(post.id)}
                                        disabled={postingComment[post.id] || !(newComments[post.id] || '').trim()}
                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {postingComment[post.id] ? 'Posting...' : 'Post'}
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="text-center py-2">
                                      <Link to="/login" className="text-sm text-primary hover:text-blue-600">
                                        Log in to comment
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
              
              {currentUser ? (
                <button
                  onClick={() => setShowNewPostForm(!showNewPostForm)}
                  className="btn btn-primary mt-6 w-full"
                >
                  {showNewPostForm ? 'Cancel' : 'Start a New Discussion'}
                </button>
              ) : (
                <Link to="/login" className="btn btn-primary mt-6 w-full text-center block">
                  Log in to Start Discussion
                </Link>
              )}
            </div>

            {/* Industry News */}
            <div className="xl:col-span-1 lg:col-span-1 order-3">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Industry News</h3>
              
              {newsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner variant="pulse" text="Loading industry news..." />
                </div>
              ) : newsError ? (
                <div className="card p-4 text-center text-gray-600">
                  <p className="mb-2">Unable to load latest news</p>
                  <p className="text-sm">Showing curated industry updates</p>
                </div>
              ) : null}
              
              <div className="space-y-4">
                {newsItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target={item.url !== '#' ? '_blank' : '_self'}
                    rel={item.url !== '#' ? 'noopener noreferrer' : ''}
                    className="card p-4 hover:shadow-lg transition-shadow duration-300 block group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-primary transition-colors duration-200">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{item.source}</span>
                          <span>{item.publishedAt}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
              
              <Link to="/news" className="inline-block mt-6 text-primary hover:text-blue-600 font-medium">
                View All News
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="card p-6 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-primary/20"
                  />
                </div>
                <div className="mb-4">
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm mb-3 italic">"{testimonial.testimonial}"</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home