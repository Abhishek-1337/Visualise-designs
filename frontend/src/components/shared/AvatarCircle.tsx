import React from 'react';
import { cn } from '../../utils/cn';

interface AvatarCircleProps {
  name: string;
  avatar?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-11 h-11 text-sm',
  xl: 'w-14 h-14 text-lg',
};

const colors = [
  'bg-gradient-to-br from-violet-500 to-violet-600',
  'bg-gradient-to-br from-emerald-500 to-emerald-600',
  'bg-gradient-to-br from-amber-500 to-amber-600',
  'bg-gradient-to-br from-rose-500 to-rose-600',
  'bg-gradient-to-br from-sky-500 to-sky-600',
  'bg-gradient-to-br from-indigo-500 to-indigo-600',
];

const AvatarCircle: React.FC<AvatarCircleProps> = ({ name, avatar, size = 'md', className }) => {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const colorIndex = name?.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length || 0;

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 overflow-hidden',
      sizeMap[size],
      !avatar && colors[colorIndex],
      className
    )}>
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
};

export default AvatarCircle;
