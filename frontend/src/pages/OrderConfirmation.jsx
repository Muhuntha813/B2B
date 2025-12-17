import React from 'react'
import { useLocation, Link } from 'react-router-dom'

const OrderConfirmation = () => {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const orderId = params.get('orderId')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-white rounded-lg shadow-sm p-8 mx-auto max-w-xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Confirmed</h1>
          <p className="text-gray-600 mb-6">Thank you for your purchase! Your order has been created successfully.</p>
          {orderId && (
            <p className="text-gray-800 font-semibold mb-6">Order ID: #{orderId}</p>
          )}
          <div className="space-x-3">
            <Link to="/" className="btn btn-primary">Go to Home</Link>
            <Link to="/cart" className="btn btn-secondary">View Cart</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation