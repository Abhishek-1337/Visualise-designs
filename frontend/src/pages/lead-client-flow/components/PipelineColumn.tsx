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
      'New Leads': 'bg-accent/10 text-accent',
      'Qualified': 'bg-primary/10 text-primary',
      'Proposal Sent': 'bg-secondary/10 text-secondary',
      'Negotiation': 'bg-warning/10 text-warning',
      'Closed Won': 'bg-success/10 text-success',
      'Closed Lost': 'bg-muted text-muted-foreground'
    };
    return colors?.[stageName] || 'bg-muted text-muted-foreground';
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
    <div className="flex flex-col h-full bg-card rounded-xl shadow-warm transition-smooth">
      <div className={`px-4 py-3 rounded-t-xl ${getStageColor(stage?.name)}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon name={stage?.icon} size={18} color="currentColor" />
            <h3 className="font-heading font-semibold text-base">{stage?.name}</h3>
          </div>
          <span className="px-2 py-1 bg-background/20 rounded-md text-xs font-medium">
            {leads?.length}
          </span>
        </div>
        <p className="text-xs font-medium opacity-90">
          Total: {formatCurrency(totalValue)}
        </p>
      </div>
      <div
        className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[400px]"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, stage?.id)}
      >
        {leads?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Icon name="Inbox" size={40} color="var(--color-muted-foreground)" className="mb-3 opacity-50" />
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