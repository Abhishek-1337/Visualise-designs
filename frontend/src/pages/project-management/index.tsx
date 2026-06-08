import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar, { TopBar } from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import ProjectCard from './components/ProjectCard';
import ProjectDetailPanel from './components/ProjectDetailPanel';
import FilterBar from './components/FilterBar';
import StatsOverview from './components/StatsOverview';
import EmptyState from './components/EmptyState';
import CreateProjectModal from '../client-crm/components/CreateProjectModal';
import { projectService, contactService, dealService } from '../../services';

const STATUS_MAP: Record<string, string> = {
  PLANNING: 'Planning',
  ACTIVE: 'In Progress',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Completed',
};

const mapProject = (p: any) => ({
  id: p.id,
  name: p.name,
  clientName: p.contact ? `${p.contact.firstName} ${p.contact.lastName}` : 'Unknown',
  status: STATUS_MAP[p.status] || p.status,
  progress: p.progress,
  startDate: p.startDate,
  deadline: p.endDate,
  coverImage: '',
  coverImageAlt: '',
  budget: p.budget,
  description: p.description,
  teamMembers: (p.members || []).map((m: any) => ({
    name: m.name,
    role: 'Member',
    avatar: m.avatar || '',
    avatarAlt: m.name,
  })),
  milestones: [],
  tasks: [],
  files: [],
  contact: p.contact,
  deal: p.deal,
  _raw: p,
});

const ProjectManagement = () => {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [filters, setFilters] = useState({
    search: '', status: 'all', client: 'all', sort: 'deadline',
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [allDeals, setAllDeals] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientSelectionId, setClientSelectionId] = useState<string>('');

  useEffect(() => {
    loadProjects();
    loadClients();
    loadDeals();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getAll({ limit: '50' });
      setProjects((res.data.projects || []).map(mapProject));
    } catch {
      console.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const res = await contactService.getAll({ limit: '100' });
      const clients = res.data.contacts || [];
      setAllClients(clients);
    } catch {
      console.error('Failed to load clients');
    }
  };

  const loadDeals = async () => {
    try {
      const res = await dealService.getAll({ limit: '100' });
      setAllDeals(res.data.deals || []);
    } catch {
      console.error('Failed to load deals');
    }
  };

  const stats = {
    activeProjects: projects.filter((p) => p.status === 'In Progress').length,
    completedThisMonth: projects.filter((p) => {
      if (p.status !== 'Completed') return false;
      const d = p.deadline ? new Date(p.deadline) : null;
      return d && d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
    }).length,
    overdueTasks: 0,
    teamMembers: [...new Set(projects.flatMap((p) => p.teamMembers.map((m: any) => m.name)))].length,
  };

  const filteredProjects = useMemo(() => {
    let result = [...projects];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q)
      );
    }
    if (filters.status !== 'all') result = result.filter((p) => p.status === filters.status);
    if (filters.client !== 'all') result = result.filter((p) => p.clientName === filters.client);
    switch (filters.sort) {
      case 'deadline':
        result.sort((a, b) => new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime());
        break;
      case 'progress':
        result.sort((a, b) => (b.progress || 0) - (a.progress || 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'client':
        result.sort((a, b) => a.clientName.localeCompare(b.clientName));
        break;
    }
    return result;
  }, [filters, projects]);

  const handleFilterChange = (key: string, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleClearFilters = () =>
    setFilters({ search: '', status: 'all', client: 'all', sort: 'deadline' });

  const handleViewDetails = (project: any) => setSelectedProject(project);
  const handleCloseDetails = () => setSelectedProject(null);

  const handleStatusUpdate = (project: any) => {
    console.log('Update status for project:', project.id);
  };

  const handleTaskUpdate = (projectId: string, taskId: string) => {
    console.log('Toggle task:', taskId, 'in project:', projectId);
  };

  const handleCreateProjectSubmit = async (data: any) => {
    try {
      setCreatingProject(true);
      const res = await projectService.create(data);
      const fullRes = await projectService.getById(res.data.id);
      setProjects(prev => [mapProject(fullRes.data), ...prev]);
      if (data.dealId) {
        setAllDeals(prev => prev.map((deal) =>
          deal.id === data.dealId ? { ...deal, project: { id: fullRes.data.id, name: fullRes.data.name } } : deal
        ));
      }
      setShowProjectModal(false);
      setSelectedClientId('');
      setClientSelectionId('');
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCreateProject = () => {
    if (allClients.length > 0) {
      setClientSelectionId('');
      setSelectedClientId('');
      setShowProjectModal(true);
    } else {
      alert('Please create a client first before creating a project.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Project Management - Visualise CRM</title>
        <meta name="description" content="Manage architectural visualization projects with milestone tracking, task management, and team collaboration tools" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <TopBar />
        <main className="md:ml-[240px] pt-[60px]">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 md:mb-8">
              <div>
                <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-2">
                  Project Management
                </h1>
                <p className="text-base md:text-lg text-muted-foreground">
                  Track milestones, manage tasks, and collaborate with your team
                </p>
              </div>
              <Button variant="default" size="lg" iconName="Plus" iconPosition="left" onClick={handleCreateProject} className="lg:w-auto">
                New Project
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-[40vh]">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading projects...</p>
                </div>
              </div>
            ) : (
              <>
                <StatsOverview stats={stats} />
                <FilterBar filters={filters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} />
                {filteredProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    {filteredProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onStatusUpdate={handleStatusUpdate}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState onCreateProject={handleCreateProject} />
                )}
              </>
            )}
          </div>
        </main>

        {selectedProject && (
          <ProjectDetailPanel
            project={selectedProject}
            onClose={handleCloseDetails}
            onTaskUpdate={handleTaskUpdate}
          />
        )}

        {showProjectModal && !selectedClientId && allClients.length > 0 && (
          <div className="fixed inset-0 z-[1999] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-fade-in">
             <div className="bg-card p-6 rounded-lg border border-border/50 shadow-soft-xl w-full max-w-sm animate-slide-up">
                <h3 className="text-lg font-bold mb-4">Select Client</h3>
                <p className="text-sm text-muted-foreground mb-4">Select a client to associate with this new project.</p>
                <select 
                  className="w-full p-2.5 border border-border rounded-lg bg-background mb-6 text-sm"
                  value={clientSelectionId}
                  onChange={(e) => setClientSelectionId(e.target.value)}
                >
                  <option value="" disabled>Choose a client...</option>
                  {allClients.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
                <div className="flex gap-3">
                  <Button variant="outline" fullWidth onClick={() => {
                    setShowProjectModal(false);
                    setClientSelectionId('');
                  }}>Cancel</Button>
                  <Button
                    variant="default"
                    fullWidth
                    onClick={() => setSelectedClientId(clientSelectionId)}
                    disabled={!clientSelectionId}
                  >
                    Continue
                  </Button>
                </div>
             </div>
          </div>
        )}

        {showProjectModal && selectedClientId && (
          <CreateProjectModal
            isOpen={showProjectModal}
            onClose={() => {
              setShowProjectModal(false);
              setSelectedClientId('');
              setClientSelectionId('');
            }}
            onCreate={handleCreateProjectSubmit}
            loading={creatingProject}
            contactId={selectedClientId}
            deals={allDeals}
          />
        )}
      </div>
    </>
  );
};

export default ProjectManagement;
