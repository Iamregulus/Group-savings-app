import axios from 'axios';

/**
 * Utility function to test API connectivity
 * This can be imported and used in the browser console for debugging
 */
export const testApiConnection = async () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const rootUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  console.log('Testing API connection...');
  console.log('Environment: Development');
  console.log('Root URL:', rootUrl);
  console.log('API URL:', apiUrl);
  
  // Test results
  const results = {
    environment: 'development',
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
      timeout: 30000,
      headers: { 
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache'
      }
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
      timeout: 30000,
      headers: { 
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache'
      }
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
      timeout: 30000,
      headers: { 
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache'
      }
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
      console.log('- Try disabling any browser extensions that might be interfering with network requests');
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
  const networkInfo = {
    online: navigator.onLine ? '✅ Online' : '❌ Offline',
    connectionType: navigator.connection ? navigator.connection.effectiveType : 'Unknown',
    downlink: navigator.connection ? navigator.connection.downlink : 'Unknown'
  };
  
  console.log('📊 Diagnostic Summary:');
  console.log('Network Status:', networkInfo);
  console.log('Local Storage:', localStorageItems);
  console.log('API Test Results:', apiTestResults);
  
  return {
    networkInfo,
    localStorageItems,
    apiTestResults
  };
};

// Make functions available globally for console debugging
if (typeof window !== 'undefined') {
  window.testApiConnection = testApiConnection;
  window.runNetworkDiagnostics = runNetworkDiagnostics;
} 