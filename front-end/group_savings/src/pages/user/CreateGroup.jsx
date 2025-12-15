/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../../services/groupService';
import { useAuth } from '../../context/AuthContext';

// Components
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';

// Required field indicator component
const RequiredField = () => (
  <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
);

const CreateGroup = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    isPublic: false,
    contributionFrequency: 'monthly',
    contributionAmount: '',
    maxMembers: '10', // Default value
    goalDate: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [debugInfo, setDebugInfo] = useState(null);

  // Add a window-level function for debugging from console
  useEffect(() => {
    window.submitGroupForm = (data) => {
      const testData = data || {
        name: "Test Group",
        description: "This is a test group",
        targetAmount: 1000,
        contributionAmount: 100,
        contributionFrequency: "monthly",
        maxMembers: 10,
        isPublic: true
      };
      console.log("Testing form submission with data:", testData);
      groupService.createGroup(testData)
        .then(resp => console.log("Success:", resp))
        .catch(err => console.error("Error:", err));
    };
    
    return () => {
      delete window.submitGroupForm;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Group name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.targetAmount || isNaN(parseFloat(formData.targetAmount)) || parseFloat(formData.targetAmount) <= 0) {
      errors.targetAmount = 'Please enter a valid target amount';
    }
    
    if (!formData.contributionAmount || isNaN(parseFloat(formData.contributionAmount)) || parseFloat(formData.contributionAmount) <= 0) {
      errors.contributionAmount = 'Please enter a valid contribution amount';
    }
    
    if (!formData.maxMembers || isNaN(parseInt(formData.maxMembers)) || parseInt(formData.maxMembers) <= 0) {
      errors.maxMembers = 'Please enter a valid maximum number of members';
    }
    
    if (formData.goalDate) {
      const goalDateObj = new Date(formData.goalDate);
      const today = new Date();
      
      if (goalDateObj <= today) {
        errors.goalDate = 'Goal date must be in the future';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
        const response = await groupService.createGroup(groupData);
        console.log('Group created successfully:', response);
        
        // Handle different response formats from the server
        const groupId = response.id || (response.group && response.group.id);
        
        if (groupId) {
          navigate(`/groups/${groupId}`, { 
            state: { 
              message: 'Group created successfully!',
              newGroup: true,
              groupCreated: true
            } 
          });
        } else {
          // If we can't find the ID, go back to dashboard with groupCreated flag
          setError("Group was created but couldn't navigate to it. Redirecting to dashboard...");
          setTimeout(() => navigate('/dashboard', { 
            state: { 
              message: 'Group created successfully!',
              groupCreated: true 
            }
          }), 2000);
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

  if (loading) return <Loader centered size="large" />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create a New Savings Group</h1>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {debugInfo && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md mb-6 overflow-auto">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          <pre className="whitespace-pre-wrap text-sm">{debugInfo}</pre>
        </div>
      )}

      <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-md">
        Fields marked with <span style={{ color: 'red' }}>*</span> are required.
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Group Name<RequiredField />
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${formErrors.name ? 'error' : ''}`}
                required
              />
              {formErrors.name && <div className="form-error">{formErrors.name}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description<RequiredField />
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`form-input h-24 ${formErrors.description ? 'error' : ''}`}
                required
              />
              {formErrors.description && <div className="form-error">{formErrors.description}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="maxMembers" className="form-label">
                Maximum Number of Members<RequiredField />
              </label>
              <input
                id="maxMembers"
                name="maxMembers"
                type="number"
                value={formData.maxMembers}
                onChange={handleChange}
                className={`form-input ${formErrors.maxMembers ? 'error' : ''}`}
                min="2"
                max="100"
                required
              />
              {formErrors.maxMembers && <div className="form-error">{formErrors.maxMembers}</div>}
              <p className="text-xs text-gray-500 mt-1">Minimum 2 members, maximum 100 members</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox"
                id="isPublic"
                name="isPublic"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                checked={formData.isPublic}
                onChange={handleChange}
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700">
                Make this group public (anyone can join)
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Savings Goals</h2>
            
            <div className="form-group">
              <label htmlFor="targetAmount" className="form-label">
                Target Amount (£)<RequiredField />
              </label>
              <input
                id="targetAmount"
                name="targetAmount"
                type="number"
                value={formData.targetAmount}
                onChange={handleChange}
                className={`form-input ${formErrors.targetAmount ? 'error' : ''}`}
                min="1"
                step="0.01"
                required
              />
              {formErrors.targetAmount && <div className="form-error">{formErrors.targetAmount}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="goalDate" className="form-label">
                Goal Date (Optional)
              </label>
              <input
                id="goalDate"
                name="goalDate"
                type="date"
                value={formData.goalDate}
                onChange={handleChange}
                className={`form-input ${formErrors.goalDate ? 'error' : ''}`}
              />
              {formErrors.goalDate && <div className="form-error">{formErrors.goalDate}</div>}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Contribution Settings</h2>
            
            <div className="form-group">
              <label htmlFor="contributionFrequency" className="form-label">
                Contribution Frequency<RequiredField />
              </label>
              <select
                id="contributionFrequency"
                name="contributionFrequency"
                value={formData.contributionFrequency}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom / Flexible</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="contributionAmount" className="form-label">
                Contribution Amount (£)<RequiredField />
              </label>
              <input
                id="contributionAmount"
                name="contributionAmount"
                type="number"
                value={formData.contributionAmount}
                onChange={handleChange}
                className={`form-input ${formErrors.contributionAmount ? 'error' : ''}`}
                min="1"
                step="0.01"
                required
              />
              {formErrors.contributionAmount && <div className="form-error">{formErrors.contributionAmount}</div>}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button 
              type="button" 
              variant="primary" 
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit">Create Group</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateGroup;