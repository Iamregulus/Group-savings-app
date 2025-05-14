import axios from 'axios';

/**
 * Utility function to test API connectivity
 * This can be imported and used in the browser console for debugging
 */
export const testApiConnection = async () => {
  // Determine if we're in production based on the URL
  const isProduction = window.location.protocol === 'https:' || 
                       window.location.hostname.includes('vercel.app');
  
  const apiUrl = isProduction 
    ? 'https://group-savings-app-production.up.railway.app/api'
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
  
  console.log('Testing API connection to:', apiUrl);
  
  try {
    const response = await axios.get(apiUrl, { 
      timeout: 5000,
      headers: { 'Accept': 'application/json' }
    });
    console.log('API connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('API connection failed:', error);
    
    // Check for specific error types
    if (error.code === 'ECONNABORTED') {
      console.error('Connection timed out. The server might be down or unreachable.');
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Server responded with error:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. CORS issue or server down.');
    }
    
    return { 
      success: false, 
      error: error.message,
      details: {
        code: error.code,
        response: error.response,
        request: !!error.request
      }
    };
  }
};

// Make the function available in the browser console for easy debugging
if (typeof window !== 'undefined') {
  window.testApiConnection = testApiConnection;
}

export default { testApiConnection }; 