import api from './api';

export const groupService = {
  // Get all available groups for joining
  async getAvailableGroups() {
    try {
      const response = await api.get('/groups/available');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching available groups:', error);
      throw error;
    }
  },

  // Get groups that a user belongs to
  async getUserGroups(userId) {
    try {
      const response = await api.get(`/users/${userId}/groups`);
      return response.data || [];
    } catch (error) {
      throw error;
    }
  },

  // Get details of a specific group
  async getGroupById(groupId) {
    try {
      const response = await api.get(`/groups/${groupId}`);
      return response.data || {};
    } catch (error) {
      throw error;
    }
  },

  // Create a new savings group
  async createGroup(groupData) {
    try {
      // Log the exact data being sent to the server
      console.log('Sending group data to server:', JSON.stringify(groupData, null, 2));
      
      // Make sure all required fields are present and properly formatted
      const formattedData = {
        name: groupData.name,
        description: groupData.description || '',
        targetAmount: Number(groupData.targetAmount),
        contributionAmount: Number(groupData.contributionAmount),
        contributionFrequency: groupData.contributionFrequency,
        maxMembers: Number(groupData.maxMembers),
        isPublic: !!groupData.isPublic
      };
      
      console.log('Formatted data being sent:', JSON.stringify(formattedData, null, 2));
      
      // Using trailing slash since we now support both in the backend
      const response = await api.post('/groups/', formattedData);
      console.log('Server response:', response);
      
      // Return the data from the response
      return response.data || response;
    } catch (error) {
      console.error('Error in createGroup:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Update a group's details
  async updateGroup(groupId, groupData) {
    try {
      const response = await api.put(`/groups/${groupId}`, groupData);
      return response.data || {};
    } catch (error) {
      throw error;
    }
  },

  // Join an existing group
  async joinGroup(groupId, joinData) {
    try {
      const response = await api.post(`/groups/${groupId}/join`, joinData);
      return response.data || {};
    } catch (error) {
      throw error;
    }
  },
  
  // Join a group using an invite code
  async joinGroupByCode(code) {
    try {
      const response = await api.post('/groups/join-by-code', { joinCode: code });
      return response.data || {};
    } catch (error) {
      throw error;
    }
  },

  // Leave a group
  async leaveGroup(groupId) {
    try {
      const response = await api.post(`/groups/${groupId}/leave`);
      return response.data || {};
    } catch (error) {
      throw error;
    }
  },

  // Get members of a group
  async getGroupMembers(groupId) {
    try {
      const response = await api.get(`/groups/${groupId}/members`);
      return response.data || [];
    } catch (error) {
      throw error;
    }
  },

  // Make a contribution to a group
  async makeContribution(groupId, contributionData) {
    try {
      const response = await api.post(`/groups/${groupId}/contributions`, contributionData);
      return response.data || {};
    } catch (error) {
      throw error;
    }
  },

  // Request a withdrawal from a group
  async requestWithdrawal(groupId, withdrawalData) {
    try {
      const response = await api.post(`/groups/${groupId}/withdrawals`, withdrawalData);
      return response.data || {};
    } catch (error) {
      throw error;
    }
  },

  // Get group statistics
  async getGroupStats(groupId) {
    try {
      const response = await api.get(`/groups/${groupId}/stats`);
      return response.data || {};
    } catch (error) {
      throw error;
    }
  },

  // Admin: Approve or reject a withdrawal request
  async processWithdrawalRequest(groupId, requestId, action, remarks) {
    try {
      const response = await api.put(`/groups/${groupId}/withdrawals/${requestId}`, { 
        status: action, 
        remarks 
      });
      return response.data || {};
    } catch (error) {
      throw error;
    }
  }
};
