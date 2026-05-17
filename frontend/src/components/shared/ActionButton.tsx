import React from 'react';
import Icon from '../AppIcon';

interface ActionButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'icon';
  disabled?: boolean;
  className?: string;
  iconSize?: number;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  icon,
  variant = 'primary',
  disabled = false,
  className = '',
  iconSize = 16,
}) => {
  if (variant === 'icon') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-smooth text-muted-foreground hover:text-blue-600 ${className}`}
      >
        {icon && <Icon name={icon} size={iconSize} color="currentColor" />}
      </button>
    );
  }

  const baseClasses = 'flex items-center gap-2 rounded-lg text-sm font-medium transition-smooth active-press';
  const variantClasses = variant === 'primary'
    ? 'px-4 py-2 bg-blue-600 text-white hover:bg-blue-700'
    : 'px-4 py-2 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30';

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses} ${className}`}>
      {icon && <Icon name={icon} size={iconSize} color="currentColor" />}
      {children}
    </button>
  );
};

export default ActionButton;
