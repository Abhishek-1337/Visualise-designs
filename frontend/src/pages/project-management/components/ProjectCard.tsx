import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProjectCard = ({ project, onStatusUpdate, onViewDetails }) => {
  const getStatusColor = (status) => {
    const colors = {
      'In Progress': 'bg-accent/10 text-accent border-accent/20',
      'On Hold': 'bg-warning/10 text-warning border-warning/20',
      'Completed': 'bg-success/10 text-success border-success/20',
      'Planning': 'bg-secondary/10 text-secondary border-secondary/20'
    };
    return colors?.[status] || 'bg-muted text-muted-foreground border-border';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return 'bg-success';
    if (percentage >= 50) return 'bg-accent';
    if (percentage >= 25) return 'bg-warning';
    return 'bg-secondary';
  };

  const isOverdue = new Date(project.deadline) < new Date() && project?.status !== 'Completed';

  return (
    <div className="bg-card rounded-lg shadow-soft-md hover-lift transition-smooth border border-border/50 overflow-hidden group">
      <div className="relative overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border shadow-soft-sm ${getStatusColor(project?.status)}`}>
            {project?.status}
          </span>
          {isOverdue && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-error/10 text-error border border-error/20 shadow-soft-sm">
              Overdue
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-lg md:text-xl text-foreground mb-1 line-clamp-1">
              {project?.name}
            </h3>
            <Link
              to="/lead-client-flow"
              className="text-sm text-muted-foreground hover:text-primary transition-smooth inline-flex items-center gap-1"
            >
              <Icon name="Building2" size={14} />
              <span className="line-clamp-1">{project?.clientName}</span>
            </Link>
          </div>
          <button
            onClick={() => onViewDetails(project)}
            className="p-2 rounded-lg hover:bg-muted transition-smooth active-press flex-shrink-0 opacity-0 group-hover:opacity-100"
            aria-label="View project details"
          >
            <Icon name="ExternalLink" size={18} color="currentColor" />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Calendar" size={16} />
            <span className="whitespace-nowrap">
              {project.startDate ? new Date(project.startDate)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
              {' → '}
              {project.deadline ? new Date(project.deadline)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Users" size={16} />
            <div className="flex -space-x-2">
              {project?.teamMembers?.slice(0, 3)?.map((member, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded-full border-2 border-card overflow-hidden bg-muted"
                  title={member?.name}
                >
                  {member?.avatar ? (
                    <Image
                      src={member.avatar}
                      alt={member.avatarAlt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-primary">
                      {member?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
              ))}
              {project?.teamMembers?.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center">
                  <span className="text-xs font-medium">+{project?.teamMembers?.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground">{project?.progress}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${getProgressColor(project?.progress)}`}
              style={{ width: `${project?.progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="FolderOpen"
            iconPosition="left"
            fullWidth
            onClick={() => onViewDetails(project)}
          >
            View Details
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="MoreVertical"
            onClick={() => onStatusUpdate(project)}
            className="flex-shrink-0"
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;