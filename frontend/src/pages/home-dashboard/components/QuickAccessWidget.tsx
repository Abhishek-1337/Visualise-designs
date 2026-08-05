import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { projectService, activityService, userService } from '../../../services';

const QuickAccessWidget = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pRes, aRes, tRes] = await Promise.allSettled([
        projectService.getAll({ limit: '5' }),
        activityService.getRecent(),
        userService.getAllUsers({ limit: '10' }),
      ]);
      if (pRes.status === 'fulfilled') setProjects(pRes.value.data.projects || []);
      if (aRes.status === 'fulfilled') setActivities(aRes.value.data.activities || aRes.value.data || []);
      if (tRes.status === 'fulfilled') setTeamMembers(tRes.value.data.users || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: string | Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-success bg-success/10';
      case 'ON_HOLD': return 'text-warning bg-warning/10';
      case 'COMPLETED': return 'text-accent bg-accent/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getActivityIcon = (type?: string) => {
    switch (type) {
      case 'CALL': return 'Phone';
      case 'EMAIL': return 'Mail';
      case 'MEETING': return 'Video';
      default: return 'MessageSquare';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
            <div className="h-5 bg-muted rounded w-1/2 mb-4" />
            <div className="space-y-3">
              <div className="h-14 bg-muted rounded" />
              <div className="h-14 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Activity" size={14} color="var(--color-primary)" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Activity</h3>
          </div>
          <Link to="/lead-client-flow">
            <Icon name="ExternalLink" size={14} color="var(--color-muted-foreground)" />
          </Link>
        </div>
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            activities.slice(0, 4).map((activity: any, i: number) => (
              <div key={activity.id || i} className="flex items-start gap-3 p-2.5 rounded-lg bg-background border border-border/50">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon name={getActivityIcon(activity.type)} size={12} color="var(--color-primary)" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground line-clamp-1">{activity.description || activity.message}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {activity.user?.name && <>{activity.user.name} &middot; </>}
                    {formatTimeAgo(activity.createdAt || activity.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <Icon name="FolderKanban" size={14} color="var(--color-accent)" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Projects</h3>
          </div>
          <Link to="/project-management">
            <Icon name="ExternalLink" size={14} color="var(--color-muted-foreground)" />
          </Link>
        </div>
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No projects yet</p>
          ) : (
            projects.map((project: any) => {
              const clientName = project.contact
                ? `${project.contact.firstName} ${project.contact.lastName}`
                : 'Unknown';
              return (
                <div key={project.id} className="p-3 rounded-lg bg-background border border-border/50">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">{project.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{clientName}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-medium ${getStatusColor(project.status)}`}>
                      {project.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${project.progress || 0}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{project.progress || 0}%</span>
                  </div>
                  {project.endDate && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Due {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Icon name="Users" size={14} color="var(--color-secondary)" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Team</h3>
          </div>
          <Link to="/team-workspace">
            <Icon name="ExternalLink" size={14} color="var(--color-muted-foreground)" />
          </Link>
        </div>
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {teamMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No team members</p>
          ) : (
            teamMembers.slice(0, 5).map((member: any) => {
              const getRoleColor = (role: string) => {
                switch (role) {
                  case 'ADMIN': return 'text-error bg-error/10';
                  case 'MANAGER': return 'text-warning bg-warning/10';
                  case 'EMPLOYEE': return 'text-primary bg-primary/10';
                  default: return 'text-muted-foreground bg-muted';
                }
              };
              return (
                <div key={member.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-background border border-border/50">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-secondary">
                        {member.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-medium ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickAccessWidget;
