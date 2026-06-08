import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';

interface ClientConversation {
  client: {
    id: string | number;
    name: string;
    avatar?: string;
    status?: string;
    company?: string;
    role?: string;
  };
  lastMessage?: {
    content: string;
    timestamp: Date;
    unread: boolean;
    unreadCount?: number;
  };
}

interface ClientListProps {
  conversations: ClientConversation[];
  selectedClientId: string | number | null;
  onSelectClient: (client: ClientConversation['client']) => void;
  onClose?: () => void;
}

const ClientList: React.FC<ClientListProps> = ({ conversations, selectedClientId, onSelectClient, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.client.name.toLowerCase().includes(q) ||
        c.client.company?.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aTime = a.lastMessage?.timestamp?.getTime() || 0;
      const bTime = b.lastMessage?.timestamp?.getTime() || 0;
      return bTime - aTime;
    });
  }, [filtered]);

  const unreadCount = conversations.filter((c) => c.lastMessage?.unread).length;

  return (
    <div className="flex flex-col h-full bg-card border-r border-border w-64 animate-fade-in">
      <div className="flex items-center justify-between px-4 py-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="MessageCircle" size={20} color="var(--color-primary)" />
          <h2 className="text-base font-semibold text-foreground">Clients</h2>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold text-primary-foreground bg-primary px-1.5 py-0.5 rounded-full leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-smooth">
            <Icon name="X" size={18} color="currentColor" />
          </button>
        )}
      </div>

      <div className="px-3 py-3">
        <div className="relative">
          <Icon name="Search" size={16} color="var(--color-muted-foreground)" className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-9 pr-9 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <Icon name="X" size={14} color="currentColor" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
              <Icon name="Users" size={22} color="var(--color-muted-foreground)" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {searchQuery ? 'No clients match your search' : 'No clients yet'}
            </p>
          </div>
        ) : (
          sorted.map((conv) => {
            const isSelected = conv.client.id === selectedClientId;
            const time = conv.lastMessage?.timestamp
              ? formatTime(conv.lastMessage.timestamp)
              : null;

            return (
              <button
                key={conv.client.id}
                onClick={() => onSelectClient(conv.client)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-smooth text-left ${
                  isSelected ? 'bg-primary/10 border-l-[3px] border-primary' : 'border-l-[3px] border-transparent hover:bg-muted/50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                  }`}>
                    {conv.client.avatar ? (
                      <img src={conv.client.avatar} alt={conv.client.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold">
                        {conv.client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${
                    conv.client.status === 'online' ? 'bg-green-500' :
                    conv.client.status === 'away' ? 'bg-amber-400' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm truncate ${conv.lastMessage?.unread ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>
                      {conv.client.name}
                    </span>
                    {time && (
                      <span className={`text-[10px] flex-shrink-0 ${conv.lastMessage?.unread ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                        {time}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className={`text-xs truncate ${
                      conv.lastMessage?.unread ? 'font-semibold text-foreground' : 'text-muted-foreground'
                    }`}>
                      {conv.lastMessage?.content || (conv.client.company || 'Click to start chatting')}
                    </span>
                    {conv.lastMessage?.unread && conv.lastMessage?.unreadCount && conv.lastMessage.unreadCount > 0 && (
                      <span className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1 flex-shrink-0">
                        {conv.lastMessage.unreadCount}
                      </span>
                    )}
                    {conv.lastMessage?.unread && (!conv.lastMessage?.unreadCount || conv.lastMessage.unreadCount <= 0) && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="Users" size={14} color="var(--color-primary)" />
          <span>{conversations.length} client{conversations.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
};

function formatTime(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export { formatTime };
export type { ClientConversation };
export default ClientList;
