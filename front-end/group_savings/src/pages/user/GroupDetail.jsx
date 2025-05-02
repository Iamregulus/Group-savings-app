import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupService } from '../../services/groupService';
import { transactionService } from '../../services/transactionService';
import { useAuth } from '../../context/AuthContext';

// Components
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import TransactionHistory from '../../components/dashboard/TransactionHistory';
import MembersList from '../../components/admin/MembersList';

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leavingGroup, setLeavingGroup] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  
  // Modal states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [processingTransaction, setProcessingTransaction] = useState(false);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setLoading(true);
        const groupData = await groupService.getGroupById(groupId);
        setGroup(groupData);
        
        const transactionData = await transactionService.getGroupTransactions(groupId);
        setTransactions(transactionData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching group data:', error);
        setError('Failed to load group details. Please try again later.');
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]);

  const handleDeposit = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setProcessingTransaction(true);
      // Use makeContribution instead of createDeposit
      await groupService.makeContribution(groupId, {
        amount: parseFloat(amount),
        note: note
      });
      
      // Refresh data
      const updatedGroup = await groupService.getGroupById(groupId);
      setGroup(updatedGroup);
      
      const updatedTransactions = await transactionService.getGroupTransactions(groupId);
      setTransactions(updatedTransactions);
      
      // Reset form and close modal
      setAmount('');
      setNote('');
      setShowDepositModal(false);
      setProcessingTransaction(false);
    } catch (error) {
      console.error('Error making contribution:', error);
      setError('Failed to process deposit. Please try again.');
      setProcessingTransaction(false);
    }
  };

  const handleWithdrawalRequest = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > group.availableBalance) {
      setError('Withdrawal amount exceeds available balance');
      return;
    }

    try {
      setProcessingTransaction(true);
      await groupService.requestWithdrawal(groupId, {
        amount: parseFloat(amount),
        reason: note
      });
      
      // Reset form and close modal
      setAmount('');
      setNote('');
      setShowWithdrawModal(false);
      setProcessingTransaction(false);

      // Show success message
      alert('Withdrawal request submitted successfully. Pending admin approval.');
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      setError('Failed to submit withdrawal request. Please try again.');
      setProcessingTransaction(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      setLeavingGroup(true);
      await groupService.leaveGroup(groupId);
      setShowLeaveConfirmModal(false);
      navigate('/dashboard', { state: { message: 'You have successfully left the group.' } });
    } catch (error) {
      console.error('Error leaving group:', error);
      setError(error.response?.data?.message || 'Failed to leave group. Please try again.');
      setLeavingGroup(false);
      setShowLeaveConfirmModal(false);
    }
  };

  // Check if user can leave the group (if they're the only admin, they cannot leave)
  const canLeaveGroup = () => {
    if (!group) return false;
    
    // If user is not an admin, they can leave
    if (group.userRole !== 'admin') return true;
    
    // If user is admin, check if there are other admins
    const adminCount = group.members?.filter(member => member.role === 'admin').length || 0;
    return adminCount > 1;
  };

  if (loading) return <Loader centered size="large" />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Group not found</h2>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{group.name}</h1>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>

      <div className="mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Group Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Total Savings</p>
              <p className="text-xl font-bold text-primary">£{group.totalSaved?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Members</p>
              <p className="text-xl font-bold text-primary">{group.memberCount || 0}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Your Contribution</p>
              <p className="text-xl font-bold text-primary">£{group.userSavings?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-xl font-bold text-primary">£{group.availableBalance?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <Button 
          onClick={() => setShowDepositModal(true)}
        >
          Make Contribution
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setShowWithdrawModal(true)}
          disabled={!group.availableBalance || group.availableBalance <= 0}
        >
          Request Withdrawal
        </Button>
        {canLeaveGroup() && (
          <Button 
            variant="danger" 
            onClick={() => setShowLeaveConfirmModal(true)}
          >
            Leave Group
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <TransactionHistory transactions={transactions} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Group Members</h2>
          <MembersList members={group.members} isAdmin={group.isUserAdmin} />
        </div>
      </div>

      {/* Deposit Modal */}
      <Modal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        title="Make a Contribution"
        actions={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowDepositModal(false)}
              disabled={processingTransaction}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeposit}
              disabled={processingTransaction}
            >
              {processingTransaction ? 'Processing...' : 'Confirm Contribution'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 p-2">
          <Input
            label="Amount (£)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="0.01"
            step="0.01"
            required
          />
          <Input
            label="Note (Optional)"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's this contribution for?"
          />
        </div>
      </Modal>

      {/* Withdrawal Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Request Withdrawal"
        actions={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowWithdrawModal(false)}
              disabled={processingTransaction}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleWithdrawalRequest}
              disabled={processingTransaction}
            >
              {processingTransaction ? 'Processing...' : 'Submit Request'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 p-2">
          <div className="p-3 bg-gray-50 rounded-md mb-4">
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="text-lg font-semibold">£{group.availableBalance?.toFixed(2) || '0.00'}</p>
          </div>
          <Input
            label="Amount (£)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="0.01"
            max={group.availableBalance}
            step="0.01"
            required
          />
          <Input
            label="Reason (Optional)"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Why are you withdrawing these funds?"
          />
        </div>
      </Modal>

      {/* Leave Group Confirmation Modal */}
      <Modal
        isOpen={showLeaveConfirmModal}
        onClose={() => setShowLeaveConfirmModal(false)}
        title="Leave Group Confirmation"
        actions={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowLeaveConfirmModal(false)}
              disabled={leavingGroup}
            >
              Cancel
            </Button>
            <Button 
              variant="danger"
              onClick={handleLeaveGroup}
              disabled={leavingGroup}
            >
              {leavingGroup ? 'Leaving...' : 'Confirm Leave'}
            </Button>
          </div>
        }
      >
        <div className="p-2">
          <p className="mb-4">Are you sure you want to leave this group?</p>
          {group.availableBalance > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded">
              <p className="font-semibold">Warning:</p>
              <p>You have £{group.availableBalance.toFixed(2)} available balance in this group. Consider withdrawing your funds before leaving.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default GroupDetail;