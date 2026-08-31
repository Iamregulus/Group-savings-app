import api from './api';

export const authService = {
  // User login
  async login(email, password) {
    return await api.post('/auth/login', { email, password });
  },

  // User signup
  async signup(userData) {
    return await api.post('/auth/register', userData);
  },

  // Get current user profile
  async getCurrentUser() {
    return await api.get('/auth/profile');
  },

  // Update user profile
  async updateProfile(userData) {
    return await api.put('/auth/profile', userData);
  },

  // Update user password
  async changePassword(currentPassword, newPassword) {
    return await api.put('/auth/password', { currentPassword, newPassword });
  },

  // Request password reset
  async requestPasswordReset(email) {
    return await api.post('/auth/reset-password', { email });
  },

  // Reset password with token
  async resetPassword(token, newPassword) {
    return await api.post(`/auth/reset-password/${token}`, { password: newPassword });
  },

  // Verify email with token
  async verifyEmail(token) {
    return await api.get(`/auth/verify-email/${token}`);
  }
};
