import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { taskService } from '../../../services';

interface Task {
  id: string;
  status: string;
  priority: string;
  dueDate?: string;
}

const MyWorkStatsCard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taskService
      .getAll({})
      .then((res) => setTasks(res.data.tasks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const todo = tasks.filter((t) => t.status === 'TODO').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const overdue = tasks.filter(
    (t) => t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < startOfToday
  ).length;

  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: 'To Do', value: todo, icon: 'Circle', color: 'text-muted-foreground', bg: 'bg-muted' },
    { label: 'In Progress', value: inProgress, icon: 'Loader', color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Completed', value: completed, icon: 'CheckCircle2', color: 'text-success', bg: 'bg-success/10' },
    { label: 'Overdue', value: overdue, icon: 'AlertCircle', color: 'text-error', bg: 'bg-error/10' },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="BarChart3" size={18} color="var(--color-primary)" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">My Work</h2>
            <p className="text-xs text-muted-foreground">Your personal task overview</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{completionRate}% complete</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {stats.map((s) => (
              <div key={s.label} className={`${s.bg} rounded-lg p-3 border border-border/50`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon name={s.icon} size={14} color="currentColor" className={s.color} />
                  <span className="text-[11px] text-muted-foreground">{s.label}</span>
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Overall completion</span>
            <span className="text-xs font-medium text-foreground">{completed}/{total} tasks</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${completionRate}%` }} />
          </div>
        </>
      )}
    </div>
  );
};

export default MyWorkStatsCard;
