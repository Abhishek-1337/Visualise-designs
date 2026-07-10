import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store';
import Icon from '../../../components/AppIcon';
import { fetchFinancial } from '../../../store/slices/projectSlice';

const MoneySnapshotCard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { financial } = useSelector((state: RootState) => state.dashboard as any);

  useEffect(() => {
    dispatch(fetchFinancial());
  }, [dispatch]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const financialData = {
    totalRevenue: financial?.totalRevenue || 0,
    pendingPayments: financial?.pending || 0,
    overduePayments: financial?.overdue || 0,
  };

  const transactions = financial?.recentTransactions?.slice(0, 4)?.map((tx: any) => ({
    id: tx.id,
    client: tx.contact?.company || `${tx.contact?.firstName} ${tx.contact?.lastName}`,
    project: tx.description || 'Invoice payment',
    amount: tx.total,
    status: tx.status?.toLowerCase(),
    date: tx.dueDate,
    daysOverdue: tx.status === 'OVERDUE' ? Math.floor((Date.now() - new Date(tx.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : null,
  })) || [];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid': return { color: 'text-success', icon: 'CheckCircle2', label: 'Paid' };
      case 'pending': return { color: 'text-warning', icon: 'Clock', label: 'Pending' };
      case 'overdue': return { color: 'text-error', icon: 'AlertCircle', label: 'Overdue' };
      default: return { color: 'text-muted-foreground', icon: 'Circle', label: 'Unknown' };
    }
  };

  const metrics = [
    { label: 'Revenue', value: formatCurrency(financialData.totalRevenue), icon: 'TrendingUp', color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Pending', value: formatCurrency(financialData.pendingPayments), icon: 'Clock', color: 'text-warning', bg: 'bg-warning/5' },
    { label: 'Overdue', value: formatCurrency(financialData.overduePayments), icon: 'AlertCircle', color: 'text-error', bg: 'bg-error/5' },
    { label: 'Transactions', value: String(transactions.length), icon: 'Receipt', color: 'text-accent', bg: 'bg-accent/5' },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
          <Icon name="DollarSign" size={18} color="var(--color-accent)" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Money Snapshot</h2>
          <p className="text-xs text-muted-foreground">Financial overview</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {metrics.map((m) => (
          <div key={m.label} className={`${m.bg} rounded-lg p-3 border border-border/50`}>
            <div className="flex items-center gap-1.5 mb-1">
              <Icon name={m.icon} size={14} color="currentColor" className={m.color} />
              <span className="text-[11px] text-muted-foreground">{m.label}</span>
            </div>
            <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Recent Transactions</h3>
      {transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
      ) : (
        <div className="space-y-2">
          {transactions?.map((tx: any) => {
            const sc = getStatusConfig(tx.status);
            return (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{tx.client}</span>
                    <span className={`text-[10px] font-medium flex items-center gap-1 ${sc.color}`}>
                      <Icon name={sc.icon} size={10} />
                      {sc.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{tx.project}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                    <span>{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    {tx.daysOverdue && <span className="text-error">{tx.daysOverdue}d overdue</span>}
                  </div>
                </div>
                <span className="text-sm font-bold text-foreground ml-3">{formatCurrency(tx.amount)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MoneySnapshotCard;
