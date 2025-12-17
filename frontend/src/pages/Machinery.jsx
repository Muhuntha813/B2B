import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import FilterSidebar from '../components/FilterSidebar'
import ProductCard from '../components/ProductCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { useUserActivity } from '../contexts/UserActivityContext'
import { getApiBaseUrlDynamic } from '../config/api'

const Machinery = () => {
  const { trackPageVisit } = useUserActivity()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [filters, setFilters] = useState({
    category: '',
    grade: '',
    priceRange: '',
    location: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [machines, setMachines] = useState([])
  const [filteredMachines, setFilteredMachines] = useState([])
  const [sortBy, setSortBy] = useState('relevance')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 12

  // Load machinery from API
  useEffect(() => {
    const loadMachinery = async () => {
      setIsLoading(true)
      try {
        const API_BASE_URL = getApiBaseUrlDynamic()
        const response = await fetch(`${API_BASE_URL}/machinery`)
        if (response.ok) {
          const data = await response.json()
          // Map database fields to frontend format
          const mappedData = data.map(m => ({
            id: m.id,
            name: m.name,
            category: m.category,
            capacity: m.capacity,
            price: Number(m.price),
            unit: m.unit || 'piece',
            image: m.image || '/images/injection-molding.svg',
            location: m.location,
            supplier: m.supplier,
            rating: Number(m.rating) || 0,
            inStock: m.in_stock !== false,
            year: m.year,
            condition: m.condition,
            description: m.description,
            specifications: typeof m.specifications === 'string' ? JSON.parse(m.specifications || '{}') : m.specifications,
            features: typeof m.features === 'string' ? JSON.parse(m.features || '[]') : m.features
          }))
          setMachines(mappedData)
        } else {
          console.error('Failed to load machinery')
          setMachines([])
        }
      } catch (error) {
        console.error('Error loading machinery:', error)
        setMachines([])
      } finally {
        setIsLoading(false)
      }
    }
    loadMachinery()
  }, [])

  // Filter options based on loaded data
  const filterOptions = {
    categories: [...new Set(machines.map(machine => machine.category).filter(Boolean))],
    grades: [...new Set(machines.map(machine => machine.condition).filter(Boolean))],
    priceRanges: [
      { label: 'Under ₹5 Lakh', value: 'under-500000' },
      { label: '₹5 Lakh - ₹15 Lakh', value: '500000-1500000' },
      { label: '₹15 Lakh - ₹30 Lakh', value: '1500000-3000000' },
      { label: '₹30 Lakh - ₹50 Lakh', value: '3000000-5000000' },
      { label: 'Above ₹50 Lakh', value: 'above-5000000' }
    ],
    locations: [...new Set(machines.map(machine => machine.location).filter(Boolean))]
  }

  // Track page visit
  useEffect(() => {
    trackPageVisit('/machinery', { category: 'machinery' })
  }, [trackPageVisit])

  useEffect(() => {
    let filtered = machines

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(machine =>
        machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(machine =>
        machine.category === filters.category
      )
    }

    // Filter by grade (condition)
    if (filters.grade) {
      filtered = filtered.filter(machine =>
        machine.condition === filters.grade
      )
    }

    // Filter by price range
    if (filters.priceRange) {
      const priceFilter = (machine) => {
        switch (filters.priceRange) {
          case 'under-500000':
            return machine.price < 500000
          case '500000-1500000':
            return machine.price >= 500000 && machine.price <= 1500000
          case '1500000-3000000':
            return machine.price >= 1500000 && machine.price <= 3000000
          case '3000000-5000000':
            return machine.price >= 3000000 && machine.price <= 5000000
          case 'above-5000000':
            return machine.price > 5000000
          default:
            return true
        }
      }
      filtered = filtered.filter(priceFilter)
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(machine =>
        machine.location === filters.location
      )
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => b.year - a.year)
    }

    setFilteredMachines(filtered)
    setCurrentPage(1)
  }, [searchTerm, filters, sortBy])

  const handleContactSeller = (machineId, supplier) => {
    navigate('/chat', { 
      state: { 
        type: 'machinery',
        productId: machineId,
        supplier: supplier,
        message: `Hi, I'm interested in learning more about this machinery. Could you provide more details?`
      }
    })
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      grade: '',
      priceRange: '',
      location: ''
    })
    setSearchTerm('')
    setCurrentPage(1)
  }

  // Pagination
  const totalPages = Math.ceil(filteredMachines.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentMachines = filteredMachines.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    setShowMobileFilters(false) // Hide mobile filters when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent">
              Industrial Machinery
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-primary-100 max-w-3xl mx-auto px-4">
              Discover high-quality machinery from trusted suppliers worldwide
            </p>
            <div className="max-w-2xl mx-auto px-4">
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Search machinery by name, category, or supplier..."
                className="w-full shadow-xl"
              />
            </div>
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm px-4">
              <span className="bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full whitespace-nowrap">
                🏭 Injection Molding
              </span>
              <span className="bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full whitespace-nowrap">
                🔧 Extrusion Lines
              </span>
              <span className="bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full whitespace-nowrap">
                ⚡ Blow Molding
              </span>
              <span className="bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full whitespace-nowrap">
                🌡️ Thermoforming
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
            <div className="lg:sticky lg:top-8">
              <FilterSidebar
                filters={filters}
                filterOptions={filterOptions}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                resultsCount={filteredMachines.length}
              />
            </div>
          </div>

          {/* Results */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-border-light">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-1 sm:mb-2">
                  Machinery Results
                </h2>
                <p className="text-sm sm:text-base text-text-secondary">
                  {filteredMachines.length} machines found
                  {searchTerm && (
                    <span className="ml-2">
                      for "<span className="font-medium text-primary-600">{searchTerm}</span>"
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <label className="text-sm font-medium text-text-primary whitespace-nowrap">Sort by:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto border border-border-light rounded-lg px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Machinery Grid */}
            {isLoading ? (
              <div className="text-center py-12 sm:py-16 bg-white rounded-xl border border-border-light">
                <LoadingSpinner />
                <p className="text-text-secondary mt-4">Loading machinery...</p>
              </div>
            ) : currentMachines.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {currentMachines.map((machine) => (
                  <div key={machine.id} className="group relative">
                    <ProductCard
                      product={machine}
                      type="machinery"
                    />
                    {/* Contact Seller Button - Always visible and responsive */}
                    <div className="mt-3 sm:mt-4 relative z-10">
                      <button
                        onClick={() => handleContactSeller(machine.id, machine.supplier)}
                        className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base relative z-20"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Contact Seller</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16 bg-white rounded-xl border border-border-light">
                <div className="text-text-muted text-4xl sm:text-6xl mb-4">🏭</div>
                <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
                  No machinery found
                </h3>
                <p className="text-sm sm:text-base text-text-secondary mb-6 px-4">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="btn btn-outline"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 mt-8 sm:mt-12">
                <button
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 border border-border-light rounded-lg text-sm font-medium text-text-primary bg-white hover:bg-background-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>
                
                {/* Page Numbers - Show fewer on mobile */}
                {[...Array(Math.min(totalPages, window.innerWidth < 640 ? 3 : 5))].map((_, index) => {
                  let page
                  const maxPages = window.innerWidth < 640 ? 3 : 5
                  if (totalPages <= maxPages) {
                    page = index + 1
                  } else if (currentPage <= Math.floor(maxPages / 2) + 1) {
                    page = index + 1
                  } else if (currentPage >= totalPages - Math.floor(maxPages / 2)) {
                    page = totalPages - maxPages + 1 + index
                  } else {
                    page = currentPage - Math.floor(maxPages / 2) + index
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 sm:px-4 py-2 border text-sm font-medium rounded-lg transition-colors duration-200 ${
                        currentPage === page
                          ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                          : 'bg-white text-text-primary border-border-light hover:bg-background-secondary'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2 border border-border-light rounded-lg text-sm font-medium text-text-primary bg-white hover:bg-background-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Machinery