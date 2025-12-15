import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transactionService } from '../../services/transactionService';
import { groupService } from '../../services/groupService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';

const ManageWithdrawals = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupData, transactionsData] = await Promise.all([
          groupService.getGroup(groupId),
          transactionService.getGroupTransactions(groupId)
        ]);
        
        setGroupName(groupData.name);
        const pending = transactionsData.filter(
          (t) => t.transactionType === 'withdrawal' && t.status === 'pending'
        );
        setRequests(pending);
      } catch (err) {
        setError('Failed to load withdrawal requests. You may not have permission to view this page.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId]);

  const handleProcessRequest = async (transactionId, action) => {
    setProcessingId(transactionId);
    try {
      await groupService.processWithdrawalRequest(groupId, transactionId, action, 'Processed by group creator');
      setRequests(requests.filter((r) => r.id !== transactionId));
    } catch (err) {
      setError(`Failed to ${action} request. Please try again.`);
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Loader centered />;

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert type="error" message={error} />
        <Button onClick={() => navigate(`/groups/${groupId}`)} className="mt-4">Back to Group</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Withdrawals for {groupName}</h1>
      <Card>
        {requests.length === 0 ? (
          <p className="p-4 text-center">No pending withdrawal requests.</p>
        ) : (
          <ul className="divide-y divide-gray-700">
            {requests.map((req) => (
              <li key={req.id} className="p-4 flex justify-between items-center">
                <div>
                  <p><strong>Amount:</strong> £{req.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">Requested by: {req.user?.name || 'Unknown User'}</p>
                  <p className="text-sm text-gray-400">Date: {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="success"
                    onClick={() => handleProcessRequest(req.id, 'completed')}
                    disabled={processingId === req.id}
                  >
                    {processingId === req.id ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleProcessRequest(req.id, 'rejected')}
                    disabled={processingId === req.id}
                  >
                    {processingId === req.id ? 'Processing...' : 'Reject'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Button onClick={() => navigate(`/groups/${groupId}`)} className="mt-4">Back to Group</Button>
    </div>
  );
};

export default ManageWithdrawals; 