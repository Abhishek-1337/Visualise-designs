import React from 'react';
import Icon from '../../../components/AppIcon';

const TeamOverviewStats = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Team Members',
      value: stats?.totalMembers,
      icon: 'Users',
      color: 'var(--color-primary)',
      bg: 'from-indigo-50 to-indigo-50/50',
      border: 'border-indigo-100/50'
    },
    {
      label: 'Active Projects',
      value: stats?.activeProjects,
      icon: 'FolderKanban',
      color: 'var(--color-accent)',
      bg: 'from-amber-50 to-amber-50/50',
      border: 'border-amber-100/50'
    },
    {
      label: 'Tasks This Week',
      value: stats?.tasksThisWeek,
      icon: 'CheckSquare',
      color: 'var(--color-success)',
      bg: 'from-green-50 to-green-50/50',
      border: 'border-green-100/50'
    },
    {
      label: 'Upcoming Deadlines',
      value: stats?.upcomingDeadlines,
      icon: 'Clock',
      color: 'var(--color-warning)',
      bg: 'from-orange-50 to-orange-50/50',
      border: 'border-orange-100/50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6 mb-6">
      {statCards?.map((stat, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-xl shadow-soft-sm p-4 md:p-5 lg:p-6 transition-smooth hover-lift"
        >
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${stat.bg} border ${stat.border} flex items-center justify-center`}>
              <Icon name={stat?.icon} size={24} color={stat?.color} />
            </div>
          </div>

          <p className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-1">
            {stat?.value}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">{stat?.label}</p>
        </div>
      ))}
    </div>
  );
};

export default TeamOverviewStats;
