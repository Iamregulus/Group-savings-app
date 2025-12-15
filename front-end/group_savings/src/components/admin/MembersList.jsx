import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import UserAvatar from '../dashboard/UserAvatar';

const MembersList = ({ members = [], isAdmin = false, onInviteMember, onRemoveMember }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  // Process members to ensure we have the right format
  const processedMembers = members ? (Array.isArray(members) ? members : []) : [];
  
  // Filter members based on search term
  const filteredMembers = processedMembers.filter(member => {
    const memberName = member.firstName && member.lastName 
      ? `${member.firstName} ${member.lastName}`
      : member.name || '';
    const memberEmail = member.email || '';
    
    return memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memberEmail.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const handleRemoveClick = (member) => {
    setSelectedMember(member);
    setShowConfirmModal(true);
  };
  
  const confirmRemove = () => {
    if (selectedMember && onRemoveMember) {
      onRemoveMember(selectedMember.id);
      setShowConfirmModal(false);
    }
  };

  const handleInviteSubmit = () => {
    if (inviteEmail && onInviteMember) {
      onInviteMember(inviteEmail);
      setInviteEmail('');
      setShowInviteModal(false);
    }
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/invite/${window.location.pathname.split('/').pop()}`;
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
  };
  
  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-4 px-4 pt-2">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{filteredMembers.length} {filteredMembers.length === 1 ? 'Member' : 'Members'}</div>
          {isAdmin && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowInviteModal(true)}
            >
              Invite
            </Button>
          )}
        </div>
        
        {processedMembers.length > 3 && (
          <div className="mb-4 px-4">
            <input
              type="text"
              placeholder="Search members..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
        
        {filteredMembers.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No members found matching your search.' : 'No members in this group yet.'}
            {isAdmin && !searchTerm && (
              <div className="mt-2">
                <Button 
                  size="sm" 
                  onClick={() => setShowInviteModal(true)}
                >
                  Invite Members
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMembers.map(member => {
              const memberName = member.firstName && member.lastName 
                ? `${member.firstName} ${member.lastName}`
                : member.name || 'Unknown';
              
              return (
                <div key={member.id || member.userId} className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-800 dark:text-purple-300 font-semibold text-lg">
                      {memberName.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{memberName}</p>
                      {member.email && <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>}
                      {member.role && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {member.role === 'admin' ? 'Admin' : 'Member'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {isAdmin && member.role !== 'admin' && onRemoveMember && (
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleRemoveClick(member)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!isAdmin && processedMembers.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 text-right">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleCopyInviteLink}
            >
              Copy Invite Link
            </Button>
          </div>
        )}
      </Card>
      
      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Removal"
        actions={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmRemove}
            >
              Remove Member
            </Button>
          </div>
        }
      >
        <p className="mb-2 text-gray-900 dark:text-gray-100">Are you sure you want to remove {selectedMember?.name || selectedMember?.firstName} from this group?</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
      </Modal>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Members"
        actions={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowInviteModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleInviteSubmit}
              disabled={!inviteEmail}
            >
              Send Invite
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="inviteEmail"
              placeholder="member@example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Alternatively, you can share this link:</p>
            <div className="flex">
              <input
                type="text"
                className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                value={`${window.location.origin}/invite/${window.location.pathname.split('/').pop()}`}
                readOnly
              />
              <Button 
                className="rounded-l-none"
                onClick={handleCopyInviteLink}
              >
                Copy
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MembersList;