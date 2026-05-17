import React from 'react';

const getProgressColor = (pct: number) => {
  if (pct >= 75) return 'bg-green-500';
  if (pct >= 50) return 'bg-blue-500';
  if (pct >= 25) return 'bg-amber-500';
  return 'bg-gray-300 dark:bg-gray-600';
};

interface ProgressWithLabelProps {
  progress: number;
}

const ProgressWithLabel: React.FC<ProgressWithLabelProps> = ({ progress }) => (
  <div className="flex-1 w-full">
    <div className="flex items-center justify-between text-xs mb-1">
      <span className="text-muted-foreground font-semibold">Progress</span>
    </div>
    <span className="font-medium text-foreground">{progress}%</span>
    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      <div
        className={`h-full transition-all duration-500 rounded-full ${getProgressColor(progress)}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

export default ProgressWithLabel;
