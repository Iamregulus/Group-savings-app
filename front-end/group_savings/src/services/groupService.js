import api from './api';

const groupService = {
  // Get all available groups for joining
  async getAvailableGroups() {
    try {
      console.log("🔍 Calling API: GET /groups/available");
      const response = await api.get('/groups/available');
      console.log("📊 API Response from getAvailableGroups:", response);
      return response || [];
    } catch (error) {
      console.error('❌ Error fetching available groups:', error);
      throw error;
    }
  },

  // Get groups that a user belongs to
  async getUserGroups() {
    try {
      console.log("🔍 Calling API: GET /groups/my-groups");
      const response = await api.get('/groups/my-groups');
      
      console.log("📊 API Response from getUserGroups:", response);
      
      // Check if response is properly formed
      if (!response) {
        console.warn("⚠️ Unexpected response format from getUserGroups: null or undefined response");
        return [];
      }
      
      // If response is already an array, just return it
      if (Array.isArray(response)) {
        console.log(`✅ Found ${response.length} groups in array response`);
        return response;
      }
      
      // Check if response.data exists and is an array
      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ Found ${response.data.length} groups in response.data`);
        return response.data;
      }
      
      // If we get here, the response format is unexpected
      console.warn("⚠️ Unexpected response format from getUserGroups:", response);
      console.log("Full response object:", JSON.stringify(response, null, 2));
      
      // Try to extract any array we find
      if (response && typeof response === 'object') {
        const possibleArrays = Object.values(response).filter(v => Array.isArray(v));
        if (possibleArrays.length > 0) {
          console.log("📋 Found possible array in response:", possibleArrays[0]);
          return possibleArrays[0];
        }
      }
      
      // If all else fails, return empty array
      return [];
    } catch (error) {
      console.error('❌ Error fetching user groups:', error);
      
      // Log error detail
      if (error.response) {
        console.error('📄 Error response data:', error.response.data);
        console.error('🔢 Error response status:', error.response.status);
      }
      
      // Rethrow the error for the component to handle
      throw error;
    }
  },

  // Get a specific group by ID
  async getGroup(groupId) {
    try {
      console.log(`🔍 Calling API: GET /groups/${groupId}`);
      const response = await api.get(`/groups/${groupId}`);
      console.log("📊 API Response from getGroup:", response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching group ${groupId}:`, error);
      throw error;
    }
  },

  // Create a new group
  async createGroup(groupData) {
    try {
      console.log("📝 Creating new group with data:", groupData);
      
      // Make the API call
      const response = await api.post('/groups', groupData);
      
      console.log("📊 Group creation response:", response);
      
      // Handle different response formats
      if (response && response.id) {
        console.log("✅ Group created successfully with ID:", response.id);
        return response;
      } else if (response && response.group && response.group.id) {
        console.log("✅ Group created successfully with ID:", response.group.id);
        return response;
      } else {
        console.warn("⚠️ Unexpected response format from createGroup:", response);
        // Still return the response even if format is unexpected
        return response;
      }
    } catch (error) {
      console.error('❌ Error creating group:', error);
      
      // Log error detail
      if (error.response) {
        console.error('📄 Error response data:', error.response.data);
        console.error('🔢 Error response status:', error.response.status);
      }
      
      // Rethrow the error for the component to handle
      throw error;
    }
  },

  // Join a group
  async joinGroup(groupId, data = {}) {
    try {
      console.log(`🔍 Calling API: POST /groups/${groupId}/join`);
      const response = await api.post(`/groups/${groupId}/join`, data);
      console.log("📊 API Response from joinGroup:", response);
      return response;
    } catch (error) {
      console.error(`❌ Error joining group ${groupId}:`, error);
      throw error;
    }
  },

  // Join a group using a join code
  async joinGroupByCode(joinCode) {
    try {
      console.log(`🔍 Calling API: POST /groups/join-by-code`);
      const response = await api.post('/groups/join-by-code', { joinCode });
      console.log("📊 API Response from joinGroupByCode:", response);
      return response;
    } catch (error) {
      console.error(`❌ Error joining group with code:`, error);
      throw error;
    }
  },

  // Make a contribution to a group
  async makeContribution(groupId, amount, paymentMethod) {
    try {
      console.log(`🔍 Calling API: POST /groups/${groupId}/contributions`);
      const response = await api.post(`/groups/${groupId}/contributions`, {
        amount,
        paymentMethod
      });
      console.log("📊 API Response from makeContribution:", response);
      return response;
    } catch (error) {
      console.error(`❌ Error making contribution to group ${groupId}:`, error);
      throw error;
    }
  },

  // Request a withdrawal from a group
  async requestWithdrawal(groupId, withdrawalData) {
    try {
      console.log(`🔍 Calling API: POST /groups/${groupId}/withdrawals`);
      const response = await api.post(`/groups/${groupId}/withdrawals`, withdrawalData);
      console.log("📊 API Response from requestWithdrawal:", response);
      return response;
    } catch (error) {
      console.error(`❌ Error requesting withdrawal from group ${groupId}:`, error);
      throw error;
    }
  },

  // Leave a group
  async leaveGroup(groupId) {
    try {
      console.log(`🔍 Calling API: POST /groups/${groupId}/leave`);
      const response = await api.post(`/groups/${groupId}/leave`);
      console.log("📊 API Response from leaveGroup:", response);
      return response;
    } catch (error) {
      console.error(`❌ Error leaving group ${groupId}:`, error);
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

  // Update a group's details
  async updateGroup(groupId, groupData) {
    try {
      const response = await api.put(`/groups/${groupId}`, groupData);
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
  async processWithdrawalRequest(groupId, transactionId, action, remarks) {
    try {
      return await api.put(`/groups/${groupId}/withdrawals/${transactionId}`, {
        status: action,
        remarks: remarks
      });
    } catch (error) {
      console.error(`Error processing withdrawal request ${transactionId}:`, error);
      throw error;
    }
  },

  async deleteGroup(groupId) {
    try {
      return await api.delete(`/groups/${groupId}`);
    } catch (error) {
      console.error(`Error deleting group ${groupId}:`, error);
      throw error;
    }
  }
};

export { groupService };
