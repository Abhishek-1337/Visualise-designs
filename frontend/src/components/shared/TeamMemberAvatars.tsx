import React from 'react';

interface TeamMember {
  name: string;
  avatar?: string;
}

interface TeamMemberAvatarsProps {
  members: TeamMember[];
  max?: number;
}

const MemberCircle: React.FC<{ name: string; avatar?: string }> = ({ name, avatar }) => (
  <div
    className="w-6 h-6 rounded-full border-2 border-card bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center"
    title={name}
  >
    {avatar ? (
      <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
    ) : (
      <span className="text-[9px] font-medium text-blue-600 dark:text-blue-400">{name.charAt(0)}</span>
    )}
  </div>
);

const TeamMemberAvatars: React.FC<TeamMemberAvatarsProps> = ({ members, max = 3 }) => {
  const visible = members.slice(0, max);
  const remaining = members.length - max;

  return (
    <div className="flex -space-x-1.5">
      {visible.map((member, i) => (
        <MemberCircle key={i} name={member.name} avatar={member.avatar} />
      ))}
      {remaining > 0 && (
        <div className="w-6 h-6 rounded-full border-2 border-card bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
          <span className="text-[9px] font-medium text-blue-600 dark:text-blue-400">+{remaining}</span>
        </div>
      )}
    </div>
  );
};

export default TeamMemberAvatars;
