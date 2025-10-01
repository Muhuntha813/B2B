import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { getCartItemsCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const navLinks = [
    { to: '/jobs', label: 'Manpower' },
    { to: '/machinery', label: 'Machineries' },
    { to: '/materials', label: 'Material' },
    { to: '/moulds', label: 'Mould Design and Makers' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  const isActiveLink = (path) => location.pathname === path

  return (
    <header className="bg-background-primary shadow-soft border-b border-border-light sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 text-primary font-bold text-xl hover:text-primary-600 transition-colors duration-200"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <span className="hidden sm:block">B2B Plastics</span>
            <span className="sm:hidden">B2B</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActiveLink(link.to)
                    ? 'text-primary bg-primary-50 border border-primary-200'
                    : 'text-text-secondary hover:text-primary hover:bg-background-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>



          {/* Header Actions */}
          <div className="flex items-center space-x-3 lg:space-x-4">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 text-text-secondary hover:text-primary transition-all duration-200 ease-out rounded-lg hover:bg-background-secondary transform hover:scale-105 will-change-transform"
              aria-label={`Shopping cart with ${getCartItemsCount()} items`}
            >
              <svg className="w-6 h-6 transition-transform duration-200 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
              </svg>
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>

            {/* Action Buttons */}
            <div className="hidden sm:flex items-center space-x-3">
              <button
                onClick={() => navigate('/post-job')}
                className="btn btn-primary btn-sm transform hover:scale-105 transition-all duration-200 ease-out will-change-transform"
              >
                Post Job
              </button>
              <button className="btn btn-outline btn-sm transform hover:scale-105 transition-all duration-200 ease-out will-change-transform">
                Login
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 text-text-secondary hover:text-primary transition-all duration-200 ease-out rounded-lg hover:bg-background-secondary transform hover:scale-105 will-change-transform"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden absolute top-full left-0 right-0 bg-white border-t border-border-light shadow-lg z-50 transition-all duration-300 ease-out will-change-transform ${
          isMenuOpen 
            ? 'opacity-100 transform translate-y-0 visible' 
            : 'opacity-0 transform -translate-y-2 invisible'
        }`}>
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Navigation */}
            <nav className="space-y-1">
              {navLinks.map((link, index) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-3 rounded-lg transition-all duration-200 ease-out transform hover:scale-[1.02] will-change-transform ${
                    isActiveLink(link.to)
                      ? 'text-primary bg-primary-50 border-l-4 border-primary font-medium shadow-sm'
                      : 'text-text-secondary hover:text-primary hover:bg-background-secondary hover:shadow-sm'
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: isMenuOpen ? 'slideInFromLeft 0.3s ease-out forwards' : 'none'
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Action Buttons */}
            <div className="flex flex-col space-y-3 pt-4 border-t border-border-light">
              <button
                onClick={() => {
                  navigate('/post-job')
                  setIsMenuOpen(false)
                }}
                className="btn btn-primary w-full transform hover:scale-105 transition-all duration-200 ease-out will-change-transform"
                style={{
                  animationDelay: `${navLinks.length * 50 + 100}ms`,
                  animation: isMenuOpen ? 'slideInFromLeft 0.3s ease-out forwards' : 'none'
                }}
              >
                Post Job
              </button>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="btn btn-outline w-full transform hover:scale-105 transition-all duration-200 ease-out will-change-transform"
                style={{
                  animationDelay: `${navLinks.length * 50 + 150}ms`,
                  animation: isMenuOpen ? 'slideInFromLeft 0.3s ease-out forwards' : 'none'
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header