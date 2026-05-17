import React, { useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Sidebar, { TopBar } from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import ClientList from './components/ClientList';
import ChatArea from './components/ChatArea';
import type { RootState } from '../../store';
import type { ClientConversation } from './components/ClientList';

interface Message {
  id: string | number;
  content: string;
  sender: 'me' | 'client';
  timestamp: Date;
  senderName?: string;
  senderAvatar?: string;
}

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

const initialConversations: ClientConversation[] = [
  {
    client: { id: 1, name: 'Alexandra Morrison', status: 'online', company: 'Morrison Interiors' },
    lastMessage: { content: 'The revised renders look amazing! Can we schedule a call to discuss Phase 2?', timestamp: hoursAgo(0.5), unread: true },
  },
  {
    client: { id: 2, name: 'David Chen', status: 'online', company: 'Chen & Associates' },
    lastMessage: { content: 'Budget confirmed for Phase 2. Let\'s move forward with the exterior scope.', timestamp: hoursAgo(2), unread: true },
  },
  {
    client: { id: 3, name: 'Priya Sharma', status: 'away', company: 'Sharma Design Studio' },
    lastMessage: { content: 'Thanks for sending the proposal. I\'ll review it with my team and get back to you.', timestamp: hoursAgo(5), unread: false },
  },
  {
    client: { id: 4, name: 'Marcus Johnson', status: 'offline', company: 'Johnson Development' },
    lastMessage: { content: 'Looking forward to the site visit. Please send over the portfolio when you get a chance.', timestamp: daysAgo(1), unread: false },
  },
  {
    client: { id: 5, name: 'Elena Vasquez', status: 'offline', company: 'Vasquez Architecture' },
    lastMessage: { content: 'Revisions submitted. The exterior lighting changes really make a difference!', timestamp: daysAgo(2), unread: false },
  },
  {
    client: { id: 6, name: 'Robert Kim', status: 'online', company: 'Kim Construction' },
    lastMessage: { content: 'Confirmed. Phase 3 delivery by Feb 15 works for our timeline.', timestamp: daysAgo(3), unread: false },
  },
  {
    client: { id: 7, name: 'Sarah Williams', status: 'away', company: 'Williams Creative' },
    lastMessage: { content: 'Just following up on the concept designs. Any updates?', timestamp: daysAgo(5), unread: true },
  },
  {
    client: { id: 8, name: 'James Rodriguez', status: 'offline', company: 'Rodriguez Realty' },
    lastMessage: { content: 'Great meeting today. Looking forward to the proposal.', timestamp: daysAgo(7), unread: false },
  },
];

const initialMessages: Record<string | number, Message[]> = {
  1: [
    { id: '1-1', content: 'Hi Alexandra! I just finished the revised renders for the living room concept.', sender: 'me', timestamp: hoursAgo(3), senderName: 'You' },
    { id: '1-2', content: 'That\'s great! I\'ve been excited to see how they turned out.', sender: 'client', timestamp: hoursAgo(2.5), senderName: 'Alexandra Morrison' },
    { id: '1-3', content: 'I\'ve uploaded them to the project folder. The lighting adjustments really brought out the texture details as you requested.', sender: 'me', timestamp: hoursAgo(2), senderName: 'You' },
    { id: '1-4', content: 'Let me take a look right now.', sender: 'client', timestamp: hoursAgo(1.5), senderName: 'Alexandra Morrison' },
    { id: '1-5', content: 'Wow! These are exactly what I had in mind. The warm lighting gives it such a cozy feel.', sender: 'client', timestamp: hoursAgo(0.8), senderName: 'Alexandra Morrison' },
    { id: '1-6', content: 'The revised renders look amazing! Can we schedule a call to discuss Phase 2?', sender: 'client', timestamp: hoursAgo(0.5), senderName: 'Alexandra Morrison' },
  ],
  2: [
    { id: '2-1', content: 'Hi David, I\'ve prepared the budget breakdown for Phase 2 as discussed.', sender: 'me', timestamp: hoursAgo(5), senderName: 'You' },
    { id: '2-2', content: 'Perfect timing. Our finance team just approved the budget expansion.', sender: 'client', timestamp: hoursAgo(4), senderName: 'David Chen' },
    { id: '2-3', content: 'That\'s excellent news! The exterior visualization scope is included in the new proposal.', sender: 'me', timestamp: hoursAgo(3), senderName: 'You' },
    { id: '2-4', content: 'Budget confirmed for Phase 2. Let\'s move forward with the exterior scope.', sender: 'client', timestamp: hoursAgo(2), senderName: 'David Chen' },
  ],
  3: [
    { id: '3-1', content: 'Hello Priya, I\'ve attached the revised proposal with updated pricing.', sender: 'me', timestamp: hoursAgo(7), senderName: 'You' },
    { id: '3-2', content: 'Thank you! I\'ll go through it carefully.', sender: 'client', timestamp: hoursAgo(6), senderName: 'Priya Sharma' },
    { id: '3-3', content: 'Thanks for sending the proposal. I\'ll review it with my team and get back to you.', sender: 'client', timestamp: hoursAgo(5), senderName: 'Priya Sharma' },
  ],
  7: [
    { id: '7-1', content: 'Hey Sarah! The concept designs are progressing well. Should have the first draft ready by end of week.', sender: 'me', timestamp: daysAgo(6), senderName: 'You' },
    { id: '7-2', content: 'Just following up on the concept designs. Any updates?', sender: 'client', timestamp: daysAgo(5), senderName: 'Sarah Williams' },
  ],
};

const ClientMessaging = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [conversations, setConversations] = useState<ClientConversation[]>(initialConversations);
  const [messages, setMessages] = useState<Record<string | number, Message[]>>(initialMessages);
  const [selectedClientId, setSelectedClientId] = useState<string | number | null>(null);
  const [showMobileList, setShowMobileList] = useState(false);

  const isClientRole = user?.role === 'CLIENT';

  const selectedClient = useMemo(() => {
    if (!selectedClientId) return null;
    return conversations.find((c) => c.client.id === selectedClientId)?.client || null;
  }, [conversations, selectedClientId]);

  const currentMessages = useMemo(() => {
    if (!selectedClientId) return [];
    return messages[selectedClientId] || [];
  }, [messages, selectedClientId]);

  const handleSelectClient = useCallback((client: ClientConversation['client']) => {
    setSelectedClientId(client.id);
    setShowMobileList(false);
    setConversations((prev) =>
      prev.map((c) =>
        c.client.id === client.id && c.lastMessage
          ? { ...c, lastMessage: { ...c.lastMessage, unread: false } }
          : c
      )
    );
  }, []);

  const handleSend = useCallback(
    (content: string) => {
      if (!selectedClientId) return;
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        content,
        sender: 'me',
        timestamp: new Date(),
        senderName: 'You',
      };

      setMessages((prev) => ({
        ...prev,
        [selectedClientId]: [...(prev[selectedClientId] || []), newMsg],
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.client.id === selectedClientId
            ? { ...c, lastMessage: { content, timestamp: new Date(), unread: false } }
            : c
        )
      );

      setTimeout(() => {
        const autoReplies: Record<string | number, string> = {
          1: "That sounds great! Let me check my calendar and get back to you with availability.",
          2: "Perfect! I'll have my team start on the scope immediately.",
          3: "Thanks for the update! I appreciate the quick turnaround.",
          4: "Great, let's keep the momentum going on this project!",
          5: "I'll review and get back to you with feedback shortly.",
          6: "Sounds good. Let me know if you need anything else from my end.",
          7: "Perfect, thanks for keeping me in the loop!",
          8: "Thanks for the message. I'll respond soon.",
        };

        const reply = autoReplies[selectedClientId];
        if (reply) {
          const replyMsg: Message = {
            id: `reply-${Date.now()}`,
            content: reply,
            sender: 'client',
            timestamp: new Date(),
            senderName: selectedClient?.name || 'Client',
          };
          setMessages((prev) => ({
            ...prev,
            [selectedClientId]: [...(prev[selectedClientId] || []), replyMsg],
          }));
        }
      }, 1500);
    },
    [selectedClientId, selectedClient]
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
          } lg:flex w-full lg:w-64  flex-shrink-0 absolute lg:relative z-30 lg:z-auto inset-0 lg:inset-auto`}>
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
