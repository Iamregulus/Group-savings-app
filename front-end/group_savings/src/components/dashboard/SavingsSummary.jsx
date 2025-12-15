import React from 'react';
import Card from '../common/Card';

const SavingsSummary = ({ totalSavings, totalContributions, groupCount, savingsGoal, currency = '£' }) => {
  // Calculate savings percentage
  const percentage = savingsGoal ? Math.min((totalSavings / savingsGoal) * 100, 100) : 0;
  
  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Savings */}
        <div className="text-center">
          <h3 className="text-gray-600 text-sm uppercase mb-1">Total Savings</h3>
          <p className="text-3xl font-bold text-primary">
            {currency}{totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {savingsGoal && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of {currency}{savingsGoal.toLocaleString('en-US')}</p>
            </div>
          )}
        </div>
        
        {/* Total Contributions */}
        <div className="text-center">
          <h3 className="text-gray-600 text-sm uppercase mb-1">Total Contributions</h3>
          <p className="text-3xl font-bold text-primary">
            {currency}{totalContributions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        
        {/* Groups */}
        <div className="text-center">
          <h3 className="text-gray-600 text-sm uppercase mb-1">Active Groups</h3>
          <p className="text-3xl font-bold text-primary">{groupCount}</p>
        </div>
      </div>
    </Card>
  );
};

export default SavingsSummary;
