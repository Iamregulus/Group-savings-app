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
    
    // Check if response.data exists and is an array
    if (!response.data || !Array.isArray(response.data)) {
      console.warn("⚠️ Unexpected response format from getUserGroups:", response.data);
      console.log("Full response object:", JSON.stringify(response, null, 2));
      return [];
    }
    
    // Log count of groups for debugging
    console.log(`✅ Found ${response.data.length} groups for the user`);
    
    return response.data;
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