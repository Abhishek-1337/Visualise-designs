import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import TenantSignupForm from './components/TenantSignupForm';

const TenantSignup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) navigate('/home-dashboard');
  }, [navigate]);

  return (
    <>
      <Helmet>
        <title>Company Sign Up - Visualise CRM</title>
        <meta name="description" content="Register your company on Visualise CRM and start managing architectural visualization projects" />
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col lg:flex-row">
        {/* Left Section - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 p-8 lg:p-12 flex-col justify-between">
          <div>
            <Link to="/login" className="flex items-center gap-3 mb-12 transition-smooth hover:opacity-80">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Icon name="Sparkles" size={28} color="var(--color-primary)" />
              </div>
              <span className="font-heading font-bold text-2xl text-foreground">Visualise CRM</span>
            </Link>
            <div className="space-y-8 mb-12">
              <div>
                <h1 className="font-heading font-bold text-4xl lg:text-5xl text-foreground mb-4">Empower your creative studio</h1>
                <p className="text-base lg:text-lg text-muted-foreground">The all-in-one workspace for high-end visualization agencies</p>
              </div>
              <div className="space-y-4">
                {[
                  { icon: 'Building', title: 'Company Workspace', description: 'Centralize all projects under your company brand' },
                  { icon: 'ShieldCheck', title: 'Admin Controls', description: 'Manage team access and project permissions' },
                  { icon: 'BarChart3', title: 'Studio Analytics', description: 'Track studio-wide revenue and performance' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-card rounded-lg shadow-warm-sm">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name={feature.icon} size={20} color="var(--color-accent)" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-base text-foreground mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Icon name="Globe" size={16} color="var(--color-primary)" />
            <span>Built for international creative studios</span>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-xl shadow-warm-lg p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground mb-2">Register Company</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Create a new workspace for your team</p>
              </div>

              <TenantSignupForm />

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-smooth hover:underline">Sign In</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TenantSignup;
