import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const OverviewTab = ({ client }) => {
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState([
    { id: 1, text: 'Client prefers photorealistic renders with warm lighting. Discussed mood board references from Scandinavian design.', author: 'Sarah Mitchell', timestamp: new Date('2025-12-28T10:30:00'), tags: ['preference', 'design'] },
    { id: 2, text: 'Budget approved for Phase 1. Client wants to see initial concepts by end of January.', author: 'James Rivera', timestamp: new Date('2025-12-20T14:15:00'), tags: ['budget', 'deadline'] },
    { id: 3, text: 'Zoom call went well. Client is very responsive and detail-oriented. Prefers weekly check-ins.', author: 'Sarah Mitchell', timestamp: new Date('2025-12-15T09:00:00'), tags: ['communication'] }
  ]);

  const timeline = [
    { id: 1, type: 'project', title: 'Residential Villa Project Started', date: new Date('2025-11-01'), icon: 'FolderOpen', color: 'text-primary bg-primary/10' },
    { id: 2, type: 'meeting', title: 'Initial Consultation Call', date: new Date('2025-10-28'), icon: 'Phone', color: 'text-success bg-success/10' },
    { id: 3, type: 'proposal', title: 'Proposal Sent & Accepted', date: new Date('2025-10-20'), icon: 'FileText', color: 'text-accent bg-accent/10' },
    { id: 4, type: 'lead', title: 'Lead Created via Referral', date: new Date('2025-10-15'), icon: 'UserPlus', color: 'text-secondary bg-secondary/10' }
  ];

  const handleAddNote = () => {
    if (!newNote?.trim()) return;
    setNotes(prev => [{ id: Date.now(), text: newNote, author: 'Studio Manager', timestamp: new Date(), tags: [] }, ...prev]);
    setNewNote('');
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (date) => {
    return date?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-card rounded-xl shadow-soft-md border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="Clock" size={20} color="var(--color-primary)" />
            Client Timeline
          </h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
            <div className="space-y-4">
              {timeline?.map((item) => (
                <div key={item?.id} className="flex items-start gap-4 pl-10 relative">
                  <div className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ${item?.color}`}>
                    <Icon name={item?.icon} size={10} color="currentColor" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-sm text-foreground">{item?.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(item?.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-soft-md border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="StickyNote" size={20} color="var(--color-primary)" />
            Team Notes
          </h3>
          <div className="mb-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e?.target?.value)}
              placeholder="Add a note about this client..."
              rows={3}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <button
              onClick={handleAddNote}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover-lift active-press"
            >
              Add Note
            </button>
          </div>
          <div className="space-y-4">
            {notes?.map((note) => (
              <div key={note?.id} className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-foreground leading-relaxed">{note?.text}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="User" size={12} color="var(--color-primary)" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{note?.author}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(note?.timestamp)} at {formatTime(note?.timestamp)}</span>
                </div>
                {note?.tags?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {note?.tags?.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-card rounded-xl shadow-soft-md border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Client Details</h3>
          <div className="space-y-3">
            {[
              { label: 'Industry', value: client?.industry || 'Architecture', icon: 'Building2' },
              { label: 'Client Since', value: client?.clientSince || 'Oct 2025', icon: 'Calendar' },
              { label: 'Total Projects', value: client?.totalProjects || '3', icon: 'FolderOpen' },
              { label: 'Lifetime Value', value: client?.lifetimeValue || '$850,000', icon: 'DollarSign' },
              { label: 'Assigned To', value: client?.assignedTo || 'Sarah Mitchell', icon: 'User' }
            ]?.map((item) => (
              <div key={item?.label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name={item?.icon} size={16} color="var(--color-muted-foreground)" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item?.label}</p>
                  <p className="text-sm font-medium text-foreground">{item?.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-soft-md border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Key Milestones</h3>
          <div className="space-y-3">
            {[
              { label: 'Phase 1 Concepts', progress: 75, color: 'bg-primary' },
              { label: 'Client Approvals', progress: 50, color: 'bg-amber-500' },
              { label: 'Final Deliverables', progress: 20, color: 'bg-emerald-500' }
            ]?.map((milestone) => (
              <div key={milestone?.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{milestone?.label}</span>
                  <span className="font-medium text-foreground">{milestone?.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${milestone?.color} rounded-full transition-all duration-500`} style={{ width: `${milestone?.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
