import React, { useState, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { materialsData } from '../data/materials'
import { useAuth } from '../contexts/AuthContext'
import { cartService } from '../services/cartService'

const ProductDetail = () => {
  const { id } = useParams()
  const { dispatch } = useContext(CartContext)
  const { currentUser } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  const product = materialsData.find(p => p.id === parseInt(id))

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <Link to="/materials" className="btn btn-primary">
            Back to Materials
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = async () => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { ...product, quantity }
    })
    // Sync to backend if authenticated
    if (currentUser?.uid) {
      try {
        await cartService.addItem(currentUser.uid, product.id, quantity)
      } catch (e) {
        console.warn('Backend cart add failed:', e)
        alert(e.message || 'Failed to add item to cart. Please check if you have buying permission approved.')
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
            <li><i className="fas fa-chevron-right"></i></li>
            <li><Link to="/materials" className="hover:text-blue-600">Materials</Link></li>
            <li><i className="fas fa-chevron-right"></i></li>
            <li className="text-gray-800">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <i className="fas fa-cube text-6xl text-gray-400"></i>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-gray-100 rounded border cursor-pointer hover:border-blue-500">
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fas fa-cube text-gray-400"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fas fa-star ${i < Math.floor(product.rating) ? '' : 'text-gray-300'}`}></i>
                  ))}
                </div>
                <span className="text-gray-600">({product.rating})</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(product.price)}/{product.unit}
              </div>
              <div className="text-sm text-gray-500">
                <i className="fas fa-building mr-1"></i>{product.supplier}
              </div>
              <div className="text-sm text-gray-500">
                <i className="fas fa-map-marker-alt mr-1"></i>{product.location}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {product.category}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {product.grade}
              </span>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-50"
                >
                  <i className="fas fa-minus"></i>
                </button>
                <input 
                  type="number" 
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center py-2 border-0 focus:ring-0"
                  min="1"
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-gray-50"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              <span className="text-gray-600">{product.unit}</span>
            </div>

            <div className="flex gap-4 mb-6">
              <button 
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-shopping-cart mr-2"></i>
                Add to Cart
              </button>
              <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <i className="fas fa-heart"></i>
              </button>
            </div>

            <div className="text-sm text-gray-600">
              <p className="mb-2"><i className="fas fa-truck mr-2"></i>Free shipping on orders over ₹10,000</p>
              <p className="mb-2"><i className="fas fa-shield-alt mr-2"></i>Quality guaranteed</p>
              <p><i className="fas fa-phone mr-2"></i>24/7 customer support</p>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'description', label: 'Description', icon: 'fas fa-info-circle' },
                { id: 'specifications', label: 'Specifications', icon: 'fas fa-cog' },
                { id: 'reviews', label: 'Reviews', icon: 'fas fa-star' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className={`${tab.icon} mr-2`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <p className="text-gray-600">
                  This high-quality plastic material is perfect for various manufacturing applications. 
                  It offers excellent durability, chemical resistance, and processing characteristics 
                  that make it ideal for your production needs.
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, j) => (
                            <i key={j} className="fas fa-star text-sm"></i>
                          ))}
                        </div>
                        <span className="font-medium">Customer {i}</span>
                        <span className="text-gray-500 text-sm">2 days ago</span>
                      </div>
                      <p className="text-gray-600">
                        Excellent quality material. Fast delivery and great customer service. 
                        Will definitely order again.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {materialsData
              .filter(p => p.category === product.category && p.id !== product.id)
              .slice(0, 4)
              .map(relatedProduct => (
                <Link 
                  key={relatedProduct.id}
                  to={`/materials/${relatedProduct.id}`}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <i className="fas fa-cube text-2xl text-gray-400"></i>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{relatedProduct.name}</h3>
                  <p className="text-green-600 font-bold">
                    {formatCurrency(relatedProduct.price)}/{relatedProduct.unit}
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail