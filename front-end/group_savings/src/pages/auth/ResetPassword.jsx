import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    if (!formData.password) {
      setError('Please enter a new password');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setError('');
      
      await authService.resetPassword(token, formData.password);
      
      setSuccess(true);
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.response?.data?.message || 'An error occurred. The token may be expired or invalid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Password Reset Successful</h2>
            <p style={{ marginBottom: '15px' }}>
              Your password has been reset successfully. You will be redirected to the login page shortly.
            </p>
            <Link 
              to="/login" 
              style={{ 
                color: '#4ecdc4', 
                textDecoration: 'none', 
                fontWeight: '600' 
              }}
            >
              Login Now
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
              Reset Your Password
            </h2>
            
            <p style={{ 
              color: '#aaa', 
              marginBottom: '24px', 
              textAlign: 'center' 
            }}>
              Please enter a new password for your account.
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
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    style={{
                      ...inputStyle,
                      paddingRight: '50px'
                    }}
                    className="password-input"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#4ecdc4',
                      cursor: 'pointer',
                      padding: '5px',
                      fontSize: '14px'
                    }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  style={inputStyle}
                  className="password-input"
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
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword; 