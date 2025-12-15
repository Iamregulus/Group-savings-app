import React from 'react';
import Card from '../common/Card';

const TransactionHistory = ({ transactions = [], currency = '£' }) => {
  // Normalize transactions to ensure we're working with an array
  const transactionList = Array.isArray(transactions) 
    ? transactions 
    : (transactions?.transactions || []);

  console.log("📊 TransactionHistory received:", transactionList);

  // Function to determine transaction type styles
  const getTransactionTypeStyles = (type) => {
    if (!type) return {
      color: 'text-gray-600',
      icon: null,
      sign: ''
    };
    
    switch (type.toLowerCase()) {
      case 'deposit':
      case 'contribution':
        return {
          color: 'text-green-600',
          icon: (
            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 10.414V14a1 1 0 102 0v-3.586l1.293 1.293a1 1 0 001.414-1.414l-3-3z" clipRule="evenodd" />
            </svg>
          ),
          sign: '+'
        };
      case 'withdrawal':
        return {
          color: 'text-red-600',
          icon: (
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-7.707a1 1 0 00-1.414 1.414L9 13.414V14a1 1 0 102 0v-.586l1.293 1.293a1 1 0 001.414-1.414l-3-3z" clipRule="evenodd" />
            </svg>
          ),
          sign: '-'
        };
      case 'fee':
        return {
          color: 'text-orange-600',
          icon: (
            <svg className="h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          ),
          sign: '-'
        };
      default:
        return {
          color: 'text-blue-600',
          icon: (
            <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
            </svg>
          ),
          sign: ''
        };
    }
  };

  // Helper to extract user name from various transaction formats
  const getUserName = (transaction) => {
    if (!transaction) return '-';
    
    // Directly access user object if available
    if (transaction.user && (transaction.user.firstName || transaction.user.lastName)) {
      return `${transaction.user.firstName || ''} ${transaction.user.lastName || ''}`.trim();
    }
    
    // Try various user name formats
    if (transaction.userName) return transaction.userName;
    if (transaction.user_name) return transaction.user_name;
    if (transaction.name) return transaction.name;
    
    return transaction.userEmail || transaction.email || 'Unknown User';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString || '-';
    }
  };

  // Format amount
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '0.00';
    
    // Convert string to number if needed
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) return '0.00';
    
    return numAmount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  if (!transactionList.length) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">No transactions found</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {transactionList.map((transaction, index) => {
              // Extract transaction type from various formats
              const type = transaction.transaction_type || transaction.type || 'Unknown';
              const { color, icon, sign } = getTransactionTypeStyles(type);
              
              // Extract and format amount
              const amount = parseFloat(transaction.amount) || 0;
              
              // Get description
              const description = transaction.description || transaction.note || `Group ${type}`;
              
              return (
                <tr key={transaction.id || `transaction-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">{icon}</div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${color}`}>{type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {getUserName(transaction)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(transaction.created_at || transaction.createdAt || transaction.date)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${color}`}>
                    {sign}{currency}{formatAmount(amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TransactionHistory;
