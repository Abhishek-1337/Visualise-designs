import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TeamMemberCard = ({ member, onAssignTask, onViewDetails, onMessage }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-success/10 text-success';
      case 'busy':
        return 'bg-warning/10 text-warning';
      case 'offline':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getWorkloadColor = (percentage) => {
    if (percentage >= 90) return 'bg-error';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-soft-sm p-4 md:p-5 lg:p-6 transition-smooth hover-lift">
      <div className="flex items-start gap-3 md:gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <Image
            src={member?.avatar}
            alt={member?.avatarAlt}
            className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full object-cover ring-2 ring-border"
          />
          <div className={`absolute bottom-0 right-0 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-card ${getStatusColor(member?.status)}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-base md:text-lg text-foreground truncate">
            {member?.name}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5 truncate">
            {member?.role}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(member?.status)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {member?.status?.charAt(0)?.toUpperCase() + member?.status?.slice(1)}
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          iconName="MessageCircle"
          iconSize={18}
          onClick={() => onMessage(member)}
          className="flex-shrink-0"
        />
      </div>
      <div className="space-y-3 md:space-y-4 mb-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">Workload</span>
            <span className="text-xs md:text-sm font-medium text-foreground">{member?.workloadPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-smooth ${getWorkloadColor(member?.workloadPercentage)}`}
              style={{ width: `${member?.workloadPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-indigo-50/50 to-transparent rounded-xl p-3 border border-indigo-100/30">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="FolderKanban" size={16} color="var(--color-primary)" />
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <p className="text-lg md:text-xl font-semibold text-foreground">{member?.activeProjects}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50/50 to-transparent rounded-xl p-3 border border-amber-100/30">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Clock" size={16} color="var(--color-accent)" />
              <span className="text-xs text-muted-foreground">Deadlines</span>
            </div>
            <p className="text-lg md:text-xl font-semibold text-foreground">{member?.upcomingDeadlines}</p>
          </div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <p className="text-xs text-muted-foreground">Current Projects:</p>
        <div className="flex flex-wrap gap-1.5">
          {member?.currentProjects?.map((project, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium"
            >
              {project}
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          iconName="Plus"
          iconPosition="left"
          iconSize={16}
          onClick={() => onAssignTask(member)}
          fullWidth
        >
          Assign Task
        </Button>
        <Button
          variant="default"
          size="sm"
          iconName="Eye"
          iconPosition="left"
          iconSize={16}
          onClick={() => onViewDetails(member)}
          fullWidth
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default TeamMemberCard;
