import api from './api';

const groupService = {
  async getAvailableGroups() {
    const response = await api.get('/groups/available');
    return response || [];
  },

  async getUserGroups() {
    const response = await api.get('/groups/my-groups');
    return Array.isArray(response) ? response : [];
  },

  async getGroup(groupId) {
    return await api.get(`/groups/${groupId}`);
  },

  async createGroup(groupData) {
    return await api.post('/groups', groupData);
  },

  async joinGroup(groupId, data = {}) {
    return await api.post(`/groups/${groupId}/join`, data);
  },

  async joinGroupByCode(joinCode) {
    return await api.post('/groups/join-by-code', { joinCode });
  },

  async makeContribution(groupId, amount, paymentMethod) {
    return await api.post(`/groups/${groupId}/contributions`, { amount, paymentMethod });
  },

  async requestWithdrawal(groupId, withdrawalData) {
    return await api.post(`/groups/${groupId}/withdrawals`, withdrawalData);
  },

  async leaveGroup(groupId) {
    return await api.post(`/groups/${groupId}/leave`);
  },

  async getGroupById(groupId) {
    return await api.get(`/groups/${groupId}`);
  },

  async updateGroup(groupId, groupData) {
    return await api.put(`/groups/${groupId}`, groupData);
  },

  async getGroupMembers(groupId) {
    return await api.get(`/groups/${groupId}/members`);
  },

  async getGroupStats(groupId) {
    return await api.get(`/groups/${groupId}/stats`);
  },

  // Vote on a pending withdrawal request. decision is 'approved' or 'rejected'.
  async voteOnWithdrawal(groupId, transactionId, decision, remarks) {
    return await api.put(`/groups/${groupId}/withdrawals/${transactionId}`, {
      status: decision,
      remarks
    });
  },

  // Promote an existing member to co-admin (creator only, capped at 2 admins)
  async promoteMember(groupId, userId) {
    return await api.post(`/groups/${groupId}/members/${userId}/promote`);
  },

  async deleteGroup(groupId) {
    return await api.delete(`/groups/${groupId}`);
  }
};

export { groupService };
