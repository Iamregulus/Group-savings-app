/* eslint-disable no-unused-vars */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/layout.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import MainLayout from './components/common/MainLayout';

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
import ManageWithdrawals from './pages/user/ManageWithdrawals';

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

              {/* Protected Routes with MainLayout */}
              <Route
                path="/*"
                element={
                  <MainLayout>
                    <Routes>
                      {/* Admin Routes */}
                      <Route 
                        path="admin" 
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <AdminDashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="admin/withdrawals" 
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <WithdrawalRequests />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="admin/members" 
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <MemberManagement />
                          </ProtectedRoute>
                        } 
                      />
                       <Route 
                        path="admin/withdrawals/:groupId" 
                        element={
                          <ProtectedRoute>
                            <GroupWithdrawals />
                          </ProtectedRoute>
                        } 
                      />

                      {/* User Routes */}
                      <Route 
                        path="dashboard" 
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="groups/:groupId" 
                        element={
                          <ProtectedRoute>
                            <GroupDetail />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="create-group" 
                        element={
                          <ProtectedRoute>
                            <CreateGroup />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="join-group" 
                        element={
                          <ProtectedRoute>
                            <JoinGroup />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="notifications" 
                        element={
                          <ProtectedRoute>
                            <Notifications />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="groups/:groupId/withdrawals" 
                        element={
                          <ProtectedRoute>
                            <ManageWithdrawals />
                          </ProtectedRoute>
                        } 
                      />

                      {/* Default redirect */}
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