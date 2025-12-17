import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { CartContext } from '../context/CartContext'

const Cart = () => {
  const { state, dispatch } = useContext(CartContext)
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: id })
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
    }
  }

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const applyPromoCode = () => {
    // Simple promo code logic
    if (promoCode.toLowerCase() === 'save10') {
      setDiscount(0.1) // 10% discount
      alert('Promo code applied! 10% discount added.')
    } else if (promoCode.toLowerCase() === 'welcome5') {
      setDiscount(0.05) // 5% discount
      alert('Promo code applied! 5% discount added.')
    } else if (promoCode) {
      alert('Invalid promo code')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const discountAmount = subtotal * discount
  const shipping = subtotal > 50000 ? 0 : 2000 // Free shipping over ₹50,000
  const tax = (subtotal - discountAmount) * 0.18 // 18% GST
  const total = subtotal - discountAmount + shipping + tax

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="mb-8">
              <i className="fas fa-shopping-cart text-6xl text-gray-300"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link to="/materials" className="btn btn-primary mr-4">
              Browse Materials
            </Link>
            <Link to="/machinery" className="btn btn-secondary">
              Browse Machinery
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <button 
            onClick={clearCart}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            <i className="fas fa-trash mr-2"></i>
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Cart Items ({state.items.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {state.items.map(item => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-cube text-2xl text-gray-400"></i>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                        <div className="text-sm text-gray-600 mb-2">
                          {item.category && (
                            <span className="mr-4">
                              <i className="fas fa-tag mr-1"></i>
                              {item.category}
                            </span>
                          )}
                          {item.grade && (
                            <span className="mr-4">
                              <i className="fas fa-star mr-1"></i>
                              {item.grade}
                            </span>
                          )}
                          {item.capacity && (
                            <span className="mr-4">
                              <i className="fas fa-cog mr-1"></i>
                              {item.capacity}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          <i className="fas fa-map-marker-alt mr-1"></i>
                          {item.location}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-2 hover:bg-gray-50"
                          >
                            <i className="fas fa-minus text-sm"></i>
                          </button>
                          <input 
                            type="number" 
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center py-2 border-0 focus:ring-0"
                            min="1"
                          />
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-2 hover:bg-gray-50"
                          >
                            <i className="fas fa-plus text-sm"></i>
                          </button>
                        </div>
                      </div>

                      {/* Price and Remove */}
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-800 mb-2">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          {formatCurrency(item.price)} each
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link 
                to="/materials" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button 
                    onClick={applyPromoCode}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Apply
                  </button>
                </div>
                {discount > 0 && (
                  <div className="mt-2 text-sm text-green-600">
                    <i className="fas fa-check-circle mr-1"></i>
                    {discount * 100}% discount applied
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount * 100}%)</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-800">Total</span>
                    <span className="text-lg font-bold text-gray-800">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              {shipping === 0 && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-800 text-sm">
                    <i className="fas fa-truck mr-2"></i>
                    Free shipping on orders over ₹50,000
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <Link to="/checkout" className="w-full btn btn-primary mb-4 text-center block">
                <i className="fas fa-lock mr-2"></i>
                Proceed to Checkout
              </Link>

              {/* Security Info */}
              <div className="text-center text-sm text-gray-500">
                <div className="flex items-center justify-center mb-2">
                  <i className="fas fa-shield-alt mr-2"></i>
                  Secure Checkout
                </div>
                <p>Your payment information is encrypted and secure</p>
              </div>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-3">We Accept:</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div className="w-8 h-6 bg-red-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">MC</span>
                  </div>
                  <div className="w-8 h-6 bg-orange-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">UPI</span>
                  </div>
                  <div className="w-8 h-6 bg-green-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">NB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart