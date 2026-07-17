import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../../store';
import Icon from '../../../components/AppIcon';
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
        completed: t.status === 'COMPLETED',
      })));
    }
  }, [todaysTasks]);

  const handleTaskToggle = async (taskId: string) => {
    dispatch(updateTaskStatus({ id: taskId, data: { status: 'COMPLETED' } }));
    setLocalTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-error/10 text-error';
      case 'high': return 'bg-warning/10 text-warning';
      case 'medium': return 'bg-accent/10 text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const completedCount = localTasks?.filter((t) => t?.completed)?.length;
  const totalCount = localTasks?.length || 0;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="Target" size={18} color="var(--color-primary)" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Today's Focus</h2>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{completedCount}/{totalCount} done</span>
      </div>

      {totalCount > 0 && (
        <div className="h-1.5 bg-muted rounded-full mb-5 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPercentage}%` }} />
        </div>
      )}

      {isLoading && !localTasks.length ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : localTasks.length === 0 ? (
        <div className="text-center py-8 flex gap-2 justify-center">
          <Icon name="CheckCircle2" size={36} color="var(--color-muted-foreground)" />
          <p className="text-sm text-muted-foreground mt-2">No tasks for today</p>
        </div>
      ) : (
        <div className="space-y-2">
          {localTasks?.map((task) => (
            <div
              key={task?.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-smooth ${
                task?.completed ? 'bg-muted/30 border-border/50' : 'bg-background border-border hover:border-primary/20'
              }`}
            >
              <Checkbox checked={task?.completed} onChange={() => handleTaskToggle(task?.id)} size="default" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-medium ${task?.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task?.title}
                  </span>
                  <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-medium ${getPriorityColor(task?.priority)}`}>
                    {task?.priority?.charAt(0)?.toUpperCase() + task?.priority?.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="truncate">{task?.client}</span>
                  <span>{task?.dueTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        to="/lead-client-flow"
        className="mt-5 block text-center text-sm text-primary hover:text-primary/80 font-medium transition-smooth"
      >
        View all tasks &rarr;
      </Link>
    </div>
  );
};

export default TodaysFocusCard;
