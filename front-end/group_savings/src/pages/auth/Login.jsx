import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Simple version without external components to troubleshoot
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      const userRole = await login(formData.email, formData.password);
      
      // Redirect based on role
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        ...errors,
        form: error.message || 'Login failed. Please check your credentials.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Updated styles based on the screenshot
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
      width: '100%',
      margin: 0,
      padding: 0,
      background: '#1a1a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'auto'
    }}>
      <div style={{
        background: '#1a1a1a',
        width: '100%',
        maxWidth: '450px',
        padding: '40px 30px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 'auto',
        boxSizing: 'border-box'
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
        
        {errors.form && (
          <div style={{ 
            background: 'rgba(220, 53, 69, 0.1)', 
            color: '#ff6b6b', 
            padding: '12px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            border: '1px solid rgba(220, 53, 69, 0.3)',
            fontSize: '14px'
          }}>
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              style={{
                ...inputStyle,
                borderColor: errors.email ? '#dc3545' : '#333'
              }}
              className="email-input"
            />
            {errors.email && (
              <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '5px' }}>
                {errors.email}
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                style={{
                  ...inputStyle,
                  paddingRight: '50px',
                  borderColor: errors.password ? '#dc3545' : '#333'
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
            {errors.password && (
              <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '5px' }}>
                {errors.password}
              </div>
            )}
          </div>
          
          <div style={{ textAlign: 'right', marginBottom: '24px' }}>
            <Link to="/forgot-password" style={{ color: '#4ecdc4', textDecoration: 'none', fontSize: '14px' }}>
              Forgot password?
            </Link>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              background: '#4ecdc4',
              border: 'none',
              borderRadius: '5px',
              color: '#1a1a1a',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              fontSize: '16px',
              height: '48px'
            }}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ color: '#fff', fontSize: '14px' }}>
              Don't have an account? <Link to="/signup" style={{ color: '#4ecdc4', textDecoration: 'none' }}>Sign up</Link>
            </p>
          </div>
          
          <div style={{
            marginTop: '30px',
            padding: '15px',
            backgroundColor: 'rgba(78, 205, 196, 0.1)',
            border: '1px solid rgba(78, 205, 196, 0.3)',
            borderRadius: '5px'
          }}>
            <h4 style={{ color: '#4ecdc4', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Demo Accounts:</h4>
            <p style={{ margin: '5px 0', color: '#ddd', fontSize: '13px' }}>Test User: test@example.com</p>
            <p style={{ margin: '5px 0', color: '#ddd', fontSize: '13px' }}>Password: password123</p>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add global styles to ensure placeholders and input text are properly visible
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  input::placeholder {
    color: #888 !important;
    opacity: 1 !important;
  }
  
  input:focus {
    color: #fff !important;
  }
  
  .email-input, .password-input {
    color: #fff !important;
  }
`;
document.head.appendChild(styleSheet);

export default Login;