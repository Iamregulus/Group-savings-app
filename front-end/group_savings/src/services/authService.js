import api from './api';

export const authService = {
  // User login
  async login(email, password) {
    try {
      return await api.post('/auth/login', { email, password });
    } catch (error) {
      throw error;
    }
  },

  // User signup
  async signup(userData) {
    try {
      return await api.post('/auth/register', userData);
    } catch (error) {
      throw error;
    }
  },

  // Get current user profile
  async getCurrentUser() {
    try {
      return await api.get('/auth/profile');
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  async updateProfile(userData) {
    try {
      return await api.put('/auth/profile', userData);
    } catch (error) {
      throw error;
    }
  },

  // Update user password
  async changePassword(currentPassword, newPassword) {
    try {
      return await api.put('/auth/password', { currentPassword, newPassword });
    } catch (error) {
      throw error;
    }
  },

  // Request password reset
  async requestPasswordReset(email) {
    try {
      return await api.post('/auth/reset-password', { email });
    } catch (error) {
      throw error;
    }
  },

  // Reset password with token
  async resetPassword(token, newPassword) {
    try {
      return await api.post(`/auth/reset-password/${token}`, { password: newPassword });
    } catch (error) {
      throw error;
    }
  },

  // Verify email with token
  async verifyEmail(token) {
    try {
      return await api.get(`/auth/verify-email/${token}`);
    } catch (error) {
      throw error;
    }
  }
};
