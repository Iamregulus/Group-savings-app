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
  
  const rootUrl = isProduction
    ? 'https://group-savings-app-production.up.railway.app'
    : 'http://localhost:5000';
  
  console.log('Testing API connection...');
  
  // Test results
  const results = {
    root: null,
    api: null
  };
  
  // Test root endpoint
  try {
    console.log('Testing root endpoint:', rootUrl);
    const rootResponse = await axios.get(rootUrl, { 
      timeout: 5000,
      headers: { 'Accept': 'application/json' }
    });
    console.log('Root endpoint connection successful:', rootResponse.data);
    results.root = { success: true, data: rootResponse.data };
  } catch (error) {
    console.error('Root endpoint connection failed:', error);
    results.root = { 
      success: false, 
      error: error.message,
      details: {
        code: error.code,
        response: error.response,
        request: !!error.request
      }
    };
  }
  
  // Test API endpoint
  try {
    console.log('Testing API endpoint:', apiUrl);
    const apiResponse = await axios.get(`${apiUrl}`, { 
      timeout: 5000,
      headers: { 'Accept': 'application/json' }
    });
    console.log('API endpoint connection successful:', apiResponse.data);
    results.api = { success: true, data: apiResponse.data };
  } catch (error) {
    console.error('API endpoint connection failed:', error);
    results.api = { 
      success: false, 
      error: error.message,
      details: {
        code: error.code,
        response: error.response,
        request: !!error.request
      }
    };
  }
  
  return results;
};

// Make the function available in the browser console for easy debugging
if (typeof window !== 'undefined') {
  window.testApiConnection = testApiConnection;
}

export default { testApiConnection }; 