import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'bordered' | 'flat' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const paddingMap = {
  none: 'p-0',
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
  const base = 'rounded-xl transition-all duration-200';
  const variantClasses = {
    elevated: 'bg-card shadow-soft-lg',
    bordered: 'bg-card border border-border',
    flat: 'bg-card',
    gradient: 'bg-card border border-border/50',
  };

  const interactive = onClick ? 'cursor-pointer text-left' : '';
  const hoverClasses = hover && !selected
    ? 'hover:border-primary/30 hover:shadow-soft-md hover-lift'
    : '';
  const selectedClasses = selected
    ? 'ring-2 ring-primary/30 border-primary/40 bg-primary/[0.02]'
    : '';

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={cn(base, variantClasses[variant], paddingMap[padding], interactive, hoverClasses, selectedClasses, className)}
    >
      {children}
    </Tag>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action, className }) => (
  <div className={cn("flex items-start justify-between gap-4 mb-5", className)}>
    <div className="min-w-0">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

export { CardHeader };
export default Card;
