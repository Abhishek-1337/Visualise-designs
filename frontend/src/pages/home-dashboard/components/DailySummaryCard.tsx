import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { taskSummaryService } from '../../../services';

interface Summary {
  user: { id: string; name: string; avatar?: string };
  completedTasks: { id: string; title: string; contact?: { firstName?: string; lastName?: string; company?: string } }[];
  pendingTasks: { id: string; title: string; contact?: { firstName?: string; lastName?: string; company?: string } }[];
  totalCompleted: number;
  totalPending: number;
}

interface DailySummaryCardProps {
  role?: string;
}

const DailySummaryCard = ({ role = 'EMPLOYEE' }: DailySummaryCardProps) => {
  const [report, setReport] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER';

  useEffect(() => {
    loadDailySummary();
  }, []);

  const loadDailySummary = async () => {
    try {
      setLoading(true);
      const res = await taskSummaryService.getDailySummaries({});
      setReport(res.data.dailyReport || []);
    } catch (err) {
      console.error('Failed to load daily summaries', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl shadow-warm-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          {[1, 2].map(i => <div key={i} className="h-20 bg-muted rounded" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-warm-md p-6 transition-smooth hover-lift">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="ClipboardCheck" size={20} color="var(--color-primary)" />
        <h3 className="text-lg font-heading font-semibold text-foreground">
          {isAdminOrManager ? "Today's Task Summaries" : "My Task Summary"}
        </h3>
      </div>

      {report.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="FileText" size={40} color="var(--color-muted-foreground)" className="mx-auto mb-3" />
          <p className="text-muted-foreground">
            {isAdminOrManager ? "No summaries submitted yet today" : "No tasks completed or due today"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {report.map((item) => (
            <div key={item.user.id} className="p-4 rounded-lg border border-border bg-background">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">
                    {item.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.totalCompleted} completed · {item.totalPending} pending
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">{item.totalCompleted}/{item.totalCompleted + item.totalPending}</span>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full"
                      style={{ width: `${(item.totalCompleted + item.totalPending) > 0 ? (item.totalCompleted / (item.totalCompleted + item.totalPending)) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Completed tasks */}
              {item.completedTasks.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-success mb-1.5">Completed Today</p>
                  <div className="space-y-1.5">
                    {item.completedTasks.map((task) => (
                      <div key={task.id} className="flex items-start gap-2 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-success" />
                        <div>
                          <p className="text-foreground">{task.title}</p>
                          {task.contact && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {task.contact.company || `${task.contact.firstName} ${task.contact.lastName}`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending tasks */}
              {item.pendingTasks.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-warning mb-1.5">Due Today</p>
                  <div className="space-y-1.5">
                    {item.pendingTasks.map((task) => (
                      <div key={task.id} className="flex items-start gap-2 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-warning" />
                        <div>
                          <p className="text-foreground">{task.title}</p>
                          {task.contact && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {task.contact.company || `${task.contact.firstName} ${task.contact.lastName}`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailySummaryCard;
