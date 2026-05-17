import React from 'react';
import Icon from '../../../components/AppIcon';

const AnalyticsSidebar = ({ stats }) => {
  const healthScore = stats?.healthScore || 82;
  const healthColor = healthScore >= 75 ? 'text-success' : healthScore >= 50 ? 'text-warning' : 'text-error';
  const healthBg = healthScore >= 75 ? 'bg-success' : healthScore >= 50 ? 'bg-warning' : 'bg-error';

  const typeBreakdown = [
    { type: 'Calls', count: stats?.calls || 24, icon: 'Phone', color: 'bg-success/10 text-success' },
    { type: 'Zoom', count: stats?.zoom || 8, icon: 'Video', color: 'bg-accent/10 text-accent' },
    { type: 'Emails', count: stats?.emails || 47, icon: 'Mail', color: 'bg-primary/10 text-primary' },
    { type: 'Messages', count: stats?.messages || 31, icon: 'MessageSquare', color: 'bg-secondary/10 text-secondary' }
  ];

  const topClients = [
    { name: 'Alexandra Morrison', count: 18, avatar: null },
    { name: 'David Chen', count: 14, avatar: null },
    { name: 'Priya Sharma', count: 11, avatar: null },
    { name: 'Marcus Johnson', count: 9, avatar: null }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl shadow-warm p-5">
        <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="BarChart2" size={18} color="var(--color-primary)" />
          Communication Analytics
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'This Month', value: stats?.thisMonth || '32', icon: 'MessageCircle' },
            { label: 'Avg Response', value: stats?.avgResponse || '2.4h', icon: 'Clock' },
            { label: 'Follow-ups', value: stats?.followUps || '7', icon: 'RefreshCw' },
            { label: 'Pending', value: stats?.pending || '3', icon: 'AlertCircle' }
          ]?.map((item) => (
            <div key={item?.label} className="bg-muted/50 rounded-lg p-3 text-center">
              <Icon name={item?.icon} size={16} color="var(--color-primary)" className="mx-auto mb-1" />
              <p className="text-lg font-heading font-bold text-foreground">{item?.value}</p>
              <p className="text-xs text-muted-foreground">{item?.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-warm p-5">
        <h3 className="font-heading font-semibold text-foreground mb-4">Relationship Health</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="var(--color-muted)" strokeWidth="6" />
              <circle cx="32" cy="32" r="26" fill="none" stroke={healthScore >= 75 ? 'var(--color-success)' : healthScore >= 50 ? 'var(--color-warning)' : 'var(--color-error)'} strokeWidth="6" strokeDasharray={`${(healthScore / 100) * 163.4} 163.4`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-bold ${healthColor}`}>{healthScore}</span>
            </div>
          </div>
          <div>
            <p className={`font-semibold ${healthColor}`}>{healthScore >= 75 ? 'Excellent' : healthScore >= 50 ? 'Good' : 'Needs Attention'}</p>
            <p className="text-xs text-muted-foreground mt-1">Based on frequency, response time & engagement</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-warm p-5">
        <h3 className="font-heading font-semibold text-foreground mb-4">By Type</h3>
        <div className="space-y-3">
          {typeBreakdown?.map((item) => (
            <div key={item?.type} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item?.color}`}>
                <Icon name={item?.icon} size={14} color="currentColor" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{item?.type}</span>
                  <span className="font-medium text-foreground">{item?.count}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(item?.count / 50) * 100}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-warm p-5">
        <h3 className="font-heading font-semibold text-foreground mb-4">Most Active Clients</h3>
        <div className="space-y-3">
          {topClients?.map((client, idx) => (
            <div key={client?.name} className="flex items-center gap-3">
              <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">{idx + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{client?.name}</p>
              </div>
              <span className="text-xs font-medium text-muted-foreground">{client?.count} comms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSidebar;
