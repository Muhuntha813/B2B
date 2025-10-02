import { useState } from 'react'
import AdBannerCarousel from '../components/AdBannerCarousel'

const Forum = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Categories', count: 45 },
    { id: 'injection-molding', name: 'Injection Molding', count: 12 },
    { id: 'material-sourcing', name: 'Material Sourcing', count: 8 },
    { id: 'machine-maintenance', name: 'Machine Maintenance', count: 15 },
    { id: 'quality-control', name: 'Quality Control', count: 6 },
    { id: 'business-tips', name: 'Business Tips', count: 4 }
  ]

  const forumPosts = [
    {
      id: 1,
      avatar: 'JD',
      name: 'John Doe',
      category: 'Injection Molding Techniques',
      title: 'Anyone have tips for reducing cycle time on ABS parts?',
      content: 'I\'m working with ABS injection molding and looking to optimize cycle times. Currently running at 45 seconds per part but wondering if there are ways to reduce this without compromising quality.',
      time: '1 day ago',
      replies: 5,
      views: 124,
      tags: ['ABS', 'cycle-time', 'optimization'],
      isAnswered: false,
      isPinned: false
    },
    {
      id: 2,
      avatar: 'AS',
      name: 'Alex Smith',
      category: 'Material Sourcing',
      title: 'Looking for a reliable supplier of virgin impact polystyrene (HIPS)',
      content: 'Need to source high-quality HIPS for automotive interior parts. Looking for suppliers who can provide consistent quality and competitive pricing.',
      time: '1 day ago',
      replies: 1,
      views: 89,
      tags: ['HIPS', 'supplier', 'automotive'],
      isAnswered: true,
      isPinned: false
    },
    {
      id: 3,
      avatar: 'MK',
      name: 'Maria K.',
      category: 'Machine Maintenance',
      title: 'Troubleshooting a hydraulic leak on a 50-ton press',
      content: 'Experiencing hydraulic fluid leaks on our 50-ton injection molding press. The leak appears to be coming from the main cylinder area. Any suggestions for diagnosis and repair?',
      time: '2 days ago',
      replies: 8,
      views: 256,
      tags: ['hydraulic', 'maintenance', 'troubleshooting'],
      isAnswered: true,
      isPinned: true
    },
    {
      id: 4,
      avatar: 'RJ',
      name: 'Raj Patel',
      category: 'Quality Control',
      title: 'Best practices for dimensional accuracy in precision molding',
      content: 'Working on precision medical device components. What are the key factors to maintain tight dimensional tolerances consistently?',
      time: '3 days ago',
      replies: 12,
      views: 342,
      tags: ['precision', 'medical', 'quality'],
      isAnswered: true,
      isPinned: false
    },
    {
      id: 5,
      avatar: 'LW',
      name: 'Lisa Wang',
      category: 'Business Tips',
      title: 'How to price custom molding services competitively?',
      content: 'New to the custom molding business. Looking for advice on pricing strategies that are competitive yet profitable.',
      time: '4 days ago',
      replies: 6,
      views: 178,
      tags: ['pricing', 'business', 'custom-molding'],
      isAnswered: false,
      isPinned: false
    },
    {
      id: 6,
      avatar: 'DM',
      name: 'David Miller',
      category: 'Material Sourcing',
      title: 'Sustainable plastic alternatives for packaging',
      content: 'Client is requesting eco-friendly packaging solutions. What are the best biodegradable or recyclable plastic alternatives available?',
      time: '5 days ago',
      replies: 9,
      views: 298,
      tags: ['sustainable', 'packaging', 'eco-friendly'],
      isAnswered: true,
      isPinned: false
    }
  ]

  const filteredPosts = forumPosts.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || 
      post.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Sort posts: pinned first, then by time
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.time) - new Date(a.time)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Forum</h1>
            <p className="text-lg text-gray-600">
              Connect with industry professionals, share knowledge, and get answers to your plastics manufacturing questions.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Desktop Layout: Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          {/* Left Sidebar - Ad Banner (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <AdBannerCarousel 
                images={[
                  '/placeholder-ad.svg',
                  '/placeholder-ad.svg',
                  '/placeholder-ad.svg'
                ]}
                intervalMs={5000}
                width={300}
                className="mb-6"
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="max-w-4xl">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                {/* Search Bar */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search discussions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* New Discussion Button */}
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                  Start New Discussion
                </button>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Results Summary */}
            {searchTerm && (
              <div className="mb-4">
                <p className="text-gray-600">
                  Found {sortedPosts.length} discussions matching "{searchTerm}"
                </p>
              </div>
            )}

            {/* Forum Posts */}
            <div className="space-y-4">
              {sortedPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                      {post.avatar}
                    </div>

                    {/* Post Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{post.name}</h3>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-blue-600">{post.category}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{post.time}</span>
                        {post.isPinned && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                            </svg>
                            Pinned
                          </span>
                        )}
                        {post.isAnswered && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Answered
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                        {post.title}
                      </h2>

                      {/* Content Preview */}
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {post.content}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {post.replies} replies
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {post.views} views
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {sortedPosts.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No discussions found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? `No discussions match "${searchTerm}"` : 'No discussions in this category'}
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                  Start the First Discussion
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile/Tablet Ad Banner - Below content */}
        <div className="lg:hidden mt-8">
          <AdBannerCarousel 
            images={[
              '/placeholder-ad.svg',
              '/placeholder-ad.svg',
              '/placeholder-ad.svg'
            ]}
            intervalMs={5000}
            width={300}
            className="mx-auto"
          />
        </div>
      </div>
    </div>
  )
}

export default Forum