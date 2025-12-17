/**
 * GNews API service for fetching industry news
 */

const API_KEY = import.meta.env.VITE_GNEWS_API_KEY;
const BASE_URL = 'https://gnews.io/api/v4';

/**
 * Fetch top headlines from GNews API
 * @param {Object} options - Query options
 * @param {string} options.lang - Language code (default: 'en')
 * @param {string} options.country - Country code (default: 'in')
 * @param {number} options.max - Maximum number of articles (default: 10)
 * @param {string} options.q - Search query
 * @returns {Promise<Object>} - { data: Article[], loading: boolean, error: string|null }
 */
export const getTopHeadlines = async ({ 
  lang = 'en', 
  country = 'in', 
  max = 10, 
  q = 'plastics industry manufacturing' 
} = {}) => {
  try {
    if (!API_KEY) {
      throw new Error('GNews API key not found. Please check your environment variables.');
    }

    const params = new URLSearchParams({
      token: API_KEY,
      lang,
      country,
      max: Math.min(max, 10), // GNews free tier limit
      q
    });

    const response = await fetch(`${BASE_URL}/top-headlines?${params}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.articles) {
      throw new Error('Invalid response format from GNews API');
    }

    // Normalize the data structure
    const normalizedArticles = data.articles.map((article, index) => ({
      id: article.url || `article-${index}`, // Use URL as unique ID
      title: article.title || 'Untitled',
      description: article.description || '',
      url: article.url || '#',
      image: article.image || '/images/placeholder.svg',
      source: article.source?.name || 'Unknown Source',
      publishedAt: article.publishedAt || new Date().toISOString()
    }));

    return {
      data: normalizedArticles,
      loading: false,
      error: null
    };

  } catch (error) {
    console.error('GNews API Error:', error);
    
    return {
      data: [],
      loading: false,
      error: error.message || 'Failed to fetch news articles'
    };
  }
};

/**
 * Fetch search results from GNews API
 * @param {Object} options - Query options
 * @param {string} options.q - Search query (required)
 * @param {string} options.lang - Language code (default: 'en')
 * @param {string} options.country - Country code (default: 'in')
 * @param {number} options.max - Maximum number of articles (default: 10)
 * @returns {Promise<Object>} - { data: Article[], loading: boolean, error: string|null }
 */
export const searchNews = async ({ 
  q, 
  lang = 'en', 
  country = 'in', 
  max = 10 
}) => {
  if (!q) {
    return {
      data: [],
      loading: false,
      error: 'Search query is required'
    };
  }

  return getTopHeadlines({ lang, country, max, q });
};

/**
 * Get industry-specific news with fallback topics
 * @param {number} max - Maximum number of articles (default: 10)
 * @returns {Promise<Object>} - { data: Article[], loading: boolean, error: string|null }
 */
export const getIndustryNews = async (max = 10) => {
  const industryQueries = [
    'plastics manufacturing industry',
    'polymer technology',
    'injection molding',
    'plastic recycling',
    'petrochemicals'
  ];

  // Try each query until we get results
  for (const query of industryQueries) {
    try {
      const result = await getTopHeadlines({ q: query, max });
      if (result.data && result.data.length > 0) {
        return result;
      }
    } catch (error) {
      console.warn(`Failed to fetch news for query: ${query}`, error);
    }
  }

  // If all queries fail, return general business news
  return getTopHeadlines({ q: 'business manufacturing', max });
};