import React from 'react';
import Icon from '../../../components/AppIcon';

interface ChatHeaderProps {
  client: {
    id: string | number;
    name: string;
    avatar?: string;
    status?: string;
    company?: string;
    email?: string;
    phone?: string;
  } | null;
  onToggleClientList: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ client, onToggleClientList }) => {
  if (!client) {
    return (
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card">
        <button onClick={onToggleClientList} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-smooth">
          <Icon name="PanelLeftOpen" size={20} color="currentColor" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="MessageCircle" size={20} color="var(--color-primary)" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">No client selected</h2>
            <p className="text-xs text-muted-foreground/60">Select a client from the list to start chatting</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card">
      <button onClick={onToggleClientList} className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-smooth">
        <Icon name="PanelLeftOpen" size={20} color="currentColor" />
      </button>
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          {client.avatar ? (
            <img src={client.avatar} alt={client.name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-primary">
              {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
          client.status === 'online' ? 'bg-green-500' : client.status === 'away' ? 'bg-amber-400' : 'bg-gray-400'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground truncate">{client.name}</h2>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            client.status === 'online' ? 'text-green-700 bg-green-50 border border-green-200' :
            client.status === 'away' ? 'text-amber-700 bg-amber-50 border border-amber-200' :
            'text-slate-500 bg-slate-100 border border-slate-200'
          }`}>
            {client.status === 'online' ? 'Online' : client.status === 'away' ? 'Away' : 'Offline'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {client.company || client.email || client.phone || ''}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground" title="Call">
          <Icon name="Phone" size={18} color="currentColor" />
        </button>
        <button className="p-2 rounded-lg hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground" title="Video call">
          <Icon name="Video" size={18} color="currentColor" />
        </button>
        <button className="p-2 rounded-lg hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground" title="Email">
          <Icon name="Mail" size={18} color="currentColor" />
        </button>
        <button className="p-2 rounded-lg hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground" title="More">
          <Icon name="MoreVertical" size={18} color="currentColor" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
