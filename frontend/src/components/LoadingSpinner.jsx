import React from 'react'

const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'pulse',
  text = '', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl'
  }

  const containerSizes = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  }

  // Pulse Animation - Letters scale in sequence
  const PulseAnimation = () => (
    <div className={`flex items-center justify-center ${containerSizes[size]} ${className}`}>
      <div className={`font-bold text-primary-600 ${sizeClasses[size]} flex`}>
        <span className="animate-pulse-letter-1">B</span>
        <span className="animate-pulse-letter-2">2</span>
        <span className="animate-pulse-letter-3">B</span>
      </div>
    </div>
  )

  // Wave Animation - Letters move up and down
  const WaveAnimation = () => (
    <div className={`flex items-center justify-center ${containerSizes[size]} ${className}`}>
      <div className={`font-bold text-primary-600 ${sizeClasses[size]} flex`}>
        <span className="animate-wave-1">B</span>
        <span className="animate-wave-2">2</span>
        <span className="animate-wave-3">B</span>
      </div>
    </div>
  )

  // Rotate Animation - Letters rotate individually
  const RotateAnimation = () => (
    <div className={`flex items-center justify-center ${containerSizes[size]} ${className}`}>
      <div className={`font-bold text-primary-600 ${sizeClasses[size]} flex`}>
        <span className="animate-rotate-letter-1 inline-block">B</span>
        <span className="animate-rotate-letter-2 inline-block">2</span>
        <span className="animate-rotate-letter-3 inline-block">B</span>
      </div>
    </div>
  )

  // Glow Animation - Letters glow in sequence
  const GlowAnimation = () => (
    <div className={`flex items-center justify-center ${containerSizes[size]} ${className}`}>
      <div className={`font-bold ${sizeClasses[size]} flex`}>
        <span className="animate-glow-1 text-primary-600">B</span>
        <span className="animate-glow-2 text-primary-600">2</span>
        <span className="animate-glow-3 text-primary-600">B</span>
      </div>
    </div>
  )

  // Bounce Animation - Letters bounce
  const BounceAnimation = () => (
    <div className={`flex items-center justify-center ${containerSizes[size]} ${className}`}>
      <div className={`font-bold text-primary-600 ${sizeClasses[size]} flex`}>
        <span className="animate-bounce-letter-1 inline-block">B</span>
        <span className="animate-bounce-letter-2 inline-block">2</span>
        <span className="animate-bounce-letter-3 inline-block">B</span>
      </div>
    </div>
  )

  // Flip Animation - Letters flip 3D style
  const FlipAnimation = () => (
    <div className={`flex items-center justify-center ${containerSizes[size]} ${className}`}>
      <div className={`font-bold text-primary-600 ${sizeClasses[size]} flex`}>
        <span className="animate-flip-1 inline-block">B</span>
        <span className="animate-flip-2 inline-block">2</span>
        <span className="animate-flip-3 inline-block">B</span>
      </div>
    </div>
  )

  const animations = {
    pulse: PulseAnimation,
    wave: WaveAnimation,
    rotate: RotateAnimation,
    glow: GlowAnimation,
    bounce: BounceAnimation,
    flip: FlipAnimation
  }

  const AnimationComponent = animations[variant] || PulseAnimation

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <AnimationComponent />
      {text && (
        <p className="text-text-secondary text-sm font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner