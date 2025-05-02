import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import UserAvatar from '../dashboard/UserAvatar';

const MembersList = ({ members, onRemoveMember }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter members based on search term
  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleRemoveClick = (member) => {
    setSelectedMember(member);
    setShowConfirmModal(true);
  };
  
  const confirmRemove = () => {
    if (selectedMember) {
      onRemoveMember(selectedMember.id);
      setShowConfirmModal(false);
    }
  };
  
  return (
    <>
      <Card title="Group Members" className="members-list-card">
        <div className="search-container mb-4">
          <input
            type="text"
            placeholder="Search members..."
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {filteredMembers.length === 0 ? (
          <p className="text-muted">No members found.</p>
        ) : (
          <div className="members-list">
            {filteredMembers.map(member => (
              <div key={member.id} className="member-item">
                <div className="member-info">
                  <UserAvatar user={member} showName={false} />
                  <div className="member-details">
                    <div className="member-name">{member.name}</div>
                    <div className="member-email">{member.email}</div>
                  </div>
                </div>
                <div className="member-actions">
                  {member.isAdmin ? (
                    <span className="admin-badge">Admin</span>
                  ) : (
                    <Button 
                      variant="danger" 
                      size="small"
                      onClick={() => handleRemoveClick(member)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Removal"
        actions={
          <>
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
          </>
        }
      >
        <p>Are you sure you want to remove {selectedMember?.name} from this group?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default MembersList;