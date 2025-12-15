import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import MyGroups from '../../components/dashboard/MyGroups';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../services/dashboardService';
import '../../styles/dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {currentUser?.firstName || 'User'}</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <Link to="/join-group">
            <Button variant="outline">Find Groups to Join</Button>
          </Link>
          <Link to="/create-group">
            <Button variant="primary">Create Group</Button>
          </Link>
        </div>
      </div>

      {/* My Groups Section */}
      <div className="mb-8">
        <MyGroups />
      </div>

      {/* Stats Cards Row */}
      <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 dark:text-gray-300 text-sm uppercase mb-1 dashboard-card-label">Contributions</h3>
            <p className="text-3xl font-bold dashboard-stat-value">{stats.quick_stats.contributions}</p>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 dark:text-gray-300 text-sm uppercase mb-1 dashboard-card-label">Groups</h3>
            <p className="text-3xl font-bold dashboard-stat-value">{stats.quick_stats.groups}</p>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 dark:text-gray-300 text-sm uppercase mb-1 dashboard-card-label">Total Savings</h3>
            <p className="text-3xl font-bold dashboard-stat-value">{stats.quick_stats.total_savings}</p>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 dark:text-gray-300 text-sm uppercase mb-1 dashboard-card-label">Growth</h3>
            <p className="text-3xl font-bold dashboard-stat-value">{stats.quick_stats.growth}</p>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      <Card className="mb-8">
        <div className="divide-y dark:divide-gray-700">
          {stats.recent_transactions.map(tx => (
            <div key={tx.id} className="p-4 flex justify-between items-center transaction-item hover:bg-gray-50 dark:hover:bg-gray-800">
              <div>
                <p className="font-medium transaction-title">{tx.description || 'No description'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 transaction-date">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`font-semibold ${tx.transactionType === 'contribution' ? 'text-green-600' : 'text-red-600'}`}>
                {tx.transactionType === 'contribution' ? '+' : '-'}&pound;{tx.amount}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;