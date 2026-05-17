import React from 'react';
import Icon from '../AppIcon';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'bordered' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const Card: React.FC<CardProps> = ({
  children,
  variant = 'bordered',
  padding = 'md',
  hover = false,
  selected = false,
  onClick,
  className = '',
}) => {
  const base = 'rounded-xl transition-all';
  const variantClasses = {
    elevated: 'bg-card shadow-warm',
    bordered: 'bg-card border border-border',
    flat: 'bg-card',
  };

  const interactive = onClick ? 'cursor-pointer text-left' : '';
  const hoverClasses = hover && !selected
    ? 'hover:border-blue-300 hover:bg-blue-50/30 dark:hover:bg-blue-950/20'
    : '';
  const selectedClasses = selected
    ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-700'
    : '';

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={`${base} ${variantClasses[variant]} ${paddingMap[padding]} ${interactive} ${hoverClasses} ${selectedClasses} ${className}`}
    >
      {children}
    </Tag>
  );
};

interface CardHeaderProps {
  title: string;
  action?: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({ title, action }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-heading font-semibold text-foreground">{title}</h3>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

export { CardHeader };
export default Card;
