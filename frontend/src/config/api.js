/**
 * Dynamic API Base URL Configuration
 * Automatically detects network IP when accessed from another device
 */

// Try to get network IP from various sources
const getNetworkIP = () => {
  if (typeof window === 'undefined') return null;
  
  // Method 1: Use current page hostname if it's an IP
  const hostname = window.location.hostname;
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return hostname;
  }
  
  // Method 2: Try to get from Vite's network URL hint
  // Vite sets this in development mode
  if (import.meta.env.DEV) {
    // Check if we can infer from the current URL
    const url = new URL(window.location.href);
    if (url.hostname && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      return url.hostname;
    }
  }
  
  return null;
};

// Cache the API base URL to avoid recalculating on every call
let cachedApiBaseUrl = null;
let lastCheckedUrl = null;
const DEBUG_API_CONFIG = false; // Set to true to enable debug logs

const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:3002/api';
  }

  const currentUrl = window.location.href;
  
  // Return cached value if URL hasn't changed
  if (cachedApiBaseUrl && lastCheckedUrl === currentUrl) {
    return cachedApiBaseUrl;
  }
  
  lastCheckedUrl = currentUrl;
  const hostname = window.location.hostname;
  
  if (DEBUG_API_CONFIG) {
    console.log('[API Config] ==========================================');
    console.log('[API Config] Full URL:', currentUrl);
    console.log('[API Config] hostname:', hostname);
  }
  
  // Priority 1: Parse IP directly from URL string (MOST RELIABLE)
  // This works even if hostname is wrong
  const ipMatch = currentUrl.match(/https?:\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
  if (ipMatch && ipMatch[1]) {
    const detectedIP = ipMatch[1];
    const apiUrl = `http://${detectedIP}:3002/api`;
    if (DEBUG_API_CONFIG) {
      console.log('[API Config] ✅✅✅ DETECTED IP FROM URL:', detectedIP);
      console.log('[API Config] ✅✅✅ USING API URL:', apiUrl);
      console.log('[API Config] ==========================================');
    }
    cachedApiBaseUrl = apiUrl;
    return apiUrl;
  }
  
  // Priority 2: Check for manual override in localStorage
  const manualIP = localStorage.getItem('API_BASE_IP');
  if (manualIP) {
    const apiUrl = `http://${manualIP}:3002/api`;
    if (DEBUG_API_CONFIG) {
      console.log('[API Config] ✅ Using manual IP override:', apiUrl);
      console.log('[API Config] ==========================================');
    }
    cachedApiBaseUrl = apiUrl;
    return apiUrl;
  }
  
  // Priority 3: Check URL parameter (e.g., ?api_ip=10.3.90.215)
  const urlParams = new URLSearchParams(window.location.search);
  const apiIP = urlParams.get('api_ip');
  if (apiIP) {
    const apiUrl = `http://${apiIP}:3002/api`;
    localStorage.setItem('API_BASE_IP', apiIP); // Save for future use
    if (DEBUG_API_CONFIG) {
      console.log('[API Config] ✅ Using IP from URL parameter:', apiUrl);
      console.log('[API Config] ==========================================');
    }
    cachedApiBaseUrl = apiUrl;
    return apiUrl;
  }
  
  // Priority 4: Environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    if (DEBUG_API_CONFIG) {
      console.log('[API Config] Using environment variable:', import.meta.env.VITE_API_BASE_URL);
      console.log('[API Config] ==========================================');
    }
    cachedApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Priority 5: Use hostname if it's an IP address
  if (hostname && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    const apiUrl = `http://${hostname}:3002/api`;
    if (DEBUG_API_CONFIG) {
      console.log('[API Config] ✅ Using network IP from hostname:', apiUrl);
      console.log('[API Config] ==========================================');
    }
    cachedApiBaseUrl = apiUrl;
    return apiUrl;
  }
  
  // Priority 6: If hostname is not localhost
  if (hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== '') {
    const apiUrl = `http://${hostname}:3002/api`;
    if (DEBUG_API_CONFIG) {
      console.log('[API Config] ✅ Using hostname (non-localhost):', apiUrl);
      console.log('[API Config] ==========================================');
    }
    cachedApiBaseUrl = apiUrl;
    return apiUrl;
  }
  
  if (DEBUG_API_CONFIG) {
    console.log('[API Config] ⚠️ WARNING: Using localhost fallback');
    console.log('[API Config] hostname:', hostname);
    console.log('[API Config] currentUrl:', currentUrl);
    console.log('[API Config] 💡 QUICK FIX: Add ?api_ip=10.3.90.215 to URL');
    console.log('[API Config] ==========================================');
  }
  cachedApiBaseUrl = 'http://localhost:3002/api';
  return 'http://localhost:3002/api';
};

// Make it a function so it's evaluated dynamically, but with caching
export const getApiBaseUrlDynamic = () => getApiBaseUrl();

// Export static value for backward compatibility
export const API_BASE_URL = getApiBaseUrl();
if (DEBUG_API_CONFIG) {
  console.log('[API Config] Initial API_BASE_URL:', API_BASE_URL);
}

// Export function to get WebSocket URL (without /api)
export const getWebSocketUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace('/api', '');
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:3002`;
    }
  }

  return 'http://localhost:3002';
};

export default API_BASE_URL;

