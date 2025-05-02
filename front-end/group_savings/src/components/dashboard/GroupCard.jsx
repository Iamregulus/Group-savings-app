import React from 'react';
import Card from '../common/Card';

const GroupCard = ({ group, onClick, currency = '£' }) => {
  const { id, name, description, totalSaved, targetAmount, memberCount, createdAt, nextPaymentDate, userSavings } = group;
  
  // Calculate progress percentage
  const progressPercentage = targetAmount ? Math.min((totalSaved / targetAmount) * 100, 100) : 0;
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  return (
    <Card className="h-full transition-all duration-200 hover:shadow-lg cursor-pointer" onClick={onClick}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-gray-800">{name}</h3>
          <div className="text-lg font-semibold text-primary">
            {currency}{totalSaved?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
        </div>
        
        {description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>
        )}
        
        {targetAmount > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{progressPercentage.toFixed(0)}% Complete</span>
              <span>{currency}{totalSaved?.toLocaleString('en-US') || '0'} of {currency}{targetAmount?.toLocaleString('en-US')}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {userSavings !== undefined && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-500">Your Savings</p>
            <p className="text-base font-semibold">{currency}{userSavings?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</p>
          </div>
        )}
        
        <div className="flex justify-between text-xs text-gray-500 mt-4">
          <div>
            <span className="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {memberCount || 0} members
            </span>
          </div>
          {createdAt && (
            <div>Started {formatDate(createdAt)}</div>
          )}
        </div>
        
        {nextPaymentDate && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">Next payment due:</p>
            <p className="text-sm font-medium">{formatDate(nextPaymentDate)}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GroupCard;