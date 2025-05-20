/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/layout.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import WithdrawalRequests from './pages/admin/WithdrawalRequests';
import MemberManagement from './pages/admin/MemberManagement';
import GroupWithdrawals from './pages/admin/GroupWithdrawals';

// User Pages
import Dashboard from './pages/user/Dashboard';
import GroupDetail from './pages/user/GroupDetail';
import CreateGroup from './pages/user/CreateGroup';
import JoinGroup from './pages/user/JoinGroup';
import Notifications from './pages/user/Notifications';

// Common Components
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';
import NotificationDropdown from './components/common/NotificationDropdown';
import NetworkStatusChecker from './components/common/NetworkStatusChecker';
import OfflineModeHandler from './components/common/OfflineModeHandler';

// Wrapper component to access theme context
const AppContent = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Listen for network status to clear route if needed
  useEffect(() => {
    const handleOffline = () => {
      console.log('App is offline, network status has changed');
    };

    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`} style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Sidebar isOpen={isMobileSidebarOpen} />
      <div className="content-wrapper" style={{ flex: 1, marginLeft: 0 }}>
        <div className="notification-bar flex justify-end px-4 py-2">
          <NotificationDropdown />
        </div>
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/withdrawals" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <WithdrawalRequests />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/members" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <MemberManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected User Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/groups/:groupId" 
              element={
                <ProtectedRoute>
                  <GroupDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-group" 
              element={
                <ProtectedRoute>
                  <CreateGroup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/join-group" 
              element={
                <ProtectedRoute>
                  <JoinGroup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } 
            />
            
            {/* Group Admin Routes */}
            <Route 
              path="/admin/withdrawals/:groupId" 
              element={
                <ProtectedRoute>
                  <GroupWithdrawals />
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <NetworkStatusChecker>
            <OfflineModeHandler />
            <AppContent />
          </NetworkStatusChecker>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;