import React, { useState, createContext, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import Icon from '../AppIcon';
import { logout } from '../../store/slices/authSlice';
import ThemeToggle from '../ThemeToggle';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  tooltip: string;
}

interface SidebarContextType {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isMobileOpen: false,
  setIsMobileOpen: () => {},
});

export const useSidebarContext = () => useContext(SidebarContext);

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const navigationItems: NavItem[] = [
    { label: 'Dashboard', path: '/home-dashboard', icon: 'LayoutDashboard', tooltip: 'Your daily command center' },
    { label: 'Pipeline', path: '/lead-client-flow', icon: 'GitBranch', tooltip: 'Visual lead and client flow' },
    { label: 'Projects', path: '/project-management', icon: 'FolderKanban', tooltip: 'Track project milestones' },
    { label: 'Team', path: '/team-workspace', icon: 'Users', tooltip: 'Collaborative workspace' },
    { label: 'Clients', path: '/client-profile', icon: 'UserCircle', tooltip: 'Client profiles & details' },
    { label: 'Client Chat', path: '/client-messaging', icon: 'MessageSquare', tooltip: 'Slack-like client messaging' },
    { label: 'Client CRM', path: '/client-crm', icon: 'UserCog', tooltip: 'Client profiles, projects & chat' },
    { label: 'Comms', path: '/communication-hub', icon: 'MessageCircle', tooltip: 'Communication hub' },
    { label: 'Settings', path: '/settings-configuration', icon: 'Settings', tooltip: 'App settings & configuration' }
  ];

  const isActivePath = (path: string) => location?.pathname === path;

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  const userName = user?.name || 'User';
  const userEmail = user?.email || '';
  const userInitial = userName?.charAt(0)?.toUpperCase() || 'U';

  const SidebarContent = () => (
    <div className="flex flex-col h-full max-w-[240px]">
      <div className="flex items-center justify-between px-4 border-b border-border h-[60px]">
        <Link to="/home-dashboard" className="flex items-center gap-3 transition-smooth hover:opacity-80">
          <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center transition-smooth">
            <Icon name="Sparkles" size={22} color="var(--color-background)" />
          </div>
          <span className="font-semibold text-lg text-foreground tracking-tight">
            Visualise CRM
          </span>
        </Link>
        <button onClick={() => setIsMobileOpen(false)} className="md:hidden p-2 rounded-md transition-smooth hover:bg-muted">
          <Icon name="X" size={20} color="currentColor" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 pt-8">
        <div className="space-y-0.5">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              onClick={() => { setIsMobileOpen(false); setIsUserMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-smooth active-press ${
                isActivePath(item?.path)
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                  : 'text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50'
              }`}
              title={item?.tooltip}
            >
              <Icon name={item?.icon} size={18} color="currentColor" />
              <span className="text-sm font-medium">{item?.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="px-3 py-2 border-t border-border">
        <ThemeToggle />
      </div>

      <div className="border-t border-border p-3">
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-smooth hover:bg-muted"
          >
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={userName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <span className="text-xs font-medium text-foreground">{userInitial}</span>
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
            <Icon name="ChevronDown" size={14} color="currentColor" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border border-border rounded-md shadow-warm-lg z-[1010]">
              <div className="p-1">
                <Link
                  to="/settings-configuration"
                  className="flex items-center gap-3 px-3 py-2 rounded-md transition-smooth hover:bg-muted"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Icon name="User" size={16} color="currentColor" />
                  <span className="text-sm text-foreground">Profile Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-smooth hover:bg-muted text-left"
                >
                  <Icon name="LogOut" size={16} color="currentColor" />
                  <span className="text-sm text-foreground">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <SidebarContext.Provider value={{ isMobileOpen, setIsMobileOpen }}>
      <aside className="hidden fixed h-screen md:flex top-0 left-0 bottom-0 bg-card border-r border-border z-[1000]">
        <SidebarContent />
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-[1020] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-card border-r border-border shadow-lg">
            <SidebarContent />
          </div>
        </div>
      )}

      {isUserMenuOpen && <div className="fixed inset-0 z-[999]" onClick={() => setIsUserMenuOpen(false)} />}
    </SidebarContext.Provider>
  );
};

export const TopBar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { setIsMobileOpen } = useSidebarContext();
  const userName = user?.name || 'User';
  const userInitial = userName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="fixed top-0 left-0 right-0 z-[900] h-[60px] bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      <button onClick={() => setIsMobileOpen(true)} className="md:hidden p-2 rounded-md transition-smooth hover:bg-muted" aria-label="Toggle menu">
        <Icon name="Menu" size={20} color="currentColor" />
      </button>
      <div className="flex-1 md:ml-4">
        <h1 className="text-base font-semibold text-foreground tracking-tight hidden md:block">Dashboard</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
          {user?.avatar ? (
            <img src={user.avatar} alt={userName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <span className="text-xs font-medium text-foreground">{userInitial}</span>
          )}
        </div>
        <span className="hidden sm:block text-sm font-medium text-muted-foreground">{userName}</span>
      </div>
    </header>
  );
};

export default Sidebar;
