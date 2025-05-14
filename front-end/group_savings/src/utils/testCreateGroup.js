import api from '../services/api';

// Function to create a test group
async function createTestGroup() {
  try {
    console.log("🔍 Testing group creation");
    
    // Sample group data
    const groupData = {
      name: "Test Group " + new Date().toLocaleTimeString(),
      description: "This is a test group created at " + new Date().toISOString(),
      targetAmount: 1000,
      contributionAmount: 100,
      contributionFrequency: "monthly",
      maxMembers: 10,
      isPublic: true
    };
    
    console.log("📝 Creating group with data:", groupData);
    
    // Make the API call directly
    const response = await api.post('/groups', groupData);
    
    console.log("📊 Group creation response:", response);
    
    // Check for group ID in response
    const groupId = response?.group?.id || response?.id;
    
    if (groupId) {
      console.log("✅ Group created successfully with ID:", groupId);
      
      // Now try to fetch the groups to see if it appears
      console.log("🔍 Fetching groups to verify creation");
      const groupsResponse = await api.get('/groups/my-groups');
      
      console.log("📊 Groups API Response:", groupsResponse);
      
      if (Array.isArray(groupsResponse?.data)) {
        const groups = groupsResponse.data;
        console.log(`📋 Found ${groups.length} groups for the user`);
        
        // Check if our new group is in the list
        const foundGroup = groups.find(g => g.id === groupId);
        
        if (foundGroup) {
          console.log("✅ CONFIRMED: Group was found in user's groups list", foundGroup);
        } else {
          console.warn("⚠️ WARNING: Created group was NOT found in user's groups");
          console.log("🔍 Looking for group ID:", groupId);
          console.log("📋 Available groups:", groups.map(g => g.id));
        }
      } else {
        console.warn("⚠️ Unexpected response format from getUserGroups:", groupsResponse);
      }
    } else {
      console.error("❌ Failed to get group ID from response");
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error in test create group:', error);
    throw error;
  }
}

// Function to log all groups for the current user
async function logUserGroups() {
  try {
    console.log("🔍 Fetching all groups for current user");
    const response = await api.get('/groups/my-groups');
    
    console.log("📊 Groups API Response:", response);
    
    if (Array.isArray(response?.data)) {
      const groups = response.data;
      console.log(`📋 Found ${groups.length} groups for the user`);
      
      if (groups.length > 0) {
        groups.forEach((group, index) => {
          console.log(`Group ${index + 1}: ID=${group.id}, Name=${group.name}`);
        });
      } else {
        console.log("No groups found for this user");
      }
    } else {
      console.warn("⚠️ Unexpected response format from getUserGroups:", response);
    }
  } catch (error) {
    console.error('❌ Error fetching user groups:', error);
  }
}

// Export functions so they can be called from the browser console
window.testCreateGroup = createTestGroup;
window.logUserGroups = logUserGroups;

export { createTestGroup, logUserGroups }; 