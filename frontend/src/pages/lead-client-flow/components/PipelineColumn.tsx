import React from 'react';
import Icon from '../../../components/AppIcon';
import LeadCard from './LeadCard';

const PipelineColumn = ({ 
  stage, 
  leads, 
  onDragStart, 
  onDragOver, 
  onDrop,
  onLeadClick,
  onQuickAction 
}) => {
  const getStageColor = (stageName) => {
    const colors = {
      'New Leads': 'bg-primary/10 text-primary',
      'Qualified': 'bg-secondary/10 text-secondary',
      'Proposal Sent': 'bg-accent/10 text-accent',
      'Negotiation': 'bg-warning/10 text-warning',
      'Closed Won': 'bg-success/10 text-success',
      'Closed Lost': 'bg-muted text-muted-foreground'
    };
    return colors?.[stageName] || 'bg-muted text-muted-foreground';
  };

  const getStageGradient = (stageName) => {
    const gradients = {
      'New Leads': 'from-primary/5 to-transparent',
      'Qualified': 'from-secondary/5 to-transparent',
      'Proposal Sent': 'from-accent/5 to-transparent',
      'Negotiation': 'from-warning/5 to-transparent',
      'Closed Won': 'from-success/5 to-transparent',
      'Closed Lost': 'from-muted/30 to-transparent'
    };
    return gradients?.[stageName] || 'from-muted/30 to-transparent';
  };

  const totalValue = leads?.reduce((sum, lead) => sum + lead?.estimatedValue, 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value);
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg shadow-soft-md border border-border/50 hover:shadow-soft-lg transition-smooth">
      <div className={`px-4 py-3 rounded-t-lg bg-gradient-to-b ${getStageGradient(stage?.name)}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-md ${getStageColor(stage?.name)} flex items-center justify-center`}>
              <Icon name={stage?.icon} size={14} color="currentColor" />
            </div>
            <h3 className="font-heading font-semibold text-sm text-foreground">{stage?.name}</h3>
          </div>
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStageColor(stage?.name)}`}>
            {leads?.length}
          </span>
        </div>
        <p className="text-xs font-medium text-muted-foreground">
          {formatCurrency(totalValue)}
        </p>
      </div>
      <div
        className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[400px] scrollbar-hide"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, stage?.id)}
      >
        {leads?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Icon name="Inbox" size={24} color="var(--color-muted-foreground)" className="opacity-50" />
            </div>
            <p className="text-sm text-muted-foreground">No leads in this stage</p>
          </div>
        ) : (
          leads?.map((lead) => (
            <LeadCard
              key={lead?.id}
              lead={lead}
              onDragStart={onDragStart}
              onClick={onLeadClick}
              onQuickAction={onQuickAction}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PipelineColumn;