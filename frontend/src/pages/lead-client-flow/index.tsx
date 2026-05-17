import React, { useState, useEffect } from 'react';
import Sidebar, { TopBar } from '../../components/ui/Header';

import PipelineColumn from './components/PipelineColumn';
import FilterBar from './components/FilterBar';
import LeadDetailModal from './components/LeadDetailModal';

const LeadClientFlow = () => {
  const [draggedLead, setDraggedLead] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    source: 'all',
    projectType: 'all',
    assignedTo: 'all'
  });

  const pipelineStages = [
  { id: 'new', name: 'New Leads', icon: 'Sparkles' },
  { id: 'qualified', name: 'Qualified', icon: 'CheckCircle' },
  { id: 'proposal', name: 'Proposal Sent', icon: 'FileText' },
  { id: 'negotiation', name: 'Negotiation', icon: 'MessageSquare' },
  { id: 'won', name: 'Closed Won', icon: 'Trophy' },
  { id: 'lost', name: 'Closed Lost', icon: 'XCircle' }];


  const [leads, setLeads] = useState([
  {
    id: 1,
    clientName: 'Alexandra Morrison',
    company: 'Morrison Development Group',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_151378054-1763295516123.png",
    avatarAlt: 'Professional woman with blonde hair in business attire smiling at camera against neutral background',
    projectType: 'Commercial',
    estimatedValue: 450000,
    lastContact: new Date('2025-12-28'),
    priority: 'high',
    stage: 'new',
    source: 'linkedin',
    email: 'alexandra.morrison@mdg.com',
    phone: '+1 (555) 234-5678',
    location: 'New York, NY, USA',
    projectDescription: 'High-end commercial office space visualization for a 15-story building in Manhattan. Client requires photorealistic renders for investor presentations and marketing materials.',
    assignedTo: 'sarah',
    assignedToName: 'Sarah Mitchell'
  },
  {
    id: 2,
    clientName: 'David Chen',
    company: 'Chen Architecture Studio',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_156233ed3-1763293655955.png",
    avatarAlt: 'Asian man with short black hair wearing glasses and dark suit in professional headshot',
    projectType: 'Residential',
    estimatedValue: 280000,
    lastContact: new Date('2025-12-30'),
    priority: 'medium',
    stage: 'new',
    source: 'referral',
    email: 'david@chenarchitecture.com',
    phone: '+1 (555) 345-6789',
    location: 'San Francisco, CA, USA',
    projectDescription: 'Luxury residential villa visualization with modern minimalist design. Needs interior and exterior renders for client approval and construction documentation.',
    assignedTo: 'james',
    assignedToName: 'James Chen'
  },
  {
    id: 3,
    clientName: 'Emma Rodriguez',
    company: 'Horizon Hospitality Group',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_14d9d1e3f-1763293907442.png",
    avatarAlt: 'Hispanic woman with long dark hair in elegant business suit smiling warmly at camera',
    projectType: 'Hospitality',
    estimatedValue: 620000,
    lastContact: new Date('2025-12-26'),
    priority: 'high',
    stage: 'qualified',
    source: 'website',
    email: 'emma.rodriguez@horizonhospitality.com',
    phone: '+1 (555) 456-7890',
    location: 'Miami, FL, USA',
    projectDescription: 'Boutique hotel visualization project featuring 120 rooms with rooftop restaurant and spa facilities. Requires comprehensive 3D walkthrough and marketing renders.',
    assignedTo: 'emily',
    assignedToName: 'Emily Rodriguez'
  },
  {
    id: 4,
    clientName: 'Michael Thompson',
    company: 'Thompson Retail Solutions',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b1a334f6-1763294531449.png",
    avatarAlt: 'Caucasian man with brown hair in navy blazer and white shirt professional business portrait',
    projectType: 'Retail',
    estimatedValue: 195000,
    lastContact: new Date('2025-12-29'),
    priority: 'medium',
    stage: 'qualified',
    source: 'email',
    email: 'michael@thompsonretail.com',
    phone: '+1 (555) 567-8901',
    location: 'Chicago, IL, USA',
    projectDescription: 'Modern retail store design visualization for flagship location. Client needs renders showing customer flow, product displays, and lighting design.',
    assignedTo: 'michael',
    assignedToName: 'Michael Thompson'
  },
  {
    id: 5,
    clientName: 'Sophie Laurent',
    company: 'Laurent Design International',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_10bba8d6f-1763294268753.png",
    avatarAlt: 'French woman with short blonde hair in sophisticated black dress professional headshot with soft lighting',
    projectType: 'Mixed-Use',
    estimatedValue: 890000,
    lastContact: new Date('2025-12-24'),
    priority: 'high',
    stage: 'proposal',
    source: 'event',
    email: 'sophie@laurentdesign.fr',
    phone: '+33 1 23 45 67 89',
    location: 'Paris, France',
    projectDescription: 'Large-scale mixed-use development combining residential, commercial, and public spaces. Comprehensive visualization package including aerial views and street-level perspectives.',
    assignedTo: 'sarah',
    assignedToName: 'Sarah Mitchell'
  },
  {
    id: 6,
    clientName: 'James Wilson',
    company: 'Wilson Property Ventures',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_18d854688-1763295573707.png",
    avatarAlt: 'African American man with short hair in charcoal suit and tie confident professional portrait',
    projectType: 'Commercial',
    estimatedValue: 340000,
    lastContact: new Date('2025-12-27'),
    priority: 'medium',
    stage: 'proposal',
    source: 'linkedin',
    email: 'james.wilson@wpventures.com',
    phone: '+1 (555) 678-9012',
    location: 'Atlanta, GA, USA',
    projectDescription: 'Corporate headquarters visualization with focus on sustainable design features and modern workspace concepts. Requires both interior and exterior renders.',
    assignedTo: 'james',
    assignedToName: 'James Chen'
  },
  {
    id: 7,
    clientName: 'Isabella Martinez',
    company: 'Martinez Urban Development',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1725ab708-1763294479697.png",
    avatarAlt: 'Latina woman with long wavy brown hair in burgundy blazer smiling professionally against white background',
    projectType: 'Residential',
    estimatedValue: 425000,
    lastContact: new Date('2025-12-23'),
    priority: 'high',
    stage: 'negotiation',
    source: 'referral',
    email: 'isabella@martinezurban.com',
    phone: '+1 (555) 789-0123',
    location: 'Los Angeles, CA, USA',
    projectDescription: 'Luxury condominium complex with 45 units featuring contemporary design and premium amenities. Full visualization package including common areas and model units.',
    assignedTo: 'emily',
    assignedToName: 'Emily Rodriguez'
  },
  {
    id: 8,
    clientName: 'Oliver Schmidt',
    company: 'Schmidt Engineering GmbH',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_117f09372-1763294704662.png",
    avatarAlt: 'German man with blonde hair and beard in gray suit professional business photograph',
    projectType: 'Commercial',
    estimatedValue: 510000,
    lastContact: new Date('2025-12-25'),
    priority: 'medium',
    stage: 'negotiation',
    source: 'website',
    email: 'oliver.schmidt@schmidteng.de',
    phone: '+49 30 12345678',
    location: 'Berlin, Germany',
    projectDescription: 'Industrial facility conversion to modern office space. Client needs visualization showing transformation from existing structure to proposed design.',
    assignedTo: 'michael',
    assignedToName: 'Michael Thompson'
  },
  {
    id: 9,
    clientName: 'Aisha Patel',
    company: 'Patel Hospitality Group',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1acd953c0-1763293371113.png",
    avatarAlt: 'Indian woman with long black hair in teal business suit professional portrait with warm smile',
    projectType: 'Hospitality',
    estimatedValue: 780000,
    lastContact: new Date('2025-12-20'),
    priority: 'high',
    stage: 'won',
    source: 'event',
    email: 'aisha@patelhospitality.com',
    phone: '+44 20 1234 5678',
    location: 'London, United Kingdom',
    projectDescription: 'Five-star resort visualization with spa, restaurants, and conference facilities. Comprehensive package including aerial views, interior spaces, and guest experience journey.',
    assignedTo: 'sarah',
    assignedToName: 'Sarah Mitchell'
  },
  {
    id: 10,
    clientName: 'Lucas Silva',
    company: 'Silva Development Corp',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_141f6e18f-1763293428248.png",
    avatarAlt: 'Brazilian man with dark hair in navy suit and striped tie confident professional headshot',
    projectType: 'Mixed-Use',
    estimatedValue: 650000,
    lastContact: new Date('2025-12-22'),
    priority: 'medium',
    stage: 'won',
    source: 'linkedin',
    email: 'lucas@silvadev.com.br',
    phone: '+55 11 98765-4321',
    location: 'São Paulo, Brazil',
    projectDescription: 'Urban regeneration project combining residential towers with retail and public spaces. Requires extensive visualization showing integration with existing neighborhood.',
    assignedTo: 'james',
    assignedToName: 'James Chen'
  },
  {
    id: 11,
    clientName: 'Nina Kowalski',
    company: 'Kowalski Retail Design',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1c786ded8-1763299774801.png",
    avatarAlt: 'Polish woman with short red hair in black blazer professional business portrait with modern aesthetic',
    projectType: 'Retail',
    estimatedValue: 125000,
    lastContact: new Date('2025-12-15'),
    priority: 'low',
    stage: 'lost',
    source: 'email',
    email: 'nina@kowalskidesign.pl',
    phone: '+48 22 123 4567',
    location: 'Warsaw, Poland',
    projectDescription: 'Shopping mall renovation visualization focusing on modernizing common areas and storefronts. Client decided to proceed with in-house team.',
    assignedTo: 'emily',
    assignedToName: 'Emily Rodriguez'
  }]
  );

  const handleDragStart = (e, lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStageId) => {
    e?.preventDefault();
    if (draggedLead && draggedLead?.stage !== targetStageId) {
      setLeads((prevLeads) =>
      prevLeads?.map((lead) =>
      lead?.id === draggedLead?.id ?
      { ...lead, stage: targetStageId } :
      lead
      )
      );
    }
    setDraggedLead(null);
  };

  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
  };

  const handleQuickAction = (action, lead) => {
    console.log(`${action} action for lead:`, lead?.clientName);
    if (action === 'view') {
      setSelectedLead(lead);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const getFilteredLeads = (stageId) => {
    return leads?.filter((lead) => {
      const matchesStage = lead?.stage === stageId;
      const matchesSource = filters?.source === 'all' || lead?.source === filters?.source;
      const matchesProjectType = filters?.projectType === 'all' || lead?.projectType?.toLowerCase() === filters?.projectType;
      const matchesAssignedTo = filters?.assignedTo === 'all' || lead?.assignedTo === filters?.assignedTo;
      const matchesSearch = !searchQuery ||
      lead?.clientName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      lead?.company?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      lead?.projectType?.toLowerCase()?.includes(searchQuery?.toLowerCase());

      return matchesStage && matchesSource && matchesProjectType && matchesAssignedTo && matchesSearch;
    });
  };

  const getTotalPipelineValue = () => {
    const filteredLeads = leads?.filter((lead) => {
      const matchesSource = filters?.source === 'all' || lead?.source === filters?.source;
      const matchesProjectType = filters?.projectType === 'all' || lead?.projectType?.toLowerCase() === filters?.projectType;
      const matchesAssignedTo = filters?.assignedTo === 'all' || lead?.assignedTo === filters?.assignedTo;
      const matchesSearch = !searchQuery ||
      lead?.clientName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      lead?.company?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      lead?.projectType?.toLowerCase()?.includes(searchQuery?.toLowerCase());

      return matchesSource && matchesProjectType && matchesAssignedTo && matchesSearch;
    });

    return filteredLeads?.reduce((sum, lead) => sum + lead?.estimatedValue, 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value);
  };

  useEffect(() => {
    document.title = 'Lead & Client Flow - Visualise CRM';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />
      <main className="md:ml-[260px] pt-[60px]">
        <div className="px-4 lg:px-6 py-4 lg:py-6">
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
                <div className="bg-card rounded-lg px-4 py-2 shadow-warm">
                  <p className="text-xs text-muted-foreground mb-0.5">Total Pipeline Value</p>
                  <p className="font-heading font-bold text-lg md:text-xl text-foreground">
                    {formatCurrency(getTotalPipelineValue())}
                  </p>
                </div>
              </div>
            </div>

            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onSearch={setSearchQuery}
              searchQuery={searchQuery} />

          </div>

          <div className="hidden lg:block">
            <div className="grid grid-cols-6 gap-4 h-[calc(100vh-280px)] min-h-[600px]">
              {pipelineStages?.map((stage) =>
              <PipelineColumn
                key={stage?.id}
                stage={stage}
                leads={getFilteredLeads(stage?.id)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onLeadClick={handleLeadClick}
                onQuickAction={handleQuickAction} />

              )}
            </div>
          </div>

          <div className="lg:hidden space-y-4">
            {pipelineStages?.map((stage) => {
              const stageLeads = getFilteredLeads(stage?.id);
              if (stageLeads?.length === 0) return null;

              return (
                <div key={stage?.id}>
                  <PipelineColumn
                    stage={stage}
                    leads={stageLeads}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onLeadClick={handleLeadClick}
                    onQuickAction={handleQuickAction} />

                </div>);

            })}
          </div>
        </div>
      </main>
      {selectedLead &&
      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)} />

      }
    </div>);

};

export default LeadClientFlow;