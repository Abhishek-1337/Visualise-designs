import React from 'react';
import Icon from '../../../components/AppIcon';

const FeatureHighlights = () => {
  const features = [
    {
      icon: 'LayoutDashboard',
      title: 'Visual Dashboard',
      description: 'Track leads, projects, and revenue in one beautiful view'
    },
    {
      icon: 'Users',
      title: 'Team Collaboration',
      description: 'Work together seamlessly with your creative team'
    },
    {
      icon: 'TrendingUp',
      title: 'Smart Analytics',
      description: 'Make data-driven decisions with powerful insights'
    },
    {
      icon: 'Zap',
      title: 'Automation',
      description: 'Reduce manual work with intelligent follow-ups'
    }
  ];

  return (
    <div className="space-y-4 md:space-y-5 lg:space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground">
          Why Creative Studios Choose Us
        </h3>
        <p className="text-sm md:text-base text-muted-foreground">
          Built specifically for architectural visualization professionals
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
        {features?.map((feature, index) => (
          <div
            key={index}
            className="bg-card rounded-lg md:rounded-xl p-4 md:p-5 lg:p-6 border border-border hover-lift transition-smooth"
          >
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name={feature?.icon} size={20} color="var(--color-primary)" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base md:text-lg font-heading font-semibold text-foreground mb-1">
                  {feature?.title}
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                  {feature?.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-accent/10 rounded-lg md:rounded-xl p-4 md:p-5 lg:p-6 border border-accent/20">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="Shield" size={20} color="var(--color-accent)" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base md:text-lg font-heading font-semibold text-foreground mb-1">
              Enterprise-Grade Security
            </h4>
            <p className="text-xs md:text-sm text-muted-foreground">
              Your client data is protected with bank-level encryption and regular security audits
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureHighlights;