import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import UserAvatar from '../dashboard/UserAvatar';

const PendingRequestsTable = ({ requests, onApprove, onReject }) => {
  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  return (
    <Card title="Pending Join Requests" className="requests-card">
      {requests.length === 0 ? (
        <p className="text-muted">No pending requests.</p>
      ) : (
        <div className="requests-table">
          <div className="requests-header">
            <div className="col-user">User</div>
            <div className="col-date">Requested</div>
            <div className="col-message">Message</div>
            <div className="col-actions">Actions</div>
          </div>
          
          <div className="requests-body">
            {requests.map(request => (
              <div key={request.id} className="request-row">
                <div className="col-user">
                  <div className="user-info">
                    <UserAvatar user={request.user} size="small" />
                    <div className="user-details">
                      <div className="user-name">{request.user.name}</div>
                      <div className="user-email">{request.user.email}</div>
                    </div>
                  </div>
                </div>
                <div className="col-date">
                  {formatDate(request.requestDate)}
                </div>
                <div className="col-message">
                  {request.message || <span className="text-muted">No message</span>}
                </div>
                <div className="col-actions">
                  <div className="action-buttons">
                    <Button
                      variant="success"
                      size="small"
                      onClick={() => onApprove(request.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => onReject(request.id)}
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
  );
};

export default PendingRequestsTable;