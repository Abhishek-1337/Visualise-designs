import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar, { TopBar } from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import { Card, StatusBadge } from '../../components/shared';
import { dealService, projectService, messageService } from '../../services';
import type { RootState } from '../../store';

const ClientPortalDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeDeals: 0,
    activeProjects: 0,
    unreadMessages: 0
  });
  const [recentDeals, setRecentDeals] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dealsRes, projectsRes, messagesRes] = await Promise.all([
          dealService.getAll({ limit: '5' }),
          projectService.getAll({ limit: '5' }),
          messageService.getConversations()
        ]);

        setRecentDeals(dealsRes.data.deals || []);
        setRecentProjects(projectsRes.data.projects || []);
        
        const unread = (messagesRes.data.conversations || []).reduce(
          (acc: number, conv: any) => acc + (conv.lastMessage?.unreadCount || 0), 
          0
        );

        setStats({
          activeDeals: dealsRes.data.pagination?.total || 0,
          activeProjects: projectsRes.data.pagination?.total || 0,
          unreadMessages: unread
        });
      } catch (error) {
        console.error('Failed to fetch client portal data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background animate-fade-in">
      <Sidebar />
      <TopBar />
      <main className="md:ml-[240px] h-screen pt-[60px] overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground">Here's an overview of your active collaborations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-200/50 dark:border-indigo-800/30 p-6 flex items-center gap-4 hover-lift shadow-soft-md transition-all duration-200">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-soft-sm">
                <Icon name="Briefcase" size={24} color="white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Deals</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeDeals}</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-200/50 dark:border-emerald-800/30 p-6 flex items-center gap-4 hover-lift shadow-soft-md transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-soft-sm">
                <Icon name="Folder" size={24} color="white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeProjects}</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-200/50 dark:border-amber-800/30 p-6 flex items-center gap-4 hover-lift shadow-soft-md transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-soft-sm">
                <Icon name="MessageSquare" size={24} color="white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unread Messages</p>
                <p className="text-2xl font-bold text-foreground">{stats.unreadMessages}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card hover className="flex flex-col">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Recent Deals</h3>
                <button 
                  onClick={() => navigate('/client-portal/deals')}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  View all
                </button>
              </div>
              <div className="p-0">
                {recentDeals.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No active deals.</div>
                ) : (
                  <ul className="divide-y divide-border">
                    {recentDeals.map((deal) => (
                      <li 
                        key={deal.id} 
                        className="px-6 py-4 hover:bg-muted/50 cursor-pointer transition-all duration-200 hover-lift"
                        onClick={() => navigate(`/client-portal/deals/${deal.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{deal.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(deal.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <StatusBadge status={deal.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>

            <Card hover className="flex flex-col">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Recent Projects</h3>
                <button 
                  onClick={() => navigate('/client-portal/projects')}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  View all
                </button>
              </div>
              <div className="p-0">
                {recentProjects.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No active projects.</div>
                ) : (
                  <ul className="divide-y divide-border">
                    {recentProjects.map((project) => (
                      <li 
                        key={project.id} 
                        className="px-6 py-4 hover:bg-muted/50 cursor-pointer transition-all duration-200 hover-lift"
                        onClick={() => navigate(`/client-portal/projects/${project.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{project.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-primary to-indigo-500" 
                                  style={{ width: `${project.progress}%` }} 
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground font-medium">{project.progress}%</span>
                            </div>
                          </div>
                          <StatusBadge status={project.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientPortalDashboard;
