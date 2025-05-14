import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import MyGroups from '../../components/dashboard/MyGroups';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard.css';

const Dashboard = () => {
  // Use auth context to check if user is admin
  const { currentUser, isAdmin } = useAuth();
  
  // Mock data for testing
  const username = currentUser?.firstName || 'Demo User';
  const [mockStats, setMockStats] = useState({
    totalSavings: '£4,550',
    activeGroups: 3,
    nextPayment: 'July 10',
    bookings: 281,
    users: '2,300',
    revenue: '34k',
    followers: '+91'
  });

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

      {/* Analytics Section */}
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Savings Growth Card */}
        <Card className="p-6">
          <h3 className="font-medium mb-2">Savings Growth</h3>
          <p className="text-gray-500 text-sm mb-4">Last Month Performance</p>
          
          {/* Bar Chart Visualization - Using divs for simplicity */}
          <div className="h-48 flex items-end space-x-4 mb-2">
            <div className="bg-green-500 w-8 h-40 rounded"></div>
            <div className="bg-green-500 w-8 h-20 rounded"></div>
            <div className="bg-green-500 w-8 h-10 rounded"></div>
            <div className="bg-green-500 w-8 h-20 rounded"></div>
            <div className="bg-green-500 w-8 h-40 rounded"></div>
            <div className="bg-green-500 w-8 h-10 rounded"></div>
            <div className="bg-green-500 w-8 h-40 rounded"></div>
          </div>
          
          <div className="text-xs text-gray-500 flex justify-between">
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
            <span>S</span>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <span className="flex items-center">
              <span className="w-3 h-3 inline-block rounded-full bg-gray-300 mr-2"></span>
              campaign sent 2 days ago
            </span>
          </div>
        </Card>
        
        {/* Monthly Contributions Card */}
        <Card className="p-6">
          <h3 className="font-medium mb-2">Monthly Contributions</h3>
          <p className="text-gray-500 text-sm mb-4">(+15%) increase in monthly savings.</p>
          
          {/* Line Chart Visualization - Using divs for simplicity */}
          <div className="h-48 relative mb-2">
            <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
              <polyline
                points="0,90 50,70 100,30 150,50 200,20 250,40 300,10"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
              />
            </svg>
          </div>
          
          <div className="text-xs text-gray-500 flex justify-between">
            <span>Apr</span>
            <span>Jun</span>
            <span>Aug</span>
            <span>Oct</span>
            <span>Dec</span>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <span className="flex items-center">
              <span className="w-3 h-3 inline-block rounded-full bg-gray-300 mr-2"></span>
              updated 4 min ago
            </span>
          </div>
        </Card>
        
        {/* Completed Savings Goals Card */}
        <Card className="p-6">
          <h3 className="font-medium mb-2">Completed Savings Goals</h3>
          <p className="text-gray-500 text-sm mb-4">Last Month Performance</p>
          
          {/* Line Chart Visualization - Using divs for simplicity */}
          <div className="h-48 relative mb-2">
            <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
              <polyline
                points="0,90 50,70 100,30 150,50 200,20 250,40 300,10"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
              />
            </svg>
          </div>
          
          <div className="text-xs text-gray-500 flex justify-between">
            <span>Apr</span>
            <span>Jun</span>
            <span>Aug</span>
            <span>Oct</span>
            <span>Dec</span>
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
      <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 dark:text-gray-300 text-sm uppercase mb-1 dashboard-card-label">Contributions</h3>
            <p className="text-3xl font-bold dashboard-stat-value">{mockStats.bookings}</p>
          </div>
          <div className="bg-gray-800 dark:bg-purple-600 p-3 rounded dashboard-icon-box shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 dark:text-gray-300 text-sm uppercase mb-1 dashboard-card-label">Members</h3>
            <p className="text-3xl font-bold dashboard-stat-value">{mockStats.users}</p>
          </div>
          <div className="bg-gray-800 dark:bg-purple-600 p-3 rounded dashboard-icon-box shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 dark:text-gray-300 text-sm uppercase mb-1 dashboard-card-label">Total Savings</h3>
            <p className="text-3xl font-bold dashboard-stat-value">{mockStats.revenue}</p>
          </div>
          <div className="bg-gray-800 dark:bg-purple-600 p-3 rounded dashboard-icon-box shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 dark:text-gray-300 text-sm uppercase mb-1 dashboard-card-label">Growth</h3>
            <p className="text-3xl font-bold dashboard-stat-value">{mockStats.followers}</p>
          </div>
          <div className="bg-gray-800 dark:bg-purple-600 p-3 rounded dashboard-icon-box shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      <Card className="mb-8">
        <div className="divide-y dark:divide-gray-700">
          <div className="p-4 flex justify-between items-center transaction-item hover:bg-gray-50 dark:hover:bg-gray-800">
            <div>
              <p className="font-medium transaction-title">Contribution to Family Savings</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 transaction-date">July 1, 2023</p>
            </div>
            <span className="font-semibold text-green-600 dark:text-green-400 transaction-amount">+£300</span>
          </div>
          <div className="p-4 flex justify-between items-center transaction-item hover:bg-gray-50 dark:hover:bg-gray-800">
            <div>
              <p className="font-medium transaction-title">Contribution to Vacation Fund</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 transaction-date">June 25, 2023</p>
            </div>
            <span className="font-semibold text-green-600 dark:text-green-400 transaction-amount">+£150</span>
          </div>
          <div className="p-4 flex justify-between items-center transaction-item hover:bg-gray-50 dark:hover:bg-gray-800">
            <div>
              <p className="font-medium transaction-title">Withdrawal from Emergency Fund</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 transaction-date">June 15, 2023</p>
            </div>
            <span className="font-semibold text-red-600 dark:text-red-400 transaction-amount">-£200</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;