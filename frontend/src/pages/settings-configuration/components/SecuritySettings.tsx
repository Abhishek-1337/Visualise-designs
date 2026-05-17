import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const SecuritySettings = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('8h');
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: false,
    expiryDays: 90
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const activeSessions = [
    { id: 1, device: 'MacBook Pro', browser: 'Chrome 120', location: 'New York, US', lastActive: 'Now', current: true },
    { id: 2, device: 'iPhone 15', browser: 'Safari Mobile', location: 'New York, US', lastActive: '2 hours ago', current: false },
    { id: 3, device: 'Windows PC', browser: 'Firefox 121', location: 'Brooklyn, US', lastActive: '1 day ago', current: false }
  ];

  const securityScore = twoFactorEnabled ? 85 : 60;

  return (
    <div className="space-y-8">
      {/* Security Score */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-warm-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Shield" size={18} color="var(--color-primary)" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground">Security Score</h3>
              <p className="text-xs text-muted-foreground">Your account security level</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-3xl font-heading font-bold ${
              securityScore >= 80 ? 'text-success' : securityScore >= 60 ? 'text-warning' : 'text-error'
            }`}>{securityScore}</span>
            <span className="text-muted-foreground text-sm">/100</span>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-smooth ${
              securityScore >= 80 ? 'bg-success' : securityScore >= 60 ? 'bg-warning' : 'bg-error'
            }`}
            style={{ width: `${securityScore}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {securityScore >= 80 ? '✅ Strong security' : '⚠️ Enable 2FA to improve your score'}
        </p>
      </div>
      {/* Two-Factor Auth */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-warm-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon name="Smartphone" size={18} color="var(--color-accent)" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-base text-foreground">Two-Factor Authentication</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Add an extra layer of security to your account</p>
            </div>
          </div>
          <button
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`relative w-11 h-6 rounded-full transition-smooth ${
              twoFactorEnabled ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-background rounded-full shadow transition-smooth ${
              twoFactorEnabled ? 'left-[22px]' : 'left-0.5'
            }`} />
          </button>
        </div>
        {twoFactorEnabled && (
          <div className="mt-4 p-3 bg-success/5 border border-success/20 rounded-lg">
            <p className="text-xs text-success font-medium">✓ Two-factor authentication is enabled</p>
            <p className="text-xs text-muted-foreground mt-1">Authenticator app configured</p>
          </div>
        )}
      </div>
      {/* Password Policy */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-warm-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center">
            <Icon name="Lock" size={18} color="var(--color-secondary)" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base text-foreground">Password Policy</h3>
            <p className="text-xs text-muted-foreground">Requirements for team passwords</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Minimum Length</p>
              <p className="text-xs text-muted-foreground">Characters required</p>
            </div>
            <select
              value={passwordPolicy?.minLength}
              onChange={(e) => setPasswordPolicy(prev => ({ ...prev, minLength: Number(e?.target?.value) }))}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              {[6, 8, 10, 12, 16]?.map(n => <option key={n} value={n}>{n} characters</option>)}
            </select>
          </div>
          {[
            { key: 'requireUppercase', label: 'Require Uppercase', desc: 'At least one uppercase letter' },
            { key: 'requireNumbers', label: 'Require Numbers', desc: 'At least one number' },
            { key: 'requireSymbols', label: 'Require Symbols', desc: 'At least one special character' },
          ]?.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2 border-t border-border">
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <button
                onClick={() => setPasswordPolicy(prev => ({ ...prev, [key]: !prev?.[key] }))}
                className={`relative w-11 h-6 rounded-full transition-smooth ${
                  passwordPolicy?.[key] ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-background rounded-full shadow transition-smooth ${
                  passwordPolicy?.[key] ? 'left-[22px]' : 'left-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="mt-4 flex items-center gap-2 text-sm text-primary font-medium hover:opacity-80 transition-smooth"
        >
          <Icon name="Key" size={14} color="currentColor" />
          Change Password
        </button>
        {showPasswordForm && (
          <div className="mt-4 space-y-3 p-4 bg-muted/30 rounded-lg">
            <input type="password" placeholder="Current password" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
            <input type="password" placeholder="New password" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
            <input type="password" placeholder="Confirm new password" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover:opacity-90">Update Password</button>
          </div>
        )}
      </div>
      {/* Active Sessions */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-warm-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-warning/10 rounded-lg flex items-center justify-center">
            <Icon name="Monitor" size={18} color="var(--color-warning)" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base text-foreground">Active Sessions</h3>
            <p className="text-xs text-muted-foreground">{activeSessions?.length} devices signed in</p>
          </div>
        </div>
        <div className="space-y-3">
          {activeSessions?.map((session) => (
            <div key={session?.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <Icon name={session?.device?.includes('iPhone') ? 'Smartphone' : 'Monitor'} size={18} color="var(--color-muted-foreground)" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{session?.device}</p>
                    {session?.current && (
                      <span className="px-1.5 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">Current</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{session?.browser} · {session?.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{session?.lastActive}</p>
                {!session?.current && (
                  <button className="text-xs text-error hover:opacity-80 transition-smooth mt-0.5">Revoke</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-foreground">Session Timeout</label>
            <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
          </div>
          <select
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(e?.target?.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            <option value="1h">1 hour</option>
            <option value="4h">4 hours</option>
            <option value="8h">8 hours</option>
            <option value="24h">24 hours</option>
            <option value="never">Never</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
