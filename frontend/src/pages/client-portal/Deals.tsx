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

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await dealService.getAll({});
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

  return (
    <div className="h-screen overflow-hidden bg-background">
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
                <Card key={deal.id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-foreground">{deal.title}</h3>
                        <StatusBadge status={deal.status} />
                      </div>
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
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-smooth"
                          >
                            Accept Deal
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(deal.id, 'CHANGES_REQUESTED')}
                            className="px-4 py-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-smooth"
                          >
                            Request Changes
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => navigate(`/client-portal/deals/${deal.id}`)}
                        className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-smooth"
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
    </div>
  );
};

export default ClientDeals;
