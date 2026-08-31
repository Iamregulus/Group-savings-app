import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlinePlus, HiOutlineArrowUpTray, HiCheck, HiXMark } from 'react-icons/hi2';
import { groupService } from '../../services/groupService';
import { transactionService } from '../../services/transactionService';
import { useAuth } from '../../context/AuthContext';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import TransactionHistory from '../../components/dashboard/TransactionHistory';
import MembersList from '../../components/admin/MembersList';
import { formatCurrency } from '../../utils/formatters';

const ADMINS_PER_GROUP = 2;

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const [group, setGroup] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [leavingGroup, setLeavingGroup] = useState(false);
  const [votingId, setVotingId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [groupData, transactionData] = await Promise.all([
        groupService.getGroup(groupId),
        transactionService.getGroupTransactions(groupId),
      ]);
      setGroup(groupData);
      setTransactions(Array.isArray(transactionData) ? transactionData : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching group data:', err);
      setError('Failed to load group details. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
    loadData();
  }, [loadData, location.state]);

  const handleDeposit = async () => {
    const value = parseFloat(amount);
    if (!amount || isNaN(value) || value <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      await groupService.makeContribution(groupId, value, 'bank_transfer');
      await loadData();
      setAmount('');
      setNote('');
      setShowDepositModal(false);
      setSuccessMessage('Contribution added successfully!');
    } catch (err) {
      setError(err.message || 'Failed to process contribution. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdrawalRequest = async () => {
    const value = parseFloat(amount);
    if (!amount || isNaN(value) || value <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (value > group.userSavings) {
      setError('Withdrawal amount exceeds your available balance.');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      await groupService.requestWithdrawal(groupId, { amount: value, description: note });
      await loadData();
      setAmount('');
      setNote('');
      setShowWithdrawModal(false);
      setSuccessMessage('Withdrawal request submitted. Awaiting admin approval.');
    } catch (err) {
      setError(err.message || 'Failed to submit withdrawal request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleVote = async (transactionId, decision) => {
    try {
      setVotingId(transactionId);
      await groupService.voteOnWithdrawal(groupId, transactionId, decision);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to record your vote. Please try again.');
    } finally {
      setVotingId(null);
    }
  };

  const handlePromote = async (userId) => {
    try {
      await groupService.promoteMember(groupId, userId);
      await loadData();
      setSuccessMessage('Member promoted to admin.');
    } catch (err) {
      setError(err.message || 'Failed to promote member.');
    }
  };

  const handleLeaveGroup = async () => {
    try {
      setLeavingGroup(true);
      await groupService.leaveGroup(groupId);
      navigate('/groups', { state: { message: 'You have successfully left the group.' } });
    } catch (err) {
      setError(err.message || 'Failed to leave group. Please try again.');
      setLeavingGroup(false);
      setShowLeaveConfirmModal(false);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      setIsDeleting(true);
      await groupService.deleteGroup(groupId);
      navigate('/groups');
    } catch (err) {
      setError(err.message || 'Failed to delete the group.');
      setIsDeleting(false);
    }
  };

  if (loading) return <Loader centered size="large" />;

  if (error && !group) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => navigate('/groups')}>Back to Groups</Button>
      </Card>
    );
  }

  if (!group) {
    return (
      <Card className="p-6 text-center">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Group not found</h2>
        <Button onClick={() => navigate('/groups')}>Back to Groups</Button>
      </Card>
    );
  }

  const isCreator = currentUser?.id === group.creatorId;
  const isMember = !!group.userRole;
  const isAdmin = group.userRole === 'admin';
  const adminCount = (group.members || []).filter((m) => m.role === 'admin').length;
  const canLeaveGroup = !isAdmin || adminCount > 1;
  const eligibleForPromotion = (group.members || []).filter((m) => m.role !== 'admin');

  const pendingWithdrawals = transactions.filter(
    (t) => t.transactionType === 'withdrawal' && t.status === 'pending'
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/groups')} className="text-gray-500 dark:text-gray-400">
          <HiOutlineArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">{group.name}</h1>
      </div>

      {successMessage && (
        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Balance card */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 text-white shadow-lg">
        <p className="text-emerald-100 text-sm">Your Savings in this Group</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(group.userSavings)}</p>
        <div className="flex justify-between mt-4 text-sm">
          <span className="text-emerald-100">Group Pool: {formatCurrency(group.availableBalance)}</span>
          <span className="text-emerald-100">{group.memberCount} members</span>
        </div>
      </div>

      {group.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300">{group.description}</p>
      )}

      {/* Action buttons */}
      {isMember && (
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={() => setShowDepositModal(true)} icon={<HiOutlinePlus className="h-4 w-4" />}>
            Deposit
          </Button>
          <Button variant="outline" onClick={() => setShowWithdrawModal(true)} icon={<HiOutlineArrowUpTray className="h-4 w-4" />}>
            Withdraw
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowLeaveConfirmModal(true)}
            disabled={!canLeaveGroup}
            title={canLeaveGroup ? undefined : 'You are the only admin. Promote another member first.'}
          >
            Leave
          </Button>
        </div>
      )}

      {/* Promote co-admin prompt */}
      {isCreator && adminCount < ADMINS_PER_GROUP && (
        <Card className="p-4 border-l-4 border-amber-500">
          <p className="text-sm font-medium text-gray-900 dark:text-white">Add a second admin</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-3">
            Withdrawals require two admins to approve. Promote a member below before anyone can request a withdrawal.
          </p>
          {eligibleForPromotion.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">Invite another member first, then come back to promote them.</p>
          ) : null}
        </Card>
      )}

      {/* Pending withdrawals needing this admin's vote */}
      {isAdmin && pendingWithdrawals.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
            Pending Withdrawals ({pendingWithdrawals.length})
          </h2>
          <div className="space-y-2">
            {pendingWithdrawals.map((tx) => (
              <Card key={tx.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(tx.amount)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {tx.description || 'Withdrawal request'}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    {tx.approvedCount}/{tx.requiredApprovals} approved
                  </span>
                </div>

                {tx.myVote ? (
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    You voted: <span className="font-medium">{tx.myVote}</span>. Waiting on the other admin.
                  </p>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      disabled={votingId === tx.id}
                      onClick={() => handleVote(tx.id, 'approved')}
                      icon={<HiCheck className="h-4 w-4" />}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={votingId === tx.id}
                      onClick={() => handleVote(tx.id, 'rejected')}
                      icon={<HiXMark className="h-4 w-4" />}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Members</h2>
        <MembersList
          members={group.members}
          isCreator={isCreator}
          canPromote={adminCount < ADMINS_PER_GROUP}
          onPromote={handlePromote}
          joinCode={group.joinCode}
          groupId={group.id}
        />
      </div>

      {/* Recent transactions */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Recent Transactions</h2>
        <TransactionHistory transactions={transactions} />
      </div>

      {isCreator && (
        <Card className="p-4 border border-red-500/30">
          <h3 className="font-semibold text-red-500 mb-1">Danger Zone</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Deleting this group refunds all member balances and closes it permanently.
          </p>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete Group</Button>
        </Card>
      )}

      {/* Deposit Modal */}
      <Modal
        isOpen={showDepositModal}
        onClose={() => !processing && setShowDepositModal(false)}
        title="Make a Contribution"
        actions={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDepositModal(false)} disabled={processing}>Cancel</Button>
            <Button onClick={handleDeposit} disabled={processing}>
              {processing ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Amount (KES)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0.01" step="0.01" required />
          <Input label="Note (Optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What's this for?" />
        </div>
      </Modal>

      {/* Withdrawal Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => !processing && setShowWithdrawModal(false)}
        title="Request Withdrawal"
        actions={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowWithdrawModal(false)} disabled={processing}>Cancel</Button>
            <Button onClick={handleWithdrawalRequest} disabled={processing}>
              {processing ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <p className="text-sm text-gray-500 dark:text-gray-400">Your Available Balance</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(group.userSavings)}</p>
          </div>
          <Input label="Amount (KES)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0.01" max={group.userSavings} step="0.01" required />
          <Input label="Reason (Optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why are you withdrawing?" />
        </div>
      </Modal>

      {/* Leave confirmation */}
      <Modal
        isOpen={showLeaveConfirmModal}
        onClose={() => setShowLeaveConfirmModal(false)}
        title="Leave Group?"
        actions={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowLeaveConfirmModal(false)} disabled={leavingGroup}>Cancel</Button>
            <Button variant="danger" onClick={handleLeaveGroup} disabled={leavingGroup}>
              {leavingGroup ? 'Leaving...' : 'Confirm Leave'}
            </Button>
          </div>
        }
      >
        <p className="mb-3">Are you sure you want to leave this group?</p>
        {group.availableBalance > 0 && (
          <Alert type="warning" message={`You have ${formatCurrency(group.availableBalance)} available balance in this group. Consider withdrawing your funds before leaving.`} />
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Group Deletion"
        actions={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteGroup} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Group'}
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to delete this group? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default GroupDetail;
