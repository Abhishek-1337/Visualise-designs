import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import Button from '../../components/ui/Button';
import { projectService, taskService } from '../../services';

const PHASES = ['Concept', 'Modeling', 'Rendering', 'Delivery'] as const;
const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'bg-slate-400' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-amber-400' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-500' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-500' },
];

const ProjectDetails = () => {
  const { id } = useParams<any>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');

  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    phase: 'Concept',
    status: 'TODO',
    dueDate: '',
    assignedToId: '',
  });
  const [creatingTask, setCreatingTask] = useState(false);

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

  const allTasks: any[] = project?.tasks || [];
  const phasedTasks = allTasks.filter((t: any) => t.phase);
  const unphasedTasks = allTasks.filter((t: any) => !t.phase);

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      'Concept': 'bg-secondary/10 text-secondary border-secondary/20',
      'Modeling': 'bg-accent/10 text-accent border-accent/20',
      'Rendering': 'bg-warning/10 text-warning border-warning/20',
      'Delivery': 'bg-success/10 text-success border-success/20',
    };
    return colors?.[phase] || 'bg-muted text-muted-foreground border-border';
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITIES.find((p) => p.value === priority)?.color || 'bg-slate-400';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'CheckCircle';
      case 'IN_PROGRESS': return 'PlayCircle';
      case 'CANCELLED': return 'XCircle';
      default: return 'Circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-success';
      case 'IN_PROGRESS': return 'text-accent';
      case 'CANCELLED': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !id) return;
    try {
      setCreatingTask(true);
      const data = {
        title: taskForm.title,
        description: taskForm.description || undefined,
        priority: taskForm.priority,
        phase: taskForm.phase,
        status: editingTask ? taskForm.status : undefined,
        dueDate: taskForm.dueDate || undefined,
        assignedToId: taskForm.assignedToId || undefined,
      };
      if (editingTask) {
        await taskService.update(editingTask.id, data);
      } else {
        await taskService.create({ ...data, projectId: id });
      }
      setShowCreateTask(false);
      setEditingTask(null);
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', phase: 'Concept', status: 'TODO', dueDate: '', assignedToId: '' });
      fetchProject(id);
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setCreatingTask(false);
    }
  };

  const handleOpenCreateTask = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', priority: 'MEDIUM', phase: 'Concept', status: 'TODO', dueDate: '', assignedToId: '' });
    setShowCreateTask(true);
  };

  const handleOpenEditTask = (task: any) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'MEDIUM',
      phase: task.phase || 'Concept',
      status: task.status || 'TODO',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      assignedToId: task.assignedTo?.id || task.assignedToId || '',
    });
    setShowCreateTask(true);
  };

  const resetTaskForm = () => {
    setTaskForm({ title: '', description: '', priority: 'MEDIUM', phase: 'Concept', status: 'TODO', dueDate: '', assignedToId: '' });
    setShowCreateTask(false);
    setEditingTask(null);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inAWeek = new Date(today);
  inAWeek.setDate(inAWeek.getDate() + 7);

  const timelineTasks = {
    overdue: allTasks.filter((t: any) => {
      if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
      return t.dueDate && new Date(t.dueDate) < today;
    }),
    today: allTasks.filter((t: any) => {
      if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d >= today && d < new Date(today.getTime() + 86400000);
    }),
    thisWeek: allTasks.filter((t: any) => {
      if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d >= new Date(today.getTime() + 86400000) && d < inAWeek;
    }),
    upcoming: allTasks.filter((t: any) => {
      if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate) >= inAWeek;
    }),
    noDate: allTasks.filter((t: any) => {
      if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
      return !t.dueDate;
    }),
    completed: allTasks.filter((t: any) => t.status === 'COMPLETED'),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="md:ml-[240px] ">
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
        <main className="md:ml-[240px] ">
          <div className="flex items-center justify-center h-[60vh]">
            <p className="text-muted-foreground">Project not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-[240px] ">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 animate-fade-in">
          {/* Header */}
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
            <div className="space-y-8">
              {/* Stats cards */}
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
                <div className="bg-card rounded-lg p-4 border border-border/50 inline-block">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="DollarSign" size={18} color="var(--color-secondary)" />
                    <span className="text-sm font-medium text-muted-foreground">Budget</span>
                  </div>
                  <p className="font-semibold text-foreground text-lg">
                    ${project.budget.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Task Timeline */}
              {allTasks.length > 0 && (
                <div>
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Icon name="ListChecks" size={20} />
                    Task Timeline
                  </h3>
                  <div className="space-y-3">
                    {timelineTasks.overdue.length > 0 && (
                      <TimelineSection
                        title="Overdue"
                        icon="AlertTriangle"
                        color="text-error"
                        tasks={timelineTasks.overdue}
                        getPriorityColor={getPriorityColor}
                        onEditTask={handleOpenEditTask}
                      />
                    )}
                    {timelineTasks.today.length > 0 && (
                      <TimelineSection
                        title="Today"
                        icon="Sun"
                        color="text-accent"
                        tasks={timelineTasks.today}
                        getPriorityColor={getPriorityColor}
                        onEditTask={handleOpenEditTask}
                      />
                    )}
                    {timelineTasks.thisWeek.length > 0 && (
                      <TimelineSection
                        title="This Week"
                        icon="CalendarDays"
                        color="text-primary"
                        tasks={timelineTasks.thisWeek}
                        getPriorityColor={getPriorityColor}
                        onEditTask={handleOpenEditTask}
                      />
                    )}
                    {timelineTasks.upcoming.length > 0 && (
                      <TimelineSection
                        title="Upcoming"
                        icon="CalendarPlus"
                        color="text-muted-foreground"
                        tasks={timelineTasks.upcoming}
                        getPriorityColor={getPriorityColor}
                        onEditTask={handleOpenEditTask}
                      />
                    )}
                    {timelineTasks.noDate.length > 0 && (
                      <TimelineSection
                        title="No Due Date"
                        icon="HelpCircle"
                        color="text-muted-foreground"
                        tasks={timelineTasks.noDate}
                        getPriorityColor={getPriorityColor}
                      />
                    )}
                    {timelineTasks.completed.length > 0 && (
                      <TimelineSection
                        title="Completed"
                        icon="CheckCircle"
                        color="text-success"
                        tasks={timelineTasks.completed}
                        getPriorityColor={getPriorityColor}
                        onEditTask={handleOpenEditTask}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Milestones */}
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                  <Icon name="Milestone" size={20} />
                  Milestones
                </h3>
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
                    <p className="text-sm text-muted-foreground">No milestones set yet. Create tasks with due dates to see them on the timeline.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{allTasks.length} task{allTasks.length !== 1 ? 's' : ''}</p>
                <Button
                  variant="default"
                  size="sm"
                  iconName="Plus"
                  onClick={handleOpenCreateTask}
                  disabled={!project?.members || project.members.length === 0}
                >
                  New Task
                </Button>
              </div>

              {allTasks.length > 0 ? (
                <>
                  {phasedTasks.length > 0 && PHASES.map((phase) => {
                    const phaseTasks = allTasks.filter((t: any) => t.phase === phase);
                    if (phaseTasks.length === 0) return null;
                    return (
                      <div key={phase}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPhaseColor(phase)}`}>
                            {phase}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {phaseTasks.filter((t: any) => t.status === 'COMPLETED').length} / {phaseTasks.length} completed
                          </span>
                        </div>
                        <div className="space-y-2">
                          {phaseTasks.map((task: any) => (
                            <TaskCard key={task.id} task={task} getPriorityColor={getPriorityColor} onEdit={handleOpenEditTask} />
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {unphasedTasks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full text-sm font-medium border bg-muted text-muted-foreground border-border/50">
                          Other Tasks
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {unphasedTasks.filter((t: any) => t.status === 'COMPLETED').length} / {unphasedTasks.length} completed
                        </span>
                      </div>
                      <div className="space-y-2">
                        {unphasedTasks.map((task: any) => (
                          <TaskCard key={task.id} task={task} getPriorityColor={getPriorityColor} onEdit={handleOpenEditTask} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <Icon name="CheckSquare" size={48} className="mx-auto mb-4 text-muted-foreground/40" />
                  <p className="text-muted-foreground mb-4">No tasks yet. Create your first task.</p>
                  <Button variant="default" iconName="Plus" onClick={handleOpenCreateTask}>
                    Create Task
                  </Button>
                </div>
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

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/60 backdrop-blur-xl" onClick={resetTaskForm}>
          <div
            className="bg-card rounded-xl shadow-soft-2xl w-full max-w-lg border border-border overflow-hidden flex flex-col max-h-[90vh] animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-card to-muted/20">
              <h2 className="font-semibold text-lg text-foreground">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
              <button onClick={resetTaskForm} className="p-1.5 rounded-lg hover:bg-muted transition-smooth">
                <Icon name="X" size={18} color="currentColor" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Title *</label>
                <input
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Create initial concept sketches"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the task details..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phase</label>
                  <select
                    value={taskForm.phase}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, phase: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {PHASES.map((phase) => (
                      <option key={phase} value={phase}>{phase}</option>
                    ))}
                  </select>
                </div>
              </div>

              {editingTask && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Assign To *</label>
                  <select
                    required
                    value={taskForm.assignedToId}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, assignedToId: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="" disabled>Select a member</option>
                    {(project?.members || []).map((m: any) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-border flex gap-3 bg-muted/20">
              <Button variant="outline" onClick={resetTaskForm} className="flex-1">Cancel</Button>
              <Button
                onClick={handleSaveTask}
                disabled={creatingTask || !taskForm.title.trim() || !taskForm.assignedToId}
                className="flex-1"
              >
                {creatingTask ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskCard = ({ task, getPriorityColor, onEdit }: { task: any; getPriorityColor: (p: string) => string; onEdit?: (task: any) => void }) => (
  <div className="bg-card rounded-lg p-4 border border-border/50 hover:border-primary/30 hover:shadow-soft-sm transition-smooth group">
    <div className="flex items-start gap-3">
      <Icon
        name={task.status === 'COMPLETED' ? 'CheckCircle' : 'Circle'}
        size={20}
        className={`mt-0.5 flex-shrink-0 ${task.status === 'COMPLETED' ? 'text-success' : 'text-muted-foreground'}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`font-medium text-foreground ${task.status === 'COMPLETED' ? 'line-through opacity-60' : ''}`}>
            {task.title}
          </h4>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} />
          {onEdit && (
            <button onClick={() => onEdit(task)} className="ml-auto p-1 rounded-md hover:bg-muted opacity-0 group-hover:opacity-100 transition-smooth flex-shrink-0">
              <Icon name="Pencil" size={14} color="currentColor" />
            </button>
          )}
        </div>
        {task.description && (
          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Icon name="Calendar" size={14} />
              <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${task.status === 'COMPLETED' ? 'text-success bg-success/10' : task.status === 'IN_PROGRESS' ? 'text-accent bg-accent/10' : 'text-muted-foreground bg-muted'}`}>
            {task.status?.replace('_', ' ') || 'TODO'}
          </span>
          {task.phase && (
            <span className="text-muted-foreground">{task.phase}</span>
          )}
          {task.assignedTo && (
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-muted ring-2 ring-card">
                {task.assignedTo.avatar ? (
                  <Image src={task.assignedTo.avatar} alt={task.assignedTo.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-primary">
                    {task.assignedTo.name?.[0]}
                  </div>
                )}
              </div>
              <span>{task.assignedTo.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const TimelineSection = ({ title, icon, color, tasks, getPriorityColor, onEditTask }: {
  title: string; icon: string; color: string; tasks: any[]; getPriorityColor: (p: string) => string; onEditTask?: (task: any) => void;
}) => (
  <div className="relative pl-8">
    <div className="absolute left-3 top-1 bottom-0 w-0.5 bg-border" />
    <div className="flex items-center gap-2 mb-3">
      <div className={`absolute left-0 w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center ${color}`}>
        <Icon name={icon} size={14} />
      </div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <span className="text-xs text-muted-foreground">({tasks.length})</span>
    </div>
    <div className="space-y-2">
      {tasks.map((task: any) => (
        <div key={task.id} className="bg-card rounded-lg p-3 border border-border/50 hover:border-primary/20 transition-smooth group">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} />
            <span className={`text-sm font-medium text-foreground ${task.status === 'COMPLETED' ? 'line-through opacity-60' : ''}`}>
              {task.title}
            </span>
            {onEditTask && (
              <button onClick={() => onEditTask(task)} className="ml-auto p-1 rounded-md hover:bg-muted opacity-0 group-hover:opacity-100 transition-smooth flex-shrink-0">
                <Icon name="Pencil" size={12} color="currentColor" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground ml-4">
            {task.dueDate && (
              <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            )}
            {task.assignedTo ? (
              <span>{task.assignedTo.name}</span>
            ) : (
              <span className="text-muted-foreground italic">No one assigned</span>
            )}
            <span className={`px-1 py-0.5 rounded text-[10px] font-medium uppercase ${task.status === 'COMPLETED' ? 'text-success bg-success/10' : 'text-muted-foreground bg-muted'}`}>
              {task.status?.replace('_', ' ') || 'TODO'}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ProjectDetails;
