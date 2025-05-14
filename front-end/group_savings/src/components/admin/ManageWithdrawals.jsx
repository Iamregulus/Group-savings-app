import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transactionService } from '../../services/transactionService';
import { groupService } from '../../services/groupService';
import { useAuth } from '../../context/AuthContext';

// Components
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import Input from '../common/Input';

const ManageWithdrawals = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [group, setGroup] = useState(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch group data to verify admin status
        const groupData = await groupService.getGroupById(groupId);
        
        // Verify the user is an admin of this group
        if (groupData.userRole !== 'admin') {
          setError('You do not have permission to manage withdrawal requests for this group');
          setLoading(false);
          return;
        }
        
        setGroup(groupData);
        
        // Fetch pending withdrawal requests
        const transactions = await transactionService.getGroupTransactions(groupId);
        
        // Filter for pending withdrawal requests
        const pendingWithdrawals = transactions.filter(transaction => 
          transaction.transaction_type === 'withdrawal' && 
          transaction.status === 'pending'
        );
        
        // Enhance with user information if available
        const enhancedWithdrawals = await Promise.all(pendingWithdrawals.map(async (request) => {
          try {
            // Try to get full transaction details
            const fullDetails = await transactionService.getTransactionById(request.id);
            return fullDetails;
          } catch (error) {
            // If can't get details, return original request
            return request;
          }
        }));
        
        setWithdrawalRequests(enhancedWithdrawals);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching withdrawal data:', error);
        setError('Failed to load withdrawal requests. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [groupId, currentUser]);

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setRemarks('');
    setShowApproveModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setRemarks('');
    setShowRejectModal(true);
  };

  const confirmApproval = async () => {
    if (!selectedRequest) return;
    
    try {
      setProcessing(true);
      
      await groupService.processWithdrawalRequest(
        groupId,
        selectedRequest.id,
        'completed',
        remarks
      );
      
      // Remove the processed request from the list
      setWithdrawalRequests(prevRequests => 
        prevRequests.filter(req => req.id !== selectedRequest.id)
      );
      
      setShowApproveModal(false);
      setSuccessMessage('Withdrawal request approved successfully');
      
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      setError('Failed to approve withdrawal. Please try again.');
    } finally {
      setProcessing(false);
      setSelectedRequest(null);
    }
  };

  const confirmRejection = async () => {
    if (!selectedRequest || !remarks.trim()) return;
    
    try {
      setProcessing(true);
      
      await groupService.processWithdrawalRequest(
        groupId,
        selectedRequest.id,
        'rejected',
        remarks
      );
      
      // Remove the processed request from the list
      setWithdrawalRequests(prevRequests => 
        prevRequests.filter(req => req.id !== selectedRequest.id)
      );
      
      setShowRejectModal(false);
      setSuccessMessage('Withdrawal request rejected successfully');
      
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      setError('Failed to reject withdrawal. Please try again.');
    } finally {
      setProcessing(false);
      setSelectedRequest(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) return <Loader centered size="large" />;

  if (error) {
    return (
      <Card className="p-6">
        <Alert type="error" message={error} />
        <div className="mt-4 text-center">
          <Button onClick={() => navigate(`/group/${groupId}`)}>Back to Group</Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Withdrawal Requests</h1>
        <Button variant="outline" onClick={() => navigate(`/group/${groupId}`)}>Back to Group</Button>
      </div>
      
      {successMessage && (
        <Alert 
          type="success" 
          message={successMessage} 
          className="mb-6"
          onClose={() => setSuccessMessage(null)}
        />
      )}
      
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {group.name} - Pending Withdrawals
        </h2>
        
        {withdrawalRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No pending withdrawal requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                {withdrawalRequests.map((request) => {
                  const userName = request.user 
                    ? `${request.user.firstName} ${request.user.lastName}`
                    : 'Unknown User';
                    
                  return (
                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{userName}</div>
                        {request.user && <div className="text-sm text-gray-500 dark:text-gray-400">{request.user.email}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">£{parseFloat(request.amount).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(request.created_at || request.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{request.description || 'No reason provided'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="space-x-2">
                          <Button
                            variant="success"
                            size="small"
                            onClick={() => handleApprove(request)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="small"
                            onClick={() => handleReject(request)}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => !processing && setShowApproveModal(false)}
        title="Approve Withdrawal Request"
        actions={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowApproveModal(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button 
              variant="success"
              onClick={confirmApproval}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Approve Withdrawal'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 p-2">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
            <p className="text-sm text-gray-500 dark:text-gray-400">Member</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {selectedRequest?.user 
                ? `${selectedRequest.user.firstName} ${selectedRequest.user.lastName}`
                : 'Unknown User'}
            </p>
            
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  £{selectedRequest?.amount ? parseFloat(selectedRequest.amount).toFixed(2) : '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Requested On</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(selectedRequest?.created_at || selectedRequest?.createdAt)}
                </p>
              </div>
            </div>
            
            {selectedRequest?.description && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">Reason</p>
                <p className="text-gray-700 dark:text-gray-300">{selectedRequest.description}</p>
              </div>
            )}
          </div>
          
          <Input
            label="Notes (Optional)"
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add any notes about this approval"
          />
          
          <div className="bg-green-50 dark:bg-green-900 p-3 rounded text-green-800 dark:text-green-200 text-sm">
            <p>Approving this request will release the funds to the member. This action cannot be undone.</p>
          </div>
        </div>
      </Modal>
      
      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => !processing && setShowRejectModal(false)}
        title="Reject Withdrawal Request"
        actions={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowRejectModal(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button 
              variant="danger"
              onClick={confirmRejection}
              disabled={processing || !remarks.trim()}
            >
              {processing ? 'Processing...' : 'Reject Withdrawal'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 p-2">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
            <p className="text-sm text-gray-500 dark:text-gray-400">Member</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {selectedRequest?.user 
                ? `${selectedRequest.user.firstName} ${selectedRequest.user.lastName}`
                : 'Unknown User'}
            </p>
            
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  £{selectedRequest?.amount ? parseFloat(selectedRequest.amount).toFixed(2) : '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Requested On</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(selectedRequest?.created_at || selectedRequest?.createdAt)}
                </p>
              </div>
            </div>
            
            {selectedRequest?.description && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">Reason</p>
                <p className="text-gray-700 dark:text-gray-300">{selectedRequest.description}</p>
              </div>
            )}
          </div>
          
          <Input
            label="Reason for Rejection (Required)"
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Explain why you are rejecting this withdrawal request"
            required
          />
          
          <div className="bg-red-50 dark:bg-red-900 p-3 rounded text-red-800 dark:text-red-200 text-sm">
            <p>The member will be notified of your decision with the reason you provide above.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageWithdrawals; 