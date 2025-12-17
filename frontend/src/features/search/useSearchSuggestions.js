import { useState, useEffect, useCallback } from 'react'
import { materialsData } from '../../data/materials'
import { machinesData } from '../../data/machines'
import { jobsData } from '../../data/jobs'

// Mock data for moulds (since it might not exist yet)
const mouldsData = [
  { id: 1, name: 'Injection Mould for Bottle Caps', category: 'Bottle Caps', type: 'mould' },
  { id: 2, name: 'Blow Mould for PET Bottles', category: 'Bottles', type: 'mould' },
  { id: 3, name: 'Compression Mould for Automotive Parts', category: 'Automotive', type: 'mould' },
  { id: 4, name: 'Thermoforming Mould for Food Containers', category: 'Food Packaging', type: 'mould' },
  { id: 5, name: 'Rotational Mould for Tanks', category: 'Industrial', type: 'mould' },
]

const useSearchSuggestions = (searchTerm, maxResults = 8) => {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Debounce function
  const debounce = useCallback((func, delay) => {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }, [])

  // Search function
  const searchData = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100))

      const normalizedTerm = term.toLowerCase().trim()
      const results = []

      // Search materials
      const materialResults = materialsData
        .filter(item => 
          item.name.toLowerCase().includes(normalizedTerm) ||
          item.category?.toLowerCase().includes(normalizedTerm) ||
          item.supplier?.toLowerCase().includes(normalizedTerm)
        )
        .slice(0, 3)
        .map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          type: 'material',
          supplier: item.supplier,
          price: item.price
        }))

      // Search machines
      const machineResults = machinesData
        .filter(item => 
          item.name.toLowerCase().includes(normalizedTerm) ||
          item.category?.toLowerCase().includes(normalizedTerm) ||
          item.supplier?.toLowerCase().includes(normalizedTerm)
        )
        .slice(0, 3)
        .map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          type: 'machine',
          supplier: item.supplier,
          price: item.price
        }))

      // Search jobs (if jobsData exists)
      let jobResults = []
      if (typeof jobsData !== 'undefined') {
        jobResults = jobsData
          .filter(item => 
            item.title?.toLowerCase().includes(normalizedTerm) ||
            item.company?.toLowerCase().includes(normalizedTerm) ||
            item.location?.toLowerCase().includes(normalizedTerm) ||
            item.skills?.some(skill => skill.toLowerCase().includes(normalizedTerm))
          )
          .slice(0, 2)
          .map(item => ({
            id: item.id,
            name: item.title || item.name,
            category: item.company,
            type: 'job',
            location: item.location,
            salary: item.salary
          }))
      }

      // Search moulds
      const mouldResults = mouldsData
        .filter(item => 
          item.name.toLowerCase().includes(normalizedTerm) ||
          item.category?.toLowerCase().includes(normalizedTerm)
        )
        .slice(0, 2)
        .map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          type: 'mould'
        }))

      // Combine and prioritize results
      results.push(...materialResults, ...machineResults, ...jobResults, ...mouldResults)

      // Sort by relevance (exact matches first, then partial matches)
      results.sort((a, b) => {
        const aExact = a.name.toLowerCase().startsWith(normalizedTerm)
        const bExact = b.name.toLowerCase().startsWith(normalizedTerm)
        
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        
        return a.name.length - b.name.length
      })

      setSuggestions(results.slice(0, maxResults))
    } catch (err) {
      setError(err.message)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [maxResults])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(searchData, 250),
    [searchData]
  )

  // Effect to trigger search when searchTerm changes
  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  // Clear suggestions when search term is empty
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([])
      setIsLoading(false)
    }
  }, [searchTerm])

  return {
    suggestions,
    isLoading,
    error,
    clearSuggestions: () => setSuggestions([])
  }
}

export default useSearchSuggestions