import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useJobs } from '../context/JobsContext'

const JobDetail = () => {
  const { id } = useParams()
  const { getJobById } = useJobs()
  const [activeTab, setActiveTab] = useState('details')

  const job = getJobById(id)

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Job Not Found</h2>
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
                      {job.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <i className="fas fa-check-circle text-green-500 mt-1"></i>
                          <span className="text-gray-600">{requirement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(job.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-gray-600">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Chat with Owner */}
            {job.status === 'Open' && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Contact Client</h3>
                <p className="text-gray-600 mb-4">
                  Interested in this project? Start a conversation with the client to discuss requirements, timeline, and pricing.
                </p>
                <Link 
                  to={`/chat?type=job&jobId=${job.id}&client=${encodeURIComponent(job.client)}`}
                  className="w-full btn btn-primary inline-flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Chat with owner</span>
                </Link>
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
            {jobsData
              .filter(j => j.category === job.category && j.id !== job.id)
              .slice(0, 3)
              .map(similarJob => (
                <Link 
                  key={similarJob.id}
                  to={`/jobs/${similarJob.id}`}
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
    </div>
  )
}

export default JobDetail