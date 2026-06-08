import React from 'react';
import Icon from '../../../components/AppIcon';

const PaymentsTab = () => {
  const invoices = [
    { id: 'INV-2025-001', description: 'Phase 1 - Concept Renders', amount: 15000, status: 'overdue', dueDate: new Date('2025-12-01'), paidDate: null },
    { id: 'INV-2025-002', description: 'Phase 2 - Detailed Visualization', amount: 22500, status: 'pending', dueDate: new Date('2026-01-15'), paidDate: null },
    { id: 'INV-2025-003', description: 'Initial Deposit - Project Kickoff', amount: 8500, status: 'paid', dueDate: new Date('2025-10-25'), paidDate: new Date('2025-10-23') },
    { id: 'INV-2025-004', description: 'Mood Board & Research Phase', amount: 4000, status: 'paid', dueDate: new Date('2025-11-10'), paidDate: new Date('2025-11-08') }
  ];

  const statusConfig = {
    paid: { color: 'bg-success/10 text-success', icon: 'CheckCircle', label: 'Paid' },
    pending: { color: 'bg-warning/10 text-warning', icon: 'Clock', label: 'Pending' },
    overdue: { color: 'bg-error/10 text-error', icon: 'AlertCircle', label: 'Overdue' }
  };

  const totalRevenue = invoices?.filter(i => i?.status === 'paid')?.reduce((sum, i) => sum + i?.amount, 0);
  const totalPending = invoices?.filter(i => i?.status === 'pending')?.reduce((sum, i) => sum + i?.amount, 0);
  const totalOverdue = invoices?.filter(i => i?.status === 'overdue')?.reduce((sum, i) => sum + i?.amount, 0);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })?.format(amount);
  const formatDate = (date) => date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Received', value: formatCurrency(totalRevenue), icon: 'TrendingUp', color: 'text-success bg-success/10' },
          { label: 'Pending Payment', value: formatCurrency(totalPending), icon: 'Clock', color: 'text-warning bg-warning/10' },
          { label: 'Overdue Amount', value: formatCurrency(totalOverdue), icon: 'AlertCircle', color: 'text-error bg-error/10' }
        ]?.map((stat) => (
          <div key={stat?.label} className="bg-card rounded-xl shadow-soft-md border border-border p-5 hover-lift">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat?.color}`}>
                <Icon name={stat?.icon} size={20} color="currentColor" />
              </div>
              <span className="text-sm text-muted-foreground">{stat?.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
          </div>
        ))}
      </div>
      {totalOverdue > 0 && (
        <div className="bg-error/5 border border-error/20 rounded-xl p-4 flex items-start gap-3">
          <Icon name="AlertTriangle" size={20} color="var(--color-error)" />
          <div>
            <p className="font-medium text-error text-sm">Overdue Payment Alert</p>
            <p className="text-sm text-muted-foreground mt-1">Invoice INV-2025-001 is overdue by 27 days. Consider sending a payment reminder.</p>
            <button className="mt-2 px-4 py-1.5 bg-error text-error-foreground rounded-lg text-xs font-medium transition-smooth hover-lift shadow-soft-sm">
              Send Reminder
            </button>
          </div>
        </div>
      )}
      <div className="bg-card rounded-xl shadow-soft-md border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-card to-muted/20">
          <h3 className="font-semibold text-foreground">Invoice History</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover-lift shadow-soft-sm">
            <Icon name="Plus" size={16} color="currentColor" />
            New Invoice
          </button>
        </div>
        <div className="divide-y divide-border">
          {invoices?.map((invoice) => {
            const config = statusConfig?.[invoice?.status];
            return (
              <div key={invoice?.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-smooth">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{invoice?.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 border ${config?.color}`}>
                      <Icon name={config?.icon} size={10} color="currentColor" />
                      {config?.label}
                    </span>
                  </div>
                  <p className="font-medium text-sm text-foreground mt-1">{invoice?.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Due: {formatDate(invoice?.dueDate)}
                    {invoice?.paidDate && ` · Paid: ${formatDate(invoice?.paidDate)}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{formatCurrency(invoice?.amount)}</p>
                  <div className="flex gap-1 mt-1 justify-end">
                    <button className="p-1.5 rounded hover:bg-muted transition-smooth" title="View">
                      <Icon name="Eye" size={14} color="var(--color-muted-foreground)" />
                    </button>
                    <button className="p-1.5 rounded hover:bg-muted transition-smooth" title="Download">
                      <Icon name="Download" size={14} color="var(--color-muted-foreground)" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PaymentsTab;
