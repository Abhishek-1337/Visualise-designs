import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { projectService } from '../../../services';

const MyProjectsCard = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectService
      .getAll({ limit: '6' })
      .then((res) => setProjects(res.data.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-success bg-success/10';
      case 'ON_HOLD': return 'text-warning bg-warning/10';
      case 'COMPLETED': return 'text-accent bg-accent/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
            <Icon name="FolderKanban" size={18} color="var(--color-accent)" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">My Projects</h2>
            <p className="text-xs text-muted-foreground">Projects you're assigned to</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{projects.length} active</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="FolderOpen" size={36} color="var(--color-muted-foreground)" />
          <p className="text-sm text-muted-foreground mt-2">No projects assigned to you yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((project: any) => {
            const clientName = project.contact
              ? `${project.contact.firstName} ${project.contact.lastName}`
              : 'Internal';
            return (
              <Link
                key={project.id}
                to="/project-management"
                className="block p-3 rounded-lg bg-background border border-border/50 hover:border-primary/20 transition-smooth"
              >
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
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${project.progress || 0}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{project.progress || 0}%</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Link
        to="/project-management"
        className="mt-5 block text-center text-sm text-primary hover:text-primary/80 font-medium transition-smooth"
      >
        View all projects &rarr;
      </Link>
    </div>
  );
};

export default MyProjectsCard;
