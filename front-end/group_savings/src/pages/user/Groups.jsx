import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlus } from 'react-icons/hi2';
import MyGroups from '../../components/dashboard/MyGroups';
import Button from '../../components/common/Button';

const Groups = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Groups</h1>
        <div className="flex gap-2">
          <Link to="/join-group">
            <Button variant="outline" size="sm">Join</Button>
          </Link>
          <Link to="/create-group">
            <Button size="sm" icon={<HiOutlinePlus className="h-4 w-4" />}>Create</Button>
          </Link>
        </div>
      </div>

      <MyGroups />
    </div>
  );
};

export default Groups;
