import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import LoadingSpinner from './LoadingSpinner'

const ProductCard = ({ product, isLoading = false }) => {
  const { addToCart } = useCart()
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  if (isLoading) {
    return (
      <div className="card h-full flex flex-col items-center justify-center p-8">
        <LoadingSpinner variant="bounce" size="sm" text="Loading product..." />
      </div>
    )
  }

  return (
    <Link to={`/product/${product.id}`} className="card group smooth-hover scale-in transition-all duration-300 h-full flex flex-col w-full">
      <div className="relative overflow-hidden rounded-t-lg">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200"></div>
        )}
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-48 object-cover group-hover:scale-110 transition-all duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        {product.inStock === false && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-800 group-hover:text-primary transition-colors duration-200 line-clamp-2 flex-grow pr-2">
            {product.name}
          </h3>
          <div className="flex items-center flex-shrink-0">
            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
          </div>
        </div>
        
        <div className="space-y-2 mb-4 flex-grow">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Category:</span>
            <span className="font-medium text-gray-800 text-right">{product.category}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Grade:</span>
            <span className="font-medium text-gray-800 text-right">{product.grade}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium text-gray-800 text-right">{product.location}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold text-primary">₹{product.price}</span>
            <span className="text-sm text-gray-600 ml-1">/{product.unit}</span>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.inStock === false}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex-shrink-0 ${
              product.inStock === false
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-blue-600 hover:shadow-md transform hover:scale-105'
            }`}
          >
            {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard