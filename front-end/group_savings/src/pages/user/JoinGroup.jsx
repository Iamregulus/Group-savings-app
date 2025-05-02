/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../../services/groupService';

// Components
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';

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

  const fetchAvailableGroups = async () => {
    try {
      setRefreshing(true);
      const groups = await groupService.getAvailableGroups();
      setAvailableGroups(groups);
      setFilteredGroups(groups);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching available groups:', error);
      setError('Failed to load available groups. Please try again later.');
      setRefreshing(false);
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
      await groupService.joinGroup(groupId, {});
      navigate(`/groups/${groupId}`);
    } catch (error) {
      console.error('Error joining group:', error);
      setError(error.response?.data?.message || 'Failed to join group. Please try again.');
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
      const response = await groupService.joinGroupByCode(inviteCode.trim());
      navigate(`/groups/${response.groupId}`);
    } catch (error) {
      console.error('Error joining by invite code:', error);
      setError(error.response?.data?.message || 'Invalid invite code or the group no longer exists.');
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
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
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
            />
            <Button 
              onClick={handleJoinByInvite}
              disabled={joining}
              fullWidth
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
                className="text-primary"
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
            
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />

            {filteredGroups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No matching groups found.</p>
              </div>
            ) : (
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
                        variant="outline"
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

      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
        <Button onClick={() => navigate('/create-group')} variant="outline">Create Your Own Group</Button>
      </div>
    </div>
  );
};

export default JoinGroup;