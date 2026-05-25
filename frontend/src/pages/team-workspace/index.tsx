import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar, { TopBar } from '../../components/ui/Header';
import TeamMemberCard from './components/TeamMemberCard';
import WorkloadChart from './components/WorkloadChart';
import ActivityFeed from './components/ActivityFeed';
import TeamOverviewStats from './components/TeamOverviewStats';
import TeamCalendar from './components/TeamCalendar';
import FilterPanel from './components/FilterPanel';
import { userService, activityService } from '../../services';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
  CLIENT: 'Client',
};

const STATUSES = ['available', 'busy', 'offline'];

const mapUserToMember = (user: any, index: number) => ({
  id: user.id,
  name: user.name,
  role: ROLE_LABELS[user.role] || user.role,
  avatar: user.avatar || '',
  avatarAlt: user.name,
  status: STATUSES[index % STATUSES.length],
  workloadPercentage: 50 + ((index * 17) % 45),
  activeProjects: 2 + (index % 4),
  upcomingDeadlines: 1 + (index % 3),
  currentProjects: [],
});

const mapActivity = (act: any) => ({
  id: act.id,
  type: act.type === 'task_completed' ? 'completion' : act.type === 'project_created' ? 'milestone' : 'collaboration',
  title: act.description?.substring(0, 60) || act.type,
  description: act.description || '',
  timestamp: act.createdAt,
  userAvatar: act.user?.avatar || '',
  userAvatarAlt: act.user?.name || '',
  userName: act.user?.name || 'System',
  projectName: '',
});

const TeamWorkspace = () => {
  const [filters, setFilters] = useState({ project: 'all', skill: 'all', deadline: 'all' });
  const [members, setMembers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, activitiesRes] = await Promise.all([
        userService.getAllUsers({ limit: '50' }),
        activityService.getAll({}),
      ]);
      setMembers((usersRes.data.users || []).map(mapUserToMember));
      setActivities((activitiesRes.data.activities || []).map(mapActivity));
    } catch {
      console.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalMembers: members.length,
    activeProjects: members.reduce((s, m) => s + (m.activeProjects || 0), 0),
    tasksThisWeek: 0,
    upcomingDeadlines: members.reduce((s, m) => s + (m.upcomingDeadlines || 0), 0),
  };

  const workloadData = members.map((m) => ({
    name: m.name,
    workload: m.workloadPercentage,
    capacity: 100,
  }));

  const filteredMembers = members.filter((m) => {
    if (filters.project !== 'all' && !m.currentProjects.includes(filters.project)) return false;
    return true;
  });

  const handleAssignTask = (member: any) => console.log('Assign task to', member.name);
  const handleViewDetails = (member: any) => console.log('View details', member.name);
  const handleMessage = (member: any) => console.log('Message', member.name);

  return (
    <>
      <Helmet>
        <title>Team Workspace - Visualise CRM</title>
        <meta name="description" content="Collaborative team workspace for architectural visualization projects" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <TopBar />
        <main className="md:ml-[260px] pt-[60px]">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
            <div className="mb-6 md:mb-8 lg:mb-10">
              <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-2">
                Team Workspace
              </h1>
              <p className="text-base md:text-lg text-muted-foreground">
                Collaborate, assign tasks, and track team progress
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-[40vh]">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading team data...</p>
                </div>
              </div>
            ) : (
              <>
                <TeamOverviewStats stats={stats} />
                <FilterPanel filters={filters} onFilterChange={setFilters} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredMembers.map((member) => (
                      <TeamMemberCard
                        key={member.id}
                        member={member}
                        onAssignTask={handleAssignTask}
                        onViewDetails={handleViewDetails}
                        onMessage={handleMessage}
                      />
                    ))}
                  </div>
                  <div className="space-y-6">
                    <WorkloadChart data={workloadData} />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <ActivityFeed activities={activities.slice(0, 20)} />
                  </div>
                  <TeamCalendar />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default TeamWorkspace;
