import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OfflineModeHandler = () => {
  const [showMessage, setShowMessage] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [isRetrying, setIsRetrying] = useState(false);
  const [message, setMessage] = useState('Checking connection status...');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Check connection status on mount
    checkConnectionStatus();

    // Check connection periodically
    const intervalId = setInterval(() => {
      if (!isRetrying) {
        checkConnectionStatus();
      }
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRetrying]);

  const checkConnectionStatus = async () => {
    try {
      const response = await axios.get(`${apiUrl}`, {
        timeout: 30000,
        headers: { 
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (response.status === 200) {
        setConnectionStatus('online');
        setShowMessage(false);
      } else {
        setConnectionStatus('error');
        setShowMessage(true);
        setMessage('Server returned an unexpected response.');
      }
    } catch (error) {
      setConnectionStatus('error');
      setShowMessage(true);
      setMessage('Unable to connect to the server. Please check if the backend is running.');
    }
  };

  const tryReconnect = async () => {
    setIsRetrying(true);
    setMessage('Trying to reconnect...');
    
    try {
      await checkConnectionStatus();
    } catch (error) {
      setMessage('Still unable to connect to the server.');
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
      backgroundColor: connectionStatus === 'online' ? '#4caf50' : '#f44336',
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
        {connectionStatus === 'online' ? '🟢 Connected' : '🔴 Connection Error'}
      </div>
      <span>{message}</span>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
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