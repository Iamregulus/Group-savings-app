import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPolling, setIsPolling] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notification count:', error);
      // If we get a 401, stop polling to prevent redirect loops
      if (error.status === 401) {
        setIsPolling(false);
      }
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    if (!isAuthenticated) return false;
    
    try {
      await notificationService.markAsRead(notificationId);
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!isAuthenticated) return false;
    
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };

  // Update authentication status when token changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      if (!token) {
        setIsPolling(false);
      } else {
        setIsPolling(true);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Set up polling for notifications
  useEffect(() => {
    // Only fetch if authenticated
    if (isAuthenticated) {
      fetchUnreadCount();
    }

    const interval = setInterval(() => {
      if (isPolling && isAuthenticated) {
        fetchUnreadCount();
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [isPolling, isAuthenticated]);

  // Expose context values
  const value = {
    unreadCount,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    setIsPolling,
    isAuthenticated
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 