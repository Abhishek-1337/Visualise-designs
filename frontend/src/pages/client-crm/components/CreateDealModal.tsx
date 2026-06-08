import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
  loading: boolean;
  contactId: string;
}

const CreateDealModal: React.FC<CreateDealModalProps> = ({ isOpen, onClose, onCreate, loading, contactId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    value: '',
    stage: 'NEW_LEAD',
    contactId: '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        value: '',
        stage: 'NEW_LEAD',
        contactId,
      });
    }
  }, [isOpen, contactId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/60 backdrop-blur-xl" onClick={onClose}>
      <div
        className="bg-card rounded-xl shadow-soft-2xl w-full max-w-lg border border-border overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-card to-muted/20">
          <h2 className="font-semibold text-lg text-foreground">Create New Deal</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-smooth">
            <Icon name="X" size={18} color="currentColor" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Deal Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Website Redesign - Phase 1"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Briefly describe the proposal scope..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Budget/Value ($)</label>
                <input
                  type="number"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Initial Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="NEW_LEAD">New Lead</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="PROPOSAL_SENT">Proposal Sent</option>
                  <option value="NEGOTIATION">Negotiation</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1" type="button">Cancel</Button>
            <Button
              variant="default"
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Deal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDealModal;
