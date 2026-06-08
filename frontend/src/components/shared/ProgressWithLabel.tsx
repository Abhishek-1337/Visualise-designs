import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressWithLabelProps {
  value: number;
  max?: number;
  label?: string;
  size?: 'sm' | 'md';
  showPercentage?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantColors = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-error',
};

const ProgressWithLabel: React.FC<ProgressWithLabelProps> = ({
  value,
  max = 100,
  label,
  size = 'sm',
  showPercentage = true,
  variant = 'primary',
  className,
}) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  const height = size === 'sm' ? 'h-2' : 'h-2.5';

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-foreground">{label}</span>}
          {showPercentage && (
            <span className="text-xs font-semibold text-muted-foreground">{percentage}%</span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', height)}>
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', variantColors[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressWithLabel;
