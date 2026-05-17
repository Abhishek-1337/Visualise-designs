import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { StatusBadge, IconButton, EmptyState } from '../../../components/shared';

interface Message {
  id: string | number;
  content: string;
  sender: 'me' | 'client' | 'team';
  timestamp: Date;
  senderName?: string;
  senderAvatar?: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  progress: number;
  dueDate: string;
  team: { name: string; avatar?: string }[];
}

interface ProjectChatPanelProps {
  project: Project | null;
  messages: Message[];
  onSend: (content: string) => void;
  onClose: () => void;
}

const chatTabs = [
  { id: 'chat', label: 'Chat', icon: 'MessageSquare' },
  { id: 'tasks', label: 'Tasks', icon: 'CheckSquare' },
  { id: 'files', label: 'Files', icon: 'Paperclip' },
  { id: 'details', label: 'Details', icon: 'Info' },
];

const MessageBubble: React.FC<{ message: Message; showSender: boolean }> = ({ message, showSender }) => {
  const isMe = message.sender === 'me';
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const initials = message.senderName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CL';

  return (
    <div className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} ${showSender ? 'mb-4' : 'mb-1'}`}>
      {showSender && (
        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
          isMe ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
        }`}>
          <span className="text-[9px] font-semibold">{isMe ? 'ME' : initials}</span>
        </div>
      )}
      {!showSender && <div className="w-7 flex-shrink-0" />}
      <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
        {showSender && (
          <div className={`flex items-center gap-2 mb-0.5 ${isMe ? 'flex-row-reverse' : ''}`}>
            <span className="text-[11px] font-semibold text-foreground">
              {isMe ? 'You' : message.senderName || 'Client'}
            </span>
            <span className="text-[10px] text-muted-foreground">{time}</span>
          </div>
        )}
        {!showSender && (
          <span className="text-[10px] text-muted-foreground/50 mb-0.5 ml-0.5">{time}</span>
        )}
        <div className={`rounded-xl px-3.5 py-2 text-sm leading-relaxed ${
          isMe
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-blue-50 dark:bg-blue-950/30 text-foreground rounded-tl-sm border border-blue-100 dark:border-blue-900/50'
        }`}>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <button className="text-muted-foreground/30 hover:text-blue-500 transition-smooth">
            <Icon name="Smile" size={12} color="currentColor" />
          </button>
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
  if (date.toDateString() === today.toDateString()) label = 'Today';
  else if (date.toDateString() === yesterday.toDateString()) label = 'Yesterday';
  else label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[10px] font-medium text-muted-foreground bg-background px-2.5 py-0.5 rounded-full border border-border">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
};

const ProjectChatPanel: React.FC<ProjectChatPanelProps> = ({ project, messages, onSend, onClose }) => {
  const [activeChatTab, setActiveChatTab] = useState('chat');
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [messageText]);

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed || !project) return;
    onSend(trimmed);
    setMessageText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const groupedMessages: { date: Date; msgs: Message[] }[] = [];
  let currentDate: string | null = null;
  messages.forEach((msg) => {
    const msgDate = new Date(msg.timestamp).toDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: new Date(msg.timestamp), msgs: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].msgs.push(msg);
    }
  });

  if (!project) {
    return (
      <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col bg-card border-l border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Icon name="MessageSquare" size={18} color="#3B82F6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Project Chat</h3>
              <p className="text-xs text-muted-foreground">Select a project to start chatting</p>
            </div>
          </div>
        </div>
        <EmptyState icon="MessageCircle" title="Select a project from the client workspace to view its conversation." iconSize={24} />
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col bg-card border-l border-border">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="Folder" size={16} color="#3B82F6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground truncate">{project.name}</h3>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-xs text-muted-foreground truncate">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <IconButton icon="Search" title="Search" />
          <IconButton icon="Phone" title="Call" />
          <IconButton icon="MoreVertical" title="More" />
          <IconButton icon="X" title="Close panel" onClick={onClose} className="lg:hidden ml-1" />
        </div>
      </div>

      <div className="border-b border-border px-3">
        <div className="flex">
          {chatTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChatTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-smooth border-b-2 ${
                activeChatTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800'
              }`}
            >
              <Icon name={tab.icon} size={13} color="currentColor" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeChatTab === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
            {groupedMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <EmptyState icon="MessageCircle" title="No messages yet" description="Start the conversation" iconSize={20} />
              </div>
            ) : (
              groupedMessages.map((group, gi) => (
                <div key={gi}>
                  <DateSeparator date={group.date} />
                  {group.msgs.map((msg, mi) => {
                    const prevMsg = mi > 0 ? group.msgs[mi - 1] : null;
                    return <MessageBubble key={msg.id} message={msg} showSender={!prevMsg || prevMsg.sender !== msg.sender} />;
                  })}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border px-4 py-3">
            <div className="flex items-end gap-2 bg-blue-50/50 dark:bg-blue-950/20 border border-border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-400 transition-all">
              <IconButton icon="Paperclip" title="Attach file" />
              <textarea
                ref={textareaRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none max-h-28 py-0.5"
              />
              <div className="flex items-center gap-1 flex-shrink-0">
                <IconButton icon="Smile" title="Emoji" />
                <button
                  onClick={handleSend}
                  disabled={!messageText.trim()}
                  className={`p-1.5 rounded-lg transition-smooth ${
                    messageText.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <Icon name="Send" size={15} color="currentColor" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeChatTab !== 'chat' && (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState icon={chatTabs.find(t => t.id === activeChatTab)?.icon || 'Info'} title={`${activeChatTab} coming soon`} iconSize={18} />
        </div>
      )}
    </div>
  );
};

export default ProjectChatPanel;
