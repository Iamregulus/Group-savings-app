import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { groupService } from '../../services/groupService';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import GroupCard from './GroupCard';

const MyGroups = ({ limit }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await groupService.getUserGroups();
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

  useEffect(() => {
    if (location.state?.groupCreated) {
      fetchGroups();
    }
  }, [location.state]);

  if (loading) return <Loader centered />;

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchGroups}>Try Again</Button>
      </Card>
    );
  }

  if (groups.length === 0) {
    return (
      <Card className="p-6 text-center">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">You haven't joined any groups yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">Join a savings group to start saving with others</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/join-group"><Button variant="primary">Find Groups</Button></Link>
          <Link to="/create-group"><Button variant="outline">Create Group</Button></Link>
        </div>
      </Card>
    );
  }

  const visibleGroups = limit ? groups.slice(0, limit) : groups;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {visibleGroups.map((group) => (
        <GroupCard key={group.id} group={group} onClick={() => navigate(`/groups/${group.id}`)} />
      ))}
    </div>
  );
};

export default MyGroups;
