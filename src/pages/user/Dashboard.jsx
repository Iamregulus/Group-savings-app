import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import MyGroups from '../../components/dashboard/MyGroups';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/common/Alert';
import '../../styles/dashboard.css';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  
  const [successMessage, setSuccessMessage] = useState('');
  
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
  
  // Check for success messages from navigation state
  useEffect(() => {
    console.log("Dashboard state from navigation:", location.state);
    
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      
      // Clear the location state but preserve groupCreated flag
      const newState = { 
        groupCreated: location.state.groupCreated,
        newGroup: location.state.newGroup,
        groupId: location.state.groupId
      };
      
      // Only keep properties that have values
      Object.keys(newState).forEach(key => {
        if (newState[key] === undefined) {
          delete newState[key];
        }
      });
      
      // Update the navigation state
      navigate(location.pathname, { 
        replace: true,
        state: Object.keys(newState).length > 0 ? newState : undefined
      });
      
      // Auto-dismiss the message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname]);

  return (
    <div className="container mx-auto px-4 py-8">
      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          className="mb-6"
          onClose={() => setSuccessMessage('')}
        />
      )}
      
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
        {/* Rest of the component remains the same */}
        {/* ... */}
      </div>
    </div>
  );
};

export default Dashboard; 