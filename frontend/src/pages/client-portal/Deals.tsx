import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { TopBar } from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import { Card, StatusBadge, EmptyState } from '../../components/shared';
import { dealService } from '../../services';

const ClientDeals = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestDealId, setRequestDealId] = useState<string | null>(null);
  const [requestNotes, setRequestNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await dealService.getAll({});
      console.log(res);
      setDeals(res.data.deals || []);
    } catch (error) {
      console.error('Failed to fetch deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (dealId: string, status: string) => {
    try {
      await dealService.update(dealId, { status });
      fetchDeals();
    } catch (error) {
      console.error('Failed to update deal status:', error);
    }
  };

  const handleOpenRequestModal = (dealId: string) => {
    setRequestDealId(dealId);
    setRequestNotes('');
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async () => {
    if (!requestDealId) return;
    try {
      setSubmitting(true);
      await dealService.update(requestDealId, {
        status: 'CHANGES_REQUESTED',
        changeRequestNotes: requestNotes.trim() || 'No details provided',
      });
      setShowRequestModal(false);
      fetchDeals();
    } catch (error) {
      console.error('Failed to submit change request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-background animate-fade-in">
      <Sidebar />
      <TopBar />
      <main className="md:ml-[240px] h-screen pt-[60px] overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Your Deals</h1>
              <p className="text-muted-foreground">View and manage your service proposals.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : deals.length === 0 ? (
            <EmptyState icon="Briefcase" title="No deals found" description="When a team member creates a proposal for you, it will appear here." />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {deals.map((deal) => (
                <Card key={deal.id} hover className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-foreground">{deal.title}</h3>
                        <StatusBadge status={deal.status} />
                      </div>
                      {deal.status === 'CHANGES_REQUESTED' && deal.changeRequestNotes && (
                        <div className="flex items-start gap-2 mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-lg">
                          <Icon name="MessageSquare" size={14} color="var(--color-warning)" className="mt-0.5 shrink-0" />
                          <p className="text-xs text-amber-800 dark:text-amber-300">{deal.changeRequestNotes}</p>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{deal.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="DollarSign" size={12} />
                          Budget: ${deal.value.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Calendar" size={12} />
                          Updated: {new Date(deal.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {deal.status === 'SENT' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(deal.id, 'ACCEPTED')}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-emerald-700 hover:to-emerald-600 shadow-soft-sm transition-all duration-200 active-press"
                          >
                            Accept Deal
                          </button>
                          <button
                            onClick={() => handleOpenRequestModal(deal.id)}
                            className="px-4 py-2 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200/50 dark:border-amber-800/30 transition-all duration-200 active-press"
                          >
                            Request Changes
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => navigate(`/client-portal/deals/${deal.id}`)}
                        className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 border border-border transition-all duration-200 active-press"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {showRequestModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/60 backdrop-blur-xl" onClick={() => setShowRequestModal(false)}>
          <div
            className="bg-card rounded-xl shadow-soft-2xl w-full max-w-lg border border-border animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-lg text-foreground">Request Changes</h2>
              <button onClick={() => setShowRequestModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-smooth">
                <Icon name="X" size={18} color="currentColor" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Describe what changes you need</label>
                <textarea
                  rows={5}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="Please describe the changes or adjustments you'd like to make to this proposal..."
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-smooth"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-smooth shadow-soft-sm"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDeals;
