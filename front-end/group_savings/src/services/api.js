import axios from 'axios';

// Determine if we're in production based on the URL
const isProduction = window.location.protocol === 'https:' || 
                     window.location.hostname.includes('vercel.app');

// Mobile check
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  typeof navigator !== 'undefined' ? navigator.userAgent : ''
);

// Define multiple backend URLs for fallback
const backendUrls = {
  primary: 'https://group-savings-app-production.up.railway.app',
  fallback: 'https://group-savings-app-backup.onrender.com', // Placeholder for a backup service
  local: 'http://localhost:5000'
};

// Use local storage to remember the last working backend
const lastWorkingBackend = localStorage.getItem('lastWorkingBackend') || 'primary';

// Create an instance of axios with custom config
const api = axios.create({
  baseURL: isProduction 
    ? `${backendUrls[lastWorkingBackend]}/api`  // Use remembered backend
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': window.location.origin
  },
  // CORS settings - must be true to send credentials
  withCredentials: true,
  // Set a reasonable timeout (longer for mobile)
  timeout: isMobile ? 45000 : 30000
});

// Offline mode indicator
let isOfflineMode = false;

// Create a simple cache for offline mode
const apiCache = {
  get: (url) => {
    try {
      const cachedData = localStorage.getItem(`api_cache_${url}`);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (e) {
      console.error('Error retrieving from cache:', e);
      return null;
    }
  },
  set: (url, data) => {
    try {
      localStorage.setItem(`api_cache_${url}`, JSON.stringify(data));
    } catch (e) {
      console.error('Error setting cache:', e);
    }
  }
};

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // In offline mode, check cache first (for GET requests)
    if (isOfflineMode && config.method === 'get') {
      // Set a flag to check cache in the response interceptor
      config.checkCache = true;
    }
    
    // Log requests in development only to avoid console spam in production
    if (import.meta.env.DEV) {
      console.log(`API ${config.method.toUpperCase()} Request:`, config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Track if we're currently redirecting to prevent loops
let isRedirecting = false;

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development only
    if (import.meta.env.DEV) {
      console.log(`API Response (${response.status}):`, response.config.url);
    }
    
    // Cache successful GET responses for offline mode
    if (response.config.method === 'get') {
      try {
        apiCache.set(response.config.url, response.data);
      } catch (e) {
        console.error('Error caching response:', e);
      }
    }
    
    return response.data;
  },
  (error) => {
    // Check if this is a GET request and we're in offline mode or experiencing network issues
    if (error.config?.method === 'get' && 
        (isOfflineMode || error.message.includes('Network Error') || error.code === 'ECONNABORTED')) {
      
      // Try to get from cache
      const cachedData = apiCache.get(error.config.url);
      if (cachedData) {
        console.log('Using cached data for:', error.config.url);
        
        // If this is our first network error, try auto-switching to offline mode
        if (!isOfflineMode) {
          console.log('Network unreachable, automatically switching to offline mode');
          isOfflineMode = true;
          
          // Display a notification to the user (using dispatch event so components can listen)
          const offlineEvent = new CustomEvent('api:offline', { 
            detail: { 
              message: 'Network connection lost. Switched to offline mode with cached data.',
              url: error.config.url
            } 
          });
          window.dispatchEvent(offlineEvent);
        }
        
        return Promise.resolve(cachedData);
      }
    }
    
    // Detailed error logging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle expired tokens or authentication errors
    if (error.response && error.response.status === 401) {
      // Clear token on authentication errors
      localStorage.removeItem('token');
      
      // Redirect to login only if we're not already on the login page and not already redirecting
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !isRedirecting) {
        isRedirecting = true;
        window.location.href = '/login';
        // Reset the flag after a delay
        setTimeout(() => {
          isRedirecting = false;
        }, 1000);
      }
    }
    
    // Check for network errors specifically
    if (error.message && error.message.includes('Network Error')) {
      console.error('Network error detected. This could be due to CORS or server unavailability.');
      
      // Log additional diagnostic information
      console.error('Network diagnostic info:', {
        apiBaseURL: api.defaults.baseURL,
        currentURL: window.location.href,
        isProduction: isProduction,
        browserInfo: navigator.userAgent
      });
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout. The server might be overloaded or unavailable.');
    }
    
    // Format and return error messages
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      'Something went wrong';
    
    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
      isNetworkError: error.message && error.message.includes('Network Error'),
      isTimeout: error.code === 'ECONNABORTED'
    });
  }
);

// Add a utility method to test connectivity
api.testConnection = async () => {
  // Try each backend in sequence
  for (const [backendKey, backendUrl] of Object.entries(backendUrls)) {
    if (!isProduction && backendKey !== 'local') continue; // In dev mode, only use local
    
    console.log(`Testing ${backendKey} backend: ${backendUrl}`);
    
    try {
      // Try the main endpoint first with credentials
      const response = await axios({
        method: 'get',
        url: `${backendUrl}`,
        timeout: isMobile ? 45000 : 30000,
        withCredentials: true,
        headers: { 
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache',
          'Origin': window.location.origin
        }
      });
      
      console.log('Root endpoint connection successful:', response.status);
      
      // Then also check the API endpoint with credentials
      try {
        await axios({
          method: 'get',
          url: `${backendUrl}/api`,
          timeout: isMobile ? 45000 : 30000,
          withCredentials: true,
          headers: { 
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Cache-Control': 'no-cache, no-store',
            'Pragma': 'no-cache',
            'Origin': window.location.origin
          }
        });
        
        console.log(`Backend ${backendKey} is working correctly!`);
        
        // Save this as the working backend
        localStorage.setItem('lastWorkingBackend', backendKey);
        
        // Update the API baseURL to use this backend
        api.defaults.baseURL = `${backendUrl}/api`;
        
        return { 
          success: true, 
          backendUsed: backendKey,
          backendUrl: backendUrl,
          status: response.status, 
          data: response.data,
          message: `Connected successfully to ${backendKey} backend`,
          isMobile: isMobile
        };
      } catch (apiError) {
        console.error(`API endpoint on ${backendKey} failed:`, apiError);
        
        // Check if this is a CORS error
        const isCorsError = apiError.message && 
                           (apiError.message.includes('CORS') || 
                            apiError.message.includes('Network Error') || 
                            apiError.message.includes('Access-Control-Allow-Origin'));
        
        if (isCorsError) {
          console.error('CORS error detected when accessing API endpoint:', apiError.message);
          
          // Try again without credentials as a fallback
          try {
            await axios({
              method: 'get',
              url: `${backendUrl}/api`,
              timeout: isMobile ? 45000 : 30000,
              withCredentials: false,
              headers: { 
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Cache-Control': 'no-cache, no-store',
                'Pragma': 'no-cache'
              }
            });
            
            console.log(`Backend ${backendKey} is working without credentials mode!`);
            
            // Since this works without credentials, update the api instance accordingly
            api.defaults.withCredentials = false;
            api.defaults.baseURL = `${backendUrl}/api`;
            localStorage.setItem('lastWorkingBackend', backendKey);
            
            return { 
              success: true, 
              backendUsed: backendKey,
              backendUrl: backendUrl,
              status: response.status, 
              data: response.data,
              message: `Connected successfully to ${backendKey} backend (without credentials)`,
              credentialsMode: 'none',
              isMobile: isMobile
            };
          } catch (fallbackError) {
            console.error('Fallback connection attempt also failed:', fallbackError);
            // Continue to next backend
          }
        }
        // Continue to next backend if this one had API issues
      }
    } catch (rootError) {
      console.error(`Root endpoint on ${backendKey} failed:`, rootError);
      // Continue to next backend if this one failed
    }
  }
  
  // If we get here, all backends failed
  return { 
    success: false, 
    error: 'All backend connections failed',
    message: 'Unable to connect to any backend server',
    attemptedBackends: Object.keys(backendUrls).filter(key => isProduction || key === 'local')
  };
};

// Demo data for offline mode
const demoData = {
  '/api/auth/login': { 
    token: 'demo_token_12345',
    user: {
      id: 'demo-user-123',
      email: 'demo@example.com',
      first_name: 'Demo',
      last_name: 'User',
      role: 'user'
    },
    message: 'Demo login successful' 
  },
  '/api/groups': [
    {
      id: 'demo-group-1',
      name: 'Demo Savings Group',
      description: 'A demo savings group for testing offline mode',
      target_amount: 1000,
      contribution_amount: 100,
      current_amount: 300,
      member_count: 3,
      creator_id: 'demo-user-123',
      created_at: new Date().toISOString()
    }
  ],
  '/api/users/profile': {
    id: 'demo-user-123',
    email: 'demo@example.com',
    first_name: 'Demo',
    last_name: 'User',
    role: 'user',
    is_email_verified: true,
    created_at: new Date().toISOString()
  }
};

// Add functions to control offline mode
api.enableOfflineMode = () => {
  isOfflineMode = true;
  console.log('Offline mode enabled.');
  
  // Add demo data to cache
  Object.entries(demoData).forEach(([url, data]) => {
    apiCache.set(url, data);
  });
  
  return { status: 'success', message: 'Offline mode enabled with demo data' };
};

api.disableOfflineMode = async () => {
  // Test connection first
  const connectionTest = await api.testConnection();
  
  if (connectionTest.success) {
    isOfflineMode = false;
    console.log('Online mode restored. Using backend:', connectionTest.backendUsed);
    return { 
      status: 'success', 
      message: `Online mode restored. Connected to ${connectionTest.backendUsed} backend.`,
      backend: connectionTest.backendUsed
    };
  } else {
    // Stay in offline mode
    console.log('Cannot switch to online mode: No backend available');
    return { 
      status: 'error', 
      message: 'Cannot switch to online mode: No backend available',
      details: connectionTest
    };
  }
};

// Add a utility function to get current status
api.getConnectionStatus = async () => {
  if (isOfflineMode) {
    return { 
      status: 'offline', 
      mode: 'offline', 
      message: 'Using cached data in offline mode'
    };
  }
  
  // Test connection
  try {
    const connectionTest = await api.testConnection();
    if (connectionTest.success) {
      return { 
        status: 'online',
        mode: 'online',
        backend: connectionTest.backendUsed,
        backendUrl: connectionTest.backendUrl,
        message: `Connected to ${connectionTest.backendUsed} backend`
      };
    } else {
      return { 
        status: 'error',
        mode: 'online_but_unreachable',
        message: 'Unable to connect to any backend server',
        details: connectionTest
      };
    }
  } catch (error) {
    return { 
      status: 'error',
      mode: 'unknown',
      message: 'Error checking connection status',
      error: error.message
    };
  }
};

export default api;
