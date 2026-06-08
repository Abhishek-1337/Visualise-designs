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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-warm-offwhite to-indigo-50/30 flex flex-col lg:flex-row">
        {/* Left Section - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-800 p-8 lg:p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
          <div className="relative z-10">
            <Link to="/login" className="flex items-center gap-3 mb-12 transition-smooth hover:opacity-80">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Icon name="Sparkles" size={28} color="#fff" />
              </div>
              <span className="font-heading font-bold text-2xl text-white">Visualise CRM</span>
            </Link>
            <div className="space-y-8 mb-12">
              <div>
                <h1 className="font-heading font-bold text-4xl lg:text-5xl text-white mb-4 leading-tight">Empower your creative studio</h1>
                <p className="text-base lg:text-lg text-indigo-200">The all-in-one workspace for high-end visualization agencies</p>
              </div>
              <div className="space-y-4">
                {[
                  { icon: 'Building', title: 'Company Workspace', description: 'Centralize all projects under your company brand' },
                  { icon: 'ShieldCheck', title: 'Admin Controls', description: 'Manage team access and project permissions' },
                  { icon: 'BarChart3', title: 'Studio Analytics', description: 'Track studio-wide revenue and performance' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-smooth">
                    <div className="w-10 h-10 bg-amber-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name={feature.icon} size={20} color="#FBBF24" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-base text-white mb-1">{feature.title}</h3>
                      <p className="text-sm text-indigo-200">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-3 text-sm text-indigo-200">
            <Icon name="Globe" size={16} color="#60A5FA" />
            <span>Built for international creative studios</span>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <div className="w-full max-w-md animate-fade-in">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Icon name="Sparkles" size={24} color="var(--color-primary-foreground)" />
              </div>
              <span className="font-heading font-bold text-xl text-foreground">Visualise CRM</span>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-soft-lg p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground mb-2">Register Company</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Create a new workspace for your team</p>
              </div>

              <TenantSignupForm />

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-smooth">Sign In</Link>
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
