import { useState, useEffect, useRef } from 'react'

/**
 * AdBannerCarousel - A responsive portrait ad banner carousel component
 * @param {Object} props
 * @param {string[]} props.images - Array of image URLs for the carousel
 * @param {number} props.intervalMs - Auto-advance interval in milliseconds (default: 4000)
 * @param {number} props.width - Width of the carousel in pixels (default: 300)
 * @param {string} props.className - Additional CSS classes
 */
const AdBannerCarousel = ({ 
  images = [], // Changed: no default placeholders
  intervalMs = 4000, 
  width = 300,
  className = ''
}) => {
  // Use placeholders only if no images provided
  const displayImages = images.length > 0 ? images : [
    '/placeholder-ad.svg',
    '/placeholder-ad.svg',
    '/placeholder-ad.svg',
    '/placeholder-ad.svg'
  ];
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef(null)

  // Auto-advance functionality
  useEffect(() => {
    if (!isPaused && displayImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % displayImages.length)
      }, intervalMs)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPaused, displayImages.length, intervalMs])

  // Handle manual navigation
  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % displayImages.length)
  }

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        goToPrevious()
        break
      case 'ArrowRight':
        event.preventDefault()
        goToNext()
        break
      case 'Home':
        event.preventDefault()
        goToSlide(0)
        break
      case 'End':
        event.preventDefault()
        goToSlide(displayImages.length - 1)
        break
      default:
        break
    }
  }

  // Handle mouse events for pause/resume
  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)
  const handleFocus = () => setIsPaused(true)
  const handleBlur = () => setIsPaused(false)

  if (!displayImages || displayImages.length === 0) {
    return (
      <div 
        className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`}
        style={{ width: `${width}px`, height: `${width * 2}px` }}
      >
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">No ads available</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${className}`}
      style={{ width: `${width}px`, height: `${width * 2}px` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Advertisement carousel"
      aria-live="polite"
    >
      {/* Main Image Display */}
      <div className="relative w-full h-full">
        <img
          src={displayImages[currentIndex]}
          alt={`Advertisement ${currentIndex + 1} of ${displayImages.length}`}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={() => {
            // In a real implementation, this would navigate to the ad's target URL
            console.log(`Clicked on ad ${currentIndex + 1}`)
          }}
          onError={(e) => {
            // Fallback to a placeholder image if the ad image fails to load
            e.target.src = '/placeholder-ad.svg'
          }}
        />
        
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Navigation Controls */}
      {displayImages.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50"
            aria-label="Previous advertisement"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50"
            aria-label="Next advertisement"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50 ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to advertisement ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Pause Indicator */}
      {isPaused && displayImages.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
          Paused
        </div>
      )}

      {/* Ad Label */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
        Ad
      </div>
    </div>
  )
}

export default AdBannerCarousel