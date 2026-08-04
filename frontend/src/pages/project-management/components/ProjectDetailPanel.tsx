import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const ProjectDetailPanel = ({ project, onClose, onTaskUpdate }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('timeline');

  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: 'Calendar' },
    { id: 'tasks', label: 'Tasks', icon: 'CheckSquare' },
    { id: 'files', label: 'Files', icon: 'FolderOpen' },
    { id: 'team', label: 'Team', icon: 'Users' }
  ];

  const handleTaskToggle = (taskId) => {
    onTaskUpdate(project?.id, taskId);
  };

  const getPhaseColor = (phase) => {
    const colors = {
      'Concept': 'bg-secondary/10 text-secondary border-secondary/20',
      'Modeling': 'bg-accent/10 text-accent border-accent/20',
      'Rendering': 'bg-warning/10 text-warning border-warning/20',
      'Delivery': 'bg-success/10 text-success border-success/20'
    };
    return colors?.[phase] || 'bg-muted text-muted-foreground border-border';
  };

  return (
    <div className="fixed inset-0 z-[1030] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-lg shadow-soft-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-border/50 animate-slide-up">
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-border">
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-1 line-clamp-1">
              {project?.name}
            </h2>
            <p className="text-sm text-muted-foreground">{project?.clientName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-smooth active-press flex-shrink-0"
            aria-label="Close panel"
          >
            <Icon name="X" size={24} color="currentColor" />
          </button>
        </div>

        <div className="border-b border-border overflow-x-auto">
          <div className="flex gap-1 p-2 min-w-max">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth flex-shrink-0
                  ${activeTab === tab?.id
                    ? 'gradient-primary text-white shadow-soft-sm'
                    : 'text-foreground hover:bg-muted'
                  }
                `}
              >
                <Icon
                  name={tab?.icon}
                  size={18}
                  color={activeTab === tab?.id ? '#FFFFFF' : 'currentColor'}
                />
                <span className="font-medium text-sm">{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-6 scrollbar-hide">
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Calendar" size={18} color="var(--color-primary)" />
                    <span className="text-sm font-medium text-muted-foreground">Start Date</span>
                  </div>
                  <p className="font-semibold text-foreground">
                    {project.startDate ? new Date(project.startDate)?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"}
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Flag" size={18} color="var(--color-accent)" />
                    <span className="text-sm font-medium text-muted-foreground">Deadline</span>
                  </div>
                  <p className="font-semibold text-foreground">
                    {project.deadline ? new Date(project.deadline)?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }): "N/A"}
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="TrendingUp" size={18} color="var(--color-success)" />
                    <span className="text-sm font-medium text-muted-foreground">Progress</span>
                  </div>
                  <p className="font-semibold text-foreground">{project?.progress}%</p>
                </div>
              </div>

              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">Milestones</h3>
                <div className="space-y-4">
                  {project?.milestones?.map((milestone, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${milestone?.completed ? 'gradient-primary' : 'bg-muted'}`}>
                          <Icon
                            name={milestone?.completed ? 'Check' : 'Circle'}
                            size={20}
                            color={milestone?.completed ? '#FFFFFF' : 'currentColor'}
                          />
                        </div>
                        {index < project?.milestones?.length - 1 && (
                          <div className={`w-0.5 h-16 ${milestone?.completed ? 'gradient-primary' : 'bg-border'}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <h4 className="font-semibold text-foreground mb-1">{milestone?.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{milestone?.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Icon name="Calendar" size={14} />
                          <span>{new Date(milestone.date)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              {['Concept', 'Modeling', 'Rendering', 'Delivery']?.map((phase) => {
                const phaseTasks = project?.tasks?.filter(task => task?.phase === phase);
                if (phaseTasks?.length === 0) return null;

                return (
                  <div key={phase}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPhaseColor(phase)}`}>
                        {phase}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {phaseTasks?.filter(t => t?.completed)?.length} / {phaseTasks?.length} completed
                      </span>
                    </div>
                    <div className="space-y-2">
                      {phaseTasks?.map((task) => (
                        <div
                          key={task?.id}
                          className="bg-background rounded-lg p-4 border border-border/50 hover:border-primary/30 hover:shadow-soft-sm transition-smooth"
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={task?.completed}
                              onChange={() => handleTaskToggle(task?.id)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-medium text-foreground mb-1 ${task?.completed ? 'line-through opacity-60' : ''}`}>
                                {task?.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">{task?.description}</p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Icon name="Calendar" size={14} />
                                  <span>{new Date(task.dueDate)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-5 h-5 rounded-full overflow-hidden bg-muted ring-2 ring-card">
                                    {task?.assignee?.avatar ? (
                                      <Image
                                        src={task.assignee.avatar}
                                        alt={task.assignee.avatarAlt}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-primary">
                                        {task?.assignee?.name?.[0]?.toUpperCase() || '?'}
                                      </div>
                                    )}
                                  </div>
                                  <span>{task?.assignee?.name}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-3">
              {project?.files?.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border/50 hover:border-primary/30 hover:shadow-soft-sm transition-smooth"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={file?.type === 'image' ? 'Image' : file?.type === 'document' ? 'FileText' : 'File'} size={20} color="var(--color-primary)" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground mb-1 line-clamp-1">{file?.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{file?.size}</span>
                      <span>•</span>
                      <span>{new Date(file.uploadedAt)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" iconName="Download" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project?.teamMembers?.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border/50 hover:border-primary/30 hover:shadow-soft-sm transition-smooth"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0 ring-2 ring-card">
                    {member?.avatar ? (
                      <Image
                        src={member.avatar}
                        alt={member.avatarAlt}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-primary">
                        {member?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground mb-1 line-clamp-1">{member?.name}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">{member?.role}</p>
                  </div>
                  <Button variant="ghost" size="sm" iconName="Mail" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-5 md:p-6 border-t border-border">
          <Button variant="outline" fullWidth onClick={onClose}>
            Close
          </Button>
          <Button
            variant="default"
            fullWidth
            iconName="ExternalLink"
            iconPosition="right"
            onClick={() => navigate(`/project-management/${project?.id}`)}
          >
            Open Full View
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPanel;