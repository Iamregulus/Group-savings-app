import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HiOutlineArrowPath, HiOutlineUserGroup } from 'react-icons/hi2';
import { groupService } from '../../services/groupService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { formatCurrency } from '../../utils/formatters';

const JoinGroup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [inviteCode, setInviteCode] = useState(searchParams.get('code') || '');
  const [availableGroups, setAvailableGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAvailableGroups = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const groups = await groupService.getAvailableGroups();
      setAvailableGroups(groups);
    } catch (err) {
      setError(err.message || 'Failed to load available groups. Please try again later.');
      setAvailableGroups([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAvailableGroups().finally(() => setLoading(false));
  }, []);

  const filteredGroups = searchQuery.trim()
    ? availableGroups.filter((g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : availableGroups;

  const handleJoinPublicGroup = async (groupId) => {
    try {
      setJoiningGroupId(groupId);
      setJoining(true);
      setError(null);
      await groupService.joinGroup(groupId, {});
      setAvailableGroups((prev) => prev.filter((g) => g.id !== groupId));
      navigate(`/groups/${groupId}`, { state: { message: 'Joined group successfully!' } });
    } catch (err) {
      setError(err.message || 'Failed to join group. Please try again.');
      setJoining(false);
      setJoiningGroupId(null);
    }
  };

  const handleJoinByInvite = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter a valid invite code');
      return;
    }

    try {
      setJoining(true);
      setError(null);
      const response = await groupService.joinGroupByCode(inviteCode.trim());
      navigate(`/groups/${response.groupId}`, { state: { message: 'Joined group successfully!' } });
    } catch (err) {
      setError(err.message || 'Invalid invite code or the group no longer exists.');
      setJoining(false);
    }
  };

  if (loading) return <Loader centered size="large" />;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Join a Savings Group</h1>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Card className="p-4">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Join with Invite Code</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Have a code? Enter it to join a private group.</p>
        <div className="space-y-3">
          <Input
            placeholder="Enter invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            disabled={joining}
          />
          <Button onClick={handleJoinByInvite} disabled={joining || !inviteCode.trim()} fullWidth>
            {joining ? 'Joining...' : 'Join Group'}
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">Public Groups</h2>
          <button onClick={fetchAvailableGroups} disabled={refreshing} className="text-emerald-600 dark:text-emerald-400">
            <HiOutlineArrowPath className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <Input
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-3"
        />

        {refreshing ? (
          <Loader centered />
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-6">
            <HiOutlineUserGroup className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No public groups available to join.</p>
            <Button onClick={() => navigate('/create-group')}>Create Your Own Group</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGroups.map((group) => (
              <div key={group.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{group.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {group.description || 'No description provided'}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{group.memberCount || 0}/{group.maxMembers || '∞'} members</span>
                      <span>{formatCurrency(group.targetAmount)} target</span>
                      <span>{formatCurrency(group.contributionAmount)} / {group.contributionFrequency}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleJoinPublicGroup(group.id)}
                    disabled={joining}
                  >
                    {joining && joiningGroupId === group.id ? 'Joining...' : 'Join'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default JoinGroup;
