import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import Sidebar, { TopBar } from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import GeneralSettings from './components/GeneralSettings';
import TeamManagement from './components/TeamManagement';
import AutomationSettings from './components/AutomationSettings';
import IntegrationsSettings from './components/IntegrationsSettings';
import SecuritySettings from './components/SecuritySettings';

interface Tab {
  id: string;
  label: string;
  icon: string;
  description: string;
  roles: string[];
}

const allTabs: Tab[] = [
  { id: 'general', label: 'General', icon: 'Settings', description: 'App preferences & display', roles: ['ADMIN', 'MANAGER'] },
  { id: 'team', label: 'Team', icon: 'Users', description: 'Roles & permissions', roles: ['ADMIN', 'MANAGER'] },
  { id: 'automation', label: 'Automation', icon: 'Zap', description: 'Workflow rules', roles: ['ADMIN'] },
  { id: 'integrations', label: 'Integrations', icon: 'Plug', description: 'Connected services', roles: ['ADMIN'] },
  { id: 'security', label: 'Security', icon: 'Shield', description: 'Auth & sessions', roles: ['ADMIN'] },
];

const SettingsConfiguration = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role || 'EMPLOYEE';
  const [activeTab, setActiveTab] = useState('general');
  const [mobileTabOpen, setMobileTabOpen] = useState(false);

  const tabs = useMemo(() => allTabs.filter((t) => t.roles.includes(role)), [role]);

  const activeTabData = tabs?.find(t => t?.id === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return <GeneralSettings />;
      case 'team': return <TeamManagement />;
      case 'automation': return <AutomationSettings />;
      case 'integrations': return <IntegrationsSettings />;
      case 'security': return <SecuritySettings />;
      default: return <GeneralSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />
      <main className="md:ml-[260px] pt-[60px]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {/* Page Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Icon name="Settings" size={20} color="var(--color-primary)" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your studio preferences and configurations</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Tabs - Desktop */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <nav className="space-y-1">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-smooth ${
                      activeTab === tab?.id
                        ? 'bg-primary text-primary-foreground shadow-warm-sm'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon
                      name={tab?.icon}
                      size={18}
                      color={activeTab === tab?.id ? 'var(--color-primary-foreground)' : 'currentColor'}
                    />
                    <div>
                      <p className="font-medium text-sm">{tab?.label}</p>
                      <p className={`text-xs mt-0.5 ${
                        activeTab === tab?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>{tab?.description}</p>
                    </div>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Mobile Tab Selector */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileTabOpen(!mobileTabOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-card rounded-xl border border-border shadow-warm-sm"
              >
                <div className="flex items-center gap-3">
                  <Icon name={activeTabData?.icon || 'Settings'} size={18} color="var(--color-primary)" />
                  <div className="text-left">
                    <p className="font-medium text-sm text-foreground">{activeTabData?.label}</p>
                    <p className="text-xs text-muted-foreground">{activeTabData?.description}</p>
                  </div>
                </div>
                <Icon name={mobileTabOpen ? 'ChevronUp' : 'ChevronDown'} size={18} color="var(--color-muted-foreground)" />
              </button>
              {mobileTabOpen && (
                <div className="mt-2 bg-card rounded-xl border border-border shadow-warm-md overflow-hidden">
                  {tabs?.map((tab) => (
                    <button
                      key={tab?.id}
                      onClick={() => { setActiveTab(tab?.id); setMobileTabOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-smooth border-b border-border last:border-0 ${
                        activeTab === tab?.id ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon name={tab?.icon} size={16} color={activeTab === tab?.id ? 'var(--color-primary)' : 'currentColor'} />
                      <span className="font-medium text-sm">{tab?.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsConfiguration;
