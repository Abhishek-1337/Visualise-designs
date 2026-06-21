import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar, { TopBar } from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import Button from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { projectService } from '../../services';

const ProjectDetails = () => {
  const { id } = useParams<any>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');

  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: 'Calendar' },
    { id: 'tasks', label: 'Tasks', icon: 'CheckSquare' },
    { id: 'files', label: 'Files', icon: 'FolderOpen' },
    { id: 'team', label: 'Team', icon: 'Users' },
  ];

  useEffect(() => {
    if (id) fetchProject(id);
  }, [id]);

  const fetchProject = async (projectId: string) => {
    try {
      setLoading(true);
      const res = await projectService.getById(projectId);
      setProject(res.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      'Concept': 'bg-secondary/10 text-secondary border-secondary/20',
      'Modeling': 'bg-accent/10 text-accent border-accent/20',
      'Rendering': 'bg-warning/10 text-warning border-warning/20',
      'Delivery': 'bg-success/10 text-success border-success/20',
    };
    return colors?.[phase] || 'bg-muted text-muted-foreground border-border';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <TopBar />
        <main className="md:ml-[240px] pt-[60px]">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <TopBar />
        <main className="md:ml-[240px] pt-[60px]">
          <div className="flex items-center justify-center h-[60vh]">
            <p className="text-muted-foreground">Project not found</p>
          </div>
        </main>
      </div>
    );
  }

  const mappedTasks = (project.tasks || []).filter((t: any) => t.phase);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />
      <main className="md:ml-[240px] pt-[60px]">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 animate-fade-in">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/project-management')}
              className="p-2 hover:bg-muted rounded-lg transition-smooth active-press"
            >
              <Icon name="ArrowLeft" size={20} />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
                  {project.name}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {project.status}
                </span>
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-6">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-t-lg transition-smooth
                    ${activeTab === tab.id
                      ? 'bg-card text-foreground border border-border border-b-white font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  <Icon name={tab.icon} size={18} />
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Calendar" size={18} color="var(--color-primary)" />
                    <span className="text-sm font-medium text-muted-foreground">Start Date</span>
                  </div>
                  <p className="font-semibold text-foreground">
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : 'TBD'}
                  </p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Flag" size={18} color="var(--color-accent)" />
                    <span className="text-sm font-medium text-muted-foreground">Deadline</span>
                  </div>
                  <p className="font-semibold text-foreground">
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : 'TBD'}
                  </p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="TrendingUp" size={18} color="var(--color-success)" />
                    <span className="text-sm font-medium text-muted-foreground">Progress</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-700"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                    <span className="font-semibold text-foreground text-sm">{project.progress || 0}%</span>
                  </div>
                </div>
              </div>

              {project.budget != null && (
                <div className="bg-card rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="DollarSign" size={18} color="var(--color-secondary)" />
                    <span className="text-sm font-medium text-muted-foreground">Budget</span>
                  </div>
                  <p className="font-semibold text-foreground text-lg">
                    ${project.budget.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Milestones */}
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">Milestones</h3>
                <div className="space-y-4">
                  {(project.milestones || []).length > 0 ? (
                    project.milestones.map((milestone: any, index: number) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${milestone.completed ? 'gradient-primary' : 'bg-muted'}`}>
                            <Icon name={milestone.completed ? 'Check' : 'Circle'} size={20} color={milestone.completed ? '#FFFFFF' : 'currentColor'} />
                          </div>
                          {index < project.milestones.length - 1 && (
                            <div className={`w-0.5 h-16 ${milestone.completed ? 'gradient-primary' : 'bg-border'}`} />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <h4 className="font-semibold text-foreground mb-1">{milestone.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Icon name="Calendar" size={14} />
                            <span>{new Date(milestone.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No milestones set yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              {mappedTasks.length > 0 ? (
                ['Concept', 'Modeling', 'Rendering', 'Delivery'].map((phase) => {
                  const phaseTasks = project.tasks.filter((t: any) => t.phase === phase);
                  if (phaseTasks.length === 0) return null;
                  return (
                    <div key={phase}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPhaseColor(phase)}`}>
                          {phase}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {phaseTasks.filter((t: any) => t.completed).length} / {phaseTasks.length} completed
                        </span>
                      </div>
                      <div className="space-y-2">
                        {phaseTasks.map((task: any) => (
                          <div
                            key={task.id}
                            className="bg-card rounded-lg p-4 border border-border/50 hover:border-primary/30 hover:shadow-soft-sm transition-smooth"
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={task.completed}
                                onChange={() => {}}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-medium text-foreground mb-1 ${task.completed ? 'line-through opacity-60' : ''}`}>
                                  {task.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Icon name="Calendar" size={14} />
                                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'}</span>
                                  </div>
                                  {task.assignee && (
                                    <div className="flex items-center gap-1">
                                      <div className="w-5 h-5 rounded-full overflow-hidden bg-muted ring-2 ring-card">
                                        <Image src={task.assignee.avatar} alt={task.assignee.name} className="w-full h-full object-cover" />
                                      </div>
                                      <span>{task.assignee.name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">No tasks yet.</p>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-3">
              {(project.files || []).length > 0 ? (
                project.files.map((file: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border/50 hover:border-primary/30 hover:shadow-soft-sm transition-smooth"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name={file.type === 'image' ? 'Image' : file.type === 'document' ? 'FileText' : 'File'} size={20} color="var(--color-primary)" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground mb-1 line-clamp-1">{file.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" iconName="Download" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(project.members || []).length > 0 ? (
                project.members.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border/50 hover:border-primary/30 hover:shadow-soft-sm transition-smooth"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0 ring-2 ring-card">
                      {member.avatar ? (
                        <Image src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-primary">
                          {member.name?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground mb-1 line-clamp-1">{member.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">{member.role || 'Member'}</p>
                    </div>
                    <Button variant="ghost" size="sm" iconName="Mail" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No team members assigned.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails;
