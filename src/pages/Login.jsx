import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FaGoogle, FaSpinner, FaShieldAlt, FaUsers, FaBriefcase } from 'react-icons/fa'

const Login = () => {
  const { signInWithGoogle, currentUser, loading, error } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already authenticated
  useEffect(() => {
    if (currentUser && !loading) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [currentUser, loading, navigate, location])

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true)
      await signInWithGoogle()
      
      // Redirect to intended page or home
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch (error) {
      console.error('Sign in failed:', error)
      setIsSigningIn(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <FaSpinner className="animate-spin text-blue-600 text-xl" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <FaShieldAlt className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to B2B Plastics
          </h2>
          <p className="text-gray-600">
            Sign in to access your account and explore opportunities
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <FaSpinner className="animate-spin h-5 w-5 mr-3" />
            ) : (
              <FaGoogle className="h-5 w-5 mr-3 text-red-500" />
            )}
            <span className="text-base font-medium">
              {isSigningIn ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Secure & Fast Authentication
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <FaUsers className="h-4 w-4 text-blue-500" />
              <span>Connect with industry professionals</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <FaBriefcase className="h-4 w-4 text-blue-500" />
              <span>Post and discover job opportunities</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <FaShieldAlt className="h-4 w-4 text-blue-500" />
              <span>Secure and private data protection</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login