import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import type { Client } from './AllClientsGrid';
import { AvatarCircle, StatusBadge, ActionButton, ProgressWithLabel, TeamMemberAvatars, EmptyState, Card, CardHeader } from '../../../components/shared';
import { dealService } from '../../../services';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  progress: number;
  dueDate: string;
  team: { name: string; avatar?: string }[];
}

interface ClientWorkspaceProps {
  client: Client;
  projects: Project[];
  deals?: any[];
  selectedProjectId: string | null;
  onSelectProject: (project: Project) => void;
  onBack: () => void;
  onNewProject: () => void;
  onNewDeal?: () => void;
  onRefresh?: () => void;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
  { id: 'deals', label: 'Deals', icon: 'Briefcase' },
  { id: 'projects', label: 'Projects', icon: 'FolderKanban' },
  { id: 'invoices', label: 'Invoices', icon: 'CreditCard' },
  { id: 'files', label: 'Files', icon: 'Paperclip' },
  { id: 'notes', label: 'Notes', icon: 'FileText' },
  { id: 'activity', label: 'Activity', icon: 'Activity' },
];

const ClientWorkspace: React.FC<ClientWorkspaceProps> = ({
  client,
  projects,
  deals = [],
  selectedProjectId,
  onSelectProject,
  onBack,
  onNewProject,
  onNewDeal,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState('deals');
  const [localDeals, setLocalDeals] = useState<any[]>(deals);
  const [convertingDealId, setConvertingDealId] = useState<string | null>(null);
  const [sendingDealId, setSendingDealId] = useState<string | null>(null);
  const [editDeal, setEditDeal] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', value: '', stage: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    setLocalDeals(deals);
  }, [deals]);

  const handleConvertToProject = async (dealId: string) => {
    try {
      setConvertingDealId(dealId);
      await dealService.convertToProject(dealId);
      setLocalDeals((prev) => prev.filter((d) => d.id !== dealId));
      setActiveTab('projects');
    } catch (error) {
      console.error('Failed to convert deal:', error);
    } finally {
      setConvertingDealId(null);
    }
  };

  const handleSendToClient = async (dealId: string) => {
    try {
      setSendingDealId(dealId);
      await dealService.update(dealId, { status: 'SENT', changeRequestNotes: '' });
      setLocalDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, status: 'SENT', changeRequestNotes: '' } : d))
      );
    } catch (error) {
      console.error('Failed to send deal:', error);
    } finally {
      setSendingDealId(null);
    }
  };

  const handleEditDeal = (deal: any) => {
    setEditDeal(deal);
    setEditForm({
      title: deal.title || '',
      description: deal.description || '',
      value: String(deal.value || ''),
      stage: deal.stage || 'NEW_LEAD',
    });
  };

  const handleSaveDeal = async () => {
    if (!editDeal) return;
    try {
      setSavingEdit(true);
      const updated = await dealService.update(editDeal.id, {
        title: editForm.title,
        description: editForm.description,
        value: parseFloat(editForm.value),
        stage: editForm.stage,
        status: 'DRAFT',
        changeRequestNotes: '',
      });
      setEditDeal(null);
      setLocalDeals((prev) =>
        prev.map((d) => (d.id === editDeal.id ? { ...d, ...(updated.data || updated), changeRequestNotes: '' } : d))
      );
    } catch (error) {
      console.error('Failed to update deal:', error);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0 bg-background overflow-hidden animate-fade-in">
      <div className="px-6 py-4 border-b border-border shrink-0 dark:bg-slate-800 h-16 bg-white">
        
        <div className="flex items-center p-2 gap-2 text-xs text-muted-foreground">
          <button
            onClick={onBack}
            className="text-sm text-primary hover:text-primary/80 transition-smooth"
          >
            <Icon name="ChevronLeft" size={14} color="currentColor" />
          </button>
          <span>Clients</span>
          <Icon name="ChevronRight" size={12} color="currentColor" />
          <span className="text-foreground font-medium">{client.name}</span>
        </div>
      </div>

      <Card variant="elevated" padding="lg" className="mx-4 mt-4 mb-0 pb-0 shrink-0 shadow-soft-md">
        <div className="flex flex-col lg:flex-row lg:items-start gap-5">
          <div className="flex items-start gap-4 flex-1">
            <AvatarCircle name={client.name} avatar={client.avatar} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{client.name}</h1>
                <StatusBadge status={client.status} size="md" />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon name="Mail" size={12} color="var(--color-primary)" />
                  {client.email}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon name="Phone" size={12} color="var(--color-primary)" />
                  {client.phone}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon name="MapPin" size={12} color="var(--color-primary)" />
                  {client.location}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton icon="Phone">Call</ActionButton>
            <ActionButton variant="secondary" icon="Mail">Email</ActionButton>
            <ActionButton variant="icon" icon="MoreHorizontal" iconSize={18} />
          </div>
        </div>
        <div className="border-b border-border px-6 mt-4">
          <div className="flex overflow-x-auto -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-smooth border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary/[0.03]'
                    : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary/30'
                }`}
              >
                <Icon name={tab.icon} size={15} color="currentColor" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex-1 min-h-0 p-6 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="elevated" padding="lg" className="flex flex-col gap-2 shadow-soft-md">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Icon name="Briefcase" size={20} color="currentColor" />
                <h3 className="font-semibold">Deals</h3>
              </div>
              <p className="text-3xl font-bold">{localDeals.length}</p>
              <p className="text-sm text-muted-foreground">Active proposals and opportunities</p>
            </Card>
            <Card variant="elevated" padding="lg" className="flex flex-col gap-2 shadow-soft-md">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Icon name="Folder" size={20} color="currentColor" />
                <h3 className="font-semibold">Projects</h3>
              </div>
              <p className="text-3xl font-bold">{projects.length}</p>
              <p className="text-sm text-muted-foreground">Active and planning projects</p>
            </Card>
            <Card variant="elevated" padding="lg" className="flex flex-col gap-2 shadow-soft-md">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <Icon name="CheckSquare" size={20} color="currentColor" />
                <h3 className="font-semibold">Tasks</h3>
              </div>
              <p className="text-3xl font-bold">{projects.reduce((acc, p) => acc + p.progress < 100 ? 1 : 0, 0)}</p>
              <p className="text-sm text-muted-foreground">Pending projects</p>
            </Card>
          </div>
        )}

        {activeTab === 'deals' && (
          <Card variant="bordered" padding="lg" className="h-full flex flex-col overflow-hidden">
            <CardHeader
              title={`Deals (${localDeals.length})`}
              action={<ActionButton icon="Plus" onClick={onNewDeal}>New Deal</ActionButton>}
            />

            {localDeals.length === 0 ? (
              <EmptyState icon="Briefcase" title="No deals yet for this client" />
            ) : (
              <div className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-2">
                {localDeals.map((deal) => (
                  <Card
                    key={deal.id}
                    variant="bordered"
                    padding="md"
                    className="flex items-center justify-between gap-4 w-full dark:bg-slate-900"
                    hover
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Icon name="Briefcase" size={18} color="currentColor" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{deal.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={deal.status} />
                          <span className="text-xs text-muted-foreground">${deal.value.toLocaleString()}</span>
                        </div>
                        {deal.status === 'CHANGES_REQUESTED' && deal.changeRequestNotes && (
                          <div className="flex items-start gap-2 mt-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-lg max-w-md">
                            <Icon name="MessageSquare" size={13} color="var(--color-warning)" className="mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{deal.changeRequestNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(deal.status === 'DRAFT' || deal.status === 'CHANGES_REQUESTED') && (
                        <button
                          onClick={() => handleEditDeal(deal)}
                          className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs font-medium hover:bg-muted/80 border border-border transition-smooth"
                        >
                          Edit Deal
                        </button>
                      )}
                      {deal.status === 'DRAFT' && (
                        <button
                          onClick={() => handleSendToClient(deal.id)}
                          disabled={sendingDealId === deal.id}
                          className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent/90 disabled:opacity-50 transition-smooth shadow-soft-sm"
                        >
                          {sendingDealId === deal.id ? 'Sending...' : 'Send to Client'}
                        </button>
                      )}
                      {deal.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleConvertToProject(deal.id)}
                          disabled={convertingDealId === deal.id}
                          className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-smooth shadow-soft-sm"
                        >
                          {convertingDealId === deal.id ? 'Converting...' : 'Convert to Project'}
                        </button>
                      )}
                      <ActionButton variant="icon" icon="ChevronRight" iconSize={16} />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'projects' && (
          <Card variant="bordered" padding="lg" className="h-full flex flex-col overflow-hidden">
            <CardHeader
              title={`Projects (${projects.length})`}
              action={<ActionButton icon="Plus" onClick={onNewProject}>New Project</ActionButton>}
            />

            {projects.length === 0 ? (
              <EmptyState icon="FolderKanban" title="No projects yet for this client" />
            ) : (
              <div className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-2">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    variant="bordered"
                    padding="md"
                    hover
                    selected={String(project.id) === selectedProjectId}
                    onClick={() => onSelectProject(project)}
                    className="flex items-start gap-4 w-full cursor-pointer dark:bg-slate-900"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      String(project.id) === selectedProjectId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      <Icon name="Folder" size={18} color="currentColor" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr] gap-6 w-full">
                      <div className="flex flex-col gap-1">
                        <h4 className="font-semibold text-foreground truncate text-sm">{project.name}</h4>
                        <p className="text-muted-foreground text-xs line-clamp-1">{project.description}</p>
                        <StatusBadge status={project.status} className='max-w-max mt-1'/>
                      </div>
                      <div className="flex flex-col gap-3 w-full justify-center">
                        <ProgressWithLabel value={project.progress} />
                        <TeamMemberAvatars members={project.team} />
                      </div>
                      <div className="flex flex-col items-start md:items-center justify-center gap-1 text-xs text-muted-foreground">
                        <span className="font-semibold">Due Date</span>
                        <div className="flex gap-2 items-center">
                          <Icon name="Calendar" size={14} color="var(--color-primary)" />
                          <span className="whitespace-nowrap">{project.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={16} color="var(--color-primary)" className="mt-2 flex-shrink-0 opacity-40 self-center" />
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'invoices' && (
          <Card variant="bordered" padding="lg">
            <CardHeader
              title="Invoices"
              action={<ActionButton icon="Plus">Create Invoice</ActionButton>}
            />
            <EmptyState icon="CreditCard" title="No invoices found" description="Create an invoice to get started" />
          </Card>
        )}

        {activeTab === 'files' && (
          <Card variant="bordered" padding="lg">
            <CardHeader
              title="Files & Documents"
              action={<ActionButton icon="Upload">Upload File</ActionButton>}
            />
            <EmptyState icon="File" title="No files uploaded" description="Upload project documents or contracts" />
          </Card>
        )}

        {activeTab === 'notes' && (
          <Card variant="bordered" padding="lg">
            <CardHeader
              title="Client Notes"
              action={<ActionButton icon="Plus">Add Note</ActionButton>}
            />
            <EmptyState icon="FileText" title="No notes yet" description="Keep track of client preferences and meeting minutes" />
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card variant="bordered" padding="lg">
            <CardHeader title="Activity Log" />
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon name="UserPlus" size={14} color="var(--color-primary)" />
                </div>
                <div>
                  <p className="text-sm text-foreground">Client added to the system</p>
                  <p className="text-xs text-muted-foreground">May 20, 2026 · 10:25 AM</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {editDeal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/60 backdrop-blur-xl" onClick={() => setEditDeal(null)}>
          <div
            className="bg-card rounded-xl shadow-soft-2xl w-full max-w-lg border border-border overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-card to-muted/20">
              <h2 className="font-semibold text-lg text-foreground">Edit Deal</h2>
              <button onClick={() => setEditDeal(null)} className="p-1.5 rounded-lg hover:bg-muted transition-smooth">
                <Icon name="X" size={18} color="currentColor" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Deal Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Budget/Value ($)</label>
                  <input
                    type="number"
                    required
                    value={editForm.value}
                    onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Stage</label>
                  <select
                    value={editForm.stage}
                    onChange={(e) => setEditForm({ ...editForm, stage: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="NEW_LEAD">New Lead</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="PROPOSAL_SENT">Proposal Sent</option>
                    <option value="NEGOTIATION">Negotiation</option>
                  </select>
                </div>
              </div>

              {editDeal?.changeRequestNotes && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="MessageSquare" size={14} color="var(--color-warning)" />
                    <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">Client Change Request</span>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{editDeal.changeRequestNotes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditDeal(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-smooth"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDeal}
                  disabled={savingEdit}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-smooth shadow-soft-sm"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { type Project };
export default ClientWorkspace;
