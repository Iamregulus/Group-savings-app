import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NetworkStatusChecker = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);
  const [showApiMessage, setShowApiMessage] = useState(false);

  // Determine if we're in production based on the URL
  const isProduction = window.location.protocol === 'https:' || 
                       window.location.hostname.includes('vercel.app');
  
  const apiUrl = isProduction 
    ? 'https://group-savings-app-production.up.railway.app/api'
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

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
        // Try to ping the API root endpoint
        await axios.get(`${apiUrl}`);
        setApiConnected(true);
        setShowApiMessage(false);
      } catch (error) {
        console.error('API connection error:', error);
        setApiConnected(false);
        setShowApiMessage(true);
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
      if (isOnline) {
        checkApiConnection();
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline, apiUrl]);

  const closeOfflineMessage = () => {
    setShowOfflineMessage(false);
  };

  const closeApiMessage = () => {
    setShowApiMessage(false);
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
          alignItems: 'center',
          gap: '10px',
          maxWidth: '90%',
          width: 'auto'
        }}>
          <span>You are currently offline. Please check your internet connection.</span>
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
          alignItems: 'center',
          gap: '10px',
          maxWidth: '90%',
          width: 'auto'
        }}>
          <span>Cannot connect to the server. The API might be down or misconfigured.</span>
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
      )}
    </>
  );
};

export default NetworkStatusChecker; 