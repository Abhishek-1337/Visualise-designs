import React from 'react';
import Sidebar, { TopBar } from '../../components/ui/Header';
import TodaysFocusCard from './components/TodaysFocusCard';
import MoneySnapshotCard from './components/MoneySnapshotCard';
import QuickAccessWidget from './components/QuickAccessWidget';

const HomeDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
          <Sidebar />
          <div className="w-[240px]"></div>
          <TopBar />
          <main className="flex-1 pt-[60px]">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
              <div className="mb-6 md:mb-8 lg:mb-12">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
                  Welcome back to your studio
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Here's what needs your attention today
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8 lg:mb-12">
                <TodaysFocusCard />
                <MoneySnapshotCard />
              </div>

              <QuickAccessWidget />
            </div>
          </main>
      </div>
    </div>
  );
};

export default HomeDashboard;
