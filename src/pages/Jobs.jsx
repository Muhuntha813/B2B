import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import LoadingSpinner from '../components/LoadingSpinner'
import { useJobs } from '../context/JobsContext'
import { useUserActivity } from '../contexts/UserActivityContext'

const Jobs = () => {
  const { trackPageVisit } = useUserActivity()
  const [searchParams] = useSearchParams()
  const { jobs, loading, error } = useJobs()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [filters, setFilters] = useState({
    categories: [],
    status: [],
    budgetRange: [0, 500000],
    locations: []
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredJobs, setFilteredJobs] = useState([])
  const itemsPerPage = 10

  // Filter options
  const filterOptions = {
    categories: [...new Set(jobs.map(job => job.category))],
    status: [...new Set(jobs.map(job => job.status))],
    locations: [...new Set(jobs.map(job => job.location))]
  }

  // Track page visit
  useEffect(() => {
    trackPageVisit('/jobs', { category: 'jobs' })
  }, [trackPageVisit])

  useEffect(() => {
    let filtered = jobs

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.material.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(job => filters.categories.includes(job.category))
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(job => filters.status.includes(job.status))
    }

    // Budget range filter
    filtered = filtered.filter(job => 
      job.budget >= filters.budgetRange[0] && job.budget <= filters.budgetRange[1]
    )

    // Location filter
    if (filters.locations.length > 0) {
      filtered = filtered.filter(job => filters.locations.includes(job.location))
    }

    setFilteredJobs(filtered)
    setCurrentPage(1)
  }, [searchTerm, filters, jobs])

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }))
  }

  const clearFilters = () => {
    setFilters({
      categories: [],
      status: [],
      budgetRange: [0, 500000],
      locations: []
    })
    setSearchTerm('')
  }

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner variant="rotate" text="Loading jobs..." />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Jobs</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Manufacturing Jobs
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Find plastic manufacturing projects and connect with clients
            </p>
            <div className="max-w-2xl mx-auto">
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Search jobs, materials, or clients..."
                initialValue={searchTerm}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Category</h4>
                <div className="space-y-2">
                  {filterOptions.categories.map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => handleFilterChange('categories', category)}
                        className="mr-2"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Status</h4>
                <div className="space-y-2">
                  {filterOptions.status.map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={() => handleFilterChange('status', status)}
                        className="mr-2"
                      />
                      <span className="text-sm">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Location</h4>
                <div className="space-y-2">
                  {filterOptions.locations.map(location => (
                    <label key={location} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.locations.includes(location)}
                        onChange={() => handleFilterChange('locations', location)}
                        className="mr-2"
                      />
                      <span className="text-sm">{location}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-600 mt-4">
                {filteredJobs.length} jobs found
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Jobs ({filteredJobs.length} results)
              </h2>
              <div className="flex items-center gap-4">
                <Link 
                  to="/post-job"
                  className="btn btn-primary"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Post a Job
                </Link>
              </div>
            </div>

            {/* Jobs List */}
            {currentJobs.length > 0 ? (
              <div className="space-y-6">
                {currentJobs.map(job => (
                  <div key={job.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600">
                            <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{job.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span><i className="fas fa-building mr-1"></i>{job.client}</span>
                          <span><i className="fas fa-map-marker-alt mr-1"></i>{job.location}</span>
                          <span><i className="fas fa-calendar mr-1"></i>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                          <span><i className="fas fa-star mr-1"></i>{job.rating}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {formatCurrency(job.budget)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {job.quantity.toLocaleString()} {job.unit}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {job.category}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        {job.material}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        {job.estimatedDuration}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        <span className="mr-4">
                          <i className="fas fa-users mr-1"></i>
                          {job.bidsReceived} bids received
                        </span>
                        <span>
                          Posted {new Date(job.postedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link 
                          to={`/jobs/${job.id}`}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          View Details
                        </Link>
                        {job.status === 'Open' && (
                          <Link 
                            to={`/chat?type=job&jobId=${job.id}&client=${encodeURIComponent(job.client)}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm inline-flex items-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>Chat with owner</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <i className="fas fa-briefcase text-6xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <button 
                  onClick={clearFilters}
                  className="btn btn-primary"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 border rounded-lg ${
                        currentPage === page
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Jobs