import api from './api';

export const transactionService = {
  // Get all transactions for a user
  async getUserTransactions(userId, options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    if (options.type) params.append('type', options.type);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await api.get(`/users/${userId}/transactions${queryString}`);
  },

  // Get all transactions for a group
  async getGroupTransactions(groupId) {
    try {
      const response = await api.get(`/groups/${groupId}/transactions`);
      return response;
    } catch (error) {
      console.error(`Error fetching transactions for group ${groupId}:`, error);
      throw error;
    }
  },

  // Get a specific transaction details
  async getTransactionById(transactionId) {
    return await api.get(`/transactions/${transactionId}`);
  },

  // Get transaction statistics/summary for a user
  async getUserTransactionSummary(userId, period) {
    return await api.get(`/users/${userId}/transactions/summary?period=${period}`);
  },

  // Get transaction statistics/summary for a group
  async getGroupTransactionSummary(groupId, period) {
    return await api.get(`/groups/${groupId}/transactions/summary?period=${period}`);
  },

  // Export transactions (generates a CSV or PDF)
  async exportTransactions(options = {}) {
    const params = new URLSearchParams();
    if (options.userId) params.append('userId', options.userId);
    if (options.groupId) params.append('groupId', options.groupId);
    if (options.format) params.append('format', options.format);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.type) params.append('type', options.type);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await api.get(`/transactions/export${queryString}`, {
      responseType: 'blob'
    });
  }
};
