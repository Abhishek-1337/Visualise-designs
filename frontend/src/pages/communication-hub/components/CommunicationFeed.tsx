import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

interface Communication {
  id?: string | number;
  type?: string;
  title?: string;
  summary?: string;
  outcome?: string;
  date?: Date | string;
  contact?: string;
  [key: string]: any;
}

interface CommunicationFeedProps {
  communications: Communication[];
  onSelect?: (comm: Communication) => void;
  selectedId?: string | null;
}

const CommunicationFeed = ({ communications, onSelect, selectedId }: CommunicationFeedProps) => {
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const typeConfig = {
    call: { icon: 'Phone', color: 'bg-success/10 text-success', label: 'Call' },
    zoom: { icon: 'Video', color: 'bg-accent/10 text-accent', label: 'Zoom' },
    email: { icon: 'Mail', color: 'bg-primary/10 text-primary', label: 'Email' },
    message: { icon: 'MessageSquare', color: 'bg-secondary/10 text-secondary', label: 'Message' }
  };

  const outcomeColors: Record<string, string> = {
    positive: 'text-success',
    neutral: 'text-warning',
    negative: 'text-error',
    pending: 'text-muted-foreground'
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return dateObj?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-3">
      {communications?.map((comm) => {
        const config = typeConfig?.[comm?.type];
        const isExpanded = expandedId === comm?.id;
        const isSelected = selectedId === comm?.id;

        return (
          <div
            key={comm?.id}
            className={`bg-card rounded-xl border transition-smooth cursor-pointer ${
              isSelected ? 'border-primary shadow-soft-md ring-1 ring-primary/10' : 'border-border hover:border-primary/30 hover:shadow-soft-sm'
            }`}
            onClick={() => { onSelect?.(comm); setExpandedId(isExpanded ? null : comm?.id); }}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config?.color}`}>
                  <Icon name={config?.icon} size={18} color="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{comm?.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{comm?.client} · {comm?.participant}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">{formatDate(comm?.date)}</span>
                      <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={14} color="var(--color-muted-foreground)" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config?.color}`}>{config?.label}</span>
                    {comm?.duration && <span className="text-xs text-muted-foreground flex items-center gap-1"><Icon name="Clock" size={10} color="currentColor" />{comm?.duration}</span>}
                    {comm?.outcome && <span className={`text-xs font-medium capitalize ${outcomeColors?.[comm?.outcomeType] || 'text-muted-foreground'}`}>{comm?.outcome}</span>}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border">
                  {comm?.notes && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm text-foreground">{comm?.notes}</p>
                    </div>
                  )}
                  {comm?.actionItems?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Action Items</p>
                      <ul className="space-y-1">
                        {comm?.actionItems?.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                            <Icon name="CheckSquare" size={14} color="var(--color-primary)" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium transition-smooth hover-lift shadow-soft-sm">
                      <Icon name="Phone" size={12} color="currentColor" />
                      Schedule Callback
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-medium text-foreground transition-smooth hover:bg-muted">
                      <Icon name="Mail" size={12} color="currentColor" />
                      Send Follow-up
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommunicationFeed;
