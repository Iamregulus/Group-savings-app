import { createContext, useState, useEffect, useContext } from 'react';
// Use mock data for now until backend is fixed
// import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Mock user data for development
const MOCK_USERS = [
  {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: 'admin',
    phoneNumber: '+1234567890'
  },
  {
    id: '2',
    firstName: 'Regular',
    lastName: 'User',
    email: 'user@example.com',
    role: 'user',
    phoneNumber: '+0987654321'
  }
];

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
            // MOCK: Get user from local storage
            const userJson = localStorage.getItem('user');
            if (userJson) {
              const user = JSON.parse(userJson);
              setCurrentUser(user);
            }
            
            // Real implementation (commented out for now):
            // const userData = await authService.getCurrentUser();
            // setCurrentUser(userData);
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
  
  // Login function - MOCK implementation for development
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // MOCK: Find user in mock data
      const user = MOCK_USERS.find(user => user.email === email);
      
      // Simulate authentication
      if (user && password === 'password') {
        const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
        
        // Save to localStorage
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        setCurrentUser(user);
        return user.role;
      } else {
        throw new Error('Invalid email or password');
      }
      
      // Real implementation (commented out for now):
      /*
      const response = await authService.login(email, password);
      
      // The backend returns: { message, user, token }
      if (response && response.data && response.data.token && response.data.user) {
        // Save token to localStorage
        localStorage.setItem('token', response.data.token);
        
        setCurrentUser(response.data.user);
        return response.data.user.role;
      } else {
        throw new Error('Invalid response from server');
      }
      */
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Signup function - MOCK implementation for development
  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // MOCK: Create new user
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        role: 'user'
      };
      
      // Simulate server response
      const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      
      // Save to localStorage
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Add to mock users (for testing only)
      MOCK_USERS.push(newUser);
      
      setCurrentUser(newUser);
      return newUser.role;
      
      // Real implementation (commented out for now):
      /*
      const response = await authService.signup(userData);
      
      // The backend returns: { message, user, token }
      if (response && response.data && response.data.token && response.data.user) {
        // Save token to localStorage
        localStorage.setItem('token', response.data.token);
        
        setCurrentUser(response.data.user);
        return response.data.user.role;
      } else {
        throw new Error('Invalid response from server');
      }
      */
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Forgot password - MOCK implementation
  const requestPasswordReset = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      // MOCK: Just pretend we sent an email
      console.log('Mock password reset email sent to:', email);
      
      // Simulate server response
      return { success: true, message: 'Password reset email sent' };
      
      // Real implementation (commented out for now):
      /*
      const response = await authService.requestPasswordReset(email);
      return response;
      */
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