/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/layout.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/ThemeContext';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import WithdrawalRequests from './pages/admin/WithdrawalRequests';
import MemberManagement from './pages/admin/MemberManagement';

// User Pages
import Dashboard from './pages/user/Dashboard';
import GroupDetail from './pages/user/GroupDetail';
import CreateGroup from './pages/user/CreateGroup';
import Notifications from './pages/user/Notifications';

// Common Components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Wrapper component to access theme context
const AppContent = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { darkMode } = useTheme();

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <Sidebar className={isMobileSidebarOpen ? 'open' : ''} />
      <div className="content-wrapper">
        <Navbar toggleSidebar={toggleMobileSidebar} />
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
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
}

export default App;