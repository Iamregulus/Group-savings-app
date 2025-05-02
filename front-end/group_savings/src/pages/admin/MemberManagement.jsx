import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Components
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';

const MemberManagement = () => {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        
        // Mock data - replace with actual API calls when backend is ready
        setTimeout(() => {
          const mockMembers = [
            { id: '1', name: 'John Doe', email: 'john@example.com', joinDate: new Date('2023-01-05'), groupCount: 2, totalSavings: 2500 },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', joinDate: new Date('2023-02-15'), groupCount: 1, totalSavings: 1200 },
            { id: '3', name: 'Robert Johnson', email: 'robert@example.com', joinDate: new Date('2023-01-20'), groupCount: 3, totalSavings: 5000 },
            { id: '4', name: 'Emily Davis', email: 'emily@example.com', joinDate: new Date('2023-03-10'), groupCount: 1, totalSavings: 800 },
            { id: '5', name: 'Michael Brown', email: 'michael@example.com', joinDate: new Date('2023-02-05'), groupCount: 2, totalSavings: 3200 },
          ];
          
          setMembers(mockMembers);
          setFilteredMembers(mockMembers);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching members:', error);
        setError('Failed to load members');
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Filter members based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMembers(members);
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = members.filter(
        member => 
          member.name.toLowerCase().includes(searchTermLower) ||
          member.email.toLowerCase().includes(searchTermLower)
      );
      setFilteredMembers(filtered);
    }
  }, [searchTerm, members]);

  const handleLockAccount = (memberId) => {
    // This would be implemented with actual API call
    alert(`Account ${memberId} would be locked. This is just a placeholder.`);
  };

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Member Management</h1>
        <Link to="/admin">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
      
      {/* Search Input */}
      <div className="mb-6">
        <Input
          placeholder="Search members by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-lg"
        />
      </div>
      
      {/* Members Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groups</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Savings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{member.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {member.joinDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                    {member.groupCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    £{member.totalSavings.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Button 
                        size="small" 
                        variant="outline" 
                        onClick={() => alert(`View details for ${member.name}`)}
                      >
                        Details
                      </Button>
                      <Button 
                        size="small" 
                        variant="danger" 
                        onClick={() => handleLockAccount(member.id)}
                      >
                        Lock
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredMembers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No members found matching your search.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MemberManagement;
