import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { fetchFinancial } from '../../../store/slices/projectSlice';

const MoneySnapshotCard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { financial } = useSelector((state: RootState) => state.dashboard as any);

  useEffect(() => {
    dispatch(fetchFinancial());
  }, [dispatch]);

  const financialData = {
    totalRevenue: financial?.totalRevenue || 0,
    pendingPayments: financial?.pending || 0,
    overduePayments: financial?.overdue || 0,
    currency: 'USD'
  };

  const revenueStreams = financial?.recentTransactions?.slice(0, 4)?.map((tx, idx) => ({
    id: idx + 1,
    client: tx.contact?.company || `${tx.contact?.firstName} ${tx.contact?.lastName}`,
    project: tx.description || 'Invoice payment',
    amount: tx.total,
    status: tx.status?.toLowerCase(),
    date: tx.dueDate,
    paymentMethod: 'Bank Transfer',
    daysOverdue: tx.status === 'OVERDUE' ? Math.floor((Date.now() - new Date(tx.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : null
  })) || [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: financialData.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })?.format(amount);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'paid': return { color: 'bg-success/10 text-success border-success/20', icon: 'CheckCircle2', label: 'Paid' };
      case 'pending': return { color: 'bg-warning/10 text-warning border-warning/20', icon: 'Clock', label: 'Pending' };
      case 'overdue': return { color: 'bg-error/10 text-error border-error/20', icon: 'AlertCircle', label: 'Overdue' };
      default: return { color: 'bg-muted text-muted-foreground border-border', icon: 'Circle', label: 'Unknown' };
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-soft-lg p-5 md:p-6 lg:p-8 transition-smooth hover-lift border border-border/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-amber-100 flex items-center justify-center">
            <Icon name="DollarSign" size={20} color="var(--color-accent)" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground">Money Snapshot</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Financial overview</p>
          </div>
        </div>
        <Button variant="outline" size="sm" iconName="TrendingUp" iconPosition="left">View Reports</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5 md:mb-6">
        <div className="bg-primary/5 rounded-lg p-3 md:p-4 border border-primary/10">
          <div className="flex items-center gap-2 mb-2"><Icon name="TrendingUp" size={16} color="var(--color-primary)" /><span className="text-xs md:text-sm text-muted-foreground">Total Revenue</span></div>
          <p className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-primary data-text">{formatCurrency(financialData?.totalRevenue)}</p>
        </div>
        <div className="bg-warning/5 rounded-lg p-3 md:p-4 border border-warning/10">
          <div className="flex items-center gap-2 mb-2"><Icon name="Clock" size={16} color="var(--color-warning)" /><span className="text-xs md:text-sm text-muted-foreground">Pending</span></div>
          <p className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-warning data-text">{formatCurrency(financialData?.pendingPayments)}</p>
        </div>
        <div className="bg-error/5 rounded-lg p-3 md:p-4 border border-error/10">
          <div className="flex items-center gap-2 mb-2"><Icon name="AlertCircle" size={16} color="var(--color-error)" /><span className="text-xs md:text-sm text-muted-foreground">Overdue</span></div>
          <p className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-error data-text">{formatCurrency(financialData?.overduePayments)}</p>
        </div>
        <div className="bg-accent/5 rounded-lg p-3 md:p-4 border border-accent/10">
          <div className="flex items-center gap-2 mb-2"><Icon name="Calendar" size={16} color="var(--color-accent)" /><span className="text-xs md:text-sm text-muted-foreground">Transactions</span></div>
          <p className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-accent data-text">{revenueStreams.length}</p>
        </div>
      </div>
      <div className="space-y-3 md:space-y-4">
        <h3 className="text-sm md:text-base font-medium text-foreground flex items-center gap-2"><Icon name="Receipt" size={18} />Recent Transactions</h3>
        {revenueStreams.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No transactions yet</p>
        ) : (
          revenueStreams?.map((stream) => {
            const statusConfig = getStatusConfig(stream?.status);
            return (
              <div key={stream?.id} className="group p-3 md:p-4 rounded-lg border border-border bg-background hover:border-primary/30 hover:shadow-soft-sm transition-smooth">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm md:text-base font-medium text-foreground truncate">{stream?.client}</h4>
                        <p className="text-xs md:text-sm text-muted-foreground truncate mt-0.5">{stream?.project}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${statusConfig?.color}`}>
                        <Icon name={statusConfig?.icon} size={12} />{statusConfig?.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5"><Icon name="Calendar" size={14} /><span>{new Date(stream.date)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
                      {stream?.daysOverdue && <div className="flex items-center gap-1.5 text-error"><Icon name="AlertTriangle" size={14} /><span>{stream?.daysOverdue} days overdue</span></div>}
                    </div>
                  </div>
                  <p className="text-lg md:text-xl lg:text-2xl font-heading font-bold text-foreground data-text whitespace-nowrap">{formatCurrency(stream?.amount)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="mt-5 md:mt-6 pt-5 md:pt-6 border-t border-border">
        <Button variant="outline" fullWidth iconName="ArrowRight" iconPosition="right">View All Financial Records</Button>
      </div>
    </div>
  );
};

export default MoneySnapshotCard;