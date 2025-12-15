import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groupService } from '../../services/groupService';
import { transactionService } from '../../services/transactionService';
import api from '../../services/api'; // Import the main api service

// Components
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalMembers: 0,
    totalSavings: 0,
    pendingWithdrawals: 0,
  });
  const [recentGroups, setRecentGroups] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/stats');
        setStats(response.stats);
        setRecentGroups(response.recentGroups);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError('Failed to load dashboard data. You may not have permission to view this page.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) return <Loader centered size="large" />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor savings activity, member growth, and manage requests.</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
          <Link to="/admin/members">
            <Button>Manage Members</Button>
          </Link>
          <Link to="/admin/withdrawals">
            <Button variant="outline">Withdrawal Requests</Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm uppercase mb-1">Total Groups</h3>
            <p className="text-3xl font-bold">{stats.totalGroups}</p>
          </div>
          <div className="bg-indigo-600 p-3 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm uppercase mb-1">Total Members</h3>
            <p className="text-3xl font-bold">{stats.totalMembers}</p>
          </div>
          <div className="bg-indigo-600 p-3 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm uppercase mb-1">Total Savings</h3>
            <p className="text-3xl font-bold">£{stats.totalSavings.toLocaleString()}</p>
          </div>
          <div className="bg-indigo-600 p-3 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm uppercase mb-1">Pending Withdrawals</h3>
            <p className="text-3xl font-bold">{stats.pendingWithdrawals}</p>
          </div>
          <div className="bg-indigo-600 p-3 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </Card>
      </div>

      {/* Recent Groups */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Groups</h2>
          <div className="space-y-4">
            {recentGroups.length > 0 ? (
              recentGroups.map(group => (
                <div key={group.id} className="flex items-center justify-between p-4 bg-purple-600 rounded">
                  <div>
                    <p className="font-bold">{group.name}</p>
                    <p className="text-sm text-black">
                      Members: {group.member_count} - Total: £{group.current_amount?.toLocaleString() || 0}
                    </p>
                  </div>
                  <Link to={`/groups/${group.id}`}>
                    <Button variant="outline">View</Button>
                  </Link>
                </div>
              ))
            ) : (
              <p>No recent groups found.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
