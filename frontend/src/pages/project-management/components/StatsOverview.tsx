import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsOverview = ({ stats }) => {
  const statCards = [
    {
      label: 'Active Projects',
      value: stats?.activeProjects,
      icon: 'FolderKanban',
      color: 'accent',
      bgColor: 'bg-accent/10',
      textColor: 'text-accent',
      borderColor: 'border-accent/20'
    },
    {
      label: 'Completed This Month',
      value: stats?.completedThisMonth,
      icon: 'CheckCircle2',
      color: 'success',
      bgColor: 'bg-success/10',
      textColor: 'text-success',
      borderColor: 'border-success/20'
    },
    {
      label: 'Overdue Tasks',
      value: stats?.overdueTasks,
      icon: 'AlertCircle',
      color: 'error',
      bgColor: 'bg-error/10',
      textColor: 'text-error',
      borderColor: 'border-error/20'
    },
    {
      label: 'Team Members',
      value: stats?.teamMembers,
      icon: 'Users',
      color: 'secondary',
      bgColor: 'bg-secondary/10',
      textColor: 'text-secondary',
      borderColor: 'border-secondary/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6 mb-6">
      {statCards?.map((stat, index) => (
        <div
          key={index}
          className={`bg-card rounded-xl shadow-warm p-4 md:p-5 lg:p-6 border ${stat?.borderColor} hover-lift transition-smooth`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-12 h-12 ${stat?.bgColor} rounded-lg flex items-center justify-center`}>
              <Icon name={stat?.icon} size={24} color={`var(--color-${stat?.color})`} />
            </div>
            <Icon name="TrendingUp" size={18} color="var(--color-muted-foreground)" />
          </div>
          <h3 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-1">
            {stat?.value}
          </h3>
          <p className="text-sm text-muted-foreground">{stat?.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;