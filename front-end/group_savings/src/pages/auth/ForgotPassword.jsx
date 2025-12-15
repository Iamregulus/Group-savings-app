import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      await requestPasswordReset(email);
      
      // We don't know if the email exists in the system (for security reasons),
      // but we show success message regardless
      setSuccess(true);
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Style definitions based on the Login component
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    height: '44px',
    border: '1px solid #333',
    borderRadius: '5px',
    background: '#1a1a1a',
    color: '#fff',
    fontSize: '16px',
    boxSizing: 'border-box',
    outline: 'none',
    caretColor: '#fff'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#fff',
    fontSize: '16px'
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'linear-gradient(45deg, #1a1a1a, #333)'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '40px 20px'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '40px', 
          color: '#fff',
          fontSize: '32px',
          fontWeight: '600' 
        }}>
          SaverCircle
        </h1>

        {success ? (
          <div style={{
            background: 'rgba(78, 205, 196, 0.1)',
            color: '#4ecdc4',
            padding: '20px',
            borderRadius: '5px',
            marginBottom: '20px',
            border: '1px solid rgba(78, 205, 196, 0.3)',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Check Your Email</h2>
            <p style={{ marginBottom: '15px' }}>
              If an account exists with the email you provided, we've sent instructions to reset your password.
            </p>
            <Link 
              to="/login" 
              style={{ 
                color: '#4ecdc4', 
                textDecoration: 'none', 
                fontWeight: '600' 
              }}
            >
              Return to login
            </Link>
          </div>
        ) : (
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              color: '#fff', 
              marginBottom: '16px', 
              textAlign: 'center' 
            }}>
              Forgot Your Password?
            </h2>
            
            <p style={{ 
              color: '#aaa', 
              marginBottom: '24px', 
              textAlign: 'center' 
            }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            {error && (
              <div style={{ 
                background: 'rgba(220, 53, 69, 0.1)', 
                color: '#ff6b6b', 
                padding: '12px', 
                borderRadius: '5px', 
                marginBottom: '20px',
                border: '1px solid rgba(220, 53, 69, 0.3)',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={inputStyle}
                  className="email-input"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#4ecdc4',
                  border: 'none',
                  borderRadius: '5px',
                  color: '#1a1a1a',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  fontSize: '16px',
                  height: '48px',
                  marginBottom: '20px'
                }}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
              
              <div style={{ textAlign: 'center' }}>
                <Link 
                  to="/login" 
                  style={{ 
                    color: '#4ecdc4', 
                    textDecoration: 'none', 
                    fontSize: '14px' 
                  }}
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword; 