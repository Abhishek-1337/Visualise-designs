import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { inviteService, authService } from '../../services';

interface InviteDetails {
  email: string;
  role: string;
  companyName: string;
}

const roleLabels = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee'
};

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided');
      setLoading(false);
      return;
    }

    inviteService.getByToken(token)
      .then((res) => {
        setInvite(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Invalid or expired invitation');
        setLoading(false);
      });
  }, [token]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Name is required';
    if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await inviteService.accept(token!, { name: name.trim(), password });
      authService.setToken(res.data.token);
      if (res.data.user?.role === 'CLIENT') {
        navigate('/client-portal');
      } else {
        navigate('/home-dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to accept invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const passwordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    const levels = [
      { strength: 1, label: 'Weak', color: 'bg-error' },
      { strength: 2, label: 'Fair', color: 'bg-warning' },
      { strength: 3, label: 'Good', color: 'bg-accent' },
      { strength: 4, label: 'Strong', color: 'bg-success' }
    ];
    return levels.find(l => l.strength === strength) || levels[0];
  };

  const strength = passwordStrength(password);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-warm-offwhite to-indigo-50/30 flex items-center justify-center">
        <div className="animate-fade-in">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <>
        <Helmet>
          <title>Invalid Invitation - Visualise CRM</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-warm-offwhite to-indigo-50/30 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-soft-lg p-8 max-w-md w-full text-center animate-fade-in">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="XCircle" size={32} color="var(--color-error)" />
            </div>
            <h1 className="font-heading font-bold text-xl text-foreground mb-2">Invalid Invitation</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover:opacity-90 shadow-soft-sm">
              <Icon name="ArrowLeft" size={16} color="currentColor" />
              Go to Login
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Accept Invitation - Visualise CRM</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-warm-offwhite to-indigo-50/30 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-accent/20">
              <Icon name="Sparkles" size={30} color="var(--color-accent)" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-foreground">Accept Invitation</h1>
            <p className="text-muted-foreground mt-1">
              You've been invited to join <span className="font-semibold text-foreground">{invite?.companyName}</span>
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-soft-lg p-6 sm:p-8">
            <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Mail" size={16} color="var(--color-primary)" />
                <span className="text-sm text-foreground font-medium">{invite?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="UserCheck" size={16} color="var(--color-primary)" />
                <span className="text-sm text-muted-foreground">
                  Role: <span className="font-medium text-foreground">{roleLabels[invite?.role] || invite?.role}</span>
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              <Input
                label="Full Name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => { setName(e.target.value); setFormErrors((prev) => ({ ...prev, name: '' })); }}
                error={formErrors.name}
                required
              />

              <div className="space-y-2">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFormErrors((prev) => ({ ...prev, password: '' })); }}
                  error={formErrors.password}
                  required
                />
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Password strength</span>
                      <span className="text-xs font-medium">{strength.label}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full transition-all rounded-full ${strength.color}`} style={{ width: `${(strength.strength / 4) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setFormErrors((prev) => ({ ...prev, confirmPassword: '' })); }}
                error={formErrors.confirmPassword}
                required
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded border-border bg-background text-accent focus:ring-accent/40"
                />
                <label htmlFor="showPassword" className="text-xs text-muted-foreground">Show password</label>
              </div>

              <Button type="submit" variant="default" size="lg" fullWidth loading={submitting} iconName="UserPlus" iconPosition="left" className="bg-slate-700 dark:text-slate-200">
                Accept Invitation & Set Up Account
              </Button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-800">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-700 hover:text-primary/80 font-medium transition-smooth">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AcceptInvite;
