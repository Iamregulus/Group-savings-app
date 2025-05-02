import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { signup } = useAuth();
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
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      // Match the data structure expected by the backend
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber
      };
      
      const userRole = await signup(userData);
      
      // Redirect based on role
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({
        ...errors,
        form: error.message || 'Signup failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Updated styles to match login page
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
  
  // Error message style
  const errorStyle = {
    color: '#ff6b6b', 
    fontSize: '12px', 
    marginTop: '5px'
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
        maxWidth: '500px',
        padding: '40px 30px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 'auto',
        boxSizing: 'border-box'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '8px', 
          color: '#fff',
          fontSize: '32px',
          fontWeight: '600' 
        }}>
          Create Account
        </h1>
        
        <p style={{ 
          textAlign: 'center', 
          marginBottom: '30px', 
          color: '#fff',
          fontSize: '16px'
        }}>
          Join our community and start saving today!
        </p>
        
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
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                style={{
                  ...inputStyle,
                  borderColor: errors.firstName ? '#dc3545' : '#333'
                }}
                className="form-input"
              />
              {errors.firstName && <div style={errorStyle}>{errors.firstName}</div>}
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                style={{
                  ...inputStyle,
                  borderColor: errors.lastName ? '#dc3545' : '#333'
                }}
                className="form-input"
              />
              {errors.lastName && <div style={errorStyle}>{errors.lastName}</div>}
            </div>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Email</label>
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
              className="form-input"
            />
            {errors.email && <div style={errorStyle}>{errors.email}</div>}
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              style={{
                ...inputStyle,
                borderColor: errors.phoneNumber ? '#dc3545' : '#333'
              }}
              className="form-input"
            />
            {errors.phoneNumber && <div style={errorStyle}>{errors.phoneNumber}</div>}
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                style={{
                  ...inputStyle,
                  paddingRight: '50px',
                  borderColor: errors.password ? '#dc3545' : '#333'
                }}
                className="form-input"
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
            {errors.password && <div style={errorStyle}>{errors.password}</div>}
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                style={{
                  ...inputStyle,
                  paddingRight: '50px',
                  borderColor: errors.confirmPassword ? '#dc3545' : '#333'
                }}
                className="form-input"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
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
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword && <div style={errorStyle}>{errors.confirmPassword}</div>}
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
              height: '48px',
              marginBottom: '24px'
            }}
          >
            {isLoading ? 'Creating Account...' : 'Sign up'}
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#fff', fontSize: '14px' }}>
              Already have an account? <Link to="/login" style={{ color: '#4ecdc4', fontWeight: '600', textDecoration: 'none' }}>Log in</Link>
            </p>
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
  
  .form-input {
    color: #fff !important;
  }
`;
document.head.appendChild(styleSheet);

export default Signup;