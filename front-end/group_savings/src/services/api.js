import axios from 'axios';

// Create an instance of axios with custom config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`API ${config.method.toUpperCase()} Request:`, config.url, config.data || {});
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
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`API Response (${response.status}):`, response.config.url, response.data);
    }
    return response.data;
  },
  (error) => {
    // Log detailed error information
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
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
    
    // Format and return error messages
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      'Something went wrong';
    
    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data
    });
  }
);

export default api;
