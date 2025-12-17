import React, { useState } from 'react'

const Avatar = ({ 
  src, 
  alt = 'User Avatar', 
  size = 'md', 
  className = '', 
  fallbackSrc = '/default-avatar.svg',
  showBorder = false,
  borderColor = 'border-primary-200'
}) => {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  // Size variants
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8', 
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  }

  const handleImageError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
      setHasError(true)
    }
  }

  const handleImageLoad = () => {
    // Reset error state if image loads successfully
    if (hasError && imgSrc === src) {
      setHasError(false)
    }
  }

  const baseClasses = `
    ${sizeClasses[size]} 
    rounded-full 
    object-cover 
    ${showBorder ? `border-2 ${borderColor}` : ''} 
    ${className}
  `.trim()

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt}
      className={baseClasses}
      onError={handleImageError}
      onLoad={handleImageLoad}
      loading="lazy"
    />
  )
}

export default Avatar