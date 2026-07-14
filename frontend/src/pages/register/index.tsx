import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import RegistrationForm from './components/RegistrationForm';
import { authService } from '../../services';

const Register = () => {
  const navigate = useNavigate();
  const [oauthConfig, setOauthConfig] = useState({ google: { enabled: true }, github: { enabled: true }, microsoft: { enabled: true } });

  useEffect(() => {
    authService.getOAuthConfig().then((res) => setOauthConfig(res.data)).catch(() => {});
    const token = localStorage.getItem('authToken');
    if (token) navigate('/home-dashboard');
  }, [navigate]);

  const handleOAuthLogin = (provider) => {
    switch (provider) {
      case 'google': authService.googleLogin(); break;
      case 'github': authService.githubLogin(); break;
      case 'microsoft': authService.microsoftLogin(); break;
      default: break;
    }
  };

  const oauthButtons = [
    { provider: 'google', label: 'Sign up with Google', icon: 'Chrome', color: 'bg-card text-foreground border-border hover:bg-muted' },
    { provider: 'github', label: 'Sign up with GitHub', icon: 'Github', color: 'bg-foreground text-background border-foreground hover:opacity-90' },
    { provider: 'microsoft', label: 'Sign up with Microsoft', icon: 'Monitor', color: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' }
  ];

  return (
    <>
      <Helmet>
        <title>Create Account - Visualise CRM</title>
        <meta name="description" content="Join Visualise CRM and transform how you manage architectural visualization projects and client relationships" />
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
                <h1 className="font-heading font-bold text-4xl lg:text-5xl text-white mb-4 leading-tight">Start managing your clients today</h1>
                <p className="text-base lg:text-lg text-indigo-200">A CRM built for creative professionals who work with international clients</p>
              </div>
              <div className="space-y-4">
                {[
                  { icon: 'LayoutDashboard', title: 'Visual Dashboard', description: 'Your daily command center with prioritized tasks' },
                  { icon: 'GitBranch', title: 'Lead Pipeline', description: 'Kanban-style boards with drag-and-drop workflow' },
                  { icon: 'FolderKanban', title: 'Project Tracking', description: 'Milestone visualization and progress monitoring' },
                  { icon: 'Users', title: 'Team Collaboration', description: 'Workload management and collective progress' }
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
            <Icon name="Shield" size={16} color="#34D399" />
            <span>Secure OAuth2 authentication</span>
          </div>
        </div>

        {/* Right Section - Registration Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <div className="w-full max-w-md animate-fade-in">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Icon name="Sparkles" size={24} color="var(--color-primary-foreground)" />
              </div>
              <span className="font-heading font-bold text-xl text-foreground">Visualise CRM</span>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-soft-lg p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground mb-2">Create your account</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Sign up to get started with Visualise CRM</p>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3 mb-6">
                {oauthButtons.map((btn) => (
                  <Button
                    key={btn.provider}
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={() => handleOAuthLogin(btn.provider)}
                    className={btn.color}
                  >
                    <Icon name={btn.icon} size={20} className="mr-3" />
                    {btn.label}
                  </Button>
                ))}
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or sign up with email</span>
                </div>
              </div>

              <RegistrationForm />

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-smooth">Sign In</Link>
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs md:text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-smooth">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-foreground transition-smooth">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-foreground transition-smooth">Help Center</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
