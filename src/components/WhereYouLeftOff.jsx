import React from 'react'
import { Link } from 'react-router-dom'
import { useUserActivity } from '../contexts/UserActivityContext'
import { Clock, ArrowRight, Eye } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'

const WhereYouLeftOff = () => {
  const { getWhereLeftOff, getRecentViews, loading } = useUserActivity()

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 flex justify-center">
        <LoadingSpinner variant="glow" size="sm" text="Loading your activity..." />
      </div>
    )
  }

  const whereLeftOff = getWhereLeftOff()
  const recentMaterials = getRecentViews('/materials')
  const recentMachinery = getRecentViews('/machinery')
  const recentJobs = getRecentViews('/jobs')

  const getPageDisplayName = (page) => {
    const pageNames = {
      '/': 'Home',
      '/materials': 'Materials',
      '/machinery': 'Machinery',
      '/jobs': 'Jobs',
      '/moulds': 'Moulds',
      '/chat': 'Chat',
      '/account': 'Account',
      '/cart': 'Shopping Cart',
      '/post-job': 'Post Job',
      '/list-service': 'List Service'
    }
    return pageNames[page] || page
  }

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently'
    
    const now = new Date()
    const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} days ago`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Where You Left Off</h3>
      </div>

      {whereLeftOff && whereLeftOff.page !== '/' && (
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Last visited</p>
                <p className="text-lg font-semibold text-blue-900">
                  {getPageDisplayName(whereLeftOff.page)}
                </p>
                <p className="text-sm text-blue-700">
                  {formatTimeAgo(whereLeftOff.lastActive)}
                </p>
              </div>
              <Link
                to={whereLeftOff.page}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Recent Activity
        </h4>

        {recentMaterials.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Recent Materials</h5>
            <div className="space-y-2">
              {recentMaterials.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">
                    Viewed materials page
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentMachinery.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Recent Machinery</h5>
            <div className="space-y-2">
              {recentMachinery.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">
                    Viewed machinery page
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentJobs.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Recent Jobs</h5>
            <div className="space-y-2">
              {recentJobs.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">
                    Viewed jobs page
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentMaterials.length === 0 && recentMachinery.length === 0 && recentJobs.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">No recent activity to show</p>
            <p className="text-gray-400 text-xs mt-1">Start exploring to see your activity here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WhereYouLeftOff