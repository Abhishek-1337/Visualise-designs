import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Sidebar, { TopBar } from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import ClientList from './components/ClientList';
import ChatArea from './components/ChatArea';
import type { RootState } from '../../store';
import type { ClientConversation } from './components/ClientList';
import { messageService } from '../../services';
import { useSocket } from '../../contexts/SocketContext';
import type { SocketMessage } from '../../contexts/SocketContext';

interface Message {
  id: string | number;
  content: string;
  sender: 'me' | 'client';
  timestamp: Date;
  senderName?: string;
  senderAvatar?: string;
}

const ClientMessaging = () => {
  const { user } = useSelector((state: RootState) => state.auth.user);
  const { socket, isConnected } = useSocket();
  const [conversations, setConversations] = useState<ClientConversation[]>([]);
  const [messages, setMessages] = useState<Record<string | number, Message[]>>({});
  const [selectedClientId, setSelectedClientId] = useState<string | number | null>(null);
  const [showMobileList, setShowMobileList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const isClientRole = user?.role === 'CLIENT';

  useEffect(() => {
    if (isClientRole) return;
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await messageService.getConversations();
        const convs: ClientConversation[] = res.data.conversations.map((c: any) => ({
          client: {
            id: c.client.id,
            name: c.client.name,
            avatar: c.client.avatar,
            status: c.client.status || 'offline',
            company: c.client.email,
          },
          lastMessage: c.lastMessage
            ? {
                content: c.lastMessage.content,
                timestamp: new Date(c.lastMessage.timestamp),
                unread: c.lastMessage.unread,
              }
            : undefined,
        }));
        setConversations(convs);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load clients');
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [isClientRole]);

  const fetchMessages = useCallback(async (clientId: string) => {
    try {
      const res = await messageService.getMessages(clientId);
      const msgs: Message[] = res.data.messages.map((m: any) => ({
        id: m.id,
        content: m.content,
        sender: m.sender,
        timestamp: new Date(m.timestamp),
      }));
      setMessages((prev) => ({ ...prev, [clientId]: msgs }));
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, []);

  const selectedClient = useMemo(() => {
    if (!selectedClientId) return null;
    return conversations.find((c) => c.client.id === selectedClientId)?.client || null;
  }, [conversations, selectedClientId]);

  const currentMessages = useMemo(() => {
    if (!selectedClientId) return [];
    return messages[selectedClientId] || [];
  }, [messages, selectedClientId]);

  useEffect(() => {
    if (!socket || !user) return;
    const handler = (msg: SocketMessage) => {
      const isForCurrentChat =
        msg.senderId === selectedClientId || msg.receiverId === selectedClientId;
      if (isForCurrentChat) {
        setMessages((prev) => {
          const existing = prev[selectedClientId as string] || [];
          if (existing.some((m) => m.id === msg.id)) return prev;
          return {
            ...prev,
            [selectedClientId as string]: [
              ...existing,
              {
                id: msg.id,
                content: msg.content,
                sender: msg.senderId === user.id ? 'me' as const : 'client' as const,
                timestamp: new Date(msg.timestamp),
              },
            ],
          };
        });
      }
      const otherId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      setConversations((prev) => {
        const existing = prev.find((c) => c.client.id === otherId);
        if (!existing) return prev;
        return prev.map((c) =>
          c.client.id === otherId
            ? {
                ...c,
                lastMessage: {
                  content: msg.content,
                  timestamp: new Date(msg.timestamp),
                  unread: otherId !== selectedClientId,
                },
              }
            : c
        );
      });
    };
    socket.on('new:message', handler);
    return () => { socket.off('new:message', handler); };
  }, [socket, user, selectedClientId]);

  const handleSelectClient = useCallback(
    (client: ClientConversation['client']) => {
      setSelectedClientId(client.id);
      setShowMobileList(false);
      setConversations((prev) =>
        prev.map((c) =>
          c.client.id === client.id && c.lastMessage
            ? { ...c, lastMessage: { ...c.lastMessage, unread: false } }
            : c
        )
      );
      if (!messages[client.id]) {
        fetchMessages(client.id as string);
      }
    },
    [messages, fetchMessages]
  );

  const handleSend = useCallback(
    (content: string) => {
      if (!selectedClientId || !content.trim() || !socket) return;
      socket.emit('send:message', { receiverId: selectedClientId, content });
    },
    [selectedClientId, socket]
  );

  if (isClientRole) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <TopBar />
        <main className="md:ml-[260px] pt-[60px]">
          <div className="flex items-center justify-center h-[calc(100vh-60px)]">
            <div className="text-center max-w-md px-8">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icon name="Lock" size={36} color="var(--color-muted-foreground)" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Access Restricted</h2>
              <p className="text-muted-foreground leading-relaxed">
                This area is for team members only. If you need assistance, please contact support.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />
      <main className="md:ml-[240px] pt-[60px] h-screen flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          <div className={`${
            showMobileList ? 'flex' : 'hidden'
          } lg:flex w-full lg:w-64 flex-shrink-0 absolute lg:relative z-30 lg:z-auto inset-0 lg:inset-auto`}>
            <ClientList
              conversations={conversations}
              selectedClientId={selectedClientId}
              onSelectClient={handleSelectClient}
              onClose={() => setShowMobileList(false)}
            />
          </div>

          <ChatArea
            client={selectedClient}
            messages={currentMessages}
            onSend={handleSend}
            onToggleClientList={() => setShowMobileList(true)}
          />
        </div>
      </main>
    </div>
  );
};

export default ClientMessaging;
