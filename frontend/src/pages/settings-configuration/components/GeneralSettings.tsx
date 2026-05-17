import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../store';
import { setThemeMode } from '../../../store/slices/themeSlice';
import type { ThemeMode } from '../../../store/slices/themeSlice';
import Icon from '../../../components/AppIcon';

const GeneralSettings = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => (state.theme as { mode: ThemeMode }).mode);
  const [language, setLanguage] = useState('en');
  const [defaultView, setDefaultView] = useState('dashboard');
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    mobile: false,
    weeklyReport: true,
    leadUpdates: true,
    projectMilestones: true,
    teamActivity: false
  });
  const [timezone, setTimezone] = useState('America/New_York');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev?.[key] }));
  };

  return (
    <div className="space-y-8">
      {/* Appearance */}
      <div className="bg-card rounded-xl p-6 shadow-warm-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Palette" size={18} color="var(--color-primary)" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground">Appearance</h3>
            <p className="text-xs text-muted-foreground">Customize how the app looks</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Theme</label>
            <div className="flex gap-3">
              {['light', 'dark', 'system']?.map((t) => (
                <button
                  key={t}
                  onClick={() => dispatch(setThemeMode(t as ThemeMode))}
                  className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium capitalize transition-smooth ${
                    theme === t
                      ? 'bg-primary text-primary-foreground border-primary shadow-warm-sm'
                      : 'bg-background text-foreground border-border hover:border-primary/40'
                  }`}
                >
                  {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'} {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e?.target?.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="en">English (US)</option>
              <option value="en-gb">English (UK)</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Default View</label>
            <select
              value={defaultView}
              onChange={(e) => setDefaultView(e?.target?.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="dashboard">Dashboard</option>
              <option value="pipeline">Lead Pipeline</option>
              <option value="projects">Projects</option>
              <option value="team">Team Workspace</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e?.target?.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Date Format</label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e?.target?.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>
      {/* Notifications */}
      <div className="bg-card rounded-xl p-6 shadow-warm-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center">
            <Icon name="Bell" size={18} color="var(--color-accent)" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground">Notifications</h3>
            <p className="text-xs text-muted-foreground">Control how you receive alerts</p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
            { key: 'browser', label: 'Browser Notifications', desc: 'Desktop push notifications' },
            { key: 'mobile', label: 'Mobile Notifications', desc: 'Push to mobile devices' },
            { key: 'weeklyReport', label: 'Weekly Summary Report', desc: 'Digest of weekly activity' },
            { key: 'leadUpdates', label: 'Lead Status Updates', desc: 'When leads change stages' },
            { key: 'projectMilestones', label: 'Project Milestones', desc: 'Milestone completion alerts' },
            { key: 'teamActivity', label: 'Team Activity', desc: 'Team member actions' },
          ]?.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() => toggleNotification(key)}
                className={`relative w-11 h-6 rounded-full transition-smooth ${
                  notifications?.[key] ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-background rounded-full shadow transition-smooth ${
                  notifications?.[key] ? 'left-[22px]' : 'left-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-smooth hover:opacity-90 shadow-warm-sm">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default GeneralSettings;
