import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import Alert from '../../components/common/Alert';

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leavingGroup, setLeavingGroup] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);
  const [isNewGroup, setIsNewGroup] = useState(location.state?.newGroup || false);
  
  // Modal states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [processingTransaction, setProcessingTransaction] = useState(false);

  useEffect(() => {
    // Clear the location state after reading it
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
    
    const fetchGroupData = async () => {
      try {
        setLoading(true);
        console.log(`🔍 Fetching group data for group ID: ${groupId}`);
        
        // Fetch group data
        const groupData = await groupService.getGroup(groupId);
        console.log(`📊 Group data received:`, groupData);
        
        // Ensure proper data format
        if (!groupData) {
          throw new Error('No group data received from the server');
        }
        
        // Process the group data to ensure all required fields are present
        const processedGroup = {
          ...groupData,
          // Ensure numeric values are correctly processed
          totalSaved: parseFloat(groupData.totalSaved || 0),
          totalWithdrawals: parseFloat(groupData.totalWithdrawals || 0),
          availableBalance: parseFloat(groupData.availableBalance || 0),
          userSavings: parseFloat(groupData.userSavings || 0),
          // Ensure counts are numbers
          memberCount: parseInt(groupData.memberCount || 0, 10),
          pendingWithdrawals: parseInt(groupData.pendingWithdrawals || 0, 10)
        };
        
        console.log(`✅ Processed group data:`, processedGroup);
        setGroup(processedGroup);
        
        // Try to fetch transaction data, but continue even if it fails
        try {
          console.log(`🔍 Fetching transactions for group ID: ${groupId}`);
          const transactionData = await transactionService.getGroupTransactions(groupId);
          console.log(`📊 Transaction data received:`, transactionData);
          
          // Handle different response formats
          if (Array.isArray(transactionData)) {
            console.log(`✅ Found ${transactionData.length} transactions (array format)`);
            setTransactions(transactionData);
          } else if (transactionData && Array.isArray(transactionData.transactions)) {
            console.log(`✅ Found ${transactionData.transactions.length} transactions (object.transactions format)`);
            setTransactions(transactionData.transactions);
          } else {
            console.warn('⚠️ Unexpected transaction data format:', transactionData);
            
            // Try to find any array in the response
            if (transactionData && typeof transactionData === 'object') {
              const possibleArrays = Object.values(transactionData).filter(v => Array.isArray(v));
              if (possibleArrays.length > 0) {
                console.log(`📋 Found possible transactions array:`, possibleArrays[0]);
                setTransactions(possibleArrays[0]);
              } else {
                setTransactions([]);
              }
            } else {
              setTransactions([]);
            }
          }
        } catch (transError) {
          console.error('❌ Error fetching transactions:', transError);
          setTransactions([]); // Set empty array if transactions can't be fetched
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching group data:', error);
        setError('Failed to load group details. Please try again later.');
        setLoading(false);
      } finally {
        // If this is a new group, show the deposit modal regardless of whether 
        // data fetching succeeded or failed
        if (isNewGroup) {
          // Delay opening the modal to ensure the UI is ready
          setTimeout(() => {
            setShowDepositModal(true);
          }, 1000);
        }
      }
    };

    fetchGroupData();
  }, [groupId, isNewGroup, location.state]);

  const handleDeposit = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setProcessingTransaction(true);
      setError(null); // Clear any previous errors
      
      console.log(`📝 Making contribution of ${amount} to group ${groupId}`);
      
      // Format the contribution data
      const contributionData = {
        amount: parseFloat(amount),
        note: note || 'Group contribution',
        paymentMethod: 'bank_transfer', // Default payment method
        description: `Group contribution: ${note || 'Regular contribution'}`
      };
      
      console.log('Sending contribution data:', contributionData);
      
      // Use the makeContribution method with individual parameters
      const response = await groupService.makeContribution(
        groupId, 
        parseFloat(amount), 
        'bank_transfer'
      );
      
      console.log('Contribution response:', response);
      
      // Refresh group data to show updated values
      console.log('Refreshing group data...');
      const updatedGroup = await groupService.getGroup(groupId);
      
      console.log('Updated group data:', updatedGroup);
      
      // Process the group data to ensure all required fields are present
      const processedGroup = {
        ...updatedGroup,
        // Ensure numeric values are correctly processed
        totalSaved: parseFloat(updatedGroup.totalSaved || 0),
        totalWithdrawals: parseFloat(updatedGroup.totalWithdrawals || 0),
        availableBalance: parseFloat(updatedGroup.availableBalance || 0),
        userSavings: parseFloat(updatedGroup.userSavings || 0),
        // Ensure counts are numbers
        memberCount: parseInt(updatedGroup.memberCount || 0, 10),
        pendingWithdrawals: parseInt(updatedGroup.pendingWithdrawals || 0, 10)
      };
      
      setGroup(processedGroup);
      
      // Refresh transactions
      console.log('Refreshing transactions...');
      try {
        const updatedTransactions = await transactionService.getGroupTransactions(groupId);
        console.log('Updated transactions:', updatedTransactions);
        
        if (Array.isArray(updatedTransactions)) {
          setTransactions(updatedTransactions);
        } else if (updatedTransactions && Array.isArray(updatedTransactions.transactions)) {
          setTransactions(updatedTransactions.transactions);
        } else if (updatedTransactions && typeof updatedTransactions === 'object') {
          // Try to find any array in the response
          const possibleArrays = Object.values(updatedTransactions).filter(v => Array.isArray(v));
          if (possibleArrays.length > 0) {
            setTransactions(possibleArrays[0]);
          }
        }
      } catch (transError) {
        console.error('Error refreshing transactions:', transError);
        // Don't set error, just keep the old transactions
      }
      
      // Reset form and close modal
      setAmount('');
      setNote('');
      setShowDepositModal(false);
      setProcessingTransaction(false);
      
      // Show success message
      setSuccessMessage('Contribution added successfully!');
    } catch (error) {
      console.error('Error making contribution:', error);
      
      // Extract error message from the response if available
      let errorMessage = 'Failed to process contribution. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
      setProcessingTransaction(false);
      
      // Keep the modal open so the user can try again
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
      {successMessage && (
        <Alert 
          type="success" 
          message={successMessage} 
          className="mb-6"
          onClose={() => setSuccessMessage(null)}
        />
      )}
      
      {isNewGroup && (
        <div className="bg-purple-800 dark:bg-purple-900 border-l-4 border-purple-500 text-white dark:text-white p-4 mb-6 rounded shadow">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-purple-300 dark:text-purple-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-white dark:text-white">
                <span className="font-medium">Your group was created successfully!</span> Now you can:
              </p>
              <ul className="mt-2 list-disc list-inside text-sm text-white dark:text-white">
                <li>Make your first contribution</li>
                <li>Invite members to join</li>
                <li>Set up group goals and rules</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{group?.name}</h1>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>

      <div className="mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Group Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Savings</p>
              <p className="text-xl font-bold text-primary dark:text-primary-light">
                £{(group?.totalSaved || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-400">Members</p>
              <p className="text-xl font-bold text-primary dark:text-primary-light">
                {group?.memberCount || 0}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-400">Your Contribution</p>
              <p className="text-xl font-bold text-primary dark:text-primary-light">
                £{(group?.userSavings || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-400">Available Balance</p>
              <p className="text-xl font-bold text-primary dark:text-primary-light">
                £{(group?.availableBalance || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>
          </div>
          
          {group?.description && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description:</p>
              <p className="text-gray-800 dark:text-gray-200">{group.description}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Admin: Pending Withdrawal Requests Section */}
      {group?.userRole === 'admin' && group?.pendingWithdrawals > 0 && (
        <div className="mb-8">
          <Card className="p-6 border-l-4 border-yellow-500">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Withdrawal Requests</h3>
                <p className="mt-1 text-gray-600 dark:text-gray-300">
                  There {group.pendingWithdrawals === 1 ? 'is' : 'are'} {group.pendingWithdrawals} pending withdrawal {group.pendingWithdrawals === 1 ? 'request' : 'requests'} that need your attention.
                </p>
                <div className="mt-4">
                  <Button
                    onClick={() => navigate(`/admin/withdrawals/${group.id}`)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Review Requests
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-8">
        <Button 
          onClick={() => setShowDepositModal(true)}
        >
          Make Contribution
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setShowWithdrawModal(true)}
          disabled={!group?.availableBalance || group?.availableBalance <= 0}
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
          <div className={`border-2 rounded-lg p-2 mb-6 ${isNewGroup ? 'border-purple-400 dark:border-purple-500 bg-purple-800 dark:bg-purple-900' : 'border-transparent'}`}>
            <h2 className="text-xl font-semibold mb-4 px-2 text-white dark:text-white">Recent Transactions</h2>
            <TransactionHistory transactions={transactions} />
            
            {isNewGroup && transactions.length === 0 && (
              <div className="p-4 text-center text-white dark:text-white">
                <p>No transactions yet! Make your first contribution to get started.</p>
                <Button 
                  onClick={() => setShowDepositModal(true)}
                  className="mt-3 bg-purple-600 hover:bg-purple-700 border-purple-600 text-white"
                  size="sm"
                >
                  Make First Contribution
                </Button>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className={`border-2 rounded-lg p-2 ${isNewGroup ? 'border-purple-400 dark:border-purple-500 bg-purple-800 dark:bg-purple-900' : 'border-transparent'}`}>
            <h2 className="text-xl font-semibold mb-4 px-2 text-white dark:text-white">Group Members</h2>
            <MembersList members={group?.members} isAdmin={group?.isUserAdmin} />
            
            {isNewGroup && (group?.members?.length === 1 || !group?.members?.length) && (
              <div className="p-4 text-center text-white dark:text-white">
                <p>You're the first member! Invite others to join your group.</p>
                <Button 
                  variant="outline"
                  className="mt-3 border-white text-white hover:bg-purple-700"
                  size="sm"
                  onClick={() => {
                    // Copy invite link or show invite modal
                    const inviteLink = `${window.location.origin}/invite/${group.joinCode || group.id}`;
                    navigator.clipboard.writeText(inviteLink);
                    alert('Invite link copied to clipboard!');
                  }}
                >
                  Copy Invite Link
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      <Modal
        isOpen={showDepositModal}
        onClose={() => {
          if (!processingTransaction) {
            setShowDepositModal(false);
            setError(null);
          }
        }}
        title="Make a Contribution"
        actions={
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                if (!processingTransaction) {
                  setShowDepositModal(false);
                  setError(null);
                }
              }}
              disabled={processingTransaction}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeposit}
              disabled={processingTransaction}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {processingTransaction ? 'Processing...' : 'Confirm Contribution'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 p-2">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
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