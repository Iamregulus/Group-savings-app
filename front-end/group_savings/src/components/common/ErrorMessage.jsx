import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div style={{ 
      background: 'rgba(220, 53, 69, 0.1)', 
      color: '#ff6b6b', 
      padding: '12px', 
      borderRadius: '5px', 
      marginBottom: '20px',
      border: '1px solid rgba(220, 53, 69, 0.3)',
      fontSize: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div>{message}</div>
      {onRetry && (
        <button 
          onClick={onRetry}
          style={{
            background: 'transparent',
            border: '1px solid #ff6b6b',
            color: '#ff6b6b',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            alignSelf: 'flex-end',
            fontSize: '12px'
          }}
        >
          Retry Connection
        </button>
      )}
    </div>
  );
};

export default ErrorMessage; 