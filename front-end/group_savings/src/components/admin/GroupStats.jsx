import React from 'react';
import Card from '../common/Card';

const GroupStats = ({ 
  stats, 
  currency = '£',
  timeframe = 'month' // 'week', 'month', 'year'
}) => {
  return (
    <div className="group-stats">
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-title">Total Saved</div>
          <div className="stat-value">{currency}{stats.totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="stat-change">
            {stats.savingsChange >= 0 ? (
              <span className="change-positive">↑ {stats.savingsChange}%</span>
            ) : (
              <span className="change-negative">↓ {Math.abs(stats.savingsChange)}%</span>
            )}
            <span className="change-period">from last {timeframe}</span>
          </div>
        </Card>
        
        <Card className="stat-card">
          <div className="stat-title">Members</div>
          <div className="stat-value">{stats.totalMembers}</div>
          <div className="stat-change">
            {stats.membersChange >= 0 ? (
              <span className="change-positive">↑ {stats.membersChange}</span>
            ) : (
              <span className="change-negative">↓ {Math.abs(stats.membersChange)}</span>
            )}
            <span className="change-period">from last {timeframe}</span>
          </div>
        </Card>
        
        <Card className="stat-card">
          <div className="stat-title">Contributions</div>
          <div className="stat-value">{stats.contributionsCount}</div>
          <div className="stat-change">
            {stats.contributionsChange >= 0 ? (
              <span className="change-positive">↑ {stats.contributionsChange}%</span>
            ) : (
              <span className="change-negative">↓ {Math.abs(stats.contributionsChange)}%</span>
            )}
            <span className="change-period">from last {timeframe}</span>
          </div>
        </Card>
        
        <Card className="stat-card">
          <div className="stat-title">Average Contribution</div>
          <div className="stat-value">{currency}{stats.averageContribution.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="stat-change">
            {stats.avgContributionChange >= 0 ? (
              <span className="change-positive">↑ {stats.avgContributionChange}%</span>
            ) : (
              <span className="change-negative">↓ {Math.abs(stats.avgContributionChange)}%</span>
            )}
            <span className="change-period">from last {timeframe}</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GroupStats;