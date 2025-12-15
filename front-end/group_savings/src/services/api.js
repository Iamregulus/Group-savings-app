import axios from 'axios';

const defaultApiUrl = import.meta.env.DEV 
  ? 'http://localhost:5000/api' 
  : 'https://group-savings-app.onrender.com/api';

// Create an instance of axios with custom config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  // CORS settings - must be true to send credentials
  withCredentials: true,
  // Set a reasonable timeout
  timeout: 30000
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    
    return response.data;
  },
  (error) => {
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

export default api;
