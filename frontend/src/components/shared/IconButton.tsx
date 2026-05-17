import React from 'react';
import Icon from '../AppIcon';

interface IconButtonProps {
  icon: string;
  onClick?: () => void;
  title?: string;
  size?: number;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, onClick, title, size = 18, className = '' }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-smooth text-muted-foreground hover:text-blue-600 ${className}`}
  >
    <Icon name={icon} size={size} color="currentColor" />
  </button>
);

export default IconButton;
