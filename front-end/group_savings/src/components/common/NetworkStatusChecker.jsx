import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../services/api';

// Mobile check
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  typeof navigator !== 'undefined' ? navigator.userAgent : ''
);

const NetworkStatusChecker = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);
  const [showApiMessage, setShowApiMessage] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Determine if we're in production based on the URL
  const isProduction = window.location.protocol === 'https:' || 
                       window.location.hostname.includes('vercel.app');
  
  const apiUrl = isProduction 
    ? 'https://group-savings-app-production.up.railway.app/api'
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

  // Root URL for connection testing (without the /api path)
  const rootUrl = isProduction
    ? 'https://group-savings-app-production.up.railway.app'
    : 'http://localhost:5000';

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

    const checkApiConnection = async () => {
      try {
        // First try to ping the root endpoint
        const rootResult = await axios.get(rootUrl, {
          timeout: isMobile ? 45000 : 30000,
          headers: { 
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Cache-Control': 'no-cache, no-store',
            'Pragma': 'no-cache'
          }
        });
        
        console.log('Root endpoint connection successful:', rootResult.status);
        
        // If root connection works, also try the API endpoint
        try {
          const apiResult = await axios.get(`${apiUrl}`, {
            timeout: isMobile ? 45000 : 30000,
            headers: { 
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              'Cache-Control': 'no-cache, no-store',
              'Pragma': 'no-cache'
            }
          });
          console.log('API endpoint connection successful:', apiResult.status);
          setApiConnected(true);
          setShowApiMessage(false);
          setErrorDetails(null);
        } catch (apiError) {
          console.error('API endpoint connection failed:', apiError);
          setApiConnected(false);
          setShowApiMessage(true);
          setErrorDetails({
            type: 'API Endpoint',
            message: apiError.message,
            code: apiError.code,
            status: apiError.response?.status,
            statusText: apiError.response?.statusText
          });
        }
      } catch (rootError) {
        console.error('Root endpoint connection failed:', rootError);
        setApiConnected(false);
        setShowApiMessage(true);
        setErrorDetails({
          type: 'Root Endpoint',
          message: rootError.message,
          code: rootError.code,
          status: rootError.response?.status,
          statusText: rootError.response?.statusText
        });
      }
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
  }, [isOnline, apiUrl, rootUrl, isRetrying]);

  const closeOfflineMessage = () => {
    setShowOfflineMessage(false);
  };

  const closeApiMessage = () => {
    setShowApiMessage(false);
  };

  const retryConnection = () => {
    if (isOnline) {
      setIsRetrying(true);
      
      // Use our utility to test the connection
      api.testConnection().then(result => {
        console.log('Connection test result:', result);
        if (result.success) {
          setApiConnected(true);
          setShowApiMessage(false);
          setErrorDetails(null);
          // Reload page to re-establish connection
          window.location.reload();
        } else {
          setApiConnected(false);
          setShowApiMessage(true);
          
          // Provide more detailed error info based on what failed
          if (result.rootSuccess === false) {
            setErrorDetails({
              type: 'Root Endpoint',
              message: result.error,
              code: result.code,
              status: result.response?.status,
              statusText: result.response?.statusText
            });
          } else if (result.apiSuccess === false) {
            setErrorDetails({
              type: 'API Endpoint',
              message: result.error,
              code: result.code,
              status: result.response?.status,
              statusText: result.response?.statusText
            });
          } else {
            setErrorDetails({
              type: 'Connection Test',
              message: result.error,
              code: result.code,
              status: result.response?.status,
              statusText: result.response?.statusText
            });
          }
        }
        setIsRetrying(false);
      }).catch(error => {
        console.error('Error during connection test:', error);
        setApiConnected(false);
        setShowApiMessage(true);
        setErrorDetails({
          type: 'Connection Test',
          message: 'Error testing connection: ' + error.message,
          code: 'TEST_ERROR'
        });
        setIsRetrying(false);
      });
    }
  };

  // Get appropriate error message based on error details
  const getErrorMessage = () => {
    if (!errorDetails) return 'Network connection to the server could not be established.';
    
    let baseMessage = `Network Error: Unable to connect to the ${errorDetails.type.toLowerCase()}.`;
    let detailMessage = '';
    
    if (errorDetails.code === 'ECONNABORTED') {
      detailMessage = `The request timed out after ${isMobile ? '45' : '30'} seconds. The server might be starting up or experiencing high load.`;
    } else if (errorDetails.message.includes('Network Error')) {
      detailMessage = isMobile 
        ? `This could be due to mobile network restrictions or the server being temporarily unavailable. Try using WiFi if you're on cellular data.`
        : `This could be due to CORS restrictions or the server being temporarily unavailable.`;
    } else if (errorDetails.status === 502) {
      detailMessage = `The server is currently down or restarting. Please try again in a few minutes.`;
    } else if (errorDetails.status === 500) {
      detailMessage = `The server encountered an internal error. Please try again later.`;
    } else {
      detailMessage = `Error: ${errorDetails.message}`;
    }
    
    return `${baseMessage} ${detailMessage}`;
  };

  return (
    <>
      {children}
      
      {showOfflineMessage && !isOnline && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          maxWidth: '90%',
          width: 'auto'
        }}>
          <span>You are currently offline. Please check your internet connection.</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={closeOfflineMessage}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#4ecdc4',
                cursor: 'pointer',
                padding: '5px',
                fontSize: '14px'
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {showApiMessage && isOnline && !apiConnected && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          maxWidth: '90%',
          width: 'auto'
        }}>
          <span>{getErrorMessage()}</span>
          {errorDetails && (
            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '5px', textAlign: 'left', width: '100%' }}>
              Error: {errorDetails.message}
              {errorDetails.status && ` (${errorDetails.status} ${errorDetails.statusText || ''})`}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={retryConnection}
              disabled={isRetrying}
              style={{
                background: '#4ecdc4',
                border: 'none',
                color: 'white',
                cursor: isRetrying ? 'not-allowed' : 'pointer',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '14px',
                opacity: isRetrying ? 0.7 : 1
              }}
            >
              {isRetrying ? 'Retrying...' : 'Retry Connection'}
            </button>
            <button 
              onClick={closeApiMessage}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#4ecdc4',
                cursor: 'pointer',
                padding: '5px',
                fontSize: '14px'
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NetworkStatusChecker; 