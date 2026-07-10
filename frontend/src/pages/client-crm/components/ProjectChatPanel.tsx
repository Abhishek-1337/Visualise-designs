import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { StatusBadge, IconButton, EmptyState } from '../../../components/shared';
import { taskService, userService } from '../../../services';

interface Message {
  id: string | number;
  content: string;
  sender: 'me' | 'client' | 'team';
  timestamp: Date;
  senderName?: string;
  senderAvatar?: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  progress: number;
  dueDate: string;
  team: { name: string; avatar?: string }[];
}

interface ProjectChatPanelProps {
  project: Project | null;
  messages: Message[];
  onSend: (content: string) => void;
  onClose: () => void;
  onToggleCollapse?: () => void;
}

const PHASES = ['Concept', 'Modeling', 'Rendering', 'Delivery'] as const;
const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'bg-slate-400' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-amber-400' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-500' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-500' },
];

const chatTabs = [
  { id: 'chat', label: 'Chat', icon: 'MessageSquare' },
  { id: 'tasks', label: 'Tasks', icon: 'CheckSquare' },
  { id: 'files', label: 'Files', icon: 'Paperclip' },
  { id: 'details', label: 'Details', icon: 'Info' },
];

const MessageBubble: React.FC<{ message: Message; showSender: boolean }> = ({ message, showSender }) => {
  const isMe = message.sender === 'me';
  const isTeam = message.sender === 'team';
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const initials = message.senderName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || (isTeam ? 'TM' : 'CL');

  return (
    <div className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} ${showSender ? 'mb-4' : 'mb-1'}`}>
      {showSender && (
        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
          isMe ? 'bg-primary text-primary-foreground' : (isTeam ? 'bg-primary/10 text-primary' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400')
        }`}>
          {message.senderAvatar ? (
            <img src={message.senderAvatar} alt={message.senderName} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <span className="text-[9px] font-semibold">{isMe ? 'ME' : initials}</span>
          )}
        </div>
      )}
      {!showSender && <div className="w-7 flex-shrink-0" />}
      <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
        {showSender && (
          <div className={`flex items-center gap-2 mb-0.5 ${isMe ? 'flex-row-reverse' : ''}`}>
            <span className={`text-[11px] font-semibold ${isMe ? 'text-primary' : (isTeam ? 'text-primary' : 'text-emerald-600')}`}>
              {isMe ? 'You' : message.senderName || (isTeam ? 'Team Member' : 'Client')}
            </span>
            <span className="text-[10px] text-muted-foreground">{time}</span>
          </div>
        )}
        {!showSender && (
          <span className="text-[10px] text-muted-foreground/50 mb-0.5 ml-0.5">{time}</span>
        )}
        <div className={`rounded-xl px-3.5 py-2 text-sm leading-relaxed ${
          isMe
            ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-soft-sm'
            : (isTeam ? 'bg-primary/5 text-foreground border border-primary/10 rounded-tl-sm' : 'bg-emerald-50 dark:bg-emerald-950/30 text-foreground border border-emerald-100 dark:border-emerald-900/50 rounded-tl-sm')
        }`}>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

const DateSeparator: React.FC<{ date: Date }> = ({ date }) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let label: string;
  if (date.toDateString() === today.toDateString()) label = 'Today';
  else if (date.toDateString() === yesterday.toDateString()) label = 'Yesterday';
  else label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[10px] font-medium text-muted-foreground bg-background px-2.5 py-0.5 rounded-full border border-border">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
};

const TaskCard: React.FC<{ task: any; onEdit?: (task: any) => void }> = ({ task, onEdit }) => {
  const getPriorityColor = (p: string) => PRIORITIES.find((pr) => pr.value === p)?.color || 'bg-slate-400';
  return (
    <div className="bg-background rounded-lg p-3 border border-border/50 group">
      <div className="flex items-start gap-2.5">
        <Icon
          name={task.status === 'COMPLETED' ? 'CheckCircle' : 'Circle'}
          size={18}
          className={`mt-0.5 flex-shrink-0 ${task.status === 'COMPLETED' ? 'text-success' : 'text-muted-foreground'}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-sm font-medium text-foreground ${task.status === 'COMPLETED' ? 'line-through opacity-60' : ''}`}>
              {task.title}
            </span>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} />
            {onEdit && (
              <button onClick={() => onEdit(task)} className="ml-auto p-1 rounded-md hover:bg-muted opacity-0 group-hover:opacity-100 transition-smooth flex-shrink-0">
                <Icon name="Pencil" size={12} color="currentColor" />
              </button>
            )}
          </div>
          {task.description && (
            <p className="text-xs text-muted-foreground mb-1.5 line-clamp-2">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            {task.dueDate && (
              <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            )}
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
              task.status === 'COMPLETED' ? 'text-success bg-success/10' : task.status === 'IN_PROGRESS' ? 'text-accent bg-accent/10' : 'text-muted-foreground bg-muted'
            }`}>
              {task.status?.replace('_', ' ') || 'TODO'}
            </span>
            {task.assignedTo && <span>{task.assignedTo.name}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectChatPanel: React.FC<ProjectChatPanelProps> = ({ project, messages, onSend, onClose, onToggleCollapse }) => {
  const [activeChatTab, setActiveChatTab] = useState('chat');
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'MEDIUM', phase: 'Concept', status: 'TODO', dueDate: '', assignedToId: '',
  });
  const [creatingTask, setCreatingTask] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [messageText]);

  useEffect(() => {
    if (activeChatTab === 'tasks' && project) {
      fetchTasks(String(project.id));
    }
  }, [activeChatTab, project]);

  const fetchTasks = async (projectId: string) => {
    try {
      setTasksLoading(true);
      const res = await taskService.getAll({ projectId });
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleOpenCreateTask = async () => {
    try {
      const res = await userService.getAllUsers({ limit: 100 });
      const staff = (res.data.users || []).filter((u: any) => u.role !== 'CLIENT');
      setAvailableUsers(staff);
    } catch {
      setAvailableUsers([]);
    }
    setEditingTask(null);
    setTaskForm({ title: '', description: '', priority: 'MEDIUM', phase: 'Concept', status: 'TODO', dueDate: '', assignedToId: '' });
    setShowCreateTask(true);
  };

  const handleOpenEditTask = async (task: any) => {
    try {
      const res = await userService.getAllUsers({ limit: 100 });
      const staff = (res.data.users || []).filter((u: any) => u.role !== 'CLIENT');
      setAvailableUsers(staff);
    } catch {
      setAvailableUsers([]);
    }
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

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !project) return;
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
        await taskService.create({ ...data, projectId: String(project.id) });
      }
      setShowCreateTask(false);
      setEditingTask(null);
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', phase: 'Concept', status: 'TODO', dueDate: '', assignedToId: '' });
      fetchTasks(String(project.id));
    } catch (err) {
      console.error('Failed to save task:', err);
    } finally {
      setCreatingTask(false);
    }
  };

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed || !project) return;
    onSend(trimmed);
    setMessageText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const groupedMessages: { date: Date; msgs: Message[] }[] = [];
  let currentDate: string | null = null;
  messages.forEach((msg) => {
    const msgDate = new Date(msg.timestamp).toDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: new Date(msg.timestamp), msgs: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].msgs.push(msg);
    }
  });

  if (!project) {
    return (
      <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col bg-card border-l border-border">
        <div className="flex items-center justify-between px-5 py-[0.85rem] border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="MessageSquare" size={18} color="var(--color-primary)" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Project Chat</h3>
              <p className="text-xs text-muted-foreground">Select a project to start chatting</p>
            </div>
          </div>
          {onToggleCollapse && (
            <IconButton icon="ChevronRight" title="Collapse panel" onClick={onToggleCollapse} />
          )}
        </div>
        <EmptyState icon="MessageCircle" title="Select a project from the client workspace to view its conversation." />
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[380px] xl:w-[420px] h-full flex flex-col bg-card border-l border-border min-h-0 animate-fade-in">
      <div className="flex items-center justify-between px-5 py-[0.85rem] border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="Folder" size={16} color="var(--color-primary)" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground truncate">{project.name}</h3>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-xs text-muted-foreground truncate">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onToggleCollapse && (
            <IconButton icon="ChevronRight" title="Collapse panel" onClick={onToggleCollapse} />
          )}
          <IconButton icon="X" title="Close panel" onClick={onClose} />
        </div>
      </div>

      <div className="border-b border-border px-3">
        <div className="flex">
          {chatTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChatTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-smooth border-b-2 ${
                activeChatTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary/30'
              }`}
            >
              <Icon name={tab.icon} size={13} color="currentColor" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeChatTab === 'chat' && (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-1">
            {groupedMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <EmptyState icon="MessageCircle" title="No messages yet" description="Start the conversation" />
              </div>
            ) : (
              groupedMessages.map((group, gi) => (
                <div key={gi}>
                  <DateSeparator date={group.date} />
                  {group.msgs.map((msg, mi) => {
                    const prevMsg = mi > 0 ? group.msgs[mi - 1] : null;
                    return <MessageBubble key={msg.id} message={msg} showSender={!prevMsg || prevMsg.sender !== msg.sender} />;
                  })}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border px-4 py-3">
            <div className="flex items-end gap-2 bg-muted border border-border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
              <IconButton icon="Paperclip" title="Attach file" />
              <textarea
                ref={textareaRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none max-h-28 py-0.5"
              />
              <div className="flex items-center gap-1 flex-shrink-0">
                <IconButton icon="Smile" title="Emoji" />
                <button
                  onClick={handleSend}
                  disabled={!messageText.trim()}
                  className={`p-1.5 rounded-lg transition-smooth ${
                    messageText.trim()
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft-sm'
                      : 'bg-muted-foreground/20 text-muted-foreground/50 cursor-not-allowed'
                  }`}
                >
                  <Icon name="Send" size={15} color="currentColor" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeChatTab === 'tasks' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-xs text-muted-foreground">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
            <Button variant="default" size="xs" iconName="Plus" onClick={handleOpenCreateTask}>
              New
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {tasksLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tasks.length > 0 ? (
              tasks.map((task: any) => (
                <TaskCard key={task.id} task={task} onEdit={handleOpenEditTask} />
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <EmptyState icon="CheckSquare" title="No tasks yet" description="Create tasks to track progress" />
              </div>
            )}
          </div>
        </div>
      )}

      {activeChatTab === 'details' && (
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h4>
            <p className="text-sm text-foreground leading-relaxed">{project.description || 'No description provided.'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background rounded-lg p-3 border border-border/50">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon name="TrendingUp" size={14} color="var(--color-success)" />
                <span className="text-xs text-muted-foreground">Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full" style={{ width: `${project.progress}%` }} />
                </div>
                <span className="text-sm font-semibold text-foreground">{project.progress}%</span>
              </div>
            </div>

            <div className="bg-background rounded-lg p-3 border border-border/50">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon name="Flag" size={14} color="var(--color-accent)" />
                <span className="text-xs text-muted-foreground">Due Date</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{project.dueDate || 'No due date'}</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Team Members</h4>
            <div className="space-y-2">
              {project.team.length > 0 ? (
                project.team.map((member, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-background rounded-lg border border-border/50">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground">{member.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No team members assigned.</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tasks Overview</h4>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-foreground font-semibold">{tasks.length} total</span>
              <span className="text-success font-semibold">{tasks.filter(t => t.status === 'COMPLETED').length} done</span>
              <span className="text-accent font-semibold">{tasks.filter(t => t.status === 'IN_PROGRESS').length} active</span>
            </div>
          </div>
        </div>
      )}

      {activeChatTab === 'files' && (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState icon="Paperclip" title="Files coming soon" />
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/60 backdrop-blur-xl" onClick={() => { setShowCreateTask(false); setTaskForm({ title: '', description: '', priority: 'MEDIUM', phase: 'Concept', dueDate: '', assignedToId: '' }); }}>
          <div
            className="bg-card rounded-xl shadow-soft-2xl w-full max-w-md border border-border overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-gradient-to-r from-card to-muted/20">
              <h2 className="font-semibold text-base text-foreground">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
              <button onClick={() => { setShowCreateTask(false); setTaskForm({ title: '', description: '', priority: 'MEDIUM', phase: 'Concept', dueDate: '', assignedToId: '' }); }} className="p-1 rounded-lg hover:bg-muted transition-smooth">
                <Icon name="X" size={16} color="currentColor" />
              </button>
            </div>
            <form onSubmit={handleSaveTask} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Title *</label>
                <input
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Task title"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm(p => ({ ...p, priority: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Phase</label>
                  <select
                    value={taskForm.phase}
                    onChange={(e) => setTaskForm(p => ({ ...p, phase: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {PHASES.map(ph => <option key={ph} value={ph}>{ph}</option>)}
                  </select>
                </div>
              </div>
              {editingTask && (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Status</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm(p => ({ ...p, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Assign To</label>
                  <select
                    value={taskForm.assignedToId}
                    onChange={(e) => setTaskForm(p => ({ ...p, assignedToId: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Unassigned</option>
                    {availableUsers.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { setShowCreateTask(false); setEditingTask(null); setTaskForm({ title: '', description: '', priority: 'MEDIUM', phase: 'Concept', status: 'TODO', dueDate: '', assignedToId: '' }); }}>
                  Cancel
                </Button>
                <Button disabled={creatingTask || !taskForm.title.trim()} className="flex-1">
                  {creatingTask ? 'Saving...' : editingTask ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectChatPanel;
