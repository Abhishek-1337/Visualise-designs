import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const AutomationSettings = () => {
  const [automations, setAutomations] = useState([
    {
      id: 1,
      name: 'Auto-assign New Leads',
      description: 'Automatically assign incoming leads to team members based on round-robin rotation',
      category: 'leads',
      enabled: true,
      trigger: 'New lead created',
      action: 'Assign to next available team member'
    },
    {
      id: 2,
      name: 'Follow-up Reminder',
      description: 'Send reminder when a lead has not been contacted in 3 days',
      category: 'leads',
      enabled: true,
      trigger: 'No contact for 3 days',
      action: 'Send email reminder to assigned rep'
    },
    {
      id: 3,
      name: 'Proposal Follow-up',
      description: 'Remind team to follow up 48 hours after sending a proposal',
      category: 'leads',
      enabled: false,
      trigger: 'Proposal sent + 48 hours',
      action: 'Create follow-up task'
    },
    {
      id: 4,
      name: 'Project Milestone Alert',
      description: 'Notify client and team when a project milestone is completed',
      category: 'projects',
      enabled: true,
      trigger: 'Milestone marked complete',
      action: 'Send notification to client & team'
    },
    {
      id: 5,
      name: 'Overdue Task Escalation',
      description: 'Escalate overdue tasks to manager after 24 hours',
      category: 'projects',
      enabled: false,
      trigger: 'Task overdue by 24 hours',
      action: 'Notify project manager'
    },
    {
      id: 6,
      name: 'Weekly Pipeline Report',
      description: 'Send weekly summary of pipeline activity every Monday morning',
      category: 'reports',
      enabled: true,
      trigger: 'Every Monday 9:00 AM',
      action: 'Email pipeline report to admins'
    }
  ]);

  const [expandedId, setExpandedId] = useState(null);

  const toggleAutomation = (id) => {
    setAutomations(prev => prev?.map(a => a?.id === id ? { ...a, enabled: !a?.enabled } : a));
  };

  const categoryColors = {
    leads: 'bg-accent/10 text-accent',
    projects: 'bg-primary/10 text-primary',
    reports: 'bg-success/10 text-success'
  };

  const categoryIcons = {
    leads: 'GitBranch',
    projects: 'FolderKanban',
    reports: 'BarChart2'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold text-lg text-foreground">Workflow Automation</h3>
          <p className="text-sm text-muted-foreground">
            {automations?.filter(a => a?.enabled)?.length} of {automations?.length} automations active
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover:opacity-90 shadow-warm-sm">
          <Icon name="Plus" size={16} color="currentColor" />
          New Rule
        </button>
      </div>
      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'leads', 'projects', 'reports']?.map(cat => (
          <button
            key={cat}
            className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-smooth"
          >
            {cat === 'all' ? 'All Rules' : cat}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {automations?.map((automation) => (
          <div
            key={automation?.id}
            className={`bg-card rounded-xl border shadow-warm-sm overflow-hidden transition-smooth ${
              automation?.enabled ? 'border-border' : 'border-border opacity-70'
            }`}
          >
            <div className="flex items-start gap-4 p-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${categoryColors?.[automation?.category]}`}>
                <Icon name={categoryIcons?.[automation?.category]} size={16} color="currentColor" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-foreground">{automation?.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${categoryColors?.[automation?.category]}`}>
                        {automation?.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{automation?.description}</p>
                  </div>
                  <button
                    onClick={() => toggleAutomation(automation?.id)}
                    className={`relative w-11 h-6 rounded-full transition-smooth flex-shrink-0 ${
                      automation?.enabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-background rounded-full shadow transition-smooth ${
                      automation?.enabled ? 'left-[22px]' : 'left-0.5'
                    }`} />
                  </button>
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === automation?.id ? null : automation?.id)}
                  className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground transition-smooth"
                >
                  <Icon name="Settings" size={12} color="currentColor" />
                  Configure
                  <Icon name={expandedId === automation?.id ? 'ChevronUp' : 'ChevronDown'} size={12} color="currentColor" />
                </button>
              </div>
            </div>

            {expandedId === automation?.id && (
              <div className="px-4 pb-4 border-t border-border">
                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="Zap" size={14} color="var(--color-accent)" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Trigger</span>
                    </div>
                    <p className="text-sm text-foreground">{automation?.trigger}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="ArrowRight" size={14} color="var(--color-primary)" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Action</span>
                    </div>
                    <p className="text-sm text-foreground">{automation?.action}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutomationSettings;
