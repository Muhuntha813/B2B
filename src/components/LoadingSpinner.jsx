const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = '', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colorClasses = {
    primary: 'border-primary-200 border-t-primary-600',
    secondary: 'border-secondary-200 border-t-secondary-600',
    white: 'border-white/30 border-t-white',
    gray: 'border-gray-200 border-t-gray-600'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          border-4 rounded-full animate-spin
        `}
      />
      {text && (
        <p className="text-text-secondary text-sm font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner