import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsOverview = ({ stats }) => {
  const statCards = [
    {
      label: 'Active Projects',
      value: stats?.activeProjects,
      icon: 'FolderKanban',
      color: 'accent',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      textColor: 'text-accent',
      borderColor: 'border-accent/20',
      iconBg: 'bg-amber-100 dark:bg-amber-950/30'
    },
    {
      label: 'Completed This Month',
      value: stats?.completedThisMonth,
      icon: 'CheckCircle2',
      color: 'success',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      textColor: 'text-success',
      borderColor: 'border-success/20',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/30'
    },
    {
      label: 'Overdue Tasks',
      value: stats?.overdueTasks,
      icon: 'AlertCircle',
      color: 'error',
      bgColor: 'bg-rose-50 dark:bg-rose-950/20',
      textColor: 'text-error',
      borderColor: 'border-error/20',
      iconBg: 'bg-rose-100 dark:bg-rose-950/30'
    },
    {
      label: 'Team Members',
      value: stats?.teamMembers,
      icon: 'Users',
      color: 'secondary',
      bgColor: 'bg-slate-50 dark:bg-slate-950/20',
      textColor: 'text-secondary',
      borderColor: 'border-secondary/20',
      iconBg: 'bg-slate-100 dark:bg-slate-950/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-6">
      {statCards?.map((stat, index) => (
        <div
          key={index}
          className={`bg-card rounded-lg shadow-soft-md p-5 border ${stat?.borderColor} hover-lift transition-smooth`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${stat?.iconBg} rounded-lg flex items-center justify-center`}>
              <Icon name={stat?.icon} size={24} color={`var(--color-${stat?.color})`} />
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon name="TrendingUp" size={14} />
              <span>vs last month</span>
            </div>
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