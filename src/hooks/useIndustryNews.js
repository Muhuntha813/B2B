import { useState, useEffect } from 'react'

const useIndustryNews = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Try multiple APIs for better reliability
        const apis = [
          // GNews API - more reliable alternative
          {
            name: 'GNews',
            url: `https://gnews.io/api/v4/search?q=plastics OR polymer OR manufacturing OR "injection molding" OR "plastic industry"&lang=en&country=any&max=6&apikey=demo`,
            parser: (data) => data.articles?.map(article => ({
              id: article.url,
              title: article.title.length > 60 ? article.title.substring(0, 60) + '...' : article.title,
              description: article.description.length > 100 ? article.description.substring(0, 100) + '...' : article.description,
              url: article.url,
              urlToImage: article.image,
              publishedAt: new Date(article.publishedAt).toLocaleDateString(),
              source: article.source.name
            }))
          },
          // NewsAPI as fallback
          {
            name: 'NewsAPI',
            url: `https://newsapi.org/v2/everything?q=plastics OR polymer OR manufacturing&language=en&sortBy=publishedAt&pageSize=6&apiKey=demo`,
            parser: (data) => data.articles?.filter(article => article.title && article.description)
              .slice(0, 4)
              .map(article => ({
                id: article.url,
                title: article.title.length > 60 ? article.title.substring(0, 60) + '...' : article.title,
                description: article.description.length > 100 ? article.description.substring(0, 100) + '...' : article.description,
                url: article.url,
                urlToImage: article.urlToImage,
                publishedAt: new Date(article.publishedAt).toLocaleDateString(),
                source: article.source.name
              }))
          }
        ]
        
        let newsData = null
        let lastError = null
        
        // Try each API until one works
        for (const api of apis) {
          try {
            const response = await fetch(api.url)
            
            if (response.ok) {
              const data = await response.json()
              const parsedNews = api.parser(data)
              
              if (parsedNews && parsedNews.length > 0) {
                newsData = parsedNews
                break
              }
            }
          } catch (apiError) {
            lastError = apiError
            console.warn(`${api.name} API failed:`, apiError.message)
          }
        }
        
        if (newsData) {
          setNews(newsData)
        } else {
          throw new Error(lastError?.message || 'All news APIs failed')
        }
      } catch (err) {
        console.warn('Failed to fetch news, using fallback data:', err.message)
        setError(err.message)
        
        // Enhanced fallback to curated industry news with images
        setNews([
          {
            id: '1',
            title: 'Revolutionary Biodegradable Polymer Breakthrough Changes Industry Standards',
            description: 'Scientists develop groundbreaking biodegradable plastic that decomposes in 6 months under normal conditions',
            url: '#',
            urlToImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=400&fit=crop',
            publishedAt: new Date().toLocaleDateString(),
            source: 'Plastics Today'
          },
          {
            id: '2',
            title: 'India Plastic Manufacturing Sector Shows Unprecedented 15% Growth',
            description: 'Indian plastic industry demonstrates remarkable resilience with record growth driven by automotive demand',
            url: '#',
            urlToImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop',
            publishedAt: new Date(Date.now() - 86400000).toLocaleDateString(),
            source: 'Industry Week'
          },
          {
            id: '3',
            title: 'Sustainable Packaging Revolution: New EU Regulations Drive Innovation',
            description: 'European regulations push companies toward eco-friendly alternatives and circular economy practices',
            url: '#',
            urlToImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop',
            publishedAt: new Date(Date.now() - 172800000).toLocaleDateString(),
            source: 'Packaging World'
          },
          {
            id: '4',
            title: 'Mumbai Plastics Expo 2024: Largest Trade Show Showcases Future Technologies',
            description: 'Biggest plastics trade show in India brings together industry leaders to showcase innovations',
            url: '#',
            urlToImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
            publishedAt: new Date(Date.now() - 259200000).toLocaleDateString(),
            source: 'Trade Show News'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  return { news, loading, error }
}

export default useIndustryNews