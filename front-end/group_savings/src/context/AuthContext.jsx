import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (token) {
          try {
            // Try to get profile from API
            const userData = await authService.getCurrentUser();
            setCurrentUser(userData);
          } catch (error) {
            console.error('Failed to get current user:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  // Login function using real API
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const normalizedEmail = (email || '').trim().toLowerCase();
      console.log('Attempting login with:', normalizedEmail, password ? '***' : '');

      const response = await authService.login(normalizedEmail, password);
      
      // Save token to localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setCurrentUser(response.user);
      return response.user.role;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Signup function
  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const normalizedUser = {
        ...userData,
        email: (userData.email || '').trim().toLowerCase(),
        firstName: (userData.firstName || '').trim(),
        lastName: (userData.lastName || '').trim(),
        phoneNumber: (userData.phoneNumber || '').trim(),
      };

      const response = await authService.signup(normalizedUser);
      
      // Save token to localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setCurrentUser(response.user);
      return response.user.role;
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const requestPasswordReset = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.requestPasswordReset(email);
      return response;
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Password reset request failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };
  
  const value = {
    currentUser,
    loading,
    error,
    login,
    signup,
    logout,
    requestPasswordReset,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin'
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};