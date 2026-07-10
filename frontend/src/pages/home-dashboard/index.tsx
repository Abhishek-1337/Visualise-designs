import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../store';
import Sidebar from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import TodaysFocusCard from './components/TodaysFocusCard';
import MoneySnapshotCard from './components/MoneySnapshotCard';
import QuickAccessWidget from './components/QuickAccessWidget';
import Button from '../../components/ui/Button';
import { seedService } from '../../services';

const roleGreetings: Record<string, { title: string; subtitle: string }> = {
  ADMIN: {
    title: 'Welcome back, Admin',
    subtitle: 'Here\'s your command center — manage your team, projects, and business at a glance',
  },
  MANAGER: {
    title: 'Welcome back, Manager',
    subtitle: 'Track your team\'s progress, client projects, and pipeline updates',
  },
  EMPLOYEE: {
    title: 'Welcome back',
    subtitle: 'Here\'s what needs your attention today',
  },
};

const AdminQuickActions = () => {
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  const handleSeed = async () => {
    try {
      setSeeding(true);
      setSeedMsg('');
      await seedService.seed();
      setSeedMsg('Seed data created! Reload to see changes.');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to seed data';
      if (msg.includes('already has data')) {
        setSeedMsg('Data already exists. Use Force Seed to replace it.');
      } else {
        setSeedMsg(msg);
      }
    } finally {
      setSeeding(false);
    }
  };

  const handleForceSeed = async () => {
    try {
      setSeeding(true);
      setSeedMsg('');
      await seedService.forceSeed();
      setSeedMsg('Data re-seeded! Reload to see changes.');
      window.location.reload();
    } catch (err: any) {
      setSeedMsg(err.response?.data?.error || 'Failed to force seed');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-soft-lg p-5 md:p-6 transition-smooth hover-lift border border-border/50">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon name="Shield" size={18} color="var(--color-primary)" />
        </div>
        <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">Admin Panel</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Link to="/settings-configuration" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-background hover:border-primary/30 hover:shadow-soft-sm transition-smooth hover-lift">
          <Icon name="Users" size={22} color="var(--color-primary)" />
          <span className="text-sm font-medium text-foreground">Manage Team</span>
        </Link>
        <Link to="/settings-configuration?tab=security" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-background hover:border-primary/30 hover:shadow-soft-sm transition-smooth hover-lift">
          <Icon name="Shield" size={22} color="var(--color-primary)" />
          <span className="text-sm font-medium text-foreground">Security</span>
        </Link>
        <Link to="/settings-configuration?tab=automation" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-background hover:border-primary/30 hover:shadow-soft-sm transition-smooth hover-lift">
          <Icon name="Zap" size={22} color="var(--color-primary)" />
          <span className="text-sm font-medium text-foreground">Automation</span>
        </Link>
        <Link to="/settings-configuration?tab=integrations" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-background hover:border-primary/30 hover:shadow-soft-sm transition-smooth hover-lift">
          <Icon name="Plug" size={22} color="var(--color-primary)" />
          <span className="text-sm font-medium text-foreground">Integrations</span>
        </Link>
      </div>
      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Demo Data</h4>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding}>
            {seeding ? 'Seeding...' : 'Seed Demo Data'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleForceSeed} disabled={seeding}>
            Force Seed
          </Button>
        </div>
        {seedMsg && (
          <p className="text-xs text-muted-foreground mt-2">{seedMsg}</p>
        )}
      </div>
    </div>
  );
};

const HomeDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role || 'EMPLOYEE';
  const greeting = roleGreetings[role] || roleGreetings.EMPLOYEE;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
          <Sidebar />
          <div className="w-[240px]"></div>
          <main className="flex-1">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12 animate-fade-in">
              <div className="mb-8 lg:mb-12">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
                  {greeting.title}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                  {greeting.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12">
                <TodaysFocusCard />
                <MoneySnapshotCard />
              </div>

              {role === 'ADMIN' && (
                <div className="mb-8 lg:mb-12">
                  <AdminQuickActions />
                </div>
              )}

              <QuickAccessWidget />
            </div>
          </main>
      </div>
    </div>
  );
};

export default HomeDashboard;
