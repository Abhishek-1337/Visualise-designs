import React, { useState, useEffect } from 'react';
import { userService, inviteService } from '../../../services';
import Icon from '../../../components/AppIcon';
import AppImage from '../../../components/AppImage';

const roleColors = {
  ADMIN: 'bg-primary/10 text-primary',
  MANAGER: 'bg-accent/10 text-accent',
  EMPLOYEE: 'bg-success/10 text-success',
  CLIENT: 'bg-muted text-muted-foreground'
};

const roleLabels = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
  CLIENT: 'Client'
};

const inviteStatusColors = {
  PENDING: 'bg-warning/10 text-warning',
  ACCEPTED: 'bg-success/10 text-success',
  EXPIRED: 'bg-muted text-muted-foreground',
  CANCELLED: 'bg-error/10 text-error'
};

const TeamManagement = () => {
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('EMPLOYEE');
  const [sending, setSending] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userService.getAllUsers({ limit: '100' }),
      inviteService.getAll()
    ])
      .then(([usersRes, invitesRes]) => {
        setMembers(usersRes.data.users || []);
        setInvites(invitesRes.data.invites || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateRole = async (memberId, newRole) => {
    try {
      await userService.updateRole(memberId, { role: newRole });
      setMembers((prev) => prev?.map((m) => m?.id === memberId ? { ...m, role: newRole } : m));
    } catch {}
  };

  const handleSendInvite = async () => {
    if (!inviteEmail) return;
    setSending(true);
    setInviteError('');
    setInviteSuccess('');
    try {
      const res = await inviteService.create({ email: inviteEmail, role: inviteRole });
      setInvites((prev) => [res.data, ...prev]);
      setInviteEmail('');
      setInviteSuccess(`Invitation sent! Share this link: ${res.data.inviteUrl}`);
    } catch (err) {
      setInviteError(err.response?.data?.error || 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  const handleCancelInvite = async (inviteId) => {
    try {
      await inviteService.cancel(inviteId);
      setInvites((prev) => prev.map((inv) => inv.id === inviteId ? { ...inv, status: 'CANCELLED' } : inv));
    } catch {}
  };

  const allMembers = [
    ...members.map((m) => ({ ...m, kind: 'member' })),
    ...invites.filter((inv) => inv.status === 'PENDING').map((inv) => ({
      id: inv.id,
      name: `${inv.email} (invited)`,
      email: inv.email,
      role: inv.role,
      kind: 'invite',
      status: 'pending',
      inviteUrl: inv.inviteUrl,
      createdAt: inv.createdAt
    }))
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold text-lg text-foreground">Team Members</h3>
          <p className="text-sm text-muted-foreground">{members?.length} members in your studio</p>
        </div>
        <button
          onClick={() => { setShowInviteForm(!showInviteForm); setInviteError(''); setInviteSuccess(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover:opacity-90 shadow-soft-sm">
          <Icon name="UserPlus" size={16} color="currentColor" />
          Invite Member
        </button>
      </div>

      {showInviteForm &&
        <div className="bg-card border border-primary/20 rounded-xl p-5 shadow-soft-sm">
          <h4 className="font-medium text-foreground mb-4">Invite New Member</h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e?.target?.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e?.target?.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button
              onClick={handleSendInvite}
              disabled={sending}
              className="px-4 py-2 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover:opacity-90 disabled:opacity-50 shadow-soft-sm">
              {sending ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
          {inviteError && <p className="text-xs text-error mt-2">{inviteError}</p>}
          {inviteSuccess &&
            <div className="mt-3 p-3 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-xs text-success break-all">{inviteSuccess}</p>
            </div>
          }
        </div>
      }

      {invites.filter((inv) => inv.status === 'PENDING').length > 0 &&
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Pending Invitations</h4>
          {invites.filter((inv) => inv.status === 'PENDING').map((inv) => (
            <div key={inv.id} className="flex items-center gap-3 bg-card border border-border rounded-xl shadow-soft-sm p-4 hover-lift transition-smooth">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Icon name="Clock" size={16} color="var(--color-warning)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{inv.email}</p>
                <p className="text-xs text-muted-foreground">
                  Role: {roleLabels[inv.role] || inv.role}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                  Pending
                </span>
                <button
                  onClick={() => handleCancelInvite(inv.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-error hover:bg-error/10 transition-smooth">
                  <Icon name="X" size={14} color="currentColor" />
                </button>
              </div>
            </div>
          ))}
        </div>
      }

      <div className="space-y-3">
        {allMembers.length === 0 && !loading &&
          <p className="text-center text-sm text-muted-foreground py-8">No team members yet. Invite someone to get started.</p>
        }
        {allMembers?.map((member) =>
          <div key={member?.id} className="bg-card border border-border rounded-xl shadow-soft-sm overflow-hidden transition-smooth">
            <div
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-smooth"
              onClick={() => setSelectedMember(selectedMember?.id === member?.id ? null : member)}>
              <div className="relative">
                {member.kind === 'member' ? (
                  <>
                    <AppImage
                      src={member?.avatar}
                      alt={member?.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-border" />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                      member?.isActive ? 'bg-success' : 'bg-muted-foreground'
                    }`} />
                  </>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                    <Icon name="Mail" size={16} color="var(--color-warning)" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-foreground truncate">{member?.name}</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleColors[member?.role] || roleColors.EMPLOYEE}`}>
                    {roleLabels[member?.role] || member?.role}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{member?.email}</p>
              </div>
              {member.kind !== 'invite' && (
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground">Last active</p>
                  <p className="text-xs font-medium text-foreground">
                    {member?.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              )}
              {member.kind === 'member' && (
                <Icon
                  name={selectedMember?.id === member?.id ? 'ChevronUp' : 'ChevronDown'}
                  size={16}
                  color="var(--color-muted-foreground)" />
              )}
            </div>

            {selectedMember?.id === member?.id && member.kind === 'member' &&
              <div className="px-4 pb-4 border-t border-border">
                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Role</label>
                    <select
                      value={member?.role}
                      onChange={(e) => updateRole(member?.id, e?.target?.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
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
