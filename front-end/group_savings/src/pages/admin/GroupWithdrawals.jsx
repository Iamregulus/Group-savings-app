import React from 'react';
import { useParams } from 'react-router-dom';
import ManageWithdrawals from '../../components/admin/ManageWithdrawals';

const GroupWithdrawals = () => {
  const { groupId } = useParams();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ManageWithdrawals />
    </div>
  );
};

export default GroupWithdrawals; 