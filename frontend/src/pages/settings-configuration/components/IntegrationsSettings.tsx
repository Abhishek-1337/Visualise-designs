import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const integrationColors: Record<string, string> = {
  'google-calendar': 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10',
  'gmail': 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10',
  'slack': 'text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10',
  'dropbox': 'text-sky-500 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10',
  'zoom': 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10',
  'stripe': 'text-violet-500 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10',
};

const integrations = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync meetings, deadlines, and project milestones',
    icon: 'Calendar',
    category: 'Calendar',
    connected: true,
    connectedAs: 'manager@visualise.studio',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send and receive emails directly from the CRM',
    icon: 'Mail',
    category: 'Email',
    connected: true,
    connectedAs: 'manager@visualise.studio',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get CRM notifications in your Slack channels',
    icon: 'MessageSquare',
    category: 'Messaging',
    connected: false,
    connectedAs: null,
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Store and share project files and assets',
    icon: 'Cloud',
    category: 'Storage',
    connected: false,
    connectedAs: null,
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Schedule and join video meetings with clients',
    icon: 'Video',
    category: 'Video',
    connected: true,
    connectedAs: 'Pro Account',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments and manage invoices',
    icon: 'CreditCard',
    category: 'Payments',
    connected: false,
    connectedAs: null,
  }
];

const IntegrationsSettings = () => {
  const [services, setServices] = useState(integrations);

  const toggleConnection = (id) => {
    setServices(prev => prev?.map(s =>
      s?.id === id ? { ...s, connected: !s?.connected, connectedAs: !s?.connected ? 'Connected Account' : null } : s
    ));
  };

  const connected = services?.filter(s => s?.connected);
  const available = services?.filter(s => !s?.connected);

  return (
    <div className="space-y-8">
      {/* Connected */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-success" />
          <h3 className="font-heading font-semibold text-lg text-foreground">Connected ({connected?.length})</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connected?.map((service) => (
            <div key={service?.id} className="bg-card border border-success/20 rounded-xl p-5 shadow-soft-sm hover-lift transition-smooth">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${integrationColors[service?.id] || 'text-foreground bg-muted'}`}>
                    <Icon name={service?.icon} size={20} color="currentColor" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{service?.name}</p>
                    <p className="text-xs text-muted-foreground">{service?.category}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 px-2.5 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                  <Icon name="Check" size={10} color="currentColor" />
                  Active
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{service?.description}</p>
              {service?.connectedAs && (
                <p className="text-xs text-foreground mt-2 font-medium">
                  <span className="text-muted-foreground">Account: </span>{service?.connectedAs}
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-1.5 px-3 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-smooth">
                  Configure
                </button>
                <button
                  onClick={() => toggleConnection(service?.id)}
                  className="flex-1 py-1.5 px-3 rounded-lg border border-error/30 text-xs font-medium text-error hover:bg-error/5 transition-smooth"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Available */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
          <h3 className="font-heading font-semibold text-lg text-foreground">Available Integrations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {available?.map((service) => (
            <div key={service?.id} className="bg-card border border-border rounded-xl p-5 shadow-soft-sm hover-lift transition-smooth">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${integrationColors[service?.id] || 'text-foreground bg-muted'} opacity-60`}>
                    <Icon name={service?.icon} size={20} color="currentColor" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{service?.name}</p>
                    <p className="text-xs text-muted-foreground">{service?.category}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{service?.description}</p>
              <button
                onClick={() => toggleConnection(service?.id)}
                className="w-full mt-4 py-1.5 px-3 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-smooth"
              >
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsSettings;
