import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { cartService } from '../services/cartService'

const Checkout = () => {
  const { items, getCartTotal, clearCart } = useCart()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canCheckout = items.length > 0 && (!!currentUser?.uid)

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  const placeOrder = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await cartService.checkout(currentUser.uid, { address, paymentMethod })
      clearCart()
      navigate(`/order-confirmation?orderId=${result.orderId}`)
    } catch (e) {
      console.error(e)
      setError(e.message || 'Checkout failed. Please check if you have buying permission approved.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={4}
                placeholder="Enter your shipping address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <h2 className="text-lg font-semibold mt-6 mb-2">Payment Method</h2>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="cod">Cash on Delivery</option>
                <option value="card">Card (placeholder)</option>
                <option value="upi">UPI (placeholder)</option>
              </select>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between text-sm">
                    <span>{it.name} × {it.quantity}</span>
                    <span>{formatCurrency(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-semibold text-gray-800">
                <span>Total</span>
                <span>{formatCurrency(getCartTotal())}</span>
              </div>
              {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
              <button
                onClick={placeOrder}
                disabled={!canCheckout || loading}
                className={`mt-4 w-full btn btn-primary ${(!canCheckout || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Placing order...' : 'Place Order'}
              </button>
              {!currentUser?.uid && (
                <p className="text-xs text-gray-500 mt-2">Login required to checkout</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout