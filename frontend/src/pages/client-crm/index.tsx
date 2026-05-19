import React, { useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Sidebar, { TopBar } from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import AllClientsGrid from './components/AllClientsGrid';
import ClientWorkspace from './components/ClientWorkspace';
import ProjectChatPanel from './components/ProjectChatPanel';
import type { RootState } from '../../store';
import type { Client } from './components/AllClientsGrid';
import type { Project } from './components/ClientWorkspace';

interface Message {
  id: string | number;
  content: string;
  sender: 'me' | 'client' | 'team';
  timestamp: Date;
  senderName?: string;
  senderAvatar?: string;
}

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

const mockClients: Client[] = [
  { id: 1, name: 'Alexandra Morrison', company: 'Morrison Interiors', email: 'alexandra@morrisoninteriors.com', phone: '+1 (555) 123-4567', location: 'New York, NY', status: 'active' },
  { id: 2, name: 'David Chen', company: 'Chen & Associates', email: 'david@chenassociates.com', phone: '+1 (555) 234-5678', location: 'San Francisco, CA', status: 'vip' },
  { id: 3, name: 'Priya Sharma', company: 'Sharma Design Studio', email: 'priya@sharmadesign.com', phone: '+1 (555) 345-6789', location: 'Austin, TX', status: 'active' },
  { id: 4, name: 'Marcus Johnson', company: 'Johnson Development', email: 'marcus@johnsondev.com', phone: '+1 (555) 456-7890', location: 'Chicago, IL', status: 'active' },
  { id: 5, name: 'Elena Vasquez', company: 'Vasquez Architecture', email: 'elena@vasquezarch.com', phone: '+1 (555) 567-8901', location: 'Miami, FL', status: 'vip' },
  { id: 6, name: 'Robert Kim', company: 'Kim Construction', email: 'robert@kimconstruction.com', phone: '+1 (555) 678-9012', location: 'Seattle, WA', status: 'active' },
  { id: 7, name: 'Sarah Williams', company: 'Williams Creative', email: 'sarah@williamscreative.com', phone: '+1 (555) 789-0123', location: 'Denver, CO', status: 'inactive' },
  { id: 8, name: 'James Rodriguez', company: 'Rodriguez Realty', email: 'james@rodriguezrealty.com', phone: '+1 (555) 890-1234', location: 'Los Angeles, CA', status: 'active' },
  { id: 9, name: 'Emily Thompson', company: 'Thompson & Co.', email: 'emily@thompsonco.com', phone: '+1 (555) 901-2345', location: 'Boston, MA', status: 'prospect' },
  { id: 10, name: 'Michael Park', company: 'Park Developments', email: 'michael@parkdev.com', phone: '+1 (555) 012-3456', location: 'Portland, OR', status: 'active' },
];

const mockProjects: Record<number, Project[]> = {
  1: [
    { id: 101, name: 'Website Redesign', description: 'Complete overhaul of the corporate website with modern UI/UX', status: 'In Progress', progress: 65, dueDate: 'Jun 15, 2026', team: [{ name: 'Sarah M.' }, { name: 'Alex K.' }, { name: 'Jordan P.' }] },
    { id: 102, name: 'Brand Identity Package', description: 'Logo, color palette, typography, and brand guidelines', status: 'Completed', progress: 100, dueDate: 'Mar 1, 2026', team: [{ name: 'Lisa R.' }, { name: 'Tom W.' }] },
    { id: 103, name: 'Mobile App MVP', description: 'Cross-platform mobile application for client portal', status: 'Planning', progress: 15, dueDate: 'Sep 30, 2026', team: [{ name: 'Mike C.' }, { name: 'Emma L.' }, { name: 'David S.' }] },
  ],
  2: [
    { id: 201, name: 'Office Renovation', description: 'Full interior redesign of downtown office space', status: 'In Progress', progress: 45, dueDate: 'Aug 20, 2026', team: [{ name: 'Chris B.' }, { name: 'Nina T.' }] },
    { id: 202, name: 'Lobby Art Installation', description: 'Curated art pieces for main lobby area', status: 'Pending', progress: 0, dueDate: 'Jul 1, 2026', team: [{ name: 'Anna P.' }] },
  ],
  3: [
    { id: 301, name: 'Residential Villa', description: 'Modern villa design with sustainable materials', status: 'In Progress', progress: 72, dueDate: 'Oct 10, 2026', team: [{ name: 'Raj M.' }, { name: 'Sophia L.' }] },
  ],
  5: [
    { id: 501, name: 'Commercial Tower', description: '40-story commercial tower architectural design', status: 'In Progress', progress: 30, dueDate: 'Dec 15, 2026', team: [{ name: 'Carlos R.' }, { name: 'Maya K.' }, { name: 'John D.' }] },
    { id: 502, name: 'Park Plaza Hotel', description: 'Boutique hotel design with rooftop garden', status: 'Planning', progress: 8, dueDate: 'Mar 2027', team: [{ name: 'Isabel F.' }, { name: 'George L.' }] },
  ],
  8: [
    { id: 801, name: 'Sunset Towers', description: 'Luxury condominium complex with 3 towers', status: 'In Progress', progress: 55, dueDate: 'Nov 30, 2026', team: [{ name: 'Diana P.' }, { name: 'Frank H.' }, { name: 'Lucy Z.' }] },
  ],
};

const mockMessages: Record<number, Message[]> = {
  101: [
    { id: '101-1', content: 'Hi team! I just reviewed the latest homepage mockups. The hero section looks fantastic.', sender: 'client', timestamp: hoursAgo(3), senderName: 'Alexandra Morrison' },
    { id: '101-2', content: 'Thanks Alexandra! We incorporated the feedback from the last review. Glad you like it.', sender: 'me', timestamp: hoursAgo(2.5), senderName: 'You' },
    { id: '101-3', content: 'Can we add a video background option for the hero section?', sender: 'client', timestamp: hoursAgo(2), senderName: 'Alexandra Morrison' },
    { id: '101-4', content: 'Absolutely! We have a few stock video options we can use, or we can use your brand video.', sender: 'me', timestamp: hoursAgo(1.5), senderName: 'You' },
    { id: '101-5', content: 'Let me check with our video team and get back to you.', sender: 'client', timestamp: hoursAgo(0.8), senderName: 'Alexandra Morrison' },
    { id: '101-6', content: 'Sounds good. In the meantime, I\'ll prepare the remaining page templates.', sender: 'me', timestamp: hoursAgo(0.5), senderName: 'You' },
    { id: '101-7', content: 'Also, the mobile responsiveness is looking much better. The navigation collapse works perfectly now.', sender: 'team', timestamp: hoursAgo(0.3), senderName: 'Sarah M.' },
  ],
  102: [
    { id: '102-1', content: 'The brand guidelines document is ready for review.', sender: 'me', timestamp: daysAgo(5), senderName: 'You' },
    { id: '102-2', content: 'Great work! The color palette is exactly what we envisioned.', sender: 'client', timestamp: daysAgo(4), senderName: 'Alexandra Morrison' },
    { id: '102-3', content: 'I\'ve shared the final files with your marketing team.', sender: 'me', timestamp: daysAgo(3), senderName: 'You' },
  ],
  103: [
    { id: '103-1', content: 'Kickoff meeting scheduled for next Monday at 10am.', sender: 'me', timestamp: hoursAgo(6), senderName: 'You' },
    { id: '103-2', content: 'Perfect, I\'ll have my product team ready.', sender: 'client', timestamp: hoursAgo(5), senderName: 'Alexandra Morrison' },
  ],
  201: [
    { id: '201-1', content: 'The demolition is complete. Ready for the next phase.', sender: 'team', timestamp: hoursAgo(48), senderName: 'Chris B.' },
    { id: '201-2', content: 'Excellent! Keep me updated on the electrical work schedule.', sender: 'client', timestamp: hoursAgo(24), senderName: 'David Chen' },
    { id: '201-3', content: 'Electricians start next Monday. We\'re on track.', sender: 'me', timestamp: hoursAgo(12), senderName: 'You' },
  ],
  301: [
    { id: '301-1', content: 'The foundation work is complete. Framing starts next week.', sender: 'team', timestamp: daysAgo(2), senderName: 'Raj M.' },
    { id: '301-2', content: 'Wonderful! The sustainable material order has been confirmed.', sender: 'client', timestamp: daysAgo(1), senderName: 'Priya Sharma' },
  ],
  501: [
    { id: '501-1', content: 'Preliminary structural analysis is done. Ready for the design review.', sender: 'team', timestamp: hoursAgo(6), senderName: 'Carlos R.' },
    { id: '501-2', content: 'Let\'s schedule the design review for Thursday.', sender: 'client', timestamp: hoursAgo(4), senderName: 'Elena Vasquez' },
  ],
  801: [
    { id: '801-1', content: 'Phase 1 foundation permit has been approved!', sender: 'me', timestamp: hoursAgo(8), senderName: 'You' },
    { id: '801-2', content: 'That\'s great news! Let\'s break ground next month.', sender: 'client', timestamp: hoursAgo(5), senderName: 'James Rodriguez' },
  ],
};

const ClientCRM = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [messages, setMessages] = useState<Record<number, Message[]>>(mockMessages);

  const isClientRole = user?.role === 'CLIENT';

  const selectedClient = mockClients.find((c) => c.id === selectedClientId) || null;
  const clientProjects = selectedClientId ? (mockProjects[selectedClientId] || []) : [];
  const selectedProject = clientProjects.find((p) => p.id === selectedProjectId) || null;
  const currentMessages = selectedProjectId ? (messages[selectedProjectId] || []) : [];

  const handleSelectClient = useCallback((client: Client) => {
    setSelectedClientId(client.id);
    setSelectedProjectId(null);
    setShowChatPanel(false);
  }, []);

  const handleSelectProject = useCallback((project: Project) => {
    setSelectedProjectId(project.id);
    setShowChatPanel(true);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedClientId(null);
    setSelectedProjectId(null);
    setShowChatPanel(false);
  }, []);

  const handleSend = useCallback(
    (content: string) => {
      if (!selectedProjectId) return;
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        content,
        sender: 'me',
        timestamp: new Date(),
        senderName: 'You',
      };
      setMessages((prev) => ({
        ...prev,
        [selectedProjectId]: [...(prev[selectedProjectId] || []), newMsg],
      }));
    },
    [selectedProjectId]
  );

  const handleCloseChat = useCallback(() => {
    setShowChatPanel(false);
  }, []);

  if (isClientRole) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <TopBar />
        <main className="md:ml-[240px] pt-[60px]">
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
      <main className="fixed md:ml-[240px] pt-[60px] h-[calc(100vh - 60px)] flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          {!selectedClientId ? (
            <AllClientsGrid
              clients={mockClients}
              onSelectClient={handleSelectClient}
            />
          ) : (
            <>
              <div className={`flex-1 flex flex-col min-w-0 ${showChatPanel ? 'hidden lg:flex' : 'flex'}`}>
                <ClientWorkspace
                  client={selectedClient}
                  projects={clientProjects}
                  selectedProjectId={selectedProjectId}
                  onSelectProject={handleSelectProject}
                  onBack={handleBack}
                />
              </div>

              <div className={`${showChatPanel ? 'flex' : 'hidden'} lg:flex`}>
                <ProjectChatPanel
                  project={selectedProject}
                  messages={currentMessages}
                  onSend={handleSend}
                  onClose={handleCloseChat}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientCRM;
