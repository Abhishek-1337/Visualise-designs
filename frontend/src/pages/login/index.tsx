import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { authService } from '../../services';
import { login } from '../../store/slices/authSlice';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  submit?: string;
}

interface OAuthConfig {
  google: { enabled: boolean };
  github: { enabled: boolean };
  microsoft: { enabled: boolean };
}

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<FormData>({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthConfig, setOauthConfig] = useState<OAuthConfig>({ google: { enabled: true }, github: { enabled: true }, microsoft: { enabled: true } });

  useEffect(() => {
    authService.getOAuthConfig().then((res) => setOauthConfig(res.data)).catch(() => {});
    
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/home-dashboard');
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData?.email) newErrors.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData?.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData?.password) newErrors.password = 'Password is required';
    else if (formData?.password?.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e?.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors?.[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});

    try {
      const response = await authService.login({
        email: formData.email.trim(),
        password: formData.password
      });

      dispatch(login({ token: response.data.token }));
      navigate('/home-dashboard');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to sign in. Please try again.';
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: 'LayoutDashboard', title: 'Visual Dashboard', description: 'Your daily command center with prioritized tasks and money snapshot' },
    { icon: 'GitBranch', title: 'Lead Pipeline', description: 'Kanban-style boards with drag-and-drop for seamless workflow' },
    { icon: 'FolderKanban', title: 'Project Tracking', description: 'Lightweight milestone visualization and progress monitoring' },
    { icon: 'Users', title: 'Team Collaboration', description: 'Friendly workspace showing workloads and collective progress' }
  ];

  const oauthButtons = [
    { provider: 'google', label: 'Sign in with Google', icon: 'Chrome', color: 'bg-card text-foreground border-border hover:bg-muted', enabled: oauthConfig?.google?.enabled !== false },
    { provider: 'github', label: 'Sign in with GitHub', icon: 'Github', color: 'bg-foreground text-background border-foreground hover:opacity-90', enabled: oauthConfig?.github?.enabled !== false },
    { provider: 'microsoft', label: 'Sign in with Microsoft', icon: 'Monitor', color: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600', enabled: oauthConfig?.microsoft?.enabled !== false }
  ];

  const handleOAuthLogin = (provider) => {
    switch (provider) {
      case 'google': authService.googleLogin(); break;
      case 'github': authService.githubLogin(); break;
      case 'microsoft': authService.microsoftLogin(); break;
      default: break;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
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
              <h1 className="font-heading font-bold text-4xl lg:text-5xl text-foreground mb-4">Welcome back to your creative studio control room</h1>
              <p className="text-base lg:text-lg text-muted-foreground">Transform your architectural visualization business with a CRM that feels as creative as your work</p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {features?.map((feature, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-card rounded-lg shadow-warm-sm hover-lift">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={feature?.icon} size={20} color="var(--color-accent)" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-base text-foreground mb-1">{feature?.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature?.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Icon name="Shield" size={16} color="var(--color-success)" />
          <span>Secure authentication with OAuth2</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Icon name="Sparkles" size={24} color="var(--color-primary)" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground">Visualise CRM</span>
          </div>

          <div className="bg-card rounded-xl shadow-warm-lg p-6 sm:p-8">
            <div className="mb-8">
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground mb-2">Sign in to your account</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Choose your preferred sign-in method</p>
            </div>

            <div className="space-y-3 mb-6">
              {oauthButtons.filter((btn) => btn.enabled).map((btn) => (
                <Button
                  key={btn.provider}
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => handleOAuthLogin(btn.provider)}
                  className={btn.color}
                >
                  <Icon name={btn.icon} size={20} />
                  {btn.label}
                </Button>
              ))}
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="Email Address" type="email" name="email" placeholder="you@example.com" value={formData?.email} onChange={handleInputChange} error={errors?.email} required disabled={isLoading} />
              <div className="relative">
                <Input label="Password" type={showPassword ? 'text' : 'password'} name="password" placeholder="Enter your password" value={formData?.password} onChange={handleInputChange} error={errors?.password} required disabled={isLoading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] p-1 rounded-md transition-smooth hover:bg-muted active-press">
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} color="var(--color-muted-foreground)" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <Checkbox label="Remember me" checked={formData?.rememberMe} onChange={(e) => setFormData((prev) => ({ ...prev, rememberMe: e?.target?.checked }))} disabled={isLoading} />
                <Link to="/forgot-password" className="text-sm font-medium text-accent hover:text-accent/80 transition-smooth">Forgot password?</Link>
              </div>
              {errors?.submit && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                  <Icon name="AlertCircle" size={20} color="var(--color-destructive)" className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive/80 whitespace-pre-line">{errors?.submit}</p>
                </div>
              )}
              <Button type="submit" variant="default" size="lg" fullWidth loading={isLoading} iconName="LogIn" iconPosition="right">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-accent hover:text-accent/80 transition-smooth">Create Account</Link>
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Want to register your company?{' '}
                <Link to="/tenant-signup" className="font-medium text-primary hover:text-primary/80 transition-smooth">Sign up as Studio</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
