import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import type { Client } from './AllClientsGrid';
import { AvatarCircle, StatusBadge, ActionButton, ProgressWithLabel, TeamMemberAvatars, EmptyState, Card, CardHeader } from '../../../components/shared';

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
  selectedProjectId: number | null;
  onSelectProject: (project: Project) => void;
  onBack: () => void;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
  { id: 'projects', label: 'Projects', icon: 'FolderKanban' },
  { id: 'invoices', label: 'Invoices', icon: 'CreditCard' },
  { id: 'files', label: 'Files', icon: 'Paperclip' },
  { id: 'notes', label: 'Notes', icon: 'FileText' },
  { id: 'activity', label: 'Activity', icon: 'Activity' },
];

const ClientWorkspace: React.FC<ClientWorkspaceProps> = ({
  client,
  projects,
  selectedProjectId,
  onSelectProject,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0 bg-background overflow-hidden">
      <div className="px-6 py-4 border-b border-border shrink-0">
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button
            onClick={onBack}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-smooth"
          >
            <Icon name="ChevronLeft" size={14} color="currentColor" />
            {/* <span>All Clients</span> */}
          </button>
          <span>Clients</span>
          <Icon name="ChevronRight" size={12} color="currentColor" />
          <span className="text-foreground font-medium">{client.name}</span>
        </div>
      </div>

      <Card variant="bordered" padding="lg" className="mx-4 mt-4 mb-0 pb-0 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-start gap-5">
          <div className="flex items-start gap-4 flex-1">
            <AvatarCircle name={client.name} avatar={client.avatar} size={14} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-heading font-bold text-foreground">{client.name}</h1>
                <StatusBadge status={client.status} size="md" />
              </div>
              {/* <p className="text-sm text-muted-foreground font-medium mt-0.5">{client.company}</p> */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon name="Mail" size={12} color="#3B82F6" />
                  {client.email}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon name="Phone" size={12} color="#3B82F6" />
                  {client.phone}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon name="MapPin" size={12} color="#3B82F6" />
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
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                    : 'border-transparent text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800'
                }`}
              >
                <Icon name={tab.icon} size={15} color="currentColor" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      

      <div className="flex-1 min-h-0 p-6 overflow-hidden">
        {activeTab === 'projects' && (
          <Card variant="bordered" padding="lg" className="h-full flex flex-col overflow-hidden">
            <CardHeader
              title={`Projects (${projects.length})`}
              action={<ActionButton icon="Plus">New Project</ActionButton>}
            />

            {projects.length === 0 ? (
              <EmptyState icon="FolderKanban" title="No projects yet for this client" />
            ) : (
              <div className="flex-1 min-h-0 space-y-3 overflow-y-auto">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    variant="bordered"
                    padding="md"
                    hover
                    selected={project.id === selectedProjectId}
                    onClick={() => onSelectProject(project)}
                    className="flex items-start gap-4 w-full"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      project.id === selectedProjectId
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                    }`}>
                      <Icon name="Folder" size={18} color="currentColor" />
                    </div>
                    {/* <div className="flex-1 min-w-0"> */}
                  <div className="grid grid-cols-[1fr_1fr_1fr] gap-6 w-full">
                    <div className="flex flex-col gap-2 ">
                      <h4 className="font-semibold text-foreground truncate text-sm">{project.name}</h4>
                      <p className="text-muted-foreground text-xs">{project.description}</p>
                      <StatusBadge status={project.status} className='max-w-max'/>
                    </div>
                    <div className="flex flex-col  gap-3 w-full">
                      <ProgressWithLabel progress={project.progress} />
                      <TeamMemberAvatars members={project.team} />
                    </div>
                    <div className="flex flex-col items-center  gap-1 text-xs text-muted-foreground">
                      <span className="font-semibold">Due Date</span>
                      <div className="flex gap-2">
                        <Icon name="Calendar" size={14} color="#3B82F6" />
                        <span className="whitespace-nowrap">{project.dueDate}</span>
                      </div>
                    </div>
                  </div>
                    <Icon name="ChevronRight" size={16} color="#3B82F6" className="mt-2 flex-shrink-0 opacity-40" />
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab !== 'projects' && (
          <EmptyState
            icon={tabs.find(t => t.id === activeTab)?.icon || 'FileText'}
            title={`${activeTab} content coming soon`}
          />
        )}
      </div>
    </div>
  );
};

export { type Project };
export default ClientWorkspace;
