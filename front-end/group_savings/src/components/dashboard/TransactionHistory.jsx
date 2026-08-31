import React from 'react';
import { HiArrowDown, HiArrowUp } from 'react-icons/hi2';
import Card from '../common/Card';
import { formatCurrency, formatDate } from '../../utils/formatters';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const TransactionHistory = ({ transactions = [] }) => {
  const list = Array.isArray(transactions) ? transactions : (transactions?.transactions || []);

  if (!list.length) {
    return (
      <Card className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        No transactions yet
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-gray-100 dark:divide-gray-700">
      {list.map((tx, index) => {
        const isContribution = (tx.transactionType || tx.transaction_type) === 'contribution';
        return (
          <div key={tx.id || index} className="p-4 flex items-center gap-3">
            <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
              isContribution ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/50 text-red-500'
            }`}>
              {isContribution ? <HiArrowDown className="h-4 w-4" /> : <HiArrowUp className="h-4 w-4" />}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {tx.description || (isContribution ? 'Contribution' : 'Withdrawal')}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(tx.createdAt || tx.created_at)}
                </span>
                {tx.status && tx.status !== 'completed' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[tx.status] || STATUS_STYLES.cancelled}`}>
                    {tx.status}
                  </span>
                )}
              </div>
            </div>
            <span className={`font-semibold text-sm flex-shrink-0 ${isContribution ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {isContribution ? '+' : '-'}{formatCurrency(tx.amount)}
            </span>
          </div>
        );
      })}
    </Card>
  );
};

export default TransactionHistory;
