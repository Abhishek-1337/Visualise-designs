import React from 'react';
import { cn } from '../../utils/cn';

interface TeamMember {
  name: string;
  avatar?: string;
}

interface TeamMemberAvatarsProps {
  members: TeamMember[];
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

const colors = [
  'bg-gradient-to-br from-violet-500 to-violet-600',
  'bg-gradient-to-br from-emerald-500 to-emerald-600',
  'bg-gradient-to-br from-amber-500 to-amber-600',
  'bg-gradient-to-br from-rose-500 to-rose-600',
  'bg-gradient-to-br from-sky-500 to-sky-600',
];

const TeamMemberAvatars: React.FC<TeamMemberAvatarsProps> = ({ members, max = 4, size = 'sm', className }) => {
  const visible = members.slice(0, max);
  const remaining = members.length - max;

  const sizeClasses = size === 'sm' ? 'w-7 h-7 text-[10px] -ml-1.5 first:ml-0' : 'w-9 h-9 text-xs -ml-2 first:ml-0';

  return (
    <div className={cn('flex items-center', className)}>
      {visible.map((m, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-card flex-shrink-0 overflow-hidden',
            colors[i % colors.length],
            sizeClasses
          )}
          title={m.name}
        >
          {m.avatar ? (
            <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
          ) : (
            m.name.charAt(0).toUpperCase()
          )}
        </div>
      ))}
      {remaining > 0 && (
        <div className={cn(
          'rounded-full flex items-center justify-center font-medium bg-muted text-muted-foreground ring-2 ring-card flex-shrink-0',
          sizeClasses
        )}>
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default TeamMemberAvatars;
