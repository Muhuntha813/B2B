import React, { useState } from 'react';

const SafeImage = ({ 
  src, 
  alt, 
  fallbackSrc = '/placeholder-news.svg', 
  className = '', 
  onError,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (e) => {
    if (!hasError) {
      setHasError(true);
      setIsLoading(false);
      e.target.src = fallbackSrc;
      
      // Call custom onError handler if provided
      if (onError) {
        onError(e);
      }
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative ${className}`}>
      <img
        src={hasError ? fallbackSrc : src}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={className.includes('object-contain') ? className : `${className} w-full h-full object-cover`}
        {...props}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default SafeImage;