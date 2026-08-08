import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import Sidebar from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Card from '../../components/shared/Card';
import ActionButton from '../../components/shared/ActionButton';
import EmptyState from '../../components/shared/EmptyState';
import ActivityFeed from './components/ActivityFeed';
import TeamCalendar from './components/TeamCalendar';
import { userService, activityService, inviteService, permissionService } from '../../services';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
  CLIENT: 'Client',
};

const TeamWorkspace = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [canInvite, setCanInvite] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('EMPLOYEE');
  const [sending, setSending] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  useEffect(() => {
    loadData();
    checkInvitePermission();
  }, []);

  const checkInvitePermission = async () => {
    if (user?.role === 'ADMIN') {
      setCanInvite(true);
      return;
    }
    try {
      const res = await permissionService.getAll();
      const matrix = res.data.matrix;
      setCanInvite(!!matrix?.[user?.role]?.['contact.create']);
    } catch {
      setCanInvite(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, activitiesRes] = await Promise.all([
        userService.getAllUsers({ limit: '50' }),
        activityService.getAll({}),
      ]);
      setMembers(usersRes.data.users || []);
      setActivities((activitiesRes.data.activities || []).map((act: any) => ({
        id: act.id,
        type: act.type === 'task_completed' ? 'completion' : act.type === 'project_created' ? 'milestone' : 'collaboration',
        title: act.description?.substring(0, 60) || act.type,
        description: act.description || '',
        timestamp: act.createdAt,
        userAvatar: act.user?.avatar || '',
        userAvatarAlt: act.user?.name || '',
        userName: act.user?.name || 'System',
        projectName: '',
      })));
    } catch {
      console.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const activeMembers = members.filter((m) => m.isActive !== false);
  const filteredMembers = activeMembers.filter((m) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!m.name?.toLowerCase().includes(q) && !m.email?.toLowerCase().includes(q)) return false;
    }
    if (roleFilter !== 'all' && m.role !== roleFilter) return false;
    return true;
  });

  const stats = {
    totalMembers: activeMembers.length,
    managers: activeMembers.filter((m) => m.role === 'MANAGER').length,
    employees: activeMembers.filter((m) => m.role === 'EMPLOYEE').length,
    admins: activeMembers.filter((m) => m.role === 'ADMIN').length,
  };

  const handleSendInvite = async () => {
    if (!inviteEmail) return;
    setSending(true);
    setInviteError('');
    setInviteSuccess('');
    try {
      const res = await inviteService.create({ email: inviteEmail, role: inviteRole });
      setInviteSuccess(`Invitation sent! Link: ${res.data.inviteUrl}`);
    } catch (err: any) {
      setInviteError(err.response?.data?.error || 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="md:ml-[240px] h-screen  flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading team data...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background animate-fade-in">
      <Sidebar />
      <main className="md:ml-[240px] h-screen flex flex-col overflow-hidden">
        <div className="px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">Team</h1>
              <p className="text-sm text-muted-foreground">{activeMembers.length} members</p>
            </div>
            {canInvite && (
              <ActionButton icon="UserPlus" onClick={() => setShowInviteModal(true)}>
                Invite Member
              </ActionButton>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card variant="elevated" padding="lg" className="shadow-soft-md">
                <div className="flex items-center gap-3 text-primary mb-2">
                  <Icon name="Users" size={20} color="currentColor" />
                  <span className="text-sm font-medium">Total Members</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats.totalMembers}</p>
              </Card>
              <Card variant="elevated" padding="lg" className="shadow-soft-md">
                <div className="flex items-center gap-3 text-accent mb-2">
                  <Icon name="UserCheck" size={20} color="currentColor" />
                  <span className="text-sm font-medium">Managers</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats.managers}</p>
              </Card>
              <Card variant="elevated" padding="lg" className="shadow-soft-md">
                <div className="flex items-center gap-3 text-emerald-600 mb-2">
                  <Icon name="Briefcase" size={20} color="currentColor" />
                  <span className="text-sm font-medium">Employees</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats.employees}</p>
              </Card>
              <Card variant="elevated" padding="lg" className="shadow-soft-md">
                <div className="flex items-center gap-3 text-violet-600 mb-2">
                  <Icon name="Shield" size={20} color="currentColor" />
                  <span className="text-sm font-medium">Admins</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats.admins}</p>
              </Card>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Icon name="Search" size={16} color="var(--color-muted-foreground)" className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                {['all', 'ADMIN', 'MANAGER', 'EMPLOYEE'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-smooth ${
                      roleFilter === role
                        ? 'bg-card text-foreground shadow-soft-sm border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {role === 'all' ? 'All' : ROLE_LABELS[role]}
                  </button>
                ))}
              </div>
            </div>

            {filteredMembers.length === 0 ? (
              <Card variant="bordered" padding="lg">
                <EmptyState icon="Users" title="No members found" description="Try adjusting your search or filters." />
              </Card>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/60 border-b border-border">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Role</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {filteredMembers.map((member) => {
                      const roleCategory =
                        member.role === 'ADMIN' ? 'Admin' :
                        member.role === 'CLIENT' ? 'Client' :
                        'Team Member';
                      const roleBadgeColor =
                        member.role === 'ADMIN' ? 'bg-violet-100 text-violet-700 border-violet-200' :
                        member.role === 'CLIENT' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        'bg-emerald-100 text-emerald-700 border-emerald-200';
                      return (
                        <tr key={member.id} className="hover:bg-muted/30 transition-smooth">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                {member.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <span className="font-medium text-foreground truncate max-w-[180px]">
                                {member.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground truncate max-w-[220px]">
                            {member.email}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${roleBadgeColor}`}>
                              {roleCategory}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${member.isActive !== false ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${member.isActive !== false ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                              {member.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setSelectedMember(member)}
                              className="px-3 py-1.5 rounded-md text-xs font-medium text-primary hover:bg-primary/10 transition-smooth"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ActivityFeed activities={activities.slice(0, 15)} />
              </div>
              <div className="space-y-6">
                <TeamCalendar events={[]} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {showInviteModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/60 backdrop-blur-xl" onClick={() => setShowInviteModal(false)}>
          <div className="bg-card rounded-xl shadow-soft-2xl w-full max-w-md border border-border animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-lg text-foreground">Invite Team Member</h2>
              <button onClick={() => setShowInviteModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-smooth">
                <Icon name="X" size={18} color="currentColor" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="EMPLOYEE">Employee</option>
                </select>
              </div>
              {inviteError && <p className="text-xs text-error">{inviteError}</p>}
              {inviteSuccess && (
                <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                  <p className="text-xs text-success break-all">{inviteSuccess}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-smooth"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvite}
                  disabled={sending || !inviteEmail.trim()}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-smooth shadow-soft-sm"
                >
                  {sending ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMember && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/60 backdrop-blur-xl" onClick={() => setSelectedMember(null)}>
          <div className="bg-card rounded-xl shadow-soft-2xl w-full max-w-md border border-border animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-lg text-foreground">Member Details</h2>
              <button onClick={() => setSelectedMember(null)} className="p-1.5 rounded-lg hover:bg-muted transition-smooth">
                <Icon name="X" size={18} color="currentColor" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                  {selectedMember.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{selectedMember.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 bg-primary/10 text-primary">
                    {ROLE_LABELS[selectedMember.role] || selectedMember.role}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {selectedMember.isActive !== false ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Last Login</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {selectedMember.lastLogin
                      ? new Date(selectedMember.lastLogin).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  {selectedMember.createdAt
                    ? new Date(selectedMember.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamWorkspace;
