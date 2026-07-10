import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import { Card, StatusBadge, EmptyState } from '../../components/shared';
import { projectService } from '../../services';

const ClientProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getAll({});
      setProjects(res.data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-background animate-fade-in">
      <Sidebar />
      <main className="md:ml-[240px] h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Your Projects</h1>
              <p className="text-muted-foreground">Track progress and collaborate on active projects.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <EmptyState icon="Folder" title="No projects yet" description="Once a deal is accepted and converted, your project will appear here." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  hover
                  onClick={() => navigate(`/client-portal/projects/${project.id}`)}
                  className="p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-soft-sm">
                      <Icon name="Folder" size={20} color="white" />
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-1 truncate">{project.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6 h-10">{project.description}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground font-medium">Progress</span>
                        <span className="text-foreground font-bold">{project.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-500 ease-out" 
                          style={{ width: `${project.progress}%` }} 
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {(project.members || []).slice(0, 3).map((m: any, i: number) => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold overflow-hidden">
                              {m.avatar ? <img src={m.avatar} alt={m.name} /> : m.name[0]}
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">Team</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Icon name="Calendar" size={12} />
                        {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No date'}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientProjects;
