import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const SearchSuggestions = ({ 
  searchTerm, 
  isVisible, 
  onClose, 
  onSelect,
  suggestions = [],
  isLoading = false 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const suggestionsRef = useRef(null)
  const navigate = useNavigate()

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1)
  }, [suggestions])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isVisible) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSelect(suggestions[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, selectedIndex, suggestions, onClose])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        onClose()
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, onClose])

  const handleSelect = (suggestion) => {
    onSelect(suggestion)
    onClose()
    
    // Navigate based on suggestion type
    switch (suggestion.type) {
      case 'material':
        navigate(`/materials?search=${encodeURIComponent(suggestion.name)}`)
        break
      case 'machine':
        navigate(`/machinery?search=${encodeURIComponent(suggestion.name)}`)
        break
      case 'job':
        navigate(`/jobs?search=${encodeURIComponent(suggestion.name)}`)
        break
      case 'mould':
        navigate(`/moulds?search=${encodeURIComponent(suggestion.name)}`)
        break
      default:
        navigate(`/materials?search=${encodeURIComponent(suggestion.name)}`)
    }
  }

  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm) return text
    
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-text-primary font-medium">
          {part}
        </mark>
      ) : part
    )
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'material':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
          </svg>
        )
      case 'machine':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      case 'job':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
          </svg>
        )
      case 'mould':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'material': return 'Material'
      case 'machine': return 'Machine'
      case 'job': return 'Job'
      case 'mould': return 'Mould'
      default: return 'Search'
    }
  }

  if (!isVisible) return null

  return (
    <div 
      ref={suggestionsRef}
      className="absolute top-full left-0 right-0 z-50 mt-1 bg-background-primary border border-border-light rounded-lg shadow-lg max-h-80 overflow-y-auto"
      role="listbox"
      aria-label="Search suggestions"
    >
      {isLoading ? (
        <div className="p-4 text-center">
          <div className="inline-flex items-center space-x-2 text-text-secondary">
            <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Searching...</span>
          </div>
        </div>
      ) : suggestions.length > 0 ? (
        <ul className="py-1">
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.type}-${suggestion.id}`}
              className={`px-4 py-3 cursor-pointer transition-colors duration-150 ${
                index === selectedIndex 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'hover:bg-background-secondary'
              }`}
              onClick={() => handleSelect(suggestion)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 ${
                  index === selectedIndex ? 'text-primary-600' : 'text-text-tertiary'
                }`}>
                  {getTypeIcon(suggestion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary">
                    {highlightMatch(suggestion.name, searchTerm)}
                  </div>
                  {suggestion.category && (
                    <div className="text-xs text-text-secondary mt-0.5">
                      {suggestion.category}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className={`badge ${
                    index === selectedIndex ? 'badge-primary' : 'bg-background-tertiary text-text-secondary'
                  }`}>
                    {getTypeLabel(suggestion.type)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : searchTerm ? (
        <div className="p-4 text-center text-text-secondary">
          <div className="flex flex-col items-center space-y-2">
            <svg className="w-8 h-8 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.5a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm">No results found for "{searchTerm}"</p>
            <p className="text-xs text-text-tertiary">Try searching for materials, machines, jobs, or moulds</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default SearchSuggestions