import React from 'react';
import Icon from '../AppIcon';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon = 'Inbox', title, description, action, className }) => (
  <div className={cn("flex flex-col items-center justify-center text-center py-16 px-6", className)}>
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-5 ring-1 ring-primary/10">
      <Icon name={icon} size={28} className="text-primary/60" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-1.5">{title}</h3>
    {description && <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>}
    {action && <div>{action}</div>}
  </div>
);

export default EmptyState;
