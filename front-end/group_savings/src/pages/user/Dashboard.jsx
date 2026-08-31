import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineUserGroup, HiOutlineArrowRight } from 'react-icons/hi2';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import MyGroups from '../../components/dashboard/MyGroups';
import { useAuth } from '../../context/AuthContext';
import { groupService } from '../../services/groupService';
import { transactionService } from '../../services/transactionService';
import { formatCurrency, formatDate } from '../../utils/formatters';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [totalSavings, setTotalSavings] = useState(0);
  const [groupCount, setGroupCount] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [groups, txResponse] = await Promise.all([
          groupService.getUserGroups(),
          transactionService.getUserTransactions(currentUser.id, { limit: 5 }),
        ]);

        setGroupCount(groups.length);
        setTotalSavings(groups.reduce((sum, g) => sum + (Number(g.userSavings) || 0), 0));
        setRecentTransactions(txResponse.transactions || []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('Failed to load your dashboard.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) load();
  }, [currentUser]);

  if (loading) return <Loader centered size="large" />;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back,</p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{currentUser?.firstName || 'there'}</h1>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Balance card */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 text-white shadow-lg">
        <p className="text-emerald-100 text-sm">Total Savings Across Groups</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(totalSavings)}</p>
        <p className="text-emerald-100 text-sm mt-3">{groupCount} active {groupCount === 1 ? 'group' : 'groups'}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/create-group">
          <Card className="p-4 flex flex-col items-center gap-2 text-center hover:shadow-md transition-shadow">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
              <HiOutlinePlus className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Create Group</span>
          </Card>
        </Link>
        <Link to="/join-group">
          <Card className="p-4 flex flex-col items-center gap-2 text-center hover:shadow-md transition-shadow">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
              <HiOutlineUserGroup className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Join a Group</span>
          </Card>
        </Link>
      </div>

      {/* My Groups */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Groups</h2>
          <Link to="/groups" className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            See all <HiOutlineArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <MyGroups limit={4} />
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recent Activity</h2>
        <Card className="divide-y divide-gray-100 dark:divide-gray-700">
          {recentTransactions.length === 0 ? (
            <p className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">No activity yet</p>
          ) : (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {tx.description || (tx.transactionType === 'contribution' ? 'Contribution' : 'Withdrawal')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(tx.createdAt)}</p>
                </div>
                <span className={`font-semibold text-sm ${tx.transactionType === 'contribution' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  {tx.transactionType === 'contribution' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
