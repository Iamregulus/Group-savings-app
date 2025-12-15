import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Set this to false to enforce authentication
const BYPASS_AUTH = false;

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  
  // If bypassing auth is enabled, render children directly
  if (BYPASS_AUTH) {
    return children;
  }
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if route requires specific role
  if (requiredRole && currentUser && currentUser.role !== requiredRole) {
    // Redirect admin to admin dashboard, regular users to user dashboard
    const redirectPath = currentUser.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

export default ProtectedRoute;