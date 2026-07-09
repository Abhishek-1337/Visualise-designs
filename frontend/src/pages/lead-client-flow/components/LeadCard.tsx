import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

interface Lead {
  id?: string;
  name?: string;
  email?: string;
  company?: string;
  value?: number;
  status?: string;
  priority?: string;
  lastContact?: string;
  avatar?: string;
  phone?: string;
  source?: string;
  notes?: string;
  [key: string]: any;
}

interface LeadCardProps {
  lead: Lead;
  onDragStart?: (e: React.DragEvent, lead: Lead) => void;
  onClick?: (lead: Lead) => void;
  onQuickAction?: (action: string, lead: Lead) => void;
}

const LeadCard = ({ lead, onDragStart, onClick, onQuickAction }: LeadCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value);
  };

  const getTimeSinceContact = (date: string) => {
    const now = new Date();
    const contactDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - contactDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-error',
      medium: 'text-warning',
      low: 'text-success'
    };
    return colors?.[priority] || 'text-muted-foreground';
  };

  const getPriorityBg = (priority) => {
    const colors = {
      high: 'bg-error/10',
      medium: 'bg-warning/10',
      low: 'bg-success/10'
    };
    return colors?.[priority] || 'bg-muted';
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onClick={() => onClick(lead)}
      className="bg-background rounded-lg p-4 border border-border cursor-move hover-lift active-press transition-smooth hover:border-primary/30 hover:shadow-soft-sm"
    >
      <div className="flex items-start gap-3 mb-3">
        <Image
          src={lead?.avatar}
          alt={lead?.avatarAlt}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-card"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-heading font-semibold text-sm text-foreground truncate">
            {lead?.clientName}
          </h4>
          <p className="text-xs text-muted-foreground truncate">{lead?.company}</p>
        </div>
        <div className={`w-2 h-2 rounded-full mt-1.5 ${getPriorityBg(lead?.priority)}`}>
          <Icon 
            name="Flag" 
            size={14} 
            color="currentColor" 
            className={getPriorityColor(lead?.priority)}
          />
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <Icon name="Briefcase" size={14} color="var(--color-muted-foreground)" />
          <span className="text-xs text-foreground">{lead?.projectType}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="DollarSign" size={14} color="var(--color-muted-foreground)" />
          <span className="text-xs font-medium text-foreground">
            {formatCurrency(lead?.estimatedValue)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Clock" size={14} color="var(--color-muted-foreground)" />
          <span className="text-xs text-muted-foreground">
            Last contact: {getTimeSinceContact(lead?.lastContact)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <button
          onClick={(e) => {
            e?.stopPropagation();
            onQuickAction('call', lead);
          }}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-smooth active-press"
          title="Call client"
        >
          <Icon name="Phone" size={14} color="currentColor" />
          <span className="text-xs font-medium">Call</span>
        </button>
        <button
          onClick={(e) => {
            e?.stopPropagation();
            onQuickAction('email', lead);
          }}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-secondary/10 text-secondary hover:bg-secondary/20 transition-smooth active-press"
          title="Send email"
        >
          <Icon name="Mail" size={14} color="currentColor" />
          <span className="text-xs font-medium">Email</span>
        </button>
        {lead.dealStatus === 'DRAFT' ? (
          <button
            onClick={(e) => {
              e?.stopPropagation();
              onQuickAction('send', lead);
            }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-smooth active-press"
            title="Send deal to client"
          >
            <Icon name="Send" size={14} color="currentColor" />
            <span className="text-xs font-medium">Send</span>
          </button>
        ) : (
          <button
            onClick={(e) => {
              e?.stopPropagation();
              onQuickAction('view', lead);
            }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-smooth active-press"
            title="View profile"
          >
            <Icon name="Eye" size={14} color="currentColor" />
            <span className="text-xs font-medium">View</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LeadCard;