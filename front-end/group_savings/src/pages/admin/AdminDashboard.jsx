import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groupService } from '../../services/groupService';
import { transactionService } from '../../services/transactionService';

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
    growthRate: '+8%'
  });
  const [recentGroups, setRecentGroups] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        
        // This would be replaced with actual API calls once the backend is implemented
        // For now, using mock data
        
        // Mock data - replace with actual API calls
        setTimeout(() => {
          setStats({
            totalGroups: 12,
            totalMembers: 96,
            totalSavings: 45000,
            pendingWithdrawals: 3,
            growthRate: '+8%'
          });
          
          setRecentGroups([
            { id: '1', name: 'Family Savings', memberCount: 4, totalSaved: 12000, createdAt: new Date('2023-01-15') },
            { id: '2', name: 'Office Team Fund', memberCount: 8, totalSaved: 8500, createdAt: new Date('2023-02-22') },
            { id: '3', name: 'Holiday Savings', memberCount: 6, totalSaved: 5000, createdAt: new Date('2023-03-10') },
          ]);
          
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError('Failed to load dashboard data');
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
      
      {/* Analytics Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Group Growth Card */}
        <Card className="p-6">
          <h3 className="font-medium mb-2">Group Growth</h3>
          <p className="text-gray-500 text-sm mb-4">Last Quarter Performance</p>
          
          {/* Bar Chart Visualization */}
          <div className="h-48 flex items-end space-x-4 mb-2">
            <div className="bg-indigo-500 w-8 h-20 rounded"></div>
            <div className="bg-indigo-500 w-8 h-28 rounded"></div>
            <div className="bg-indigo-500 w-8 h-24 rounded"></div>
            <div className="bg-indigo-500 w-8 h-32 rounded"></div>
            <div className="bg-indigo-500 w-8 h-36 rounded"></div>
            <div className="bg-indigo-500 w-8 h-40 rounded"></div>
            <div className="bg-indigo-500 w-8 h-44 rounded"></div>
          </div>
          
          <div className="text-xs text-gray-500 flex justify-between">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <span className="flex items-center">
              <span className="w-3 h-3 inline-block rounded-full bg-gray-300 mr-2"></span>
              updated 2 days ago
            </span>
          </div>
        </Card>
        
        {/* Member Growth Card */}
        <Card className="p-6">
          <h3 className="font-medium mb-2">Member Growth</h3>
          <p className="text-gray-500 text-sm mb-4">(+15%) increase in new members</p>
          
          {/* Line Chart Visualization */}
          <div className="h-48 relative mb-2">
            <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
              <polyline
                points="0,80 50,75 100,60 150,40 200,30 250,20 300,10"
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
              />
            </svg>
          </div>
          
          <div className="text-xs text-gray-500 flex justify-between">
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <span className="flex items-center">
              <span className="w-3 h-3 inline-block rounded-full bg-gray-300 mr-2"></span>
              updated 4 min ago
            </span>
          </div>
        </Card>
        
        {/* Total Savings Growth Card */}
        <Card className="p-6">
          <h3 className="font-medium mb-2">Total Savings Growth</h3>
          <p className="text-gray-500 text-sm mb-4">Monthly Progress</p>
          
          {/* Area Chart Visualization */}
          <div className="h-48 relative mb-2">
            <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <polyline
                points="0,90 50,70 100,50 150,40 200,20 250,25 300,10"
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
              />
              <polygon
                points="0,90 50,70 100,50 150,40 200,20 250,25 300,10 300,100 0,100"
                fill="url(#gradient)"
              />
            </svg>
          </div>
          
          <div className="text-xs text-gray-500 flex justify-between">
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <span className="flex items-center">
              <span className="w-3 h-3 inline-block rounded-full bg-gray-300 mr-2"></span>
              just updated
            </span>
          </div>
        </Card>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
        </Card>
      </div>
      
      {/* Recent Groups */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Groups</h2>
        <Card>
          <div className="divide-y">
            {recentGroups.map(group => (
              <div key={group.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{group.name}</p>
                  <p className="text-sm text-gray-500">Members: {group.memberCount} · Total: £{group.totalSaved.toLocaleString()}</p>
                </div>
                <Link to={`/group/${group.id}`}>
                  <Button size="small" variant="outline">View</Button>
                </Link>
              </div>
            ))}
            
            {recentGroups.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No groups created yet
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
