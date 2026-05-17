import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const LogCommunicationModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    type: 'call',
    client: '',
    participant: '',
    date: new Date()?.toISOString()?.split('T')?.[0],
    duration: '',
    outcome: '',
    outcomeType: 'positive',
    notes: '',
    actionItems: ''
  });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form?.client || !form?.type) return;
    onSave?.({
      ...form,
      id: Date.now(),
      title: `${form?.type === 'call' ? 'Call' : form?.type === 'zoom' ? 'Zoom Meeting' : form?.type === 'email' ? 'Email' : 'Message'} with ${form?.client}`,
      date: new Date(form?.date),
      actionItems: form?.actionItems ? form?.actionItems?.split('\n')?.filter(Boolean) : []
    });
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-warm-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-heading font-semibold text-foreground">Log Communication</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-smooth">
            <Icon name="X" size={20} color="currentColor" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {[{ id: 'call', icon: 'Phone', label: 'Call' }, { id: 'zoom', icon: 'Video', label: 'Zoom' }, { id: 'email', icon: 'Mail', label: 'Email' }, { id: 'message', icon: 'MessageSquare', label: 'Message' }]?.map((type) => (
                <button
                  key={type?.id}
                  onClick={() => handleChange('type', type?.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-smooth ${
                    form?.type === type?.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <Icon name={type?.icon} size={18} color="currentColor" />
                  {type?.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Client *</label>
              <input value={form?.client} onChange={(e) => handleChange('client', e?.target?.value)} placeholder="Client name" className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Participant</label>
              <input value={form?.participant} onChange={(e) => handleChange('participant', e?.target?.value)} placeholder="Team member" className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Date</label>
              <input type="date" value={form?.date} onChange={(e) => handleChange('date', e?.target?.value)} className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Duration</label>
              <input value={form?.duration} onChange={(e) => handleChange('duration', e?.target?.value)} placeholder="e.g. 30 min" className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Outcome</label>
            <input value={form?.outcome} onChange={(e) => handleChange('outcome', e?.target?.value)} placeholder="Brief outcome summary" className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea value={form?.notes} onChange={(e) => handleChange('notes', e?.target?.value)} placeholder="Detailed notes..." rows={3} className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Action Items (one per line)</label>
            <textarea value={form?.actionItems} onChange={(e) => handleChange('actionItems', e?.target?.value)} placeholder="Send revised proposal\nSchedule follow-up call" rows={2} className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium transition-smooth hover:bg-muted/80">Cancel</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover-lift active-press">Save Communication</button>
        </div>
      </div>
    </div>
  );
};

export default LogCommunicationModal;
