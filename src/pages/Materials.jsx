import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import ProductCard from '../components/ProductCard'
import FilterSidebar from '../components/FilterSidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import { materialsData } from '../data/materials'
import { useUserActivity } from '../contexts/UserActivityContext'

const Materials = () => {
  const { trackPageVisit } = useUserActivity()
  const [filteredProducts, setFilteredProducts] = useState(materialsData)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    grade: '',
    priceRange: '',
    location: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const productsPerPage = 12

  // Filter categories and grades based on data
  const categories = [...new Set(materialsData.map(item => item.category))]
  const grades = [...new Set(materialsData.map(item => item.grade))]
  const locations = [...new Set(materialsData.map(item => item.location))]

  const filterOptions = {
    categories,
    grades,
    locations,
    priceRanges: [
      { label: 'Under ₹50', value: '0-50' },
      { label: '₹50 - ₹100', value: '50-100' },
      { label: '₹100 - ₹200', value: '100-200' },
      { label: 'Above ₹200', value: '200+' }
    ]
  }

  // Track page visit
  useEffect(() => {
    trackPageVisit('/materials', { category: 'materials' })
  }, [trackPageVisit])

  useEffect(() => {
    setIsLoading(true)
    
    // Simulate loading delay for smooth transitions
    const filterTimeout = setTimeout(() => {
      let filtered = materialsData

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      // Apply category filter
      if (filters.category) {
        filtered = filtered.filter(product => product.category === filters.category)
      }

      // Apply grade filter
      if (filters.grade) {
        filtered = filtered.filter(product => product.grade === filters.grade)
      }

      // Apply location filter
      if (filters.location) {
        filtered = filtered.filter(product => product.location === filters.location)
      }

      // Apply price range filter
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(Number)
        filtered = filtered.filter(product => {
          if (filters.priceRange === '200+') {
            return product.price >= 200
          }
          return product.price >= min && product.price <= max
        })
      }

      setFilteredProducts(filtered)
      setCurrentPage(1)
      setIsLoading(false)
    }, 300) // 300ms delay for smooth filtering

    return () => clearTimeout(filterTimeout)
  }, [searchTerm, filters])

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
  }

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Materials</h1>
              <p className="text-gray-600">Find high-quality plastic materials for your production needs</p>
            </div>
            <div className="lg:w-96">
              <SearchBar 
                placeholder="Search materials..." 
                onSearch={handleSearch}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="btn btn-secondary w-full flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
              Filters
            </button>
          </div>

          {/* Sidebar */}
          <div className={`lg:w-80 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <FilterSidebar
              filters={filters}
              filterOptions={filterOptions}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              resultsCount={filteredProducts.length}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="mb-4 sm:mb-0">
                <p className="text-gray-600">
                  Showing {startIndex + 1}-{Math.min(startIndex + productsPerPage, filteredProducts.length)} of {filteredProducts.length} results
                  {searchTerm && (
                    <span className="ml-2">
                      for "<span className="font-semibold">{searchTerm}</span>"
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option>Sort by: Relevance</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {[...Array(8)].map((_, index) => (
                  <ProductCard key={`loading-${index}`} isLoading={true} />
                ))}
              </div>
            ) : currentProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 auto-rows-fr">
                  {currentProducts.map((product) => (
                    <div key={product.id} className="flex">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-2 border rounded-lg ${
                          currentPage === index + 1
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V4a2 2 0 00-2-2h-2a2 2 0 00-2-2V4a2 2 0 00-2 2v2.306z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No materials found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                <button
                  onClick={clearFilters}
                  className="btn btn-primary"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Materials