import React from 'react';

interface AvatarCircleProps {
  name: string;
  avatar?: string;
  size?: number;
  className?: string;
}

const AvatarCircle: React.FC<AvatarCircleProps> = ({ name, avatar, size = 10, className = '' }) => {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const dimension = size * 4;
  const textSize = size >= 12 ? 'text-sm font-bold' : size >= 10 ? 'text-sm font-bold' : size >= 8 ? 'text-[10px]' : 'text-[9px]';

  return (
    <div
      className={`rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        <span className={`${textSize} font-medium text-blue-600 dark:text-blue-400`}>{initials}</span>
      )}
    </div>
  );
};

export default AvatarCircle;
