import React from 'react';
import Icon from '../../../components/AppIcon';
import Card from '../../../components/shared/Card';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  isActive: boolean;
  lastLogin: string;
}

interface TeamMemberCardProps {
  member: Member;
  onViewDetails: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
  CLIENT: 'Client',
};

const roleColors: Record<string, string> = {
  ADMIN: 'bg-primary/10 text-primary',
  MANAGER: 'bg-accent/10 text-accent',
  EMPLOYEE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  CLIENT: 'bg-muted text-muted-foreground',
};

const TeamMemberCard = ({ member, onViewDetails }: TeamMemberCardProps) => {
  return (
    <Card variant="bordered" padding="md" hover className="w-full dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-base font-bold text-primary shrink-0">
          {member.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm truncate">{member.name}</h4>
          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${roleColors[member.role] || 'bg-muted text-muted-foreground'}`}>
              {ROLE_LABELS[member.role] || member.role}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${member.isActive !== false ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
            <span className="text-[11px] text-muted-foreground">{member.isActive !== false ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
          className="p-1.5 rounded-lg hover:bg-muted transition-smooth text-muted-foreground hover:text-primary shrink-0"
        >
          <Icon name="ChevronRight" size={16} color="currentColor" />
        </button>
      </div>
    </Card>
  );
};

export default TeamMemberCard;
