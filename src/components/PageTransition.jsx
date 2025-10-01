import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const PageTransition = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)
  const location = useLocation()

  useEffect(() => {
    setIsLoading(true)
    
    // Start transition
    const timer = setTimeout(() => {
      setDisplayChildren(children)
      setIsLoading(false)
    }, 150) // Short delay for smooth transition

    return () => clearTimeout(timer)
  }, [location.pathname, children])

  return (
    <div className="page-transition-wrapper">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="loading-spinner">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-text-secondary text-sm font-medium">Loading...</p>
          </div>
        </div>
      )}
      
      {/* Page content with transition */}
      <div 
        className={`page-content ${
          isLoading 
            ? 'opacity-0 transform translate-y-4' 
            : 'opacity-100 transform translate-y-0'
        } transition-all duration-300 ease-out`}
      >
        {displayChildren}
      </div>
    </div>
  )
}

export default PageTransition