import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../store';
import Sidebar from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import TodaysFocusCard from './components/TodaysFocusCard';
import MoneySnapshotCard from './components/MoneySnapshotCard';
import QuickAccessWidget from './components/QuickAccessWidget';
import DailySummaryCard from './components/DailySummaryCard';
import MyWorkStatsCard from './components/MyWorkStatsCard';
import MyProjectsCard from './components/MyProjectsCard';
import Button from '../../components/ui/Button';
import { seedService } from '../../services';

const roleGreetings: Record<string, { name: string; subtitle: string }> = {
  ADMIN: {
    name: 'Admin',
    subtitle: 'Your command center — manage your team, projects, and business at a glance.',
  },
  MANAGER: {
    name: 'Manager',
    subtitle: 'Track your team\'s progress, client projects, and pipeline updates.',
  },
  EMPLOYEE: {
    name: '',
    subtitle: 'Here\'s what needs your attention today.',
  },
};

const getTimeOfDay = (hours: number): string => {
  if (hours < 12) return 'Good morning';
  if (hours < 17) return 'Good afternoon';
  return 'Good evening';
};

const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const HomeDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role || 'EMPLOYEE';
  const greeting = roleGreetings[role] || roleGreetings.EMPLOYEE;

  const now = new Date();
  const timeOfDay = getTimeOfDay(now.getHours());
  const firstName = user?.name?.split(' ')?.[0];
  const greetingName = greeting.name || firstName || '';
  const greetingTitle = greetingName ? `${timeOfDay}, ${greetingName}` : timeOfDay;
  const isEmployee = role === 'EMPLOYEE';

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
      setSeedMsg(msg.includes('already has data') ? 'Data already exists. Use Force Seed to replace it.' : msg);
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
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <div className="w-[240px]" />
        <main className="flex-1 min-h-screen">
          <div className="max-w-[1400px] mx-auto px-6 py-8 animate-fade-in">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{greetingTitle}</h1>
                <p className="text-sm text-muted-foreground mt-1">{greeting.subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{today}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <TodaysFocusCard />
              {isEmployee ? <MyProjectsCard /> : <MoneySnapshotCard />}
            </div>

            <div className="mb-8">
              {isEmployee ? <MyWorkStatsCard /> : <DailySummaryCard />}
            </div>

            <div className="mb-8">
              <QuickAccessWidget />
            </div>

            <div className="flex items-center justify-between gap-4 p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-6">
                <Link to="/project-management" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  <Icon name="FolderKanban" size={16} />
                  Projects
                </Link>
                <Link to="/lead-client-flow" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  <Icon name="Kanban" size={16} />
                  Pipeline
                </Link>
                <Link to="/team-workspace" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  <Icon name="Users" size={16} />
                  Team
                </Link>
                <Link to="/settings-configuration" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  <Icon name="Settings" size={16} />
                  Settings
                </Link>
              </div>
              {role === 'ADMIN' && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding}>
                    {seeding ? 'Seeding...' : 'Seed Data'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleForceSeed} disabled={seeding}>
                    Force Seed
                  </Button>
                  {seedMsg && <span className="text-xs text-muted-foreground">{seedMsg}</span>}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeDashboard;
