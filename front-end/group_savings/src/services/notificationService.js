import api from './api';

export const notificationService = {
  // Get user notifications with pagination and filtering
  async getNotifications(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);
      if (params.unreadOnly) queryParams.append('unread', 'true');
      
      const queryString = queryParams.toString();
      const endpoint = `/notifications/${queryString ? `?${queryString}` : ''}`;
      
      return await api.get(endpoint);
    } catch (error) {
      throw error;
    }
  },
  
  // Mark a specific notification as read
  async markAsRead(notificationId) {
    try {
      return await api.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      throw error;
    }
  },
  
  // Mark all notifications as read
  async markAllAsRead() {
    try {
      return await api.put('/notifications/read-all');
    } catch (error) {
      throw error;
    }
  },
  
  // Get unread notification count (useful for badges)
  async getUnreadCount() {
    try {
      const response = await this.getNotifications({ limit: 1, unreadOnly: true });
      return response.data.meta.unreadCount || 0;
    } catch (error) {
      // If we get an authentication error, return 0 instead of propagating the error
      if (error.status === 401) {
        return 0;
      }
      throw error;
    }
  }
}; 