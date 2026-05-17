import React, { useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';

interface Message {
  id: string | number;
  content: string;
  sender: 'me' | 'client';
  timestamp: Date;
  senderName?: string;
  senderAvatar?: string;
}

interface ChatAreaProps {
  client: {
    id: string | number;
    name: string;
    avatar?: string;
    status?: string;
    company?: string;
    email?: string;
    phone?: string;
  } | null;
  messages: Message[];
  onSend: (content: string) => void;
  onToggleClientList: () => void;
}

const MessageBubble: React.FC<{ message: Message; showSender: boolean }> = ({ message, showSender }) => {
  const isMe = message.sender === 'me';
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} ${showSender ? 'mb-4' : 'mb-1'}`}>
      {showSender && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center mt-0.5">
          {isMe ? (
            <span className="text-xs font-semibold text-accent-foreground">ME</span>
          ) : (
            <span className="text-xs font-semibold text-accent-foreground">
              {message.senderName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CL'}
            </span>
          )}
        </div>
      )}
      {!showSender && <div className="w-8 flex-shrink-0" />}
      <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
        {showSender && (
          <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs font-semibold text-foreground">
              {isMe ? 'You' : message.senderName || 'Client'}
            </span>
            <span className="text-[10px] text-muted-foreground">{time}</span>
          </div>
        )}
        {!showSender && (
          <span className="text-[10px] text-muted-foreground/50 mb-0.5 ml-0.5">{time}</span>
        )}
        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isMe
            ? 'bg-primary text-primary-foreground rounded-tr-md'
            : 'bg-muted text-foreground rounded-tl-md'
        }`}>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

const DateSeparator: React.FC<{ date: Date }> = ({ date }) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let label: string;
  if (date.toDateString() === today.toDateString()) {
    label = 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    label = 'Yesterday';
  } else {
    label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs font-medium text-muted-foreground bg-background px-3 py-1 rounded-full border border-border">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
};

const EmptyState: React.FC = () => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center max-w-sm">
      <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Icon name="MessageSquare" size={36} color="var(--color-muted-foreground)" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to Client Chat</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Select a client from the list on the left to view your conversation history and send messages.
      </p>
    </div>
  </div>
);

const ChatArea: React.FC<ChatAreaProps> = ({ client, messages, onSend, onToggleClientList }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const groupedMessages: { date: Date; messages: Message[] }[] = [];
  let currentDate: string | null = null;

  messages.forEach((msg) => {
    const msgDate = new Date(msg.timestamp).toDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: new Date(msg.timestamp), messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  if (!client) {
    return (
      <div className="flex-1 flex flex-col bg-background">
        <ChatHeader client={null} onToggleClientList={onToggleClientList} />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0">
      <ChatHeader client={client} onToggleClientList={onToggleClientList} />
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-1 scroll-smooth">
        {groupedMessages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="MessageCircle" size={28} color="var(--color-muted-foreground)" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">No messages yet</h3>
              <p className="text-sm text-muted-foreground">Start a conversation with {client.name}</p>
            </div>
          </div>
        ) : (
          groupedMessages.map((group, gi) => (
            <div key={gi}>
              <DateSeparator date={group.date} />
              {group.messages.map((msg, mi) => {
                const prevMsg = mi > 0 ? group.messages[mi - 1] : null;
                const showSender = !prevMsg || prevMsg.sender !== msg.sender;
                return <MessageBubble key={msg.id} message={msg} showSender={showSender} />;
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSend={onSend} disabled={false} />
    </div>
  );
};

export default ChatArea;
