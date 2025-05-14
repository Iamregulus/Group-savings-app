import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { groupService } from '../../services/groupService';
import Card from '../common/Card';
import Button from '../common/Button';

const MyGroups = () => {
  const location = useLocation();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await groupService.getUserGroups();
      console.log("Fetched user groups:", data);
      setGroups(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to load your groups. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Check if we just created a group and refresh the list
  useEffect(() => {
    if (location.state?.groupCreated) {
      fetchGroups();
    }
  }, [location.state]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
        <div className="mt-4 text-center">
          <Button onClick={fetchGroups}>Try Again</Button>
        </div>
      </Card>
    );
  }

  if (groups.length === 0) {
    return (
      <Card className="p-6 text-center">
        <h3 className="font-medium mb-2">You haven't joined any groups yet</h3>
        <p className="text-gray-500 mb-4">Join a savings group to start saving with others</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/join-group">
            <Button variant="primary">Find Groups to Join</Button>
          </Link>
          <Link to="/create-group">
            <Button variant="outline">Create New Group</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Groups</h2>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="text" 
            onClick={fetchGroups} 
            size="sm"
            className="flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
          <Link to="/join-group">
            <Button variant="outline" size="sm">Join New Group</Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map(group => (
          <Link to={`/groups/${group.id}`} key={group.id}>
            <Card className="p-4 hover:shadow-lg transition-shadow duration-200 h-full">
              <div className="flex flex-col h-full">
                <h3 className="font-medium text-lg mb-1">{group.name}</h3>
                <p className="text-gray-500 text-sm mb-2 flex-grow">
                  {group.description && group.description.length > 100 
                    ? group.description.substring(0, 100) + '...' 
                    : group.description || 'No description available'}
                </p>
                
                {/* Group Stats */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Target</p>
                      <p className="font-medium">£{typeof group.targetAmount === 'number' ? group.targetAmount.toLocaleString() : 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
                      <p className="font-medium">{group.memberCount || 0}/{group.maxMembers || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Contribution</p>
                      <p className="font-medium">£{group.contributionAmount || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Frequency</p>
                      <p className="font-medium capitalize">{group.contributionFrequency || 'monthly'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Role Badge */}
                {group.role === 'admin' && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      Admin
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyGroups; 