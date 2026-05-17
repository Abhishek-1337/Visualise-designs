import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import AppImage from '../../../components/AppImage';

const teamMembers = [
{
  id: 1,
  name: 'Sarah Mitchell',
  email: 'sarah@visualise.studio',
  role: 'admin',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1ce929a8f-1770714441566.png",
  avatarAlt: 'Professional woman with blonde hair smiling',
  status: 'active',
  lastActive: '2 hours ago',
  permissions: { leads: true, projects: true, team: true, billing: true, settings: true }
},
{
  id: 2,
  name: 'Marcus Johnson',
  email: 'marcus@visualise.studio',
  role: 'manager',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_14a5ca983-1763300171126.png",
  avatarAlt: 'Professional man with dark hair in business casual',
  status: 'active',
  lastActive: '30 min ago',
  permissions: { leads: true, projects: true, team: true, billing: false, settings: false }
},
{
  id: 3,
  name: 'Elena Rodriguez',
  email: 'elena@visualise.studio',
  role: 'designer',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_15b575e71-1763296142079.png",
  avatarAlt: 'Young woman with dark hair in creative workspace',
  status: 'active',
  lastActive: '1 day ago',
  permissions: { leads: false, projects: true, team: false, billing: false, settings: false }
},
{
  id: 4,
  name: 'James Park',
  email: 'james@visualise.studio',
  role: 'viewer',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1bf45e980-1763299426445.png",
  avatarAlt: 'Asian man in professional attire with glasses',
  status: 'inactive',
  lastActive: '5 days ago',
  permissions: { leads: false, projects: false, team: false, billing: false, settings: false }
}];


const roleColors = {
  admin: 'bg-primary/10 text-primary',
  manager: 'bg-accent/10 text-accent',
  designer: 'bg-success/10 text-success',
  viewer: 'bg-muted text-muted-foreground'
};

const TeamManagement = () => {
  const [members, setMembers] = useState(teamMembers);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');

  const updateRole = (memberId, newRole) => {
    setMembers((prev) => prev?.map((m) => m?.id === memberId ? { ...m, role: newRole } : m));
  };

  const togglePermission = (memberId, perm) => {
    setMembers((prev) => prev?.map((m) =>
    m?.id === memberId ?
    { ...m, permissions: { ...m?.permissions, [perm]: !m?.permissions?.[perm] } } :
    m
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold text-lg text-foreground">Team Members</h3>
          <p className="text-sm text-muted-foreground">{members?.length} members in your studio</p>
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover:opacity-90 shadow-warm-sm">
          
          <Icon name="UserPlus" size={16} color="currentColor" />
          Invite Member
        </button>
      </div>
      {/* Invite Form */}
      {showInviteForm &&
      <div className="bg-card rounded-xl p-5 border border-primary/20 shadow-warm-sm">
          <h4 className="font-medium text-foreground mb-4">Invite New Member</h4>
          <div className="flex gap-3">
            <input
            type="email"
            placeholder="Email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e?.target?.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
          
            <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e?.target?.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
            
              <option value="viewer">Viewer</option>
              <option value="designer">Designer</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <button className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium transition-smooth hover:opacity-90">
              Send Invite
            </button>
          </div>
        </div>
      }
      {/* Members List */}
      <div className="space-y-3">
        {members?.map((member) =>
        <div key={member?.id} className="bg-card rounded-xl border border-border shadow-warm-sm overflow-hidden">
            <div
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-smooth"
            onClick={() => setSelectedMember(selectedMember?.id === member?.id ? null : member)}>
            
              <div className="relative">
                <AppImage
                src={member?.avatar}
                alt={member?.avatarAlt}
                className="w-10 h-10 rounded-full object-cover" />
              
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
              member?.status === 'active' ? 'bg-success' : 'bg-muted-foreground'}`
              } />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-foreground">{member?.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors?.[member?.role]}`}>
                    {member?.role}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{member?.email}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">Last active</p>
                <p className="text-xs font-medium text-foreground">{member?.lastActive}</p>
              </div>
              <Icon
              name={selectedMember?.id === member?.id ? 'ChevronUp' : 'ChevronDown'}
              size={16}
              color="var(--color-muted-foreground)" />
            
            </div>

            {selectedMember?.id === member?.id &&
          <div className="px-4 pb-4 border-t border-border">
                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Role</label>
                    <select
                  value={member?.role}
                  onChange={(e) => updateRole(member?.id, e?.target?.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/40">
                  
                      <option value="viewer">Viewer</option>
                      <option value="designer">Designer</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Permissions</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(member?.permissions)?.map(([perm, enabled]) =>
                  <button
                    key={perm}
                    onClick={() => togglePermission(member?.id, perm)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-smooth ${
                    enabled ?
                    'bg-success/10 text-success border border-success/20' : 'bg-muted text-muted-foreground border border-border'}`
                    }>
                    
                          <Icon name={enabled ? 'Check' : 'X'} size={12} color="currentColor" />
                          {perm}
                        </button>
                  )}
                    </div>
                  </div>
                </div>
              </div>
          }
          </div>
        )}
      </div>
    </div>);

};

export default TeamManagement;