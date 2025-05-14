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
  console.log('Environment:', isProduction ? 'Production' : 'Development');
  console.log('Root URL:', rootUrl);
  console.log('API URL:', apiUrl);
  
  // Test results
  const results = {
    environment: isProduction ? 'production' : 'development',
    timestamp: new Date().toISOString(),
    browserInfo: navigator.userAgent,
    root: null,
    api: null,
    authTest: null
  };
  
  // Test root endpoint
  try {
    console.log('Testing root endpoint:', rootUrl);
    const rootResponse = await axios.get(rootUrl, { 
      timeout: 5000,
      headers: { 'Accept': 'application/json' }
    });
    console.log('Root endpoint connection successful:', rootResponse.status);
    results.root = { 
      success: true, 
      status: rootResponse.status,
      statusText: rootResponse.statusText,
      data: rootResponse.data 
    };
  } catch (error) {
    console.error('Root endpoint connection failed:', error);
    results.root = { 
      success: false, 
      error: error.message,
      details: {
        code: error.code,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : null,
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
    console.log('API endpoint connection successful:', apiResponse.status);
    results.api = { 
      success: true, 
      status: apiResponse.status,
      statusText: apiResponse.statusText,
      data: apiResponse.data 
    };
  } catch (error) {
    console.error('API endpoint connection failed:', error);
    results.api = { 
      success: false, 
      error: error.message,
      details: {
        code: error.code,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : null,
        request: !!error.request
      }
    };
  }
  
  // Test auth endpoint (should work even without a token)
  try {
    console.log('Testing auth health endpoint:', `${apiUrl}/auth`);
    const authResponse = await axios.get(`${apiUrl}/auth`, { 
      timeout: 5000,
      headers: { 'Accept': 'application/json' }
    });
    console.log('Auth endpoint connection successful:', authResponse.status);
    results.authTest = { 
      success: true, 
      status: authResponse.status,
      statusText: authResponse.statusText,
      data: authResponse.data 
    };
  } catch (error) {
    console.error('Auth endpoint connection failed:', error);
    results.authTest = { 
      success: false, 
      error: error.message,
      details: {
        code: error.code,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : null,
        request: !!error.request
      }
    };
  }
  
  // Final assessment
  const allSuccess = results.root.success && results.api.success;
  const partialSuccess = results.root.success || results.api.success;
  
  console.log('----------------------------------------');
  console.log('Connection Test Results:', 
    allSuccess ? '✅ All tests passed' : 
    partialSuccess ? '⚠️ Some tests failed' : 
    '❌ All tests failed');
  console.log('----------------------------------------');
  
  if (!allSuccess) {
    console.log('Suggested actions:');
    if (!results.root.success && !results.api.success) {
      console.log('- Check if the backend server is running at', rootUrl);
      console.log('- Verify your internet connection');
      console.log('- Check for CORS issues - the browser might be blocking cross-origin requests');
    } else if (results.root.success && !results.api.success) {
      console.log('- The server is reachable but the API endpoints are not accessible');
      console.log('- Check if the API routes are configured correctly on the backend');
    }
  }
  
  return results;
};

/**
 * Extended diagnostic utility to check all aspects of the connection
 */
export const runNetworkDiagnostics = async () => {
  console.log('🔍 Running comprehensive network diagnostics...');
  
  // Basic connection test
  const apiTestResults = await testApiConnection();
  
  // Get local storage state
  const localStorageItems = {
    token: localStorage.getItem('token') ? '✅ Present' : '❌ Missing',
    user: localStorage.getItem('user') ? '✅ Present' : '❌ Missing'
  };
  
  // Network information if available
  const networkInfo = navigator.connection ? {
    effectiveType: navigator.connection.effectiveType,
    downlink: navigator.connection.downlink,
    rtt: navigator.connection.rtt,
    saveData: navigator.connection.saveData
  } : 'Not available';
  
  // Compile results
  const diagnosticsResults = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    apiTests: apiTestResults,
    browser: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      onLine: navigator.onLine
    },
    localStorage: localStorageItems,
    networkInfo
  };
  
  console.log('Complete Diagnostics Results:', diagnosticsResults);
  
  return diagnosticsResults;
};

// Make these functions available in the browser console for easy debugging
if (typeof window !== 'undefined') {
  window.testApiConnection = testApiConnection;
  window.runNetworkDiagnostics = runNetworkDiagnostics;
}

export default { testApiConnection, runNetworkDiagnostics }; 