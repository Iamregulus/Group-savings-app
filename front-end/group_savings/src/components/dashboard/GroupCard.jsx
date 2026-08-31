import React from 'react';
import { HiLockClosed, HiGlobeAlt } from 'react-icons/hi2';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/formatters';

const GroupCard = ({ group, onClick }) => {
  const { name, totalSaved, memberCount, maxMembers, role, isPublic, pendingWithdrawals } = group;

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {isPublic ? (
            <HiGlobeAlt className="h-4 w-4 text-gray-400 flex-shrink-0" />
          ) : (
            <HiLockClosed className="h-4 w-4 text-gray-400 flex-shrink-0" />
          )}
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{name}</h3>
        </div>
        {role === 'admin' && (
          <span className="flex-shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Admin
          </span>
        )}
      </div>

      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
        {formatCurrency(totalSaved)}
      </p>

      <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span>{memberCount || 0}{maxMembers ? `/${maxMembers}` : ''} members</span>
        {role === 'admin' && pendingWithdrawals > 0 && (
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            {pendingWithdrawals} pending
          </span>
        )}
      </div>
    </Card>
  );
};

export default GroupCard;
