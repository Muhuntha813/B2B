import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useJobs } from '../context/JobsContext'
import { useAuth } from '../contexts/AuthContext'
import ChatWindow from '../components/ChatWindow'
import jobService from '../services/jobService'
import LoadingSpinner from '../components/LoadingSpinner'
import { getApiBaseUrlDynamic } from '../config/api'

const JobDetail = () => {
  const { id } = useParams()
  const { getJobById, jobs } = useJobs()
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('details')
  const [showChat, setShowChat] = useState(false)
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [requestingBoost, setRequestingBoost] = useState(false)
  const [boostMessage, setBoostMessage] = useState('')
  
  useEffect(() => {
    const loadJob = async () => {
      setLoading(true)
      setError(null)
      
      // First try to get from local state
      const localJob = getJobById(parseInt(id))
      if (localJob) {
        // Normalize local job data as well
        const normalizedLocalJob = {
          ...localJob,
          owner_uid: localJob.owner_uid || localJob.firebase_uid || 'unknown',
          status: localJob.status ? (localJob.status.charAt(0).toUpperCase() + localJob.status.slice(1).toLowerCase()) : 'Open'
        }
        setJob(normalizedLocalJob)
        setLoading(false)
        return
      }
      
      // If not in local state, fetch from API
      try {
        const fetchedJob = await jobService.getJobById(id)
        if (fetchedJob) {
          // Normalize job data to match component expectations
          const normalizedJob = {
            ...fetchedJob,
            // Handle requirements - could be string, object, or array
            requirements: Array.isArray(fetchedJob.requirements) 
              ? fetchedJob.requirements 
              : typeof fetchedJob.requirements === 'string' 
                ? (() => {
                    try {
                      const parsed = JSON.parse(fetchedJob.requirements)
                      return Array.isArray(parsed) ? parsed : Object.values(parsed).filter(v => v)
                    } catch {
                      return [fetchedJob.requirements]
                    }
                  })()
                : fetchedJob.requirements && typeof fetchedJob.requirements === 'object'
                  ? Object.values(fetchedJob.requirements).filter(v => v && typeof v === 'string')
                  : [],
            // Handle specifications - could be string, object, or array
            specifications: typeof fetchedJob.specifications === 'string'
              ? (() => {
                  try {
                    const parsed = JSON.parse(fetchedJob.specifications)
                    return Array.isArray(parsed) ? parsed.reduce((acc, item) => ({ ...acc, ...item }), {}) : parsed
                  } catch {
                    return {}
                  }
                })()
              : Array.isArray(fetchedJob.specifications)
                ? fetchedJob.specifications.reduce((acc, item) => ({ ...acc, ...item }), {})
                : fetchedJob.specifications || {},
            // Normalize date fields
            postedDate: fetchedJob.posted_date || fetchedJob.postedDate || new Date().toLocaleDateString(),
            startDate: fetchedJob.start_date || fetchedJob.startDate || 'Not specified',
            endDate: fetchedJob.deadline || fetchedJob.end_date || fetchedJob.endDate || 'Not specified',
            // Normalize other fields
            bidsReceived: fetchedJob.bids_received || fetchedJob.bidsReceived || 0,
            estimatedDuration: fetchedJob.estimated_duration || fetchedJob.estimatedDuration || 'Not specified',
            owner_uid: fetchedJob.owner_uid || fetchedJob.firebase_uid || 'unknown',
            unit: fetchedJob.unit || 'pieces',
            // Normalize status (capitalize first letter)
            status: fetchedJob.status ? (fetchedJob.status.charAt(0).toUpperCase() + fetchedJob.status.slice(1).toLowerCase()) : 'Open'
          }
          setJob(normalizedJob)
        } else {
          setError('Job not found')
        }
      } catch (err) {
        console.error('Error fetching job:', err)
        setError('Failed to load job details')
      } finally {
        setLoading(false)
      }
    }
    
    loadJob()
  }, [id, getJobById])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {error || 'Job Not Found'}
          </h2>
          <Link to="/jobs" className="btn btn-primary">
            Back to Jobs
          </Link>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Completed': return 'bg-gray-100 text-gray-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Injection Molding': return 'fas fa-syringe'
      case 'Blow Molding': return 'fas fa-wind'
      case 'Extrusion': return 'fas fa-arrows-alt-h'
      case 'Thermoforming': return 'fas fa-fire'
      case 'Custom Manufacturing': return 'fas fa-cogs'
      default: return 'fas fa-industry'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
            <li><i className="fas fa-chevron-right"></i></li>
            <li><Link to="/jobs" className="hover:text-blue-600">Jobs</Link></li>
            <li><i className="fas fa-chevron-right"></i></li>
            <li className="text-gray-800">{job.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{job.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span><i className="fas fa-user mr-1"></i>{job.client}</span>
                    <span><i className="fas fa-map-marker-alt mr-1"></i>{job.location}</span>
                    <span><i className="fas fa-calendar mr-1"></i>Posted: {job.postedDate}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  <i className={`${getCategoryIcon(job.category)} mr-1`}></i>
                  {job.category}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {job.material}
                </span>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  Qty: {job.quantity}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(job.budget)}
                  </div>
                  <div className="text-sm text-gray-600">Budget</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {job.bidsReceived}
                  </div>
                  <div className="text-sm text-gray-600">Bids Received</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {job.estimatedDuration}
                  </div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
              </div>
            </div>

            {/* Job Details Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {[
                    { id: 'details', label: 'Job Details', icon: 'fas fa-info-circle' },
                    { id: 'requirements', label: 'Requirements', icon: 'fas fa-list-check' },
                    { id: 'specifications', label: 'Specifications', icon: 'fas fa-cog' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 text-sm font-medium border-b-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <i className={`${tab.icon} mr-2`}></i>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'details' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Project Description</h3>
                    <p className="text-gray-600 mb-6">{job.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Timeline</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Start Date:</span>
                            <span className="font-medium">{job.startDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">End Date:</span>
                            <span className="font-medium">{job.endDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">{job.estimatedDuration}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Project Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Material:</span>
                            <span className="font-medium">{job.material}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Quantity:</span>
                            <span className="font-medium">{job.quantity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="font-medium">{job.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'requirements' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Project Requirements</h3>
                    <div className="space-y-3">
                      {Array.isArray(job.requirements) && job.requirements.length > 0 ? (
                        job.requirements.map((requirement, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <i className="fas fa-check-circle text-green-500 mt-1"></i>
                            <span className="text-gray-600">
                              {typeof requirement === 'string' ? requirement : JSON.stringify(requirement)}
                            </span>
                          </div>
                        ))
                      ) : job.requirements && typeof job.requirements === 'object' ? (
                        Object.entries(job.requirements).map(([key, value], index) => (
                          <div key={index} className="flex items-start gap-3">
                            <i className="fas fa-check-circle text-green-500 mt-1"></i>
                            <span className="text-gray-600">
                              <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {String(value)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No specific requirements listed.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {job.specifications && typeof job.specifications === 'object' && Object.keys(job.specifications).length > 0 ? (
                        Object.entries(job.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-700 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="text-gray-600">{String(value)}</span>
                          </div>
                        ))
                      ) : Array.isArray(job.specifications) && job.specifications.length > 0 ? (
                        job.specifications.map((spec, index) => (
                          <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-700">Specification {index + 1}:</span>
                            <span className="text-gray-600">{typeof spec === 'string' ? spec : JSON.stringify(spec)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No technical specifications provided.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Chat with Owner */}
            {(job.status === 'Open' || job.status?.toLowerCase() === 'open') && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Contact Client</h3>
                <p className="text-gray-600 mb-4">
                  Interested in this project? Start a conversation with the client to discuss requirements, timeline, and pricing.
                </p>
                {!currentUser ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 mb-3">
                      Please log in to chat with the client and place bids.
                    </p>
                    <Link
                      to="/login"
                      className="w-full btn btn-primary inline-flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Log In to Chat</span>
                    </Link>
                  </div>
            ) : currentUser.uid === job.owner_uid || currentUser.uid === job.firebase_uid ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 mb-3">
                    <i className="fas fa-info-circle mr-2"></i>
                    This is your job posting. You can view and manage bids from your account.
                  </p>
                  
                  {/* Boost Job Section */}
                  {!job.boost_requested && !job.boost_approved && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-sm text-blue-800 mb-2">
                        <i className="fas fa-arrow-up mr-2"></i>
                        Boost your job to appear at the top of listings!
                      </p>
                      <button
                        onClick={async () => {
                          setRequestingBoost(true)
                          setBoostMessage('')
                          try {
                            const API_BASE_URL = getApiBaseUrlDynamic()
                            const response = await fetch(`${API_BASE_URL}/jobs/${job.id}/boost`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({ user_uid: currentUser.uid })
                            })
                            
                            const result = await response.json()
                            if (response.ok && result.success) {
                              setBoostMessage('success')
                              // Update job state to reflect boost request
                              setJob(prev => ({ ...prev, boost_requested: true }))
                              setTimeout(() => setBoostMessage(''), 5000)
                            } else {
                              setBoostMessage(result.error || 'Failed to request boost')
                              setTimeout(() => setBoostMessage(''), 5000)
                            }
                          } catch (error) {
                            console.error('Error requesting boost:', error)
                            setBoostMessage('An error occurred. Please try again.')
                            setTimeout(() => setBoostMessage(''), 5000)
                          } finally {
                            setRequestingBoost(false)
                          }
                        }}
                        disabled={requestingBoost}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {requestingBoost ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Requesting...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-arrow-up"></i>
                            <span>Boost This Job</span>
                          </>
                        )}
                      </button>
                      {boostMessage && (
                        <div className={`mt-2 p-2 rounded text-sm ${
                          boostMessage === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {boostMessage === 'success' 
                            ? '✓ Boost request submitted! Waiting for admin approval.' 
                            : boostMessage}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {job.boost_requested && !job.boost_approved && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <i className="fas fa-clock mr-2"></i>
                        Boost request pending admin approval...
                      </p>
                    </div>
                  )}
                  
                  {job.boost_approved && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">
                        <i className="fas fa-check-circle mr-2"></i>
                        Your job is boosted! It appears at the top of listings.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
                  <button 
                    onClick={() => setShowChat(true)}
                    className="w-full btn btn-primary inline-flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Chat with owner</span>
                  </button>
                )}
              </div>
            )}

            {/* Client Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Client Information</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-blue-600"></i>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{job.client}</div>
                  <div className="text-sm text-gray-600">{job.location}</div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium">2020</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jobs Posted:</span>
                  <span className="font-medium">15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 mr-1">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="fas fa-star text-xs"></i>
                      ))}
                    </div>
                    <span className="font-medium">4.8</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Job Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Proposals</span>
                  <span className="font-semibold">{job.bidsReceived}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg. Bid</span>
                  <span className="font-semibold">{formatCurrency(job.budget * 0.85)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time Left</span>
                  <span className="font-semibold text-orange-600">5 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Jobs */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Similar Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs
              .filter(j => j.category === job.category && j.id !== job.id)
              .slice(0, 3)
              .map(similarJob => (
                <Link 
                  key={similarJob.id}
                  to={`/job/${similarJob.id}`}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 line-clamp-2">{similarJob.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(similarJob.status)}`}>
                      {similarJob.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{similarJob.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 font-bold">
                      {formatCurrency(similarJob.budget)}
                    </span>
                    <span className="text-gray-500">
                      <i className="fas fa-map-marker-alt mr-1"></i>
                      {similarJob.location}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* Chat Window */}
      {showChat && (
        <ChatWindow
          jobId={job.id}
          jobOwnerUid={job.owner_uid || job.firebase_uid || 'default-owner-uid'}
          jobTitle={job.title}
          jobBudget={job.budget}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  )
}

export default JobDetail