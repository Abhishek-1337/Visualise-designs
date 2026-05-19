import React, { useEffect, useState } from 'react';
import Sidebar, { TopBar } from '../../components/ui/Header';
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
      <TopBar />
      <main className="md:ml-[240px] pt-[60px]">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">Payments</h1>
            <p className="text-muted-foreground">Manage invoices and receive payments</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl shadow-warm-md p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Receipt" size={20} />
                Invoices
              </h2>
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded" />)}
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="FileText" size={40} className="mx-auto mb-2" />
                  <p>No invoices yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {inv.contact?.firstName} {inv.contact?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">#{inv.invoiceNumber}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">{formatCurrency(inv.total)}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(inv.status)}`}>
                          {inv.status}
                        </span>
                        {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                          <Button size="sm" onClick={() => handlePay(inv.id)}>Pay Now</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl shadow-warm-md p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon name="CreditCard" size={20} />
                Payment History
              </h2>
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded" />)}
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="DollarSign" size={40} className="mx-auto mb-2" />
                  <p>No payments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((pay: any) => (
                    <div key={pay.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {formatCurrency(pay.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(pay.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(pay.status)}`}>
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
