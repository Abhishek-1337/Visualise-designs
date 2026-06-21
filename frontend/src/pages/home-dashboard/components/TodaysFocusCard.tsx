import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../../store';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { fetchDashboard, updateTaskStatus } from '../../../store/slices/projectSlice';

const PRIORITY_MAP: Record<string, string> = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high', URGENT: 'urgent' };

const TodaysFocusCard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { todaysTasks, isLoading } = useSelector((state: RootState) => state.dashboard as any);
  const [localTasks, setLocalTasks] = React.useState<any[]>([]);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (todaysTasks?.length) {
      setLocalTasks(todaysTasks.map((t) => ({
        id: t.id,
        title: t.title,
        client: t.contact?.company || t.contact?.firstName || 'Unknown',
        priority: PRIORITY_MAP[t.priority] || 'medium',
        dueTime: t.dueDate ? new Date(t.dueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'All day',
        type: 'task',
        completed: t.status === 'COMPLETED'
      })));
    }
  }, [todaysTasks]);

  const handleTaskToggle = async (taskId) => {
    const { updateTaskStatus } = await import('../../../store/slices/projectSlice');
    dispatch(updateTaskStatus({ id: taskId, data: { status: 'COMPLETED' } }));
    setLocalTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-error/10 text-error border-error/20';
      case 'high': return 'bg-warning/10 text-warning border-warning/20';
      case 'medium': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const completedCount = localTasks?.filter((t) => t?.completed)?.length;
  const totalCount = localTasks?.length || 0;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (isLoading && !localTasks.length) {
    return (
      <div className="bg-card rounded-lg shadow-soft-md p-6 lg:p-8 border border-border/50">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-2 bg-muted rounded"></div>
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-soft-lg p-5 md:p-6 lg:p-8 transition-smooth hover-lift border border-border/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg gradient-primary flex items-center justify-center shadow-soft-sm">
            <Icon name="Target" size={20} color="#FFFFFF" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground">Today's Focus</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{new Date()?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
        <span className="text-xs md:text-sm font-medium text-foreground data-text">{completedCount}/{totalCount} completed</span>
      </div>
      {totalCount > 0 && (
        <div className="mb-5 md:mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full gradient-primary transition-smooth" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>
      )}
      {localTasks.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="CheckCircle2" size={48} color="var(--color-muted-foreground)" />
          <p className="text-muted-foreground mt-2">No tasks for today. Enjoy your free time!</p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {localTasks?.map((task) => (
            <div key={task?.id} className={`group p-3 md:p-4 rounded-lg border transition-smooth ${task?.completed ? 'bg-muted/50 border-border opacity-60' : 'bg-background border-border hover:border-primary/30 hover:shadow-soft-sm'}`}>
              <div className="flex items-start gap-3">
                <div className="pt-0.5">
                  <Checkbox checked={task?.completed} onChange={() => handleTaskToggle(task?.id)} size="default" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <h3 className={`text-sm md:text-base font-medium ${task?.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task?.title}</h3>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border whitespace-nowrap ${getPriorityColor(task?.priority)}`}>{task?.priority?.charAt(0)?.toUpperCase() + task?.priority?.slice(1)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Icon name="Building2" size={14} /><span className="truncate">{task?.client}</span></div>
                    <div className="flex items-center gap-1.5"><Icon name="Clock" size={14} /><span>{task?.dueTime}</span></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-5 md:mt-6 pt-5 md:pt-6 border-t border-border">
        <Link to="/lead-client-flow"><Button variant="outline" fullWidth iconName="ArrowRight" iconPosition="right">View All Tasks & Pipeline</Button></Link>
      </div>
    </div>
  );
};

export default TodaysFocusCard;