import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import { AvatarCircle, StatusBadge, Card } from '../../../components/shared';

export interface Client {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  status: string;
  avatar?: string;
}

interface AllClientsGridProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
}

const AllClientsGrid: React.FC<AllClientsGridProps> = ({ clients, onSelectClient }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0 overflow-hidden">
      <div className="px-6 py-6 border-b border-border shrink-0">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select a client to view their profile, projects, and conversations.
          </p>
        </div>
        <div className="relative mt-4 max-w-md">
          <Icon name="Search" size={16} color="var(--color-muted-foreground)" className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients by name, company, or email..."
            className="w-full pl-9 pr-9 py-2.5 bg-blue-50/50 dark:bg-blue-950/20 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-600 transition-smooth">
              <Icon name="X" size={14} color="currentColor" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4">
              <Icon name="Users" size={28} color="#3B82F6" />
            </div>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No clients match your search' : 'No clients available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((client) => (
              <Card
                key={client.id}
                variant="bordered"
                padding="lg"
                hover
                onClick={() => onSelectClient(client)}
                className="flex items-start gap-4 text-left"
              >
                <AvatarCircle name={client.name} avatar={client.avatar} size={12} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{client.name}</h3>
                    <StatusBadge status={client.status} />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{client.company}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="Mail" size={12} color="#3B82F6" />
                      {client.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="MapPin" size={12} color="#3B82F6" />
                      {client.location}
                    </span>
                  </div>
                </div>
                <Icon name="ChevronRight" size={16} color="#3B82F6" className="mt-1 flex-shrink-0 opacity-40" />
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="Users" size={14} color="#3B82F6" />
          <span>{clients.length} client{clients.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default AllClientsGrid;
