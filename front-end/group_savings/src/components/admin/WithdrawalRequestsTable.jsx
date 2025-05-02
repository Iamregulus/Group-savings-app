import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import UserAvatar from '../dashboard/UserAvatar';

const WithdrawalRequestsTable = ({ requests, onApprove, onReject, currency = '£' }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  const handleApproveClick = (request) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };
  
  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };
  
  const confirmApproval = () => {
    if (selectedRequest) {
      onApprove(selectedRequest.id);
      setShowApproveModal(false);
    }
  };
  
  const confirmRejection = () => {
    if (selectedRequest) {
      onReject(selectedRequest.id);
      setShowRejectModal(false);
    }
  };
  
  return (
    <>
      <Card title="Withdrawal Requests" className="withdrawal-requests-card">
        {requests.length === 0 ? (
          <p className="text-muted">No pending withdrawal requests.</p>
        ) : (
          <div className="requests-table">
            <div className="requests-header">
              <div className="col-user">User</div>
              <div className="col-amount">Amount</div>
              <div className="col-date">Requested</div>
              <div className="col-reason">Reason</div>
              <div className="col-actions">Actions</div>
            </div>
            
            <div className="requests-body">
              {requests.map(request => (
                <div key={request.id} className="request-row">
                  <div className="col-user">
                    <div className="user-info">
                      <UserAvatar user={request.user} size="small" />
                      <div className="user-name">{request.user.name}</div>
                    </div>
                  </div>
                  <div className="col-amount">
                    {currency}{request.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="col-date">
                    {formatDate(request.requestDate)}
                  </div>
                  <div className="col-reason">
                    {request.reason || <span className="text-muted">No reason provided</span>}
                  </div>
                  <div className="col-actions">
                    <div className="action-buttons">
                      <Button
                        variant="success"
                        size="small"
                        onClick={() => handleApproveClick(request)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleRejectClick(request)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
      
      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Confirm Withdrawal Approval"
        actions={
          <>
            <Button 
              variant="outline" 
              onClick={() => setShowApproveModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="success" 
              onClick={confirmApproval}
            >
              Approve Withdrawal
            </Button>
          </>
        }
      >
        <p>Are you sure you want to approve this withdrawal request?</p>
        <div className="confirmation-details">
          <p><strong>User:</strong> {selectedRequest?.user.name}</p>
          <p><strong>Amount:</strong> {currency}{selectedRequest?.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p><strong>Reason:</strong> {selectedRequest?.reason || 'No reason provided'}</p>
        </div>
        <p className="text-warning">This will deduct the amount from the group's total savings.</p>
      </Modal>
      
      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Confirm Withdrawal Rejection"
        actions={
          <>
            <Button 
              variant="outline" 
              onClick={() => setShowRejectModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmRejection}
            >
              Reject Withdrawal
            </Button>
          </>
        }
      >
        <p>Are you sure you want to reject this withdrawal request?</p>
        <div className="confirmation-details">
          <p><strong>User:</strong> {selectedRequest?.user.name}</p>
          <p><strong>Amount:</strong> {currency}{selectedRequest?.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p><strong>Reason:</strong> {selectedRequest?.reason || 'No reason provided'}</p>
        </div>
      </Modal>
    </>
  );
};

export default WithdrawalRequestsTable;