/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../../services/groupService';

// Components
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';

const JoinGroup = () => {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [availableGroups, setAvailableGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchAvailableGroups = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      console.log('Fetching available groups...');
      const groups = await groupService.getAvailableGroups();
      
      console.log('Available groups:', groups);
      setAvailableGroups(groups);
      setFilteredGroups(groups);
      
      if (groups.length === 0) {
        console.log('No available groups found');
      }
      
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching available groups:', error);
      setError(error.message || 'Failed to load available groups. Please try again later.');
      setRefreshing(false);
      setAvailableGroups([]);
      setFilteredGroups([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAvailableGroups().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredGroups(availableGroups);
    } else {
      const filtered = availableGroups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredGroups(filtered);
    }
  }, [searchQuery, availableGroups]);

  const handleJoinPublicGroup = async (groupId) => {
    try {
      setJoiningGroupId(groupId);
      setJoining(true);
      setError(null);
      
      const selectedGroup = availableGroups.find(g => g.id === groupId);
      const groupName = selectedGroup ? selectedGroup.name : 'group';
      
      console.log(`Joining group ${groupId}...`);
      await groupService.joinGroup(groupId, {});
      
      // Show success message and update available groups list
      setSuccessMessage(`Successfully joined "${groupName}"! Redirecting...`);
      
      // Remove the joined group from the list
      const updatedGroups = availableGroups.filter(g => g.id !== groupId);
      setAvailableGroups(updatedGroups);
      setFilteredGroups(updatedGroups);
      
      // Wait a moment before navigating to let the user see the success message
      setTimeout(() => {
        navigate(`/groups/${groupId}`, { state: { groupJoined: true } });
      }, 1500);
    } catch (error) {
      console.error('Error joining group:', error);
      setError(error.message || 'Failed to join group. Please try again.');
      setJoining(false);
      setJoiningGroupId(null);
    }
  };

  const handleJoinByInvite = async () => {
    if (!inviteCode || inviteCode.trim() === '') {
      setError('Please enter a valid invite code');
      return;
    }

    try {
      setJoining(true);
      setError(null);
      
      console.log(`Joining with invite code ${inviteCode.trim()}...`);
      const response = await groupService.joinGroupByCode(inviteCode.trim());
      
      // Show success message
      setSuccessMessage(`Successfully joined group! Redirecting...`);
      
      // Wait a moment before navigating to let the user see the success message
      setTimeout(() => {
        navigate(`/groups/${response.groupId}`, { state: { groupJoined: true } });
      }, 1500);
    } catch (error) {
      console.error('Error joining by invite code:', error);
      setError(error.message || 'Invalid invite code or the group no longer exists.');
      setJoining(false);
    }
  };

  const handleRefresh = () => {
    fetchAvailableGroups();
  };

  if (loading) return <Loader centered size="large" />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Join a Savings Group</h1>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>

      {error && (
        <Alert 
          type="error"
          message={error}
          className="mb-6"
          onClose={() => setError(null)}
        />
      )}
      
      {successMessage && (
        <Alert 
          type="success"
          message={successMessage}
          className="mb-6"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Join with Invite Code</h2>
          <p className="text-gray-600 mb-4">Have an invite code? Enter it below to join a private group.</p>
          
          <div className="space-y-4">
            <Input
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              disabled={joining}
            />
            <Button 
              onClick={handleJoinByInvite}
              disabled={joining || !inviteCode.trim()}
              fullWidth
              variant="primary"
            >
              {joining ? 'Joining...' : 'Join Group'}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Available Public Groups</h2>
              <Button 
                variant="text" 
                onClick={handleRefresh} 
                disabled={refreshing}
                className="text-primary flex items-center"
              >
                {refreshing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </Button>
            </div>
            
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />

            {refreshing && (
              <div className="flex justify-center py-4">
                <Loader size="medium" />
              </div>
            )}

            {!refreshing && filteredGroups.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No public groups available to join.</p>
                <div className="flex justify-center">
                  <Button onClick={() => navigate('/create-group')} variant="primary">
                    Create Your Own Group
                  </Button>
                </div>
              </div>
            )}
            
            {!refreshing && filteredGroups.length > 0 && (
              <div className="space-y-4">
                {filteredGroups.map(group => (
                  <Card key={group.id} className="p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{group.name}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{group.description || 'No description provided'}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            {group.memberCount || 0}/{group.maxMembers || 'unlimited'} members
                          </span>
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            £{group.targetAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'} target
                          </span>
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {group.contributionFrequency} payments
                          </span>
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                            £{group.contributionAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'} per {group.contributionFrequency?.replace('ly', '')}
                          </span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleJoinPublicGroup(group.id)}
                        disabled={joining}
                        variant="primary"
                        size="small"
                      >
                        {joining && joiningGroupId === group.id ? 'Joining...' : 'Join'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="text-center p-8 bg-gray-50 rounded-lg dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-300 mb-4">Can't find what you're looking for?</p>
        <Button onClick={() => navigate('/create-group')} variant="primary">Create Your Own Group</Button>
      </div>
    </div>
  );
};

export default JoinGroup;