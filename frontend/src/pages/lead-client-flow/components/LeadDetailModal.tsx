import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const LeadDetailModal = ({ lead, onClose }) => {
  if (!lead) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-lg shadow-soft-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border/50 animate-slide-up">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="font-heading font-semibold text-xl text-foreground">Lead Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-smooth active-press"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} color="currentColor" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            {lead?.avatar ? (
              <Image
                src={lead.avatar}
                alt={lead.avatarAlt}
                className="w-20 h-20 rounded-full object-cover flex-shrink-0 ring-2 ring-card"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ring-2 ring-card text-2xl font-bold text-primary">
                {lead?.clientName?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-2xl text-foreground mb-1">
                {lead?.clientName}
              </h3>
              <p className="text-base text-muted-foreground mb-2">{lead?.company}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {lead?.projectType}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  lead?.priority === 'high' ? 'bg-error/10 text-error' :
                  lead?.priority === 'medium'? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                }`}>
                  {lead?.priority?.charAt(0)?.toUpperCase() + lead?.priority?.slice(1)} Priority
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-background rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="DollarSign" size={18} color="var(--color-primary)" />
                <span className="text-sm font-medium text-muted-foreground">Estimated Value</span>
              </div>
              <p className="font-heading font-semibold text-2xl text-foreground">
                {formatCurrency(lead?.estimatedValue)}
              </p>
            </div>

            <div className="bg-background rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Calendar" size={18} color="var(--color-secondary)" />
                <span className="text-sm font-medium text-muted-foreground">Last Contact</span>
              </div>
              <p className="font-heading font-semibold text-lg text-foreground">
                {formatDate(lead?.lastContact)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-base text-foreground">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name="Mail" size={16} color="var(--color-primary)" />
                </div>
                <span className="text-sm text-foreground">{lead?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Icon name="Phone" size={16} color="var(--color-secondary)" />
                </div>
                <span className="text-sm text-foreground">{lead?.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Icon name="MapPin" size={16} color="var(--color-accent)" />
                </div>
                <span className="text-sm text-foreground">{lead?.location}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-base text-foreground">Project Details</h4>
            <p className="text-sm text-foreground leading-relaxed">{lead?.projectDescription}</p>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-base text-foreground">Lead Source</h4>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Icon name="TrendingUp" size={16} color="var(--color-accent)" />
              </div>
              <span className="text-sm text-foreground capitalize">{lead?.source}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-base text-foreground">Assigned To</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Icon name="User" size={18} color="#FFFFFF" />
              </div>
              <span className="text-sm text-foreground">{lead?.assignedToName}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button variant="default" iconName="Phone" iconPosition="left" fullWidth>
              Call Client
            </Button>
            <Button variant="outline" iconName="Mail" iconPosition="left" fullWidth>
              Send Email
            </Button>
            <Button variant="secondary" iconName="Calendar" iconPosition="left" fullWidth>
              Schedule Meeting
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;