import React, { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import { designersData } from '../data/designers'

const Moulds = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [filters, setFilters] = useState({
    specializations: [],
    availability: [],
    rateRange: [0, 5000],
    locations: []
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredDesigners, setFilteredDesigners] = useState(designersData)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const itemsPerPage = 12

  // Filter options
  const filterOptions = {
    specializations: [...new Set(designersData.map(designer => designer.specialization))],
    availability: [...new Set(designersData.map(designer => designer.availability))],
    locations: [...new Set(designersData.map(designer => designer.location))]
  }

  useEffect(() => {
    let filtered = designersData

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(designer =>
        designer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        designer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        designer.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Specialization filter
    if (filters.specializations.length > 0) {
      filtered = filtered.filter(designer => filters.specializations.includes(designer.specialization))
    }

    // Availability filter
    if (filters.availability.length > 0) {
      filtered = filtered.filter(designer => filters.availability.includes(designer.availability))
    }

    // Rate range filter
    filtered = filtered.filter(designer => 
      designer.hourlyRate >= filters.rateRange[0] && designer.hourlyRate <= filters.rateRange[1]
    )

    // Location filter
    if (filters.locations.length > 0) {
      filtered = filtered.filter(designer => filters.locations.includes(designer.location))
    }

    setFilteredDesigners(filtered)
    setCurrentPage(1)
  }, [searchTerm, filters])

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
      specializations: [],
      availability: [],
      rateRange: [0, 5000],
      locations: []
    })
    setSearchTerm('')
    setCurrentPage(1)
  }

  const handleContactDesigner = (designerId, designerName) => {
    navigate('/chat', { 
      state: { 
        type: 'designer',
        productId: designerId,
        supplier: designerName,
        message: `Hi, I'm interested in discussing a mold design project. Could you provide more details about your services?`
      }
    })
  }

  // Pagination
  const totalPages = Math.ceil(filteredDesigners.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentDesigners = filteredDesigners.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    setShowMobileFilters(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Available': return 'bg-green-100 text-green-800'
      case 'Busy': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-secondary-600 via-secondary-700 to-primary-600 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-secondary-100 bg-clip-text text-transparent">
              Mold Design Experts
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-secondary-100 max-w-3xl mx-auto px-4">
              Connect with professional mold designers and precision manufacturers
            </p>
            <div className="max-w-2xl mx-auto px-4">
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Search designers, companies, or specializations..."
                className="w-full shadow-xl"
              />
            </div>
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm px-4">
              <span className="bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full whitespace-nowrap">
                🔧 Injection Molds
              </span>
              <span className="bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full whitespace-nowrap">
                ⚡ Blow Molds
              </span>
              <span className="bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full whitespace-nowrap">
                🎯 Precision Tooling
              </span>
              <span className="bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full whitespace-nowrap">
                🏭 Custom Design
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full flex items-center justify-between bg-white border border-border-light rounded-lg px-4 py-3 text-text-primary font-medium hover:bg-background-secondary transition-colors duration-200"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
                <span>Filters</span>
              </span>
              <svg 
                className={`w-5 h-5 transition-transform duration-200 ${showMobileFilters ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Sidebar */}
          <div className={`lg:w-1/4 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:sticky lg:top-8 border border-border-light">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                >
                  Clear All
                </button>
              </div>

              {/* Specialization Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-text-primary">Specialization</h4>
                <div className="space-y-2">
                  {filterOptions.specializations.map(spec => (
                    <label key={spec} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.specializations.includes(spec)}
                        onChange={() => handleFilterChange('specializations', spec)}
                        className="mr-3 w-4 h-4 text-primary-600 border-border-light rounded focus:ring-primary-500 focus:ring-2"
                      />
                      <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-200">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-text-primary">Availability</h4>
                <div className="space-y-2">
                  {filterOptions.availability.map(avail => (
                    <label key={avail} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.availability.includes(avail)}
                        onChange={() => handleFilterChange('availability', avail)}
                        className="mr-3 w-4 h-4 text-primary-600 border-border-light rounded focus:ring-primary-500 focus:ring-2"
                      />
                      <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-200">{avail}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-text-primary">Location</h4>
                <div className="space-y-2">
                  {filterOptions.locations.map(location => (
                    <label key={location} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.locations.includes(location)}
                        onChange={() => handleFilterChange('locations', location)}
                        className="mr-3 w-4 h-4 text-primary-600 border-border-light rounded focus:ring-primary-500 focus:ring-2"
                      />
                      <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-200">{location}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="text-sm text-text-muted mt-4 p-3 bg-background-secondary rounded-lg border border-border-light">
                <span className="font-medium text-primary-600">{filteredDesigners.length}</span> designers found
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-border-light">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-1 sm:mb-2">
                  Mold Designers
                </h2>
                <p className="text-sm sm:text-base text-text-secondary">
                  {filteredDesigners.length} designers found
                  {searchTerm && (
                    <span className="ml-2">
                      for "<span className="font-medium text-primary-600">{searchTerm}</span>"
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-background-secondary rounded-lg p-1 border border-border-light">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-white text-primary-600 shadow-sm' 
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-white text-primary-600 shadow-sm' 
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
                {/* Sort Dropdown */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <label className="text-sm font-medium text-text-primary whitespace-nowrap">Sort by:</label>
                  <select className="w-full sm:w-auto border border-border-light rounded-lg px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white">
                    <option>Relevance</option>
                    <option>Rating: High to Low</option>
                    <option>Rate: Low to High</option>
                    <option>Rate: High to Low</option>
                    <option>Experience: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Designers Grid/List */}
            {currentDesigners.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" 
                : "space-y-6 mb-8"
              }>
                {currentDesigners.map(designer => (
                  <div 
                    key={designer.id} 
                    className={`bg-white rounded-xl shadow-sm border border-border-light hover:shadow-md transition-all duration-300 group ${
                      viewMode === 'list' ? 'p-6' : 'p-6 h-full flex flex-col'
                    }`}
                  >
                    <div className={`${viewMode === 'list' ? 'flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6' : 'flex flex-col'}`}>
                      {/* Designer Info */}
                      <div className={`${viewMode === 'list' ? 'flex items-center space-x-4 flex-shrink-0' : 'flex items-start gap-4 mb-4'}`}>
                        <div className="relative">
                          <div className="w-16 h-16 aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center border-2 border-primary-200 overflow-hidden">
                            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            designer.availability === 'Available' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                        </div>
                        <div className={viewMode === 'list' ? '' : 'flex-1'}>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg sm:text-xl font-bold text-text-primary group-hover:text-primary-600 transition-colors">
                              {designer.name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(designer.availability)}`}>
                              {designer.availability}
                            </span>
                          </div>
                          <p className="text-text-secondary text-sm mb-1">{designer.company}</p>
                          <p className="text-primary-600 text-sm font-medium mb-2">{designer.specialization}</p>
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(designer.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-text-muted">
                              {designer.rating} ({designer.projectsCompleted} projects)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Designer Details */}
                      <div className={`${viewMode === 'list' ? 'flex-1' : 'mb-4 flex-grow'}`}>
                        {viewMode === 'grid' && (
                          <>
                            <p className="text-text-secondary text-sm mb-4 line-clamp-3">{designer.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              {designer.skills.slice(0, 3).map(skill => (
                                <span key={skill} className="px-2 py-1 bg-background-secondary text-text-primary rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                              {designer.skills.length > 3 && (
                                <span className="px-2 py-1 bg-background-secondary text-text-primary rounded text-xs">
                                  +{designer.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          </>
                        )}
                        
                        <div className={`${viewMode === 'list' ? 'grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4' : 'grid grid-cols-2 gap-2 text-sm text-text-muted mb-4'}`}>
                          <div className="flex items-center space-x-1 min-w-0">
                            <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="min-w-0 flex-1">
                              {viewMode === 'list' && <p className="text-xs text-text-muted">Experience</p>}
                              <p className={`text-sm truncate ${viewMode === 'list' ? 'font-medium text-text-primary' : ''}`}>
                                {designer.experience} years
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 min-w-0">
                            <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <div className="min-w-0 flex-1">
                              {viewMode === 'list' && <p className="text-xs text-text-muted">Rate</p>}
                              <p className={`text-sm truncate ${viewMode === 'list' ? 'font-medium text-text-primary' : ''}`}>
                                ₹{designer.hourlyRate}/hr
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 min-w-0">
                            <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="min-w-0 flex-1">
                              {viewMode === 'list' && <p className="text-xs text-text-muted">Location</p>}
                              <p className={`text-sm truncate ${viewMode === 'list' ? 'font-medium text-text-primary' : ''}`}>
                                {designer.location}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 min-w-0">
                            <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                            </svg>
                            <div className="min-w-0 flex-1">
                              {viewMode === 'list' && <p className="text-xs text-text-muted">Projects</p>}
                              <p className={`text-sm truncate ${viewMode === 'list' ? 'font-medium text-text-primary' : ''}`}>
                                {designer.projectsCompleted} projects
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className={`${viewMode === 'list' ? 'flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0' : 'flex gap-2 mt-auto'}`}>
                          <Link 
                            to={`/designers/${designer.id}`}
                            className={`${viewMode === 'list' ? 'flex-1 sm:flex-none' : ''} px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 text-sm font-medium transition-colors duration-200 text-center`}
                          >
                            View Profile
                          </Link>
                          <button 
                            onClick={() => handleContactDesigner(designer.id, designer.name)}
                            className={`${viewMode === 'list' ? 'flex-1 sm:flex-none' : ''} px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors duration-200`}
                          >
                            Contact
                          </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-border-light">
                <div className="text-text-muted mb-6">
                  <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3">
                  No designers found
                </h3>
                <p className="text-text-secondary mb-6 max-w-md mx-auto">
                  We couldn't find any designers matching your criteria. Try adjusting your search or filters.
                </p>
                <button 
                  onClick={clearFilters}
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 sm:mt-12 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-border-light">
                <div className="text-sm text-text-secondary mb-4 sm:mb-0">
                   Showing {(currentPage - 1) * designersPerPage + 1} to {Math.min(currentPage * designersPerPage, filteredDesigners.length)} of {filteredDesigners.length} designers
                 </div>
                <div className="flex justify-center items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-2 border border-border-light rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-secondary transition-colors duration-200 text-sm font-medium"
                  >
                    <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = currentPage === page;
                    const shouldShow = page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                    
                    if (!shouldShow && page !== currentPage - 2 && page !== currentPage + 2) {
                      return null;
                    }
                    
                    if ((page === currentPage - 2 || page === currentPage + 2) && totalPages > 5) {
                      return (
                        <span key={page} className="px-2 text-text-muted">
                          ...
                        </span>
                      );
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 sm:px-4 py-2 border rounded-lg text-sm font-medium transition-colors duration-200 ${
                          isCurrentPage
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                            : 'border-border-light hover:bg-background-secondary text-text-primary'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 sm:px-4 py-2 border border-border-light rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-secondary transition-colors duration-200 text-sm font-medium"
                  >
                    <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="hidden sm:inline">Next</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Moulds