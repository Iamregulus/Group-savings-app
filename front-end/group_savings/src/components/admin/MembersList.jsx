import React, { useState } from 'react';
import { HiOutlineLink } from 'react-icons/hi2';
import Card from '../common/Card';
import Button from '../common/Button';

const MembersList = ({ members = [], isCreator = false, canPromote = false, onPromote, joinCode, groupId }) => {
  const [promotingId, setPromotingId] = useState(null);

  const processedMembers = Array.isArray(members) ? members : [];

  const handlePromote = async (userId) => {
    if (!onPromote) return;
    try {
      setPromotingId(userId);
      await onPromote(userId);
    } finally {
      setPromotingId(null);
    }
  };

  const handleCopyInviteLink = () => {
    const link = joinCode
      ? `${window.location.origin}/join-group?code=${joinCode}`
      : `${window.location.origin}/groups/${groupId}`;
    navigator.clipboard.writeText(link);
    alert('Invite link copied to clipboard!');
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {processedMembers.length} {processedMembers.length === 1 ? 'Member' : 'Members'}
        </span>
        <button
          onClick={handleCopyInviteLink}
          className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
        >
          <HiOutlineLink className="h-3.5 w-3.5" /> Invite
        </button>
      </div>

      {processedMembers.length === 0 ? (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">No members yet.</p>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {processedMembers.map((member) => {
            const name = member.firstName && member.lastName
              ? `${member.firstName} ${member.lastName}`
              : member.name || 'Unknown';
            const userId = member.userId || member.id;

            return (
              <div key={userId} className="py-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 flex-shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{name}</p>
                    {member.role && (
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        member.role === 'admin'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {member.role === 'admin' ? 'Admin' : 'Member'}
                      </span>
                    )}
                  </div>
                </div>

                {isCreator && canPromote && member.role !== 'admin' && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={promotingId === userId}
                    onClick={() => handlePromote(userId)}
                  >
                    {promotingId === userId ? 'Promoting...' : 'Make Admin'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default MembersList;
