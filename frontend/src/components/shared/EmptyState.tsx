import React from 'react';
import Icon from '../AppIcon';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  iconSize?: number;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, iconSize = 24 }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-3">
      <Icon name={icon} size={iconSize} color="#3B82F6" />
    </div>
    <p className="text-sm text-muted-foreground">{title}</p>
    {description && <p className="text-xs text-muted-foreground/60 mt-1">{description}</p>}
  </div>
);

export default EmptyState;
