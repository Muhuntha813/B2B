import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchSuggestions from '../features/search/SearchSuggestions'
import useSearchSuggestions from '../features/search/useSearchSuggestions'

const SearchBar = ({ 
  placeholder = "Search for manpower, machinery, materials...", 
  onSearch,
  className = "" 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const { suggestions, isLoading } = useSearchSuggestions(searchTerm)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      setShowSuggestions(false)
      if (onSearch) {
        onSearch(searchTerm.trim())
      } else {
        // Navigate to materials page with search query
        navigate(`/materials?search=${encodeURIComponent(searchTerm.trim())}`)
      }
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setShowSuggestions(value.length >= 2)
  }

  const handleInputFocus = () => {
    setIsFocused(true)
    if (searchTerm.length >= 2) {
      setShowSuggestions(true)
    }
  }

  const handleInputBlur = () => {
    setIsFocused(false)
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      if (!isFocused) {
        setShowSuggestions(false)
      }
    }, 150)
  }

  const handleSuggestionSelect = (suggestion) => {
    setSearchTerm(suggestion.name)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  const handleCloseSuggestions = () => {
    setShowSuggestions(false)
  }

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
            <svg 
              className="h-4 w-4 sm:h-5 sm:w-5 text-text-tertiary" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className="input pl-10 sm:pl-12 pr-16 sm:pr-20 py-2 sm:py-2.5 text-sm sm:text-base"
            aria-label="Search"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            role="combobox"
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 px-3 sm:px-4 py-2 bg-primary text-white rounded-r-lg hover:bg-primary-600 focus:bg-primary-600 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Search"
          >
            <span className="hidden sm:inline text-sm sm:text-base">Search</span>
            <svg 
              className="w-4 h-4 sm:hidden" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </button>
        </div>
      </form>

      {/* Search Suggestions */}
      <div className="absolute top-full left-0 right-0 mt-1 sm:mt-2 z-50">
        <SearchSuggestions
          searchTerm={searchTerm}
          isVisible={showSuggestions && (suggestions.length > 0 || isLoading || searchTerm.length >= 2)}
          onClose={handleCloseSuggestions}
          onSelect={handleSuggestionSelect}
          suggestions={suggestions}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default SearchBar