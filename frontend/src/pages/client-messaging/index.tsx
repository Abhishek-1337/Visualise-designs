import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  isRead?: boolean;
}

const ClientMessaging = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { socket, isConnected } = useSocket();
  const [conversations, setConversations] = useState<ClientConversation[]>([]);
  const [messages, setMessages] = useState<Record<string | number, Message[]>>({});
  const [selectedClientId, setSelectedClientId] = useState<string | number | null>(null);
  const [showMobileList, setShowMobileList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await messageService.getConversations();
        const convs: ClientConversation[] = (res.data?.conversations || []).map((c: any) => ({
          client: {
            id: c.client.id,
            name: c.client.name,
            avatar: c.client.avatar,
            status: c.client.status || 'offline',
            company: c.client.email,
            role: c.client.role,
          },
          lastMessage: c.lastMessage
            ? {
                content: c.lastMessage.content,
                timestamp: new Date(c.lastMessage.timestamp),
                unread: c.lastMessage.unread,
                unreadCount: c.lastMessage.unreadCount,
              }
            : undefined,
        }));
        setConversations(convs);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load conversations');
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const fetchMessages = useCallback(async (clientId: string) => {
    try {
      const res = await messageService.getMessages(clientId);
      const msgs: Message[] = (res.data?.messages || []).map((m: any) => ({
        id: m.id,
        content: m.content,
        sender: m.sender,
        timestamp: new Date(m.timestamp),
        isRead: m.isRead,
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
                sender: msg.senderId === user.id ? ('me' as const) : ('client' as const),
                timestamp: new Date(msg.timestamp),
                isRead: msg.senderId === user.id ? false : true,
              },
            ],
          };
        });

        if (msg.senderId === selectedClientId) {
          socket.emit('mark:read', { senderId: selectedClientId });
          messageService.markRead({ senderId: selectedClientId as string });
        }
      }

      const otherId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      setConversations((prev) => {
        const existing = prev.find((c) => c.client.id === otherId);
        if (!existing) {
          // New conversation start? Re-fetch or add manually.
          // For now, let's just re-fetch to be safe.
          return prev; 
        }
        return prev.map((c) =>
          c.client.id === otherId
            ? {
                ...c,
                lastMessage: {
                  content: msg.content,
                  timestamp: new Date(msg.timestamp),
                  unread: otherId !== selectedClientId,
                  unreadCount:
                    otherId !== selectedClientId
                      ? (c.lastMessage?.unreadCount || 0) + 1
                      : 0,
                },
              }
            : c
        );
      });
    };

    const readHandler = ({ readerId }: { readerId: string }) => {
      if (readerId === selectedClientId) {
        setMessages((prev) => {
          const msgs = prev[selectedClientId as string] || [];
          return {
            ...prev,
            [selectedClientId as string]: msgs.map((m) => ({ ...m, isRead: true })),
          };
        });
      }
    };

    const typingStartHandler = ({ senderId }: { senderId: string }) => {
      setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
    };

    const typingStopHandler = ({ senderId }: { senderId: string }) => {
      setTypingUsers((prev) => ({ ...prev, [senderId]: false }));
    };

    const statusHandler = ({ userId, status }: { userId: string; status: string }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.client.id === userId ? { ...c, client: { ...c.client, status } } : c
        )
      );
    };

    const onlineUsersHandler = (userIds: string[]) => {
      setConversations((prev) =>
        prev.map((c) => ({
          ...c,
          client: {
            ...c.client,
            status: userIds.includes(c.client.id as string) ? 'online' : 'offline',
          },
        }))
      );
    };

    socket.on('new:message', handler);
    socket.on('messages:read', readHandler);
    socket.on('typing:start', typingStartHandler);
    socket.on('typing:stop', typingStopHandler);
    socket.on('user:status', statusHandler);
    socket.on('online-users', onlineUsersHandler);

    socket.emit('get:online-users');

    return () => {
      socket.off('new:message', handler);
      socket.off('messages:read', readHandler);
      socket.off('typing:start', typingStartHandler);
      socket.off('typing:stop', typingStopHandler);
      socket.off('user:status', statusHandler);
      socket.off('online-users', onlineUsersHandler);
    };
  }, [socket, user, selectedClientId]);

  const handleSelectClient = useCallback(
    (client: ClientConversation['client']) => {
      setSelectedClientId(client.id);
      setShowMobileList(false);
      setConversations((prev) =>
        prev.map((c) =>
          c.client.id === client.id && c.lastMessage
            ? { ...c, lastMessage: { ...c.lastMessage, unread: false, unreadCount: 0 } }
            : c
        )
      );
      if (!messages[client.id]) {
        fetchMessages(client.id as string);
      }
      // Mark as read
      socket?.emit('mark:read', { senderId: client.id });
      messageService.markRead({ senderId: client.id as string });
    },
    [messages, fetchMessages, socket]
  );

  const handleSend = useCallback(
    (content: string) => {
      if (!selectedClientId || !content.trim() || !socket) return;
      socket.emit('send:message', { receiverId: selectedClientId, content });
    },
    [selectedClientId, socket]
  );

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (!selectedClientId || !socket) return;
      socket.emit(isTyping ? 'typing:start' : 'typing:stop', {
        receiverId: selectedClientId,
      });
    },
    [selectedClientId, socket]
  );

  return (
    <div className="min-h-screen bg-background animate-fade-in">
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
            isTyping={!!selectedClientId && typingUsers[selectedClientId as string]}
            onTyping={handleTyping}
          />
        </div>
      </main>
    </div>
  );
};

export default ClientMessaging;
