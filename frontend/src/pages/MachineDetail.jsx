import React, { useState, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import { machinesData } from '../data/machines'
import { useAuth } from '../contexts/AuthContext'
import { cartService } from '../services/cartService'

const MachineDetail = () => {
  const { id } = useParams()
  const { dispatch } = useContext(CartContext)
  const { currentUser } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  const machine = machinesData.find(m => m.id === parseInt(id))

  if (!machine) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Machine Not Found</h2>
          <Link to="/machinery" className="btn btn-primary">
            Back to Machinery
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = async () => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { ...machine, quantity }
    })
    if (currentUser?.uid) {
      try {
        await cartService.addItem(currentUser.uid, machine.id, quantity)
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
            <li><Link to="/machinery" className="hover:text-blue-600">Machinery</Link></li>
            <li><i className="fas fa-chevron-right"></i></li>
            <li className="text-gray-800">{machine.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Machine Image */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <i className="fas fa-industry text-6xl text-gray-400"></i>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-gray-100 rounded border cursor-pointer hover:border-blue-500">
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fas fa-industry text-gray-400"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Machine Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{machine.name}</h1>
              <p className="text-gray-600">{machine.description}</p>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fas fa-star ${i < Math.floor(machine.rating) ? '' : 'text-gray-300'}`}></i>
                  ))}
                </div>
                <span className="text-gray-600">({machine.rating})</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                machine.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {machine.inStock ? 'Available' : 'Not Available'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                machine.condition === 'New' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {machine.condition}
              </span>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(machine.price)}
              </div>
              <div className="text-sm text-gray-500 mb-1">
                <i className="fas fa-building mr-1"></i>{machine.supplier}
              </div>
              <div className="text-sm text-gray-500 mb-1">
                <i className="fas fa-map-marker-alt mr-1"></i>{machine.location}
              </div>
              <div className="text-sm text-gray-500">
                <i className="fas fa-calendar mr-1"></i>Year: {machine.year}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {machine.category}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {machine.capacity}
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
              <span className="text-gray-600">units</span>
            </div>

            <div className="flex gap-4 mb-6">
              <button 
                onClick={handleAddToCart}
                disabled={!machine.inStock}
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
              <p className="mb-2"><i className="fas fa-truck mr-2"></i>Installation support available</p>
              <p className="mb-2"><i className="fas fa-tools mr-2"></i>1 year warranty included</p>
              <p><i className="fas fa-phone mr-2"></i>Technical support available</p>
            </div>
          </div>
        </div>

        {/* Machine Details Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'description', label: 'Description', icon: 'fas fa-info-circle' },
                { id: 'specifications', label: 'Specifications', icon: 'fas fa-cog' },
                { id: 'features', label: 'Features', icon: 'fas fa-star' }
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
                <h3 className="text-lg font-semibold mb-4">Machine Description</h3>
                <p className="text-gray-600 mb-4">{machine.description}</p>
                <p className="text-gray-600">
                  This high-quality industrial machine is designed for efficient plastic processing. 
                  It offers excellent performance, reliability, and precision that make it perfect 
                  for your manufacturing operations.
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(machine.specifications).map(([key, value]) => (
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

            {activeTab === 'features' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {machine.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <i className="fas fa-check-circle text-green-500 mt-1"></i>
                      <span className="text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Machines */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Machines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {machinesData
              .filter(m => m.category === machine.category && m.id !== machine.id)
              .slice(0, 4)
              .map(relatedMachine => (
                <Link 
                  key={relatedMachine.id}
                  to={`/machinery/${relatedMachine.id}`}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <i className="fas fa-industry text-2xl text-gray-400"></i>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{relatedMachine.name}</h3>
                  <p className="text-green-600 font-bold">
                    {formatCurrency(relatedMachine.price)}
                  </p>
                  <p className="text-sm text-gray-500">{relatedMachine.capacity}</p>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MachineDetail