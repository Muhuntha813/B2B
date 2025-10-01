import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Footer Links */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <Link 
              to="/about" 
              className="text-gray-600 hover:text-primary transition-colors duration-200"
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-600 hover:text-primary transition-colors duration-200"
            >
              Contact
            </Link>
            <Link 
              to="/privacy" 
              className="text-gray-600 hover:text-primary transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              className="text-gray-600 hover:text-primary transition-colors duration-200"
            >
              Terms of Service
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-gray-600 text-sm">
            <p>&copy; 2024 B2B Plastics. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer