import React from 'react';
import Icon from '../../../components/AppIcon';

const TeamOverviewStats = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Team Members',
      value: stats?.totalMembers,
      icon: 'Users',
      color: 'var(--color-primary)',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Active Projects',
      value: stats?.activeProjects,
      icon: 'FolderKanban',
      color: 'var(--color-accent)',
      bgColor: 'bg-accent/10'
    },
    {
      label: 'Tasks This Week',
      value: stats?.tasksThisWeek,
      icon: 'CheckSquare',
      color: 'var(--color-success)',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Upcoming Deadlines',
      value: stats?.upcomingDeadlines,
      icon: 'Clock',
      color: 'var(--color-warning)',
      bgColor: 'bg-warning/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
      {statCards?.map((stat, index) => (
        <div
          key={index}
          className="bg-card rounded-xl shadow-warm p-4 md:p-5 lg:p-6 transition-smooth hover-lift"
        >
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg ${stat?.bgColor} flex items-center justify-center`}>
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