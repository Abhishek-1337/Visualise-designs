import React, { useState, useEffect, useCallback } from 'react';
import { dealService } from '../../services';
import Sidebar from '../../components/ui/Header';
import PipelineColumn from './components/PipelineColumn';
import FilterBar from './components/FilterBar';
import LeadDetailModal from './components/LeadDetailModal';

const STAGE_MAP: Record<string, string> = {
  NEW_LEAD: 'new', QUALIFIED: 'qualified', PROPOSAL_SENT: 'proposal',
  NEGOTIATION: 'negotiation', CLOSED_WON: 'won', CLOSED_LOST: 'lost',
};
const STAGE_REVERSE: Record<string, string> = {
  new: 'NEW_LEAD', qualified: 'QUALIFIED', proposal: 'PROPOSAL_SENT',
  negotiation: 'NEGOTIATION', won: 'CLOSED_WON', lost: 'CLOSED_LOST',
};

const pipelineStages = [
  { id: 'new', name: 'New Leads', icon: 'Sparkles' },
  { id: 'qualified', name: 'Qualified', icon: 'CheckCircle' },
  { id: 'proposal', name: 'Proposal Sent', icon: 'FileText' },
  { id: 'negotiation', name: 'Negotiation', icon: 'MessageSquare' },
  { id: 'won', name: 'Closed Won', icon: 'Trophy' },
  { id: 'lost', name: 'Closed Lost', icon: 'XCircle' },
];

const mapDealToLead = (deal: any) => ({
  id: deal.id,
  clientName: deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : 'Unknown',
  company: deal.contact?.company || '',
  avatar: '',
  avatarAlt: '',
  projectType: deal.title?.split(' - ')[0] || deal.title,
  estimatedValue: deal.value,
  lastContact: deal.expectedCloseDate || deal.createdAt,
  priority: deal.probability >= 70 ? 'high' : deal.probability >= 40 ? 'medium' : 'low',
  stage: STAGE_MAP[deal.stage] || 'new',
  source: 'website',
  email: deal.contact?.email || '',
  phone: '',
  location: '',
  projectDescription: deal.description || '',
  assignedTo: deal.assignedTo?.id || '',
  assignedToName: deal.assignedTo?.name || 'Unassigned',
  dealStage: deal.stage,
  dealStatus: deal.status,
});

const LeadClientFlow = () => {
  const [draggedLead, setDraggedLead] = useState<any>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ source: 'all', projectType: 'all', assignedTo: 'all' });
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      setLoading(true);
      const res = await dealService.getAll({ limit: '100' });
      setLeads((res.data.deals || []).map(mapDealToLead));
    } catch {
      console.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, lead: any) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = useCallback(async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    if (draggedLead && draggedLead.stage !== targetStageId) {
      try {
        await dealService.updateStage(draggedLead.id, { stage: STAGE_REVERSE[targetStageId] });
        setLeads((prev) =>
          prev.map((l) => (l.id === draggedLead.id ? { ...l, stage: targetStageId } : l))
        );
      } catch {
        console.error('Failed to update deal stage');
      }
    }
    setDraggedLead(null);
  }, [draggedLead]);

  const handleLeadClick = (lead: any) => setSelectedLead(lead);

  const handleQuickAction = async (action: string, lead: any) => {
    if (action === 'view') setSelectedLead(lead);
    if (action === 'send') {
      try {
        await dealService.update(lead.id, { status: 'SENT' });
        setLeads((prev) =>
          prev.map((l) => (l.id === lead.id ? { ...l, dealStatus: 'SENT' } : l))
        );
      } catch {
        console.error('Failed to send deal');
      }
    }
  };

  const handleFilterChange = (filterType: string, value: string) =>
    setFilters((prev) => ({ ...prev, [filterType]: value }));

  const getFilteredLeads = (stageId: string) =>
    leads.filter((lead) => {
      if (lead.stage !== stageId) return false;
      if (filters.source !== 'all' && lead.source !== filters.source) return false;
      if (filters.assignedTo !== 'all' && lead.assignedTo !== filters.assignedTo) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          lead.clientName?.toLowerCase().includes(q) ||
          lead.company?.toLowerCase().includes(q) ||
          lead.projectType?.toLowerCase().includes(q)
        );
      }
      return true;
    });

  const getTotalPipelineValue = () =>
    leads.filter((l) => l.stage !== 'lost').reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  useEffect(() => { document.title = 'Lead & Client Flow - Visualise CRM'; }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-[260px]">
        <div className="px-4 lg:px-6 py-4 lg:py-6 animate-fade-in">
          <div className="mb-4 lg:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div>
                <h1 className="font-heading font-bold text-2xl md:text-3xl lg:text-4xl text-foreground mb-1">
                  Lead & Client Pipeline
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Visual flow of leads through your sales pipeline
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-card rounded-lg px-4 py-2.5 shadow-soft-sm border border-border/50">
                  <p className="text-xs text-muted-foreground mb-0.5">Total Pipeline Value</p>
                  <p className="font-heading font-bold text-lg md:text-xl gradient-primary bg-clip-text text-transparent">
                    {loading ? '...' : formatCurrency(getTotalPipelineValue())}
                  </p>
                </div>
              </div>
            </div>

            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onSearch={setSearchQuery}
              searchQuery={searchQuery}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading pipeline...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden lg:block">
                <div className="grid grid-cols-6 gap-4 h-[calc(100vh-280px)] min-h-[600px]">
                  {pipelineStages.map((stage) => (
                    <PipelineColumn
                      key={stage.id}
                      stage={stage}
                      leads={getFilteredLeads(stage.id)}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onLeadClick={handleLeadClick}
                      onQuickAction={handleQuickAction}
                    />
                  ))}
                </div>
              </div>

              <div className="lg:hidden space-y-4">
                {pipelineStages.map((stage) => {
                  const stageLeads = getFilteredLeads(stage.id);
                  if (stageLeads.length === 0) return null;
                  return (
                    <div key={stage.id}>
                      <PipelineColumn
                        stage={stage}
                        leads={stageLeads}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onLeadClick={handleLeadClick}
                        onQuickAction={handleQuickAction}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
};

export default LeadClientFlow;