import React, { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Sidebar, { TopBar } from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import AllClientsGrid from './components/AllClientsGrid';
import ClientWorkspace from './components/ClientWorkspace';
import ProjectChatPanel from './components/ProjectChatPanel';
import { contactService, projectService, inviteService } from '../../services';
import type { RootState } from '../../store';
import type { Client } from './components/AllClientsGrid';
import type { Project } from './components/ClientWorkspace';

interface Message {
  id: string | number;
  content: string;
  sender: 'me' | 'client' | 'team';
  timestamp: Date;
  senderName?: string;
  senderAvatar?: string;
}

interface PendingInvite {
  id: string;
  email: string;
  createdAt: string;
}

const STATUS_MAP: Record<string, string> = {
  ACTIVE: 'active', VIP: 'vip', LEAD: 'lead', PROSPECT: 'prospect', INACTIVE: 'inactive',
};

const STATUS_MAP_PROJECT: Record<string, string> = {
  PLANNING: 'Planning', ACTIVE: 'In Progress', ON_HOLD: 'On Hold', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
};

const mapContactToClient = (c: any): Client => ({
  id: c.id,
  name: `${c.firstName} ${c.lastName}`,
  company: c.company || '',
  email: c.email,
  phone: c.phone || '',
  location: c.country || '',
  status: STATUS_MAP[c.status] || 'active',
});

const mapProject = (p: any): Project => ({
  id: p.id,
  name: p.name,
  description: p.description || '',
  status: STATUS_MAP_PROJECT[p.status] || p.status,
  progress: p.progress,
  dueDate: p.endDate ? new Date(p.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
  team: (p.members || []).map((m: any) => ({ name: m.name })),
});

const InviteClientModal = ({
  isOpen,
  onClose,
  onSend,
  sending,
  error,
  success,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: string) => void;
  sending: boolean;
  error: string;
  success: string;
}) => {
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (isOpen) { setEmail(''); }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card rounded-xl shadow-warm-2xl w-full max-w-md border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading font-semibold text-lg text-foreground">Invite New Client</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-smooth">
            <Icon name="X" size={18} color="currentColor" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Client Email</label>
            <input
              type="email"
              placeholder="Enter client email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-error">{error}</p>}
          {success && (
            <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-xs text-success break-all">{success}</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              variant="default"
              onClick={() => onSend(email)}
              disabled={sending || !email.trim()}
              className="flex-1"
            >
              {sending ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClientCRM = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [clients, setClients] = useState<Client[]>([]);
  const [projectsByClient, setProjectsByClient] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);

  useEffect(() => {
    loadData();
    loadInvites();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contactsRes, projectsRes] = await Promise.all([
        contactService.getAll({ limit: '100' }),
        projectService.getAll({ limit: '100' }),
      ]);
      const contacts = (contactsRes.data.contacts || []).map(mapContactToClient);
      setClients(contacts);

      const grouped: Record<string, any[]> = {};
      for (const p of projectsRes.data.projects || []) {
        const cid = p.contactId;
        if (!grouped[cid]) grouped[cid] = [];
        grouped[cid].push(p);
      }
      setProjectsByClient(grouped);
    } catch {
      console.error('Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  const loadInvites = async () => {
    try {
      const res = await inviteService.getAll();
      const clientInvites = (res.data.invites || [])
        .filter((inv: any) => inv.role === 'CLIENT' && inv.status === 'PENDING')
        .map((inv: any) => ({ id: inv.id, email: inv.email, createdAt: inv.createdAt }));
      setPendingInvites(clientInvites);
    } catch {}
  };

  const isClientRole = user?.role === 'CLIENT';

  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;
  const clientProjects: Project[] = (selectedClientId ? projectsByClient[selectedClientId] || [] : []).map(mapProject);
  const selectedProject = clientProjects.find((p) => String(p.id) === selectedProjectId) || null;
  const currentMessages = selectedProjectId ? (messages[selectedProjectId] || []) : [];

  const handleSelectClient = useCallback((client: Client) => {
    setSelectedClientId(client.id as string);
    setSelectedProjectId(null);
    setShowChatPanel(false);
  }, []);

  const handleSelectProject = useCallback((project: Project) => {
    setSelectedProjectId(String(project.id) as string);
    setShowChatPanel(true);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedClientId(null);
    setSelectedProjectId(null);
    setShowChatPanel(false);
  }, []);

  const handleSend = useCallback(
    (content: string) => {
      if (!selectedProjectId) return;
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        content,
        sender: 'me',
        timestamp: new Date(),
        senderName: 'You',
      };
      setMessages((prev) => ({
        ...prev,
        [selectedProjectId]: [...(prev[selectedProjectId] || []), newMsg],
      }));
    },
    [selectedProjectId]
  );

  const handleCloseChat = useCallback(() => {
    setShowChatPanel(false);
  }, []);

  const handleInviteClient = useCallback(() => {
    setShowInviteModal(true);
    setInviteError('');
    setInviteSuccess('');
    setInviteEmail('');
  }, []);

  const handleCloseInviteModal = useCallback(() => {
    setShowInviteModal(false);
    setInviteError('');
    setInviteSuccess('');
  }, []);

  const handleSendInvite = useCallback(async (email: string) => {
    if (!email) return;
    setSending(true);
    setInviteError('');
    setInviteSuccess('');
    try {
      const res = await inviteService.create({ email, role: 'CLIENT' });
      setPendingInvites((prev) => [
        { id: res.data.id, email: res.data.email, createdAt: res.data.createdAt },
        ...prev,
      ]);
      setInviteEmail(email);
      setInviteSuccess(`Invitation sent! Share this link: ${res.data.inviteUrl}`);
    } catch (err: any) {
      setInviteError(err.response?.data?.error || 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  }, []);

  const handleCancelInvite = useCallback(async (inviteId: string) => {
    try {
      await inviteService.cancel(inviteId);
      setPendingInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
    } catch {}
  }, []);

  if (isClientRole) {
    return (
      <div className="h-screen overflow-hidden bg-background">
        <Sidebar />
        <TopBar />
        <main className="md:ml-[240px] h-screen pt-[60px] overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-8">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icon name="Lock" size={36} color="var(--color-muted-foreground)" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Access Restricted</h2>
              <p className="text-muted-foreground leading-relaxed">
                This area is for team members only. If you need assistance, please contact support.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen overflow-hidden bg-background">
        <Sidebar />
        <TopBar />
        <main className="md:ml-[240px] h-screen pt-[60px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading clients...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      <Sidebar />
      <TopBar />
      <main className="md:ml-[240px] h-screen pt-[60px] flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {!selectedClientId ? (
            <AllClientsGrid
              clients={clients}
              onSelectClient={handleSelectClient}
              pendingInvites={pendingInvites}
              onInviteClient={handleInviteClient}
              onCancelInvite={handleCancelInvite}
            />
          ) : (
            <>
              <div className={`flex-1 flex flex-col min-w-0 min-h-0 ${showChatPanel ? 'hidden lg:flex' : 'flex'}`}>
                <ClientWorkspace
                  client={selectedClient}
                  projects={clientProjects}
                  selectedProjectId={selectedProjectId}
                  onSelectProject={handleSelectProject}
                  onBack={handleBack}
                />
              </div>

              <div className={`${showChatPanel ? 'flex' : 'hidden'} lg:flex min-h-0`}>
                <ProjectChatPanel
                  project={selectedProject}
                  messages={currentMessages}
                  onSend={handleSend}
                  onClose={handleCloseChat}
                />
              </div>
            </>
          )}
        </div>
      </main>

      <InviteClientModal
        isOpen={showInviteModal}
        onClose={handleCloseInviteModal}
        onSend={handleSendInvite}
        sending={sending}
        error={inviteError}
        success={inviteSuccess}
      />
    </div>
  );
};

export default ClientCRM;
