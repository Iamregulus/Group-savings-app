import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { HiOutlineFlag, HiOutlineLockClosed, HiOutlineGlobeAlt } from 'react-icons/hi2';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const SuperUserDashboard = () => {
  const [stats, setStats] = useState(null);
  const [groups, setGroups] = useState([]);
  const [cashflow, setCashflow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flaggingId, setFlaggingId] = useState(null);

  const loadData = async () => {
    try {
      const [statsData, groupsData, cashflowData] = await Promise.all([
        adminService.getStats(),
        adminService.getAllGroups(),
        adminService.getCashflow(),
      ]);
      setStats(statsData.stats);
      setGroups(groupsData);
      setCashflow(cashflowData);
    } catch (err) {
      console.error('Error loading super user dashboard:', err);
      setError('Failed to load platform data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleFlag = async (group) => {
    try {
      setFlaggingId(group.id);
      const updated = await adminService.setGroupFlag(group.id, !group.isFlaggedManual);
      setGroups((prev) => prev.map((g) => (g.id === group.id ? updated : g)));
    } catch (err) {
      console.error('Error toggling flag:', err);
    } finally {
      setFlaggingId(null);
    }
  };

  if (loading) return <Loader centered size="large" />;
  if (error) return <p className="text-red-500">{error}</p>;

  const totalMoneyIn = groups.reduce((sum, g) => sum + (Number(g.moneyIn) || 0), 0);
  const totalMoneyOut = groups.reduce((sum, g) => sum + (Number(g.moneyOut) || 0), 0);

  const chartData = {
    labels: cashflow.map((c) => c.month),
    datasets: [
      { label: 'Money In', data: cashflow.map((c) => c.moneyIn), backgroundColor: '#10b981' },
      { label: 'Money Out', data: cashflow.map((c) => c.moneyOut), backgroundColor: '#f87171' },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Saved (All Groups)</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(stats.totalSavings)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Money In</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalMoneyIn)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Money Out</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalMoneyOut)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Pending Withdrawals</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.pendingWithdrawals}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Cash Flow (Last 6 Months)</h2>
        <div className="h-64">
          <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            All Groups <span className="text-gray-400 font-normal">({groups.length} total)</span>
          </h2>
          <span className="text-sm text-red-500">
            {groups.filter((g) => g.isFlagged).length} flagged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 pr-4">Group</th>
                <th className="py-2 pr-4">Pool Total</th>
                <th className="py-2 pr-4">In</th>
                <th className="py-2 pr-4">Out</th>
                <th className="py-2 pr-4">Growth</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {groups.map((group) => (
                <tr key={group.id}>
                  <td className="py-3 pr-4">
                    <Link to={`/groups/${group.id}`} className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400">
                      {group.isPublic ? <HiOutlineGlobeAlt className="h-4 w-4 text-gray-400" /> : <HiOutlineLockClosed className="h-4 w-4 text-gray-400" />}
                      {group.name}
                    </Link>
                    <p className="text-xs text-gray-400">{group.memberCount} members</p>
                  </td>
                  <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">{formatCurrency(group.poolTotal)}</td>
                  <td className="py-3 pr-4 text-emerald-600 dark:text-emerald-400">+{formatCurrency(group.moneyIn)}</td>
                  <td className="py-3 pr-4 text-red-500">-{formatCurrency(group.moneyOut)}</td>
                  <td className={`py-3 pr-4 font-medium ${group.growthPercentage >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {group.growthPercentage >= 0 ? '+' : ''}{group.growthPercentage}%
                  </td>
                  <td className="py-3 pr-4">
                    {group.isFlagged ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/50 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
                        <HiOutlineFlag className="h-3 w-3" /> Flagged
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleFlag(group)}
                      disabled={flaggingId === group.id}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline"
                    >
                      {group.isFlaggedManual ? 'Unflag' : 'Flag'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SuperUserDashboard;
