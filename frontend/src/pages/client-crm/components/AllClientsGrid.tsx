import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import { AvatarCircle, StatusBadge, Card } from '../../../components/shared';

export interface Client {
  id: number | string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  status: string;
  avatar?: string;
}

interface PendingInvite {
  id: string;
  email: string;
  createdAt: string;
}

interface AllClientsGridProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
  pendingInvites?: PendingInvite[];
  onInviteClient?: () => void;
  onCancelInvite?: (inviteId: string) => void;
}

const AllClientsGrid: React.FC<AllClientsGridProps> = ({
  clients,
  onSelectClient,
  pendingInvites = [],
  onInviteClient,
  onCancelInvite,
}) => {
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
    <div className="flex-1 min-h-0 flex flex-col min-w-0 overflow-hidden animate-fade-in">
      <div className="px-6 py-6 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clients</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select a client to view their profile, projects, and conversations.
            </p>
          </div>
          <button
            onClick={onInviteClient}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover-lift shadow-soft-sm"
          >
            <Icon name="UserPlus" size={16} color="currentColor" />
            Invite Client
          </button>
        </div>

        <div className="relative mt-4 max-w-md">
          <Icon name="Search" size={16} color="var(--color-muted-foreground)" className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients by name, company, or email..."
            className="w-full pl-9 pr-9 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-smooth">
              <Icon name="X" size={14} color="currentColor" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        {pendingInvites.length > 0 && (
          <div className="mb-6 space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Pending Invitations</h4>
            {pendingInvites.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 bg-card rounded-xl border border-border shadow-soft-sm p-4 hover-lift transition-smooth">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <Icon name="Clock" size={16} color="var(--color-warning)" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{inv.email}</p>
                  <p className="text-xs text-muted-foreground">Invited to join as client</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
                    Pending
                  </span>
                  <button
                    onClick={() => onCancelInvite?.(inv.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-error hover:bg-error/10 transition-smooth"
                  >
                    <Icon name="X" size={14} color="currentColor" />
                  </button>
                </div>
              </div>
            ))}
            <hr className="border-border my-4" />
          </div>
        )}

        {filtered.length === 0 && pendingInvites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Icon name="Users" size={28} color="var(--color-primary)" />
            </div>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No clients match your search' : 'No clients available'}
            </p>
            {!searchQuery && (
              <button
                onClick={onInviteClient}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover-lift shadow-soft-sm"
              >
                Invite Your First Client
              </button>
            )}
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
                <AvatarCircle name={client.name} avatar={client.avatar} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{client.name}</h3>
                    <StatusBadge status={client.status} />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{client.company}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="Mail" size={12} color="var(--color-primary)" />
                      {client.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="MapPin" size={12} color="var(--color-primary)" />
                      {client.location}
                    </span>
                  </div>
                </div>
                <Icon name="ChevronRight" size={16} color="var(--color-primary)" className="mt-1 flex-shrink-0 opacity-40" />
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="Users" size={14} color="var(--color-primary)" />
          <span>{clients.length} client{clients.length !== 1 ? 's' : ''}</span>
          {pendingInvites.length > 0 && (
            <>
              <span className="text-muted-foreground/40">•</span>
              <span>{pendingInvites.length} pending invite{pendingInvites.length !== 1 ? 's' : ''}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllClientsGrid;
