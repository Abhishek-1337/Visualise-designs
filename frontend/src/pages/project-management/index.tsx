import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar, { TopBar } from '../../components/ui/Header';

import Button from '../../components/ui/Button';
import ProjectCard from './components/ProjectCard';
import ProjectDetailPanel from './components/ProjectDetailPanel';
import FilterBar from './components/FilterBar';
import StatsOverview from './components/StatsOverview';
import EmptyState from './components/EmptyState';

const ProjectManagement = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    client: 'all',
    sort: 'deadline'
  });

  const mockProjects = [
  {
    id: 1,
    name: "Luxury Penthouse Visualization",
    clientName: "Skyline Architects",
    status: "In Progress",
    progress: 65,
    startDate: "2024-11-15",
    deadline: "2025-01-30",
    coverImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1c37dd8c3-1764661908810.png",
    coverImageAlt: "Modern luxury penthouse interior with floor-to-ceiling windows overlooking city skyline at sunset with contemporary furniture",
    teamMembers: [
    {
      name: "Sarah Chen",
      role: "Lead 3D Artist",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1d92ac120-1763293804988.png",
      avatarAlt: "Professional headshot of Asian woman with long black hair in white blouse smiling warmly"
    },
    {
      name: "Marcus Rodriguez",
      role: "Lighting Specialist",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1c30629a8-1763296377538.png",
      avatarAlt: "Professional headshot of Hispanic man with short black hair in navy suit with confident expression"
    },
    {
      name: "Emily Watson",
      role: "Texture Artist",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b24a7c2e-1763296129552.png",
      avatarAlt: "Professional headshot of Caucasian woman with blonde hair in gray blazer with friendly smile"
    }],

    milestones: [
    {
      title: "Concept Approval",
      description: "Initial design concepts reviewed and approved by client",
      date: "2024-11-20",
      completed: true
    },
    {
      title: "3D Modeling Complete",
      description: "All architectural elements and furniture modeled",
      date: "2024-12-15",
      completed: true
    },
    {
      title: "Lighting & Materials",
      description: "Lighting setup and material application in progress",
      date: "2025-01-10",
      completed: false
    },
    {
      title: "Final Renders",
      description: "High-resolution renders and post-processing",
      date: "2025-01-25",
      completed: false
    }],

    tasks: [
    {
      id: 101,
      title: "Create base geometry for living room",
      description: "Model walls, floors, and ceiling structures",
      phase: "Modeling",
      completed: true,
      dueDate: "2024-12-10",
      assignee: {
        name: "Sarah Chen",
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1d92ac120-1763293804988.png",
        avatarAlt: "Professional headshot of Asian woman with long black hair in white blouse smiling warmly"
      }
    },
    {
      id: 102,
      title: "Setup HDRI lighting environment",
      description: "Configure realistic lighting for daytime scenes",
      phase: "Rendering",
      completed: false,
      dueDate: "2025-01-05",
      assignee: {
        name: "Marcus Rodriguez",
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1c30629a8-1763296377538.png",
        avatarAlt: "Professional headshot of Hispanic man with short black hair in navy suit with confident expression"
      }
    },
    {
      id: 103,
      title: "Apply PBR materials to furniture",
      description: "Create and apply physically-based materials",
      phase: "Rendering",
      completed: false,
      dueDate: "2025-01-08",
      assignee: {
        name: "Emily Watson",
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b24a7c2e-1763296129552.png",
        avatarAlt: "Professional headshot of Caucasian woman with blonde hair in gray blazer with friendly smile"
      }
    }],

    files: [
    {
      name: "Penthouse_FloorPlan_v3.pdf",
      type: "document",
      size: "2.4 MB",
      uploadedAt: "2024-12-20"
    },
    {
      name: "LivingRoom_Render_Draft.jpg",
      type: "image",
      size: "8.7 MB",
      uploadedAt: "2024-12-28"
    },
    {
      name: "Material_Library.zip",
      type: "archive",
      size: "156 MB",
      uploadedAt: "2024-12-15"
    }]

  },
  {
    id: 2,
    name: "Commercial Office Complex",
    clientName: "Urban Design Co",
    status: "Planning",
    progress: 15,
    startDate: "2025-01-05",
    deadline: "2025-03-20",
    coverImage: "https://images.unsplash.com/photo-1667391551176-9070c1dc52e0",
    coverImageAlt: "Modern commercial office interior with open floor plan featuring glass partitions and contemporary workstations",
    teamMembers: [
    {
      name: "David Kim",
      role: "Project Manager",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1d0689ca5-1763296168465.png",
      avatarAlt: "Professional headshot of Asian man with glasses in dark suit with serious expression"
    },
    {
      name: "Lisa Anderson",
      role: "Senior Visualizer",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17187f2d5-1763301571161.png",
      avatarAlt: "Professional headshot of Caucasian woman with red hair in blue blazer with confident smile"
    }],

    milestones: [
    {
      title: "Project Kickoff",
      description: "Initial meeting and requirements gathering",
      date: "2025-01-05",
      completed: true
    },
    {
      title: "Concept Development",
      description: "Create initial design concepts and mood boards",
      date: "2025-01-20",
      completed: false
    },
    {
      title: "Client Presentation",
      description: "Present concepts to client for approval",
      date: "2025-02-05",
      completed: false
    }],

    tasks: [
    {
      id: 201,
      title: "Gather reference images",
      description: "Collect inspiration and reference materials",
      phase: "Concept",
      completed: true,
      dueDate: "2025-01-08",
      assignee: {
        name: "Lisa Anderson",
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17187f2d5-1763301571161.png",
        avatarAlt: "Professional headshot of Caucasian woman with red hair in blue blazer with confident smile"
      }
    },
    {
      id: 202,
      title: "Create mood boards",
      description: "Develop visual direction for the project",
      phase: "Concept",
      completed: false,
      dueDate: "2025-01-15",
      assignee: {
        name: "David Kim",
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1d0689ca5-1763296168465.png",
        avatarAlt: "Professional headshot of Asian man with glasses in dark suit with serious expression"
      }
    }],

    files: [
    {
      name: "Project_Brief.pdf",
      type: "document",
      size: "1.2 MB",
      uploadedAt: "2025-01-05"
    }]

  },
  {
    id: 3,
    name: "Residential Villa Exterior",
    clientName: "Modern Living Group",
    status: "Completed",
    progress: 100,
    startDate: "2024-09-01",
    deadline: "2024-12-15",
    coverImage: "https://images.unsplash.com/photo-1617052167777-f0f26b5c54f4",
    coverImageAlt: "Stunning modern villa exterior with white facade and large glass windows surrounded by landscaped garden at dusk",
    teamMembers: [
    {
      name: "James Wilson",
      role: "Exterior Specialist",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1e3c66f04-1763301139274.png",
      avatarAlt: "Professional headshot of Caucasian man with brown hair in gray suit with warm smile"
    },
    {
      name: "Nina Patel",
      role: "Landscape Artist",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1e6f6785c-1763294921427.png",
      avatarAlt: "Professional headshot of Indian woman with long dark hair in burgundy blouse with friendly expression"
    },
    {
      name: "Tom Bradley",
      role: "Post-Production",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1e29f8ad9-1763291929812.png",
      avatarAlt: "Professional headshot of Caucasian man with beard in black shirt with creative expression"
    }],

    milestones: [
    {
      title: "Site Analysis",
      description: "Study site conditions and surroundings",
      date: "2024-09-10",
      completed: true
    },
    {
      title: "3D Modeling",
      description: "Complete architectural modeling",
      date: "2024-10-15",
      completed: true
    },
    {
      title: "Landscaping",
      description: "Add vegetation and outdoor elements",
      date: "2024-11-20",
      completed: true
    },
    {
      title: "Final Delivery",
      description: "Deliver final high-resolution renders",
      date: "2024-12-15",
      completed: true
    }],

    tasks: [
    {
      id: 301,
      title: "Model villa architecture",
      description: "Create detailed 3D model of villa structure",
      phase: "Modeling",
      completed: true,
      dueDate: "2024-10-10",
      assignee: {
        name: "James Wilson",
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1e3c66f04-1763301139274.png",
        avatarAlt: "Professional headshot of Caucasian man with brown hair in gray suit with warm smile"
      }
    },
    {
      id: 302,
      title: "Create landscape elements",
      description: "Add trees, plants, and outdoor features",
      phase: "Modeling",
      completed: true,
      dueDate: "2024-11-15",
      assignee: {
        name: "Nina Patel",
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1e6f6785c-1763294921427.png",
        avatarAlt: "Professional headshot of Indian woman with long dark hair in burgundy blouse with friendly expression"
      }
    },
    {
      id: 303,
      title: "Final color grading",
      description: "Post-process renders for final delivery",
      phase: "Delivery",
      completed: true,
      dueDate: "2024-12-12",
      assignee: {
        name: "Tom Bradley",
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1e29f8ad9-1763291929812.png",
        avatarAlt: "Professional headshot of Caucasian man with beard in black shirt with creative expression"
      }
    }],

    files: [
    {
      name: "Villa_Final_Renders.zip",
      type: "archive",
      size: "245 MB",
      uploadedAt: "2024-12-15"
    },
    {
      name: "Client_Presentation.pdf",
      type: "document",
      size: "15.3 MB",
      uploadedAt: "2024-12-15"
    }]

  },
  {
    id: 4,
    name: "Historic Building Restoration",
    clientName: "Heritage Restoration",
    status: "On Hold",
    progress: 40,
    startDate: "2024-10-01",
    deadline: "2025-02-28",
    coverImage: "https://images.unsplash.com/photo-1726474667849-f7d2fcc9e20a",
    coverImageAlt: "Historic Victorian building facade with ornate architectural details and restored stonework in afternoon light",
    teamMembers: [
    {
      name: "Robert Chen",
      role: "Heritage Specialist",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_13a48293d-1763296098326.png",
      avatarAlt: "Professional headshot of Asian man with short black hair in brown jacket with thoughtful expression"
    },
    {
      name: "Maria Garcia",
      role: "Detail Artist",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1a36548bd-1763296665300.png",
      avatarAlt: "Professional headshot of Hispanic woman with curly dark hair in green blouse with warm smile"
    }],

    milestones: [
    {
      title: "Historical Research",
      description: "Study original building documentation",
      date: "2024-10-15",
      completed: true
    },
    {
      title: "Base Modeling",
      description: "Create accurate architectural model",
      date: "2024-11-30",
      completed: true
    },
    {
      title: "Detail Work",
      description: "Add ornamental and decorative elements",
      date: "2025-01-15",
      completed: false
    }],

    tasks: [
    {
      id: 401,
      title: "Research historical details",
      description: "Study period-accurate architectural elements",
      phase: "Concept",
      completed: true,
      dueDate: "2024-10-12",
      assignee: {
        name: "Robert Chen",
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_13a48293d-1763296098326.png",
        avatarAlt: "Professional headshot of Asian man with short black hair in brown jacket with thoughtful expression"
      }
    },
    {
      id: 402,
      title: "Model ornamental details",
      description: "Create decorative architectural elements",
      phase: "Modeling",
      completed: false,
      dueDate: "2025-01-10",
      assignee: {
        name: "Maria Garcia",
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1a36548bd-1763296665300.png",
        avatarAlt: "Professional headshot of Hispanic woman with curly dark hair in green blouse with warm smile"
      }
    }],

    files: [
    {
      name: "Historical_References.pdf",
      type: "document",
      size: "45.2 MB",
      uploadedAt: "2024-10-15"
    },
    {
      name: "Base_Model_v2.blend",
      type: "3d",
      size: "89.5 MB",
      uploadedAt: "2024-11-28"
    }]

  },
  {
    id: 5,
    name: "Sustainable Housing Development",
    clientName: "Green Space Developers",
    status: "In Progress",
    progress: 55,
    startDate: "2024-11-01",
    deadline: "2025-02-15",
    coverImage: "https://img.rocket.new/generatedImages/rocket_gen_img_10c2b3852-1764713727327.png",
    coverImageAlt: "Modern sustainable housing development with solar panels and green roofs surrounded by natural landscaping",
    teamMembers: [
    {
      name: "Alex Thompson",
      role: "Sustainability Consultant",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1d4acb824-1763293516412.png",
      avatarAlt: "Professional headshot of Caucasian man with blonde hair in green shirt with enthusiastic expression"
    },
    {
      name: "Priya Sharma",
      role: "Environmental Artist",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1d71d6fc6-1763295655575.png",
      avatarAlt: "Professional headshot of Indian woman with shoulder-length black hair in teal blouse with confident smile"
    },
    {
      name: "Carlos Mendez",
      role: "Technical Director",
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_16105ed6d-1763296582884.png",
      avatarAlt: "Professional headshot of Hispanic man with short dark hair in blue shirt with professional demeanor"
    }],

    milestones: [
    {
      title: "Eco-Design Concept",
      description: "Develop sustainable design approach",
      date: "2024-11-15",
      completed: true
    },
    {
      title: "Site Integration",
      description: "Model buildings within natural environment",
      date: "2024-12-20",
      completed: true
    },
    {
      title: "Green Features",
      description: "Add solar panels, green roofs, and landscaping",
      date: "2025-01-20",
      completed: false
    },
    {
      title: "Final Renders",
      description: "Create photorealistic visualizations",
      date: "2025-02-10",
      completed: false
    }],

    tasks: [
    {
      id: 501,
      title: "Model housing units",
      description: "Create 3D models of residential buildings",
      phase: "Modeling",
      completed: true,
      dueDate: "2024-12-15",
      assignee: {
        name: "Carlos Mendez",
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_16105ed6d-1763296582884.png",
        avatarAlt: "Professional headshot of Hispanic man with short dark hair in blue shirt with professional demeanor"
      }
    },
    {
      id: 502,
      title: "Add solar panel arrays",
      description: "Model and position solar energy systems",
      phase: "Modeling",
      completed: false,
      dueDate: "2025-01-15",
      assignee: {
        name: "Alex Thompson",
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1d4acb824-1763293516412.png",
        avatarAlt: "Professional headshot of Caucasian man with blonde hair in green shirt with enthusiastic expression"
      }
    },
    {
      id: 503,
      title: "Create native landscaping",
      description: "Add indigenous plants and natural features",
      phase: "Rendering",
      completed: false,
      dueDate: "2025-01-25",
      assignee: {
        name: "Priya Sharma",
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1d71d6fc6-1763295655575.png",
        avatarAlt: "Professional headshot of Indian woman with shoulder-length black hair in teal blouse with confident smile"
      }
    }],

    files: [
    {
      name: "Sustainability_Report.pdf",
      type: "document",
      size: "3.8 MB",
      uploadedAt: "2024-11-20"
    },
    {
      name: "Site_Plan.dwg",
      type: "cad",
      size: "12.4 MB",
      uploadedAt: "2024-12-01"
    },
    {
      name: "Progress_Renders.zip",
      type: "archive",
      size: "67.3 MB",
      uploadedAt: "2024-12-28"
    }]

  }];


  const stats = {
    activeProjects: mockProjects?.filter((p) => p?.status === 'In Progress')?.length,
    completedThisMonth: mockProjects?.filter((p) => {
      const completedDate = new Date(p.deadline);
      const now = new Date();
      return p?.status === 'Completed' &&
      completedDate?.getMonth() === now?.getMonth() &&
      completedDate?.getFullYear() === now?.getFullYear();
    })?.length,
    overdueTasks: mockProjects?.reduce((sum, project) => {
      return sum + project?.tasks?.filter((task) =>
      !task?.completed && new Date(task.dueDate) < new Date()
      )?.length;
    }, 0),
    teamMembers: [...new Set(mockProjects.flatMap((p) => p.teamMembers.map((m) => m.name)))]?.length
  };

  const filteredProjects = useMemo(() => {
    let result = [...mockProjects];

    if (filters?.search) {
      const searchLower = filters?.search?.toLowerCase();
      result = result?.filter((project) =>
      project?.name?.toLowerCase()?.includes(searchLower) ||
      project?.clientName?.toLowerCase()?.includes(searchLower)
      );
    }

    if (filters?.status !== 'all') {
      result = result?.filter((project) => project?.status === filters?.status);
    }

    if (filters?.client !== 'all') {
      result = result?.filter((project) => project?.clientName === filters?.client);
    }

    switch (filters?.sort) {
      case 'deadline':
        result?.sort((a, b) => new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime());
        break;
      case 'progress':
        result?.sort((a, b) => (b?.progress || 0) - (a?.progress || 0));
        break;
      case 'name':
        result?.sort((a, b) => a?.name?.localeCompare(b?.name));
        break;
      case 'client':
        result?.sort((a, b) => a?.clientName?.localeCompare(b?.clientName));
        break;
      default:
        break;
    }

    return result;
  }, [filters, mockProjects]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      client: 'all',
      sort: 'deadline'
    });
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
  };

  const handleCloseDetails = () => {
    setSelectedProject(null);
  };

  const handleStatusUpdate = (project) => {
    console.log('Update status for project:', project?.id);
  };

  const handleTaskUpdate = (projectId, taskId) => {
    console.log('Toggle task:', taskId, 'in project:', projectId);
  };

  const handleCreateProject = () => {
    console.log('Create new project');
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

        <main className="md:ml-[260px] pt-[60px]">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 md:mb-8">
              <div>
                <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-2">
                  Project Management
                </h1>
                <p className="text-base md:text-lg text-muted-foreground">
                  Track milestones, manage tasks, and collaborate with your team
                </p>
              </div>
              <Button
                variant="default"
                size="lg"
                iconName="Plus"
                iconPosition="left"
                onClick={handleCreateProject}
                className="lg:w-auto">

                New Project
              </Button>
            </div>

            <StatsOverview stats={stats} />

            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters} />


            {filteredProjects?.length > 0 ?
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
                {filteredProjects?.map((project) =>
              <ProjectCard
                key={project?.id}
                project={project}
                onStatusUpdate={handleStatusUpdate}
                onViewDetails={handleViewDetails} />

              )}
              </div> :

            <EmptyState onCreateProject={handleCreateProject} />
            }
          </div>
        </main>

        {selectedProject &&
        <ProjectDetailPanel
          project={selectedProject}
          onClose={handleCloseDetails}
          onTaskUpdate={handleTaskUpdate} />

        }
      </div>
    </>);

};

export default ProjectManagement;