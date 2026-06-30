import React, { useState, createContext, useContext, useMemo, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import type { Role } from '../../types';
import Icon from '../AppIcon';
import { logout } from '../../store/slices/authSlice';
import ThemeToggle from '../ThemeToggle';
import { notificationService } from '../../services';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  tooltip: string;
  roles: Role[];
}

const navItemConfig: NavItem[] = [
  { label: 'Dashboard', path: '/home-dashboard', icon: 'LayoutDashboard', tooltip: 'Your daily command center', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
  // { label: 'Pipeline', path: '/lead-client-flow', icon: 'GitBranch', tooltip: 'Visual lead and client flow', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { label: 'Projects', path: '/project-management', icon: 'FolderKanban', tooltip: 'Track project milestones', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { label: 'Team', path: '/team-workspace', icon: 'Users', tooltip: 'Collaborative workspace', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
  // { label: 'Clients', path: '/client-profile', icon: 'UserCircle', tooltip: 'Client profiles & details', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { label: 'Client Chat', path: '/client-messaging', icon: 'MessageSquare', tooltip: 'Slack-like client messaging', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { label: 'Clients', path: '/client-crm', icon: 'UserCog', tooltip: 'Client profiles, projects & chat', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { label: 'Comms', path: '/communication-hub', icon: 'MessageCircle', tooltip: 'Communication hub', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { label: 'Payments', path: '/payments', icon: 'CreditCard', tooltip: 'Invoices & payments', roles: ['ADMIN', 'MANAGER'] },
  
  { label: 'Portal Home', path: '/client-portal', icon: 'LayoutDashboard', tooltip: 'Your collaboration portal', roles: ['CLIENT'] },
  { label: 'My Deals', path: '/client-portal/deals', icon: 'Briefcase', tooltip: 'View your deals', roles: ['CLIENT'] },
  { label: 'My Projects', path: '/client-portal/projects', icon: 'FolderKanban', tooltip: 'View your projects', roles: ['CLIENT'] },
  { label: 'Messages', path: '/client-portal/messages', icon: 'MessageSquare', tooltip: 'Chat with the team', roles: ['CLIENT'] },
];

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

  const navigationItems = useMemo(() => {
    const role = user?.role || 'EMPLOYEE';
    return navItemConfig.filter((item) => item.roles.includes(role));
  }, [user?.role]);

  const isActivePath = (path: string) => location?.pathname === path;
  const isActiveParent = (path: string) => location?.pathname?.startsWith(path) && path !== '/';

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  const userName = user?.name || 'User';
  const userEmail = user?.email || '';
  const userInitial = userName?.charAt(0)?.toUpperCase() || 'U';

  const SidebarContent = () => (
    <div className="flex flex-col h-full w-full min-w-0 overflow-hidden">
      <div className="flex items-center gap-3 px-5 h-[64px] border-b border-border">
        <Link to={user?.role === 'CLIENT' ? '/client-portal' : '/home-dashboard'} className="flex items-center gap-2.5 transition-smooth hover:opacity-80">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-soft-sm">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <div>
            <span className="font-semibold text-base text-foreground tracking-tight">
              Visualise
            </span>
            <span className="text-[10px] block text-muted-foreground font-medium tracking-wider uppercase">CRM</span>
          </div>
        </Link>
        <button onClick={() => setIsMobileOpen(false)} className="md:hidden p-2 rounded-lg transition-smooth hover:bg-muted ml-auto">
          <Icon name="X" size={18} color="currentColor" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin">
        <div className="space-y-0.5">
          {navigationItems?.map((item) => {
            const active = isActivePath(item?.path) || isActiveParent(item?.path);
            return (
              <Link
                key={item?.path}
                to={item?.path}
                onClick={() => { setIsMobileOpen(false); setIsUserMenuOpen(false); }}
                className={`flex w-full min-w-0 items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title={item?.tooltip}
              >
                <Icon name={item?.icon} size={18} color={active ? 'var(--color-primary)' : 'currentColor'} className="flex-shrink-0" />
                <span className="min-w-0 flex-1 truncate text-sm">{item?.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="px-3 py-2 border-t border-border">
        <ThemeToggle />
      </div>

      <div className="border-t border-border p-3">
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth hover:bg-muted"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
              {user?.avatar ? (
                <img src={user.avatar} alt={userName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                userInitial
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
            <Icon name="ChevronDown" size={14} color="var(--color-muted-foreground)" className="flex-shrink-0" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute bottom-full left-2 right-2 mb-2 bg-card border border-border rounded-xl shadow-soft-xl z-[1010] p-1.5 animate-scale-in">
              <Link
                to={user?.role === 'CLIENT' ? '/client-portal/profile' : '/settings-configuration'}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth hover:bg-muted text-sm text-foreground"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <Icon name="User" size={16} className="text-muted-foreground" />
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth hover:bg-error/10 text-sm text-error text-left"
              >
                <Icon name="LogOut" size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <SidebarContext.Provider value={{ isMobileOpen, setIsMobileOpen }}>
      <aside className="hidden fixed h-screen md:flex top-0 left-0 bottom-0 bg-card border-r border-border z-[1000] w-[240px]">
        <SidebarContent />
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-[1020] md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-card border-r border-border shadow-soft-xl animate-slide-right">
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
  const navigate = useNavigate();
  const userName = user?.name || 'User';
  const userInitial = userName?.charAt(0)?.toUpperCase() || 'U';
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.role !== 'CLIENT') return;
    const fetchNotifs = async () => {
      try {
        const res = await notificationService.getAll({ limit: '10' });
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user?.role]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[900] h-[64px] bg-card/80 backdrop-blur-lg border-b border-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setIsMobileOpen(true)} className="md:hidden p-2 rounded-lg transition-smooth hover:bg-muted" aria-label="Toggle menu">
          <Icon name="Menu" size={20} color="currentColor" />
        </button>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="ChevronRight" size={14} />
          <span className="font-medium text-foreground">{user?.role === 'CLIENT' ? 'Client Portal' : 'Dashboard'}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user?.role && user.role !== 'EMPLOYEE' && (
          <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wider uppercase ${
            user.role === 'ADMIN'
              ? 'bg-primary/10 text-primary'
              : 'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400'
          }`}>
            {user.role}
          </span>
        )}

        {user?.role === 'CLIENT' && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-muted transition-smooth"
            >
              <Icon name="Bell" size={20} color="currentColor" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-error text-[10px] font-bold text-white px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-soft-xl animate-scale-in overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllAsRead} className="text-xs text-primary hover:underline font-medium">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">No notifications yet</div>
                  ) : (
                    notifications.map((n: any) => (
                      <div
                        key={n.id}
                        onClick={() => { if (!n.isRead) handleMarkAsRead(n.id); }}
                        className={`px-4 py-3 border-b border-border/50 cursor-pointer transition-smooth hover:bg-muted/50 ${
                          !n.isRead ? 'bg-primary/[0.02]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                          <div className={!n.isRead ? '' : 'ml-5'}>
                            <p className="text-sm font-medium text-foreground">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
          {user?.avatar ? (
            <img src={user.avatar} alt={userName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            userInitial
          )}
        </div>
        <span className="hidden sm:block text-sm font-medium text-foreground">{userName}</span>
      </div>
    </header>
  );
};

export default Sidebar;
