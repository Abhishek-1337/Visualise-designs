import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { invoiceService, paymentService } from '../../services';

const Payments = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, payRes] = await Promise.all([
        invoiceService.getAll({ limit: '50' }),
        paymentService.getPayments({})
      ]);
      setInvoices(invRes.data.invoices || []);
      setPayments(payRes.data.payments || []);
    } catch (err) {
      console.error('Failed to load payment data', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (invoiceId: string) => {
    try {
      const res = await paymentService.createCheckoutSession({ invoiceId });
      const { url } = res.data;
      if (url) {
        window.open(url, '_blank');
      } else {
        alert('Payment recorded as pending. Stripe is not configured.');
        loadData();
      }
    } catch (err) {
      console.error('Payment failed', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-success/10 text-success border-success/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'overdue': return 'bg-error/10 text-error border-error/20';
      case 'draft': return 'bg-muted text-muted-foreground border-border';
      case 'cancelled': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-[260px]">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
          <div className="mb-6 md:mb-8 animate-fade-in">
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-2">Payments</h1>
            <p className="text-muted-foreground">Manage invoices and receive payments</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl shadow-soft-md p-6 hover-lift transition-smooth">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Icon name="Receipt" size={18} color="var(--color-primary)" />
                </div>
                Invoices
              </h2>
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-lg" />)}
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon name="FileText" size={24} color="var(--color-muted-foreground)" />
                  </div>
                  <p className="text-sm font-medium">No invoices yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-muted/30 transition-smooth">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {inv.contact?.firstName} {inv.contact?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">#{inv.invoiceNumber}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">{formatCurrency(inv.total)}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(inv.status)}`}>
                          {inv.status}
                        </span>
                        {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                          <Button size="sm" variant="default" onClick={() => handlePay(inv.id)}>Pay Now</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl shadow-soft-md p-6 hover-lift transition-smooth">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Icon name="CreditCard" size={18} color="var(--color-accent)" />
                </div>
                Payment History
              </h2>
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-lg" />)}
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon name="DollarSign" size={24} color="var(--color-muted-foreground)" />
                  </div>
                  <p className="text-sm font-medium">No payments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((pay: any) => (
                    <div key={pay.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-muted/30 transition-smooth">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-success/10 rounded-lg flex items-center justify-center">
                          <Icon name="Check" size={16} color="var(--color-success)" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {formatCurrency(pay.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(pay.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(pay.status)}`}>
                        {pay.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payments;
