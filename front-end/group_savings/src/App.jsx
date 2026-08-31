import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import MainLayout from './components/common/MainLayout';
import SuperUserLayout from './components/common/SuperUserLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Super User Page
import SuperUserDashboard from './pages/admin/SuperUserDashboard';

// User Pages
import Dashboard from './pages/user/Dashboard';
import Groups from './pages/user/Groups';
import GroupDetail from './pages/user/GroupDetail';
import CreateGroup from './pages/user/CreateGroup';
import JoinGroup from './pages/user/JoinGroup';
import Analytics from './pages/user/Analytics';
import Notifications from './pages/user/Notifications';
import Profile from './pages/user/Profile';

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';
import NetworkStatusChecker from './components/common/NetworkStatusChecker';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <NetworkStatusChecker>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Super User: separate desktop-first layout */}
              <Route
                path="/super-admin"
                element={
                  <ProtectedRoute requiredRole="super_user">
                    <SuperUserLayout>
                      <SuperUserDashboard />
                    </SuperUserLayout>
                  </ProtectedRoute>
                }
              />

              {/* Regular user routes, mobile-first shell */}
              <Route
                path="/*"
                element={
                  <MainLayout>
                    <Routes>
                      <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
                      <Route path="groups/:groupId" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
                      <Route path="create-group" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
                      <Route path="join-group" element={<ProtectedRoute><JoinGroup /></ProtectedRoute>} />
                      <Route path="analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                      <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                      <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </MainLayout>
                }
              />
            </Routes>
          </NetworkStatusChecker>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
