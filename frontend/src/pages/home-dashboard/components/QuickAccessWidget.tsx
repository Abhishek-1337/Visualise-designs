import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { projectService, activityService } from '../../../services';

const QuickAccessWidget = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pRes, aRes] = await Promise.allSettled([
        projectService.getAll({ limit: '3' }),
        activityService.getRecent(),
      ]);
      if (pRes.status === 'fulfilled') setProjects(pRes.value.data.projects || []);
      if (aRes.status === 'fulfilled') setActivities(aRes.value.data.activities || aRes.value.data || []);
    } catch {
      // silent fail
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
      case 'ACTIVE': return 'bg-success/10 text-success border-success/20';
      case 'ON_HOLD': return 'bg-warning/10 text-warning border-warning/20';
      case 'COMPLETED': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted text-muted-foreground border-border';
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
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card rounded-lg shadow-soft-lg p-5 md:p-6 border border-border/50 animate-pulse">
            <div className="h-6 bg-muted rounded w-2/3 mb-4" />
            <div className="space-y-3">
              <div className="h-16 bg-muted rounded" />
              <div className="h-16 bg-muted rounded" />
              <div className="h-16 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Activity */}
      <div className="bg-card rounded-lg shadow-soft-lg p-5 md:p-6 transition-smooth hover-lift border border-border/50">
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Activity" size={18} color="var(--color-primary)" />
            </div>
            <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">
              Recent Activity
            </h3>
          </div>
          <Link to="/lead-client-flow">
            <button className="p-1.5 rounded-lg hover:bg-muted transition-smooth">
              <Icon name="ExternalLink" size={16} color="currentColor" />
            </button>
          </Link>
        </div>

        <div className="space-y-3 md:space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            activities.slice(0, 5).map((activity: any, i: number) => (
              <div
                key={activity.id || i}
                className="p-3 rounded-lg border border-border bg-background hover:border-primary/30 hover:shadow-soft-sm transition-smooth"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name={getActivityIcon(activity.type)} size={14} color="var(--color-primary)" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2">{activity.description || activity.message}</p>
                    <span className="text-xs text-muted-foreground">
                      {activity.user?.name && <>{activity.user.name} · </>}
                      {formatTimeAgo(activity.createdAt || activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <Link to="/lead-client-flow" className="block mt-5">
          <button className="w-full py-2 text-sm text-primary hover:text-primary/80 font-medium transition-smooth">
            View All Activity →
          </button>
        </Link>
      </div>

      {/* Project Updates */}
      <div className="bg-card rounded-lg shadow-soft-lg p-5 md:p-6 transition-smooth hover-lift border border-border/50">
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <Icon name="FolderKanban" size={18} color="var(--color-accent)" />
            </div>
            <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">
              Project Updates
            </h3>
          </div>
          <Link to="/project-management">
            <button className="p-1.5 rounded-lg hover:bg-muted transition-smooth">
              <Icon name="ExternalLink" size={16} color="currentColor" />
            </button>
          </Link>
        </div>

        <div className="space-y-3 md:space-y-4">
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No projects yet</p>
          ) : (
            projects.map((project: any) => {
              const clientName = project.contact
                ? `${project.contact.firstName} ${project.contact.lastName}`
                : 'Unknown';
              return (
                <div
                  key={project.id}
                  className="p-3 rounded-lg border border-border bg-background hover:border-accent/30 hover:shadow-soft-sm transition-smooth"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">{project.name}</h4>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{clientName}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap ${getStatusColor(project.status)}`}>
                      {project.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span className="font-medium data-text">{project.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent transition-smooth" style={{ width: `${project.progress || 0}%` }} />
                    </div>
                  </div>
                  {project.endDate && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Due {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <Link to="/project-management" className="block mt-5">
          <button className="w-full py-2 text-sm text-accent hover:text-accent/80 font-medium transition-smooth">
            View All Projects →
          </button>
        </Link>
      </div>

      {/* Team Activity */}
      <div className="bg-card rounded-lg shadow-soft-lg p-5 md:p-6 transition-smooth hover-lift border border-border/50">
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Icon name="Users" size={18} color="var(--color-secondary)" />
            </div>
            <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">
              Team Activity
            </h3>
          </div>
          <Link to="/team-workspace">
            <button className="p-1.5 rounded-lg hover:bg-muted transition-smooth">
              <Icon name="ExternalLink" size={16} color="currentColor" />
            </button>
          </Link>
        </div>

        <div className="space-y-3 md:space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            activities.slice(0, 5).map((activity: any, i: number) => (
              <div
                key={activity.id || i}
                className="p-3 rounded-lg border border-border bg-background hover:border-secondary/30 hover:shadow-soft-sm transition-smooth"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-secondary">
                    {activity.user?.name
                      ? activity.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                      : '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      {activity.user?.name && <span className="font-medium">{activity.user.name} </span>}
                      {activity.description || activity.message || 'performed an action'}
                    </p>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.createdAt || activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <Link to="/team-workspace" className="block mt-5">
          <button className="w-full py-2 text-sm text-secondary hover:text-secondary/80 font-medium transition-smooth">
            View Team Workspace →
          </button>
        </Link>
      </div>
    </div>
  );
};

export default QuickAccessWidget;
