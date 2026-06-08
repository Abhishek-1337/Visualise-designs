import React, { useState } from 'react';
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
  const [convertingDealId, setConvertingDealId] = useState<string | null>(null);

  const handleConvertToProject = async (dealId: string) => {
    try {
      setConvertingDealId(dealId);
      await dealService.convertToProject(dealId);
      if (onRefresh) onRefresh();
      setActiveTab('projects');
    } catch (error) {
      console.error('Failed to convert deal:', error);
    } finally {
      setConvertingDealId(null);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0 bg-background overflow-hidden animate-fade-in">
      <div className="px-6 py-4 border-b border-border shrink-0 bg-gradient-to-r from-background to-muted/30">
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
              <p className="text-3xl font-bold">{deals.length}</p>
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
              title={`Deals (${deals.length})`}
              action={<ActionButton icon="Plus" onClick={onNewDeal}>New Deal</ActionButton>}
            />

            {deals.length === 0 ? (
              <EmptyState icon="Briefcase" title="No deals yet for this client" />
            ) : (
              <div className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-2">
                {deals.map((deal) => (
                  <Card
                    key={deal.id}
                    variant="bordered"
                    padding="md"
                    className="flex items-center justify-between gap-4 w-full"
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
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                    className="flex items-start gap-4 w-full cursor-pointer"
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
    </div>
  );
};

export { type Project };
export default ClientWorkspace;
