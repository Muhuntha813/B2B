import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import useIndustryNews from '../hooks/useIndustryNews'

const Home = () => {
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

      {/* Community Forum Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Forum Posts */}
            <div className="lg:col-span-2">
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
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Industry News</h3>
              
              {newsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="card p-4 animate-pulse">
                      <div className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-gray-300 rounded mt-1"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
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

      {/* Sponsors Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Sponsors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((sponsor) => (
              <div key={sponsor} className="card p-8 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-600 font-medium">SPONSOR</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home