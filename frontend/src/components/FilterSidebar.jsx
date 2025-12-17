const FilterSidebar = ({ filters, filterOptions, onFilterChange, onClearFilters, resultsCount }) => {
  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: filters[filterType] === value ? '' : value
    }
    onFilterChange(newFilters)
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary hover:text-blue-600 font-medium"
          >
            Clear All ({activeFiltersCount})
          </button>
        )}
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-primary">{resultsCount}</span> results found
        </p>
      </div>

      <div className="space-y-6">
        {/* Categories */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Categories</h4>
          <div className="space-y-2">
            {filterOptions.categories.map((category) => (
              <label key={category} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.category === category}
                  onChange={() => handleFilterChange('category', category)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-primary transition-colors duration-200">
                  {category}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Grades */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Grades</h4>
          <div className="space-y-2">
            {filterOptions.grades.map((grade) => (
              <label key={grade} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.grade === grade}
                  onChange={() => handleFilterChange('grade', grade)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-primary transition-colors duration-200">
                  {grade}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Price Range</h4>
          <div className="space-y-2">
            {filterOptions.priceRanges.map((range) => (
              <label key={range.value} className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="priceRange"
                  checked={filters.priceRange === range.value}
                  onChange={() => handleFilterChange('priceRange', range.value)}
                  className="w-4 h-4 text-primary border-gray-300 focus:ring-primary focus:ring-2"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-primary transition-colors duration-200">
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Locations</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {filterOptions.locations.map((location) => (
              <label key={location} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.location === location}
                  onChange={() => handleFilterChange('location', location)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-primary transition-colors duration-200">
                  {location}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Apply Filters Button for Mobile */}
      <div className="mt-6 lg:hidden">
        <button className="w-full btn btn-primary">
          Apply Filters
        </button>
      </div>
    </div>
  )
}

export default FilterSidebar