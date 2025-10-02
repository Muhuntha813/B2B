import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import AdBannerCarousel from '../components/AdBannerCarousel'
import SafeImage from '../components/SafeImage'
import { getIndustryNews } from '../services/news'

const News = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const newsPerPage = 12

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Using GNews API service
        const result = await getIndustryNews(50)
        
        if (result.error) {
          throw new Error(result.error)
        }
        
        if (result.data && result.data.length > 0) {
          // Format the data for display
          const formattedNews = result.data.map(article => ({
            id: article.id,
            title: article.title,
            description: article.description,
            content: article.description, // GNews doesn't provide full content
            url: article.url,
            urlToImage: article.image,
            publishedAt: new Date(article.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            source: article.source,
            author: null // GNews doesn't provide author info
          }))
          
          setNews(formattedNews)
        } else {
          throw new Error('No articles found')
        }
      } catch (err) {
        console.warn('Failed to fetch news from GNews API, using fallback data:', err.message)
        setError(err.message)
        
        // Enhanced fallback to curated industry news with images
        setNews([
          {
            id: '1',
            title: 'Revolutionary Biodegradable Polymer Breakthrough Changes Industry Standards',
            description: 'Scientists at leading research institutions have developed a groundbreaking biodegradable plastic that completely decomposes within 6 months under normal environmental conditions.',
            content: 'This revolutionary polymer breakthrough represents a significant step forward in sustainable packaging solutions. The new material maintains the durability and flexibility of traditional plastics while offering complete biodegradability.',
            url: '#',
            urlToImage: '/placeholder-news.svg',
            publishedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            source: 'Plastics Today',
            author: 'Dr. Sarah Chen'
          },
          {
            id: '2',
            title: 'India Plastic Manufacturing Sector Shows Unprecedented 15% Growth in Q4 2024',
            description: 'The Indian plastic manufacturing industry demonstrates remarkable resilience and growth, driven by increased automotive demand and infrastructure development projects.',
            content: 'Industry analysts report that the growth is primarily attributed to government initiatives promoting Make in India and increased demand from automotive and construction sectors.',
            url: '#',
            urlToImage: '/placeholder-news.svg',
            publishedAt: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            source: 'Industry Week',
            author: 'Rajesh Kumar'
          },
          {
            id: '3',
            title: 'Sustainable Packaging Revolution: New EU Regulations Drive Innovation',
            description: 'European Union introduces comprehensive regulations pushing companies toward eco-friendly plastic alternatives and circular economy practices.',
            content: 'The new regulations mandate significant reductions in single-use plastics and promote innovative recycling technologies across member states.',
            url: '#',
            urlToImage: '/placeholder-news.svg',
            publishedAt: new Date(Date.now() - 172800000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            source: 'Packaging World',
            author: 'Maria Rodriguez'
          },
          {
            id: '4',
            title: 'Mumbai Plastics Expo 2024: Largest Trade Show Showcases Future Technologies',
            description: 'The biggest plastics trade show in India brings together industry leaders to showcase cutting-edge innovations, sustainable solutions, and emerging technologies.',
            content: 'Over 500 exhibitors from 40 countries participated in this year\'s expo, highlighting advances in injection molding, 3D printing, and recycling technologies.',
            url: '#',
            urlToImage: '/placeholder-news.svg',
            publishedAt: new Date(Date.now() - 259200000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            source: 'Trade Show News',
            author: 'Amit Sharma'
          },
          {
            id: '5',
            title: 'Advanced Injection Molding Techniques Reduce Production Costs by 30%',
            description: 'New precision molding technologies and AI-driven process optimization are revolutionizing manufacturing efficiency in the plastics industry.',
            content: 'Companies implementing these advanced techniques report significant cost savings while maintaining superior product quality and reducing material waste.',
            url: '#',
            urlToImage: '/placeholder-news.svg',
            publishedAt: new Date(Date.now() - 345600000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            source: 'Manufacturing Today',
            author: 'Jennifer Liu'
          },
          {
            id: '6',
            title: 'Circular Economy in Plastics: Recycling Technologies Reach New Milestones',
            description: 'Breakthrough recycling technologies enable the processing of previously non-recyclable plastics, moving the industry closer to a circular economy.',
            content: 'These innovations include chemical recycling processes that can handle mixed plastic waste and convert it back to virgin-quality materials.',
            url: '#',
            urlToImage: '/placeholder-news.svg',
            publishedAt: new Date(Date.now() - 432000000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            source: 'Environmental Science Today',
            author: 'Dr. Michael Green'
          },
          {
            id: '7',
            title: 'Smart Manufacturing: IoT Integration Transforms Plastic Production Lines',
            description: 'Internet of Things (IoT) sensors and smart monitoring systems are revolutionizing quality control and predictive maintenance in plastic manufacturing.',
            content: 'Real-time data analytics and machine learning algorithms help manufacturers optimize production parameters and reduce downtime significantly.',
            url: '#',
            urlToImage: '/placeholder-news.svg',
            publishedAt: new Date(Date.now() - 518400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            source: 'Smart Manufacturing',
            author: 'David Park'
          },
          {
            id: '8',
            title: 'Bioplastics Market Expected to Reach $27 Billion by 2025',
            description: 'Market research indicates explosive growth in the bioplastics sector, driven by consumer demand for sustainable alternatives and regulatory support.',
            content: 'The growth is fueled by innovations in plant-based polymers and increased adoption across packaging, automotive, and consumer goods industries.',
            url: '#',
            urlToImage: '/placeholder-news.svg',
            publishedAt: new Date(Date.now() - 604800000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            source: 'Market Research Today',
            author: 'Lisa Thompson'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  // Filter news based on search term
  const filteredNews = news.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.source.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredNews.length / newsPerPage)
  const startIndex = (currentPage - 1) * newsPerPage
  const endIndex = startIndex + newsPerPage
  const currentNews = filteredNews.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary">
        <div className="container py-20">
          <div className="text-center">
            <LoadingSpinner size="lg" variant="flip" text="Loading latest industry news..." />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Industry News & Updates
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Stay informed with the latest developments in the plastics industry
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center text-primary-100 hover:text-white transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search news articles..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <svg 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <p className="mt-2 text-sm text-gray-600">
                Found {filteredNews.length} articles matching "{searchTerm}"
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="py-12">
        <div className="container">
          {/* Desktop Layout: Two-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
            {/* Left Sidebar - Ad Banner (Desktop) */}
            <div className="hidden lg:block">
              <div className="sticky top-8">
                <AdBannerCarousel 
                   images={[
                     '/placeholder-ad.svg',
                     '/placeholder-ad.svg',
                     '/placeholder-ad.svg',
                     '/placeholder-ad.svg'
                   ]}
                   intervalMs={4000}
                   width={300}
                   className="mb-6"
                 />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-6xl">
              {error && (
                <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-yellow-800">
                      Unable to fetch live news from GNews API. Showing curated industry updates.
                    </p>
                  </div>
                </div>
              )}

              {currentNews.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
                  <p className="text-gray-500">Try adjusting your search terms</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 stagger-animation">
                {currentNews.map((article, index) => (
                  <article 
                    key={article.id} 
                    className="card overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative h-48 overflow-hidden">
                       <SafeImage
                         src={article.urlToImage}
                         alt={article.title}
                         fallbackSrc="/placeholder-news.svg"
                         className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                       />
                       <div className="absolute top-4 left-4">
                        <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {article.source}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {article.publishedAt}
                        {article.author && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{article.author}</span>
                          </>
                        )}
                      </div>
                      
                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        {article.title}
                      </h2>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {article.description}
                      </p>
                      
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                      >
                        Read Full Article
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </article>
                ))}
              </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-12">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 border rounded-lg transition-colors duration-200 ${
                              currentPage === page
                                ? 'bg-primary-500 text-white border-primary-500'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Mobile/Tablet Ad Banner */}
          <div className="lg:hidden mt-12">
            <AdBannerCarousel 
               images={[
                 '/placeholder-banner.svg',
                 '/placeholder-banner.svg',
                 '/placeholder-banner.svg',
                 '/placeholder-banner.svg'
               ]}
               intervalMs={4000}
               width="100%"
               height={200}
               className="rounded-lg"
             />
          </div>
        </div>
      </section>
    </div>
  )
}

export default News