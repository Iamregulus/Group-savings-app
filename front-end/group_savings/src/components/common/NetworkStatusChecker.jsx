import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const NetworkStatusChecker = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);
  const [showApiMessage, setShowApiMessage] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const defaultApiUrl = import.meta.env.DEV 
    ? 'http://localhost:5000/api' 
    : 'https://group-savings-app.onrender.com/api';
  const apiUrl = import.meta.env.VITE_API_URL || defaultApiUrl;
  const rootUrl = apiUrl.replace(/\/api\/?$/, '');

  const checkApiConnection = useCallback(async () => {
    try {
      // Use the /health endpoint for a more reliable check
      const healthResult = await axios.get(`${rootUrl}/health`, {
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        }
      });

      console.log('Health endpoint connection successful:', healthResult.status);
      setApiConnected(true);
      setShowApiMessage(false);
      setErrorDetails(null);

    } catch (error) {
      console.error('API health check failed:', error);
      setApiConnected(false);
      setShowApiMessage(true);
      setErrorDetails({
        type: 'API Health Check',
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
    }
  }, [rootUrl]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
      checkApiConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check API connection on mount and when online status changes
    if (isOnline) {
      checkApiConnection();
    }

    // Check API connection every 30 seconds
    const intervalId = setInterval(() => {
      if (isOnline && !isRetrying) {
        checkApiConnection();
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline, isRetrying, checkApiConnection]);

  const closeOfflineMessage = () => {
    setShowOfflineMessage(false);
  };

  const closeApiMessage = () => {
    setShowApiMessage(false);
  };

  const retryConnection = async () => {
    if (isOnline) {
      setIsRetrying(true);
      await checkApiConnection();
      setIsRetrying(false);
    }
  };

  // Get appropriate error message based on error details
  const getErrorMessage = () => {
    if (!errorDetails) return 'Network connection to the server could not be established.';
    
    let baseMessage = `Network Error: Unable to connect to the ${errorDetails.type.toLowerCase()}.`;
    let detailMessage = '';
    
    if (errorDetails.code === 'ECONNABORTED') {
      detailMessage = 'The request timed out after 30 seconds. The server might be starting up or experiencing high load.';
    } else if (errorDetails.message.includes('Network Error')) {
      detailMessage = 'This could be due to CORS restrictions or the server being temporarily unavailable.';
    } else if (errorDetails.status === 404) {
      detailMessage = 'The endpoint was not found. Please check if the server is running correctly.';
    } else if (errorDetails.status >= 500) {
      detailMessage = 'The server encountered an internal error. Please try again later.';
    } else if (errorDetails.status === 403) {
      detailMessage = 'Access forbidden. This might be due to CORS configuration issues.';
    }
    
    return `${baseMessage} ${detailMessage}`;
  };

  // Don't render anything if everything is working fine
  if (isOnline && apiConnected) {
    return children;
  }

  return (
    <>
      {children}
      
      {/* Offline Message */}
      {showOfflineMessage && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <strong className="font-bold">You're offline!</strong>
              <span className="block sm:inline"> Please check your internet connection.</span>
            </div>
            <button
              onClick={closeOfflineMessage}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* API Connection Error Message */}
      {showApiMessage && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded shadow-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <strong className="font-bold">Server Connection Issue</strong>
              <p className="text-sm mt-1">{getErrorMessage()}</p>
              <div className="mt-2">
                <button
                  onClick={retryConnection}
                  disabled={isRetrying}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm mr-2 disabled:opacity-50"
                >
                  {isRetrying ? 'Retrying...' : 'Retry Connection'}
                </button>
                <button
                  onClick={closeApiMessage}
                  className="text-yellow-700 hover:text-yellow-900 text-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              onClick={closeApiMessage}
              className="text-yellow-700 hover:text-yellow-900 ml-4"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NetworkStatusChecker; 