import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const OfflineModeHandler = () => {
  const [showMessage, setShowMessage] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [demoModeActive, setDemoModeActive] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [message, setMessage] = useState('Checking connection status...');

  useEffect(() => {
    // Check connection status on mount
    checkConnectionStatus();

    // Listen for offline mode events
    const handleOfflineEvent = (event) => {
      setShowMessage(true);
      setConnectionStatus('offline');
      setMessage(`Network error: ${event.detail.message}`);
    };

    window.addEventListener('api:offline', handleOfflineEvent);

    // Check connection periodically
    const intervalId = setInterval(() => {
      if (!isRetrying && !demoModeActive) {
        checkConnectionStatus();
      }
    }, 30000);

    return () => {
      window.removeEventListener('api:offline', handleOfflineEvent);
      clearInterval(intervalId);
    };
  }, [isRetrying, demoModeActive]);

  const checkConnectionStatus = async () => {
    try {
      const status = await api.getConnectionStatus();
      
      if (status.status === 'online') {
        setConnectionStatus('online');
        setShowMessage(false);
      } else if (status.status === 'offline') {
        setConnectionStatus('offline');
        setDemoModeActive(true);
        setShowMessage(true);
        setMessage('Using offline demo mode with cached data.');
      } else {
        setConnectionStatus('error');
        setShowMessage(true);
        setMessage('Unable to connect to the server. Would you like to try demo mode?');
      }
    } catch (error) {
      setConnectionStatus('error');
      setShowMessage(true);
      setMessage('Error checking connection status. Network may be unavailable.');
    }
  };

  const enableDemoMode = async () => {
    try {
      await api.enableOfflineMode();
      setDemoModeActive(true);
      setConnectionStatus('offline');
      setMessage('Demo mode activated. Using sample data.');
      // Reload the page to apply changes
      window.location.reload();
    } catch (error) {
      setMessage(`Error enabling demo mode: ${error.message}`);
    }
  };

  const tryReconnect = async () => {
    setIsRetrying(true);
    setMessage('Trying to reconnect...');
    
    try {
      const status = await api.getConnectionStatus();
      
      if (status.status === 'online') {
        if (demoModeActive) {
          const result = await api.disableOfflineMode();
          if (result.status === 'success') {
            setDemoModeActive(false);
            setConnectionStatus('online');
            setShowMessage(false);
            // Reload the page to apply changes
            window.location.reload();
          } else {
            setMessage('Could not disable demo mode: No backend available');
          }
        } else {
          setConnectionStatus('online');
          setShowMessage(false);
        }
      } else {
        setMessage('Still unable to connect to any backend server.');
      }
    } catch (error) {
      setMessage(`Error during reconnection: ${error.message}`);
    } finally {
      setIsRetrying(false);
    }
  };

  const dismiss = () => {
    setShowMessage(false);
  };

  if (!showMessage) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: connectionStatus === 'online' ? '#4caf50' : 
                      connectionStatus === 'offline' ? '#ff9800' : '#f44336',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      zIndex: 1001,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      maxWidth: '90%',
      width: 'auto'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        {connectionStatus === 'online' ? '🟢 Connected' : 
         connectionStatus === 'offline' ? '🟠 Offline Mode' : '🔴 Connection Error'}
      </div>
      <span>{message}</span>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
        {connectionStatus === 'error' && !demoModeActive && (
          <button 
            onClick={enableDemoMode}
            style={{
              background: '#9c27b0',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            Try Demo Mode
          </button>
        )}
        
        <button 
          onClick={tryReconnect}
          disabled={isRetrying}
          style={{
            background: '#2196f3',
            border: 'none',
            color: 'white',
            cursor: isRetrying ? 'not-allowed' : 'pointer',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            opacity: isRetrying ? 0.7 : 1
          }}
        >
          {isRetrying ? 'Reconnecting...' : 'Try Reconnect'}
        </button>
        
        <button 
          onClick={dismiss}
          style={{
            background: 'transparent',
            border: '1px solid white',
            color: 'white',
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default OfflineModeHandler; 