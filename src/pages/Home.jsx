import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import SearchBar from '../components/SearchBar'
import LoadingSpinner from '../components/LoadingSpinner'
import useIndustryNews from '../hooks/useIndustryNews'
import { useAuth } from '../contexts/AuthContext'
import { useAdmin } from '../contexts/AdminContext'
import WhereYouLeftOff from '../components/WhereYouLeftOff'
import AdBannerCarousel from '../components/AdBannerCarousel'
// Removed Sponsors section; SafeImage and WebSocket no longer needed here

const Home = () => {
  const { currentUser } = useAuth()
  const { testimonials } = useAdmin()
  const { news: newsItems, loading: newsLoading, error: newsError } = useIndustryNews()
  const services = [
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Manpower',
      description: 'Find skilled professionals for your plastics business',
      link: '/jobs'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      ),
      title: 'Machineries',
      description: 'Discover wide range of machinery for plastics manufacturing',
      link: '/machinery'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
      title: 'Material',
      description: 'Source high-quality materials for your production needs',
      link: '/materials'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      title: 'Mould Design and Makers',
      description: 'Connect with experts in mould design and manufacturing',
      link: '/moulds'
    }
  ]

  const forumPosts = [
    {
      avatar: 'JD',
      name: 'John Doe',
      category: 'Injection Molding Techniques',
      title: 'Anyone have tips for reducing cycle time on ABS parts?',
      time: '1 day ago',
      replies: 5
    },
    {
      avatar: 'AS',
      name: 'Alex Smith',
      category: 'Material Sourcing',
      title: 'Looking for a reliable supplier of virgin impact polystyrene (HIPS)',
      time: '1 day ago',
      replies: 1
    },
    {
      avatar: 'MK',
      name: 'Maria K.',
      category: 'Machine Maintenance',
      title: 'Troubleshooting a hydraulic leak on a 50-ton press',
      time: '2 days ago',
      replies: 8
    }
  ]

  // WebSocket listeners for real-time updates
  // Removed sponsors WebSocket update effect

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-primary to-blue-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              India's First Online Plastics Market
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              Connecting plastics professionals with their industrial requirements. 
              Find manpower, machinery, materials, and mould design services all in one place.
            </p>
            
            <div className="max-w-2xl mx-auto">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* Where You Left Off Section - Only for logged-in users */}
      {currentUser && (
        <section className="py-8 bg-gray-50">
          <div className="container">
            <WhereYouLeftOff />
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            Our Key Services
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Link
                key={index}
                to={service.link}
                className="card p-6 text-center group hover:scale-105 transition-all duration-300"
              >
                <div className="text-primary mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors Section removed as requested */}

      {/* Mobile Ad Banner Section */}
      <section className="py-8 bg-white xl:hidden">
        <div className="container">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sponsored</h3>
            <div className="flex justify-center">
              <AdBannerCarousel 
                width={300}
                className="max-w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Community Forum Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 gap-8">
            {/* Ad Banner - Left Side (Desktop) */}
            <div className="hidden xl:block xl:col-span-1 order-1">
              <div className="sticky top-24">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sponsored</h3>
                <AdBannerCarousel 
                  width={280}
                  className="w-full"
                />
              </div>
            </div>

            {/* Forum Posts */}
            <div className="xl:col-span-2 lg:col-span-2 order-2">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Community Forum</h2>
                <Link to="/forum" className="text-primary hover:text-blue-600 font-medium">
                  View All
                </Link>
              </div>
              
              <div className="space-y-6">
                {forumPosts.map((post, index) => (
                  <div key={index} className="card p-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                        {post.avatar}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{post.name}</h4>
                        <p className="text-sm text-primary mb-2">Posted in {post.category}</p>
                        <p className="text-gray-700 mb-3">{post.title}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{post.time}</span>
                          <span>{post.replies} Replies</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="btn btn-primary mt-6">
                Start a New Discussion
              </button>
            </div>

            {/* Industry News */}
            <div className="xl:col-span-1 lg:col-span-1 order-3">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Industry News</h3>
              
              {newsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner variant="pulse" text="Loading industry news..." />
                </div>
              ) : newsError ? (
                <div className="card p-4 text-center text-gray-600">
                  <p className="mb-2">Unable to load latest news</p>
                  <p className="text-sm">Showing curated industry updates</p>
                </div>
              ) : null}
              
              <div className="space-y-4">
                {newsItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target={item.url !== '#' ? '_blank' : '_self'}
                    rel={item.url !== '#' ? 'noopener noreferrer' : ''}
                    className="card p-4 hover:shadow-lg transition-shadow duration-300 block group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-primary mt-1 group-hover:scale-110 transition-transform duration-200">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-primary transition-colors duration-200">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{item.source}</span>
                          <span>{item.publishedAt}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
              
              <Link to="/news" className="inline-block mt-6 text-primary hover:text-blue-600 font-medium">
                View All News
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="card p-6 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-primary/20"
                  />
                </div>
                <div className="mb-4">
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm mb-3 italic">"{testimonial.testimonial}"</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home