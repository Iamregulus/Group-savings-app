import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import { transactionService } from '../../services/transactionService';
import { formatCurrency } from '../../utils/formatters';

const Analytics = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await transactionService.getUserTransactionSummary(currentUser.id, 'all');
        setSummary(data.summary);
        setGroups(data.groups || []);
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError('Failed to load your analytics.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) load();
  }, [currentUser]);

  if (loading) return <Loader centered size="large" />;
  if (error) return <p className="text-red-500 text-sm">{error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Analytics</h1>

      <div className="grid grid-cols-1 gap-3">
        <Card className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(summary?.currentBalance)}
          </p>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Contributed</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {formatCurrency(summary?.totalContributions)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Withdrawn</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {formatCurrency(summary?.totalWithdrawals)}
            </p>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">By Group</h2>
        {groups.length === 0 ? (
          <Card className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
            You're not saving in any groups yet.
          </Card>
        ) : (
          <div className="space-y-2">
            {groups.map((g) => (
              <Card
                key={g.groupId}
                className="p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/groups/${g.groupId}`)}
              >
                <span className="font-medium text-gray-900 dark:text-white">{g.name}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(g.balance)}
                </span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
