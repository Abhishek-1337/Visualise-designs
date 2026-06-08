import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { userService } from '../../../services';
import { useAuth } from 'contexts/AuthContext';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
  loading: boolean;
  contactId: string;
  deals?: any[];
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  loading,
  contactId,
  deals = [],
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('PLANNING');
  const [selectedDealId, setSelectedDealId] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setBudget('');
      setStartDate('');
      setEndDate('');
      setStatus('PLANNING');
      setSelectedDealId('');
      setSelectedMemberIds([]);
      fetchMembers();
    }
  }, [isOpen]);

  const availableDeals = deals.filter((deal) =>
    deal?.contactId === contactId &&
    deal?.status !== 'CONVERTED_TO_PROJECT' &&
    !deal?.project
  );

  const fetchMembers = async () => {
    try {
      setFetchLoading(true);
      // Fetch all users but we'll likely want to filter for staff roles
      const res = await userService.getAllUsers({ limit: 100 });
      const staff = (res.data.users || []).filter((u: any) => u.role !== 'CLIENT');
      const newStaff = staff.filter((s: any) => s.id !== user?.id); 
      setMembers(newStaff);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name,
      description,
      budget: budget ? parseFloat(budget) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status,
      contactId,
      dealId: selectedDealId || undefined,
      memberIds: selectedMemberIds,
    });
  };

  const handleDealChange = (dealId: string) => {
    setSelectedDealId(dealId);
    const deal = availableDeals.find((item) => item.id === dealId);
    if (!deal) return;
    if (!name.trim()) setName(deal.title || '');
    if (!description.trim()) setDescription(deal.description || '');
    if (!budget.trim() && deal.value) setBudget(String(deal.value));
  };

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/60 backdrop-blur-xl" onClick={onClose}>
      <div
        className="bg-card rounded-xl shadow-soft-2xl w-full max-w-lg border border-border overflow-hidden flex flex-col max-h-[90vh] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-card to-muted/20">
          <h2 className="font-semibold text-lg text-foreground">Create New Project</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-smooth">
            <Icon name="X" size={18} color="currentColor" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Project Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website Redesign"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Linked Deal (Optional)</label>
            <select
              value={selectedDealId}
              onChange={(e) => handleDealChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">No linked deal</option>
              {availableDeals.map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.title} {deal.value ? `- $${Number(deal.value).toLocaleString()}` : ''}
                </option>
              ))}
            </select>
            {availableDeals.length === 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground">No unlinked deals found for this client.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project goals..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Budget (Optional)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="5000"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">End Date (Due)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Assign Team Members</label>
            <div className="border border-border rounded-lg p-3 bg-muted/30 max-h-40 overflow-y-auto space-y-2">
              {fetchLoading ? (
                <p className="text-xs text-muted-foreground text-center py-2">Loading members...</p>
              ) : members.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">No team members found</p>
              ) : (
                members.map((member) => (
                  <label key={member.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-background cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedMemberIds.includes(member.id)}
                      onChange={() => toggleMember(member.id)}
                      className="rounded border-border text-primary focus:ring-primary/30"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm text-foreground">{member.name}</span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-border flex gap-3 bg-muted/20">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="flex-1"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
