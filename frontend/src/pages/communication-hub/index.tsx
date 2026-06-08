import React, { useState } from 'react';
import Sidebar, { TopBar } from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import CommunicationFeed from './components/CommunicationFeed';
import AnalyticsSidebar from './components/AnalyticsSidebar';
import LogCommunicationModal from './components/LogCommunicationModal';

const CommunicationHub = () => {
  const [selectedComm, setSelectedComm] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const [communications, setCommunications] = useState([
    {
      id: 1, type: 'zoom', title: 'Q1 Project Review Meeting',
      client: 'Alexandra Morrison', participant: 'Sarah Mitchell',
      date: new Date('2025-12-28T10:00:00'), duration: '1h 15min',
      outcome: 'Phase 1 approved', outcomeType: 'positive',
      notes: 'Client approved all Phase 1 concepts. Requested minor color adjustments on render #3. Very enthusiastic about the overall direction.',
      actionItems: ['Send revised render #3 by Friday', 'Prepare Phase 2 timeline', 'Schedule next review for Jan 15']
    },
    {
      id: 2, type: 'call', title: 'Budget Discussion Call',
      client: 'David Chen', participant: 'James Rivera',
      date: new Date('2025-12-26T14:30:00'), duration: '28 min',
      outcome: 'Budget confirmed', outcomeType: 'positive',
      notes: 'Confirmed budget for Phase 2. Client wants to add exterior visualization to scope.',
      actionItems: ['Send updated proposal with exterior scope', 'Revise contract addendum']
    },
    {
      id: 3, type: 'email', title: 'Sent revised proposal document',
      client: 'Priya Sharma', participant: 'Studio Manager',
      date: new Date('2025-12-24T09:15:00'), duration: null,
      outcome: 'Awaiting response', outcomeType: 'pending',
      notes: 'Sent updated proposal with revised pricing and timeline. Included portfolio samples.',
      actionItems: ['Follow up if no response by Dec 28']
    },
    {
      id: 4, type: 'call', title: 'Initial Discovery Call',
      client: 'Marcus Johnson', participant: 'Sarah Mitchell',
      date: new Date('2025-12-22T11:00:00'), duration: '45 min',
      outcome: 'Qualified lead', outcomeType: 'positive',
      notes: 'Strong interest in full visualization package. Has worked with 3D studios before. Timeline is flexible.',
      actionItems: ['Send portfolio and pricing guide', 'Schedule site visit for Jan 5']
    },
    {
      id: 5, type: 'zoom', title: 'Concept Presentation',
      client: 'Elena Vasquez', participant: 'James Rivera',
      date: new Date('2025-12-20T15:00:00'), duration: '55 min',
      outcome: 'Revisions requested', outcomeType: 'neutral',
      notes: 'Client liked overall direction but wants more dramatic lighting in exterior shots. Interior concepts approved.',
      actionItems: ['Revise exterior lighting on 4 renders', 'Resubmit by Dec 27']
    },
    {
      id: 6, type: 'message', title: 'Project timeline inquiry',
      client: 'Robert Kim', participant: 'Studio Manager',
      date: new Date('2025-12-19T16:45:00'), duration: null,
      outcome: 'Responded', outcomeType: 'positive',
      notes: 'Client asked about delivery timeline for Phase 3. Confirmed Feb 15 deadline.',
      actionItems: []
    }
  ]);

  const filterOptions = [
    { id: 'all', label: 'All', icon: 'Layers' },
    { id: 'call', label: 'Calls', icon: 'Phone' },
    { id: 'zoom', label: 'Zoom', icon: 'Video' },
    { id: 'email', label: 'Emails', icon: 'Mail' },
    { id: 'message', label: 'Messages', icon: 'MessageSquare' }
  ];

  const dateOptions = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' }
  ];

  const filteredComms = communications?.filter((comm) => {
    const matchesType = activeFilter === 'all' || comm?.type === activeFilter;
    const matchesSearch = !searchQuery || 
      comm?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      comm?.client?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      comm?.participant?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleAddComm = (newComm) => {
    setCommunications(prev => [newComm, ...prev]);
  };

  const stats = {
    thisMonth: communications?.length,
    avgResponse: '2.4h',
    followUps: communications?.filter(c => c?.actionItems?.length > 0)?.length,
    pending: communications?.filter(c => c?.outcomeType === 'pending')?.length,
    calls: communications?.filter(c => c?.type === 'call')?.length,
    zoom: communications?.filter(c => c?.type === 'zoom')?.length,
    emails: communications?.filter(c => c?.type === 'email')?.length,
    messages: communications?.filter(c => c?.type === 'message')?.length,
    healthScore: 82
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Sidebar />
      <TopBar />
      <main className="md:ml-[260px] pt-[60px]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Communication Hub</h1>
              <p className="text-sm text-muted-foreground mt-1">Track all client interactions and follow-ups in one place</p>
            </div>
            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium transition-smooth hover-lift active-press shadow-soft-sm"
            >
              <Icon name="Plus" size={18} color="currentColor" />
              Log Communication
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <div className="bg-card rounded-xl shadow-soft-sm border border-border p-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Icon name="Search" size={16} color="var(--color-muted-foreground)" className="absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e?.target?.value)}
                      placeholder="Search by client, participant, or topic..."
                      className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e?.target?.value)}
                    className="px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {dateOptions?.map((opt) => (
                      <option key={opt?.id} value={opt?.id}>{opt?.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {filterOptions?.map((filter) => (
                    <button
                      key={filter?.id}
                      onClick={() => setActiveFilter(filter?.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-smooth ${
                        activeFilter === filter?.id
                          ? 'bg-primary text-primary-foreground shadow-soft-sm'
                          : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                      }`}
                    >
                      <Icon name={filter?.icon} size={12} color="currentColor" />
                      {filter?.label}
                      {filter?.id !== 'all' && (
                        <span className="ml-1 px-1.5 py-0.5 bg-background/20 rounded-full text-xs">
                          {communications?.filter(c => c?.type === filter?.id)?.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">{filteredComms?.length} communications</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon name="ArrowDownUp" size={12} color="currentColor" />
                  Most Recent
                </div>
              </div>

              <CommunicationFeed
                communications={filteredComms}
                onSelect={setSelectedComm}
                selectedId={selectedComm?.id}
              />

              {filteredComms?.length === 0 && (
                <div className="text-center py-16 animate-fade-in">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon name="MessageSquare" size={28} color="var(--color-primary)" />
                  </div>
                  <p className="font-medium text-foreground mb-1">No communications found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters or log a new communication</p>
                </div>
              )}
            </div>

            <div className="lg:w-72 xl:w-80 flex-shrink-0">
              <AnalyticsSidebar stats={stats} />
            </div>
          </div>
        </div>
      </main>
      {showLogModal && (
        <LogCommunicationModal
          onClose={() => setShowLogModal(false)}
          onSave={handleAddComm}
        />
      )}
    </div>
  );
};

export default CommunicationHub;
