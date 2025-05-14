import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import groupService from '../../services/groupService';

const CreateGroup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    contributionAmount: '',
    contributionFrequency: '',
    maxMembers: '',
    isPublic: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setDebugInfo(null);

      // This is the format the backend is expecting based on the API code
      const groupData = {
        name: formData.name,
        description: formData.description,
        targetAmount: parseFloat(formData.targetAmount),
        contributionAmount: parseFloat(formData.contributionAmount),
        contributionFrequency: formData.contributionFrequency,
        maxMembers: parseInt(formData.maxMembers),
        isPublic: formData.isPublic
      };
      
      // Add this console message to help users debug
      const helpMessage = "Creating group with data: " + 
        JSON.stringify(groupData, null, 2) + 
        "\n\nIf this fails, try running this in your browser console:" +
        "\n\nsubmitGroupForm()";
        
      console.log(helpMessage);
      setDebugInfo(helpMessage);
      
      try {
        console.log("Submitting group creation request...");
        const response = await groupService.createGroup(groupData);
        console.log('Group created successfully:', response);
        
        // Handle different response formats from the server
        let groupId = null;
        let createdGroup = null;

        if (response && response.id) {
          groupId = response.id;
          createdGroup = response;
        } else if (response && response.group && response.group.id) {
          groupId = response.group.id;
          createdGroup = response.group;
        }
        
        console.log(`Group created with ID: ${groupId}`);
        
        // Create a fixed state object for consistent routing
        const successState = { 
          message: 'Group created successfully!',
          newGroup: true,
          groupCreated: true,
          groupId: groupId,
          group: createdGroup
        };

        if (groupId) {
          // First navigate to the dashboard with the success message and flags
          // This will trigger the MyGroups component to refresh
          navigate('/dashboard', { state: successState });
          
          // This approach keeps the flags in place for MyGroups to detect
          // and doesn't immediately clear them with another navigation
        } else {
          // If we can't find the ID, go back to dashboard with groupCreated flag
          setError("Group was created but couldn't navigate to it. Redirecting to dashboard...");
          navigate('/dashboard', { state: successState });
        }
      } catch (apiError) {
        console.error('API Error Response:', apiError);
        
        // Show more detailed error information
        let errorDetails = apiError.response?.data || apiError.message || 'Unknown error';
        if (typeof errorDetails === 'object') {
          errorDetails = JSON.stringify(errorDetails, null, 2);
        }
        setDebugInfo(errorDetails);
        throw apiError;
      }
    } catch (error) {
      console.error('Error creating group:', error);
      setError(`Failed to create group: ${error.message || 'Unknown error'}`);
      setLoading(false);
    }
  };

  const validateForm = () => {
    // Implement form validation logic here
    return true; // Placeholder return, actual implementation needed
  };

  return (
    <div>
      {/* Render your form here */}
    </div>
  );
};

export default CreateGroup; 