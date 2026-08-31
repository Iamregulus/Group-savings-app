import api from './api';

const adminService = {
  async getStats() {
    return await api.get('/admin/stats');
  },

  async getAllGroups() {
    return await api.get('/admin/groups');
  },

  async getCashflow() {
    return await api.get('/admin/cashflow');
  },

  async setGroupFlag(groupId, flagged) {
    return await api.put(`/admin/groups/${groupId}/flag`, { flagged });
  }
};

export { adminService };
