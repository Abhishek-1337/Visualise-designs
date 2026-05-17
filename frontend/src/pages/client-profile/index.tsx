import React, { useState } from 'react';
import Sidebar, { TopBar } from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import ClientHeader from './components/ClientHeader';
import OverviewTab from './components/OverviewTab';
import FilesTab from './components/FilesTab';
import PaymentsTab from './components/PaymentsTab';

const ClientProfile = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const client = {
    id: 1,
    name: 'Alexandra Morrison',
    company: 'Morrison Development Group',
    email: 'alexandra.morrison@mdg.com',
    phone: '+1 (555) 234-5678',
    location: 'New York, NY, USA',
    status: 'vip',
    industry: 'Real Estate Development',
    clientSince: 'Oct 2025',
    totalProjects: '3',
    lifetimeValue: '$850,000',
    assignedTo: 'Sarah Mitchell',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1de4255a3-1771898934284.png",
    avatarAlt: 'Professional woman with blonde hair in business attire smiling at camera'
  };

  const tabs = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
  { id: 'projects', label: 'Projects', icon: 'FolderOpen' },
  { id: 'communications', label: 'Communications', icon: 'MessageSquare' },
  { id: 'files', label: 'Files', icon: 'Paperclip' },
  { id: 'payments', label: 'Payments', icon: 'CreditCard' }];


  const projects = [
  { id: 1, name: 'Residential Villa Visualization', status: 'in_progress', progress: 65, value: '$280,000', deadline: 'Feb 28, 2026' },
  { id: 2, name: 'Commercial Lobby Renders', status: 'completed', progress: 100, value: '$45,000', deadline: 'Dec 15, 2025' },
  { id: 3, name: 'Penthouse Interior Design', status: 'planning', progress: 10, value: '$120,000', deadline: 'Apr 30, 2026' }];


  const communications = [
  { id: 1, type: 'call', title: 'Project Status Update Call', date: new Date('2025-12-28'), duration: '32 min', outcome: 'Positive - approved Phase 1 concepts' },
  { id: 2, type: 'email', title: 'Sent revised proposal document', date: new Date('2025-12-20'), duration: null, outcome: 'Awaiting response' },
  { id: 3, type: 'zoom', title: 'Kickoff Meeting', date: new Date('2025-11-01'), duration: '1h 15min', outcome: 'Project scope finalized' }];


  const statusConfig = {
    in_progress: 'bg-primary/10 text-primary',
    completed: 'bg-success/10 text-success',
    planning: 'bg-warning/10 text-warning'
  };

  const commTypeConfig = {
    call: { icon: 'Phone', color: 'bg-success/10 text-success' },
    email: { icon: 'Mail', color: 'bg-primary/10 text-primary' },
    zoom: { icon: 'Video', color: 'bg-accent/10 text-accent' }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />
      <main className="md:ml-[260px] pt-[60px]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="mb-4">
            <button
              onClick={() => window.history?.back()}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth mb-4">
              
              <Icon name="ArrowLeft" size={16} color="currentColor" />
              Back to Pipeline
            </button>
          </div>

          <ClientHeader client={client} onEdit={() => {}} />

          <div className="bg-card rounded-xl shadow-warm overflow-hidden">
            <div className="border-b border-border">
              <div className="flex overflow-x-auto">
                {tabs?.map((tab) =>
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-smooth border-b-2 ${
                  activeTab === tab?.id ?
                  'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'}`
                  }>
                  
                    <Icon name={tab?.icon} size={16} color="currentColor" />
                    {tab?.label}
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && <OverviewTab client={client} />}

              {activeTab === 'projects' &&
              <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-heading font-semibold text-foreground">Projects ({projects?.length})</h3>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover-lift active-press">
                      <Icon name="Plus" size={16} color="currentColor" />
                      New Project
                    </button>
                  </div>
                  {projects?.map((project) =>
                <div key={project?.id} className="p-4 bg-muted/30 rounded-xl border border-border hover:border-primary/30 transition-smooth">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-foreground">{project?.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusConfig?.[project?.status]}`}>
                              {project?.status?.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Icon name="DollarSign" size={14} color="currentColor" />{project?.value}</span>
                            <span className="flex items-center gap-1"><Icon name="Calendar" size={14} color="currentColor" />Due {project?.deadline}</span>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium text-foreground">{project?.progress}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${project?.progress}%` }}></div>
                            </div>
                          </div>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-muted transition-smooth">
                          <Icon name="ExternalLink" size={16} color="var(--color-muted-foreground)" />
                        </button>
                      </div>
                    </div>
                )}
                </div>
              }

              {activeTab === 'communications' &&
              <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-heading font-semibold text-foreground">Communication History</h3>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover-lift active-press">
                      <Icon name="Plus" size={16} color="currentColor" />
                      Log Communication
                    </button>
                  </div>
                  {communications?.map((comm) => {
                  const config = commTypeConfig?.[comm?.type];
                  return (
                    <div key={comm?.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl border border-border">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config?.color}`}>
                          <Icon name={config?.icon} size={18} color="currentColor" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{comm?.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{comm?.date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            {comm?.duration && <span>· {comm?.duration}</span>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 italic">{comm?.outcome}</p>
                        </div>
                      </div>);

                })}
                </div>
              }

              {activeTab === 'files' && <FilesTab />}
              {activeTab === 'payments' && <PaymentsTab />}
            </div>
          </div>
        </div>
      </main>
    </div>);

};

export default ClientProfile;