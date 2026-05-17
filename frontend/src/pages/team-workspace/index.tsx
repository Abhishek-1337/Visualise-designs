import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar, { TopBar } from '../../components/ui/Header';
import TeamMemberCard from './components/TeamMemberCard';
import WorkloadChart from './components/WorkloadChart';
import ActivityFeed from './components/ActivityFeed';
import TeamOverviewStats from './components/TeamOverviewStats';
import TeamCalendar from './components/TeamCalendar';
import FilterPanel from './components/FilterPanel';

const TeamWorkspace = () => {
  const [filters, setFilters] = useState({
    project: 'all',
    skill: 'all',
    deadline: 'all'
  });

  const teamMembers = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Senior 3D Artist",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1f8f896f2-1763299689286.png",
    avatarAlt: "Professional woman with blonde hair in business attire smiling at camera with modern office background",
    status: "available",
    workloadPercentage: 65,
    activeProjects: 3,
    upcomingDeadlines: 2,
    currentProjects: ["Luxury Villa Render", "Office Complex", "Hotel Interior"]
  },
  {
    id: 2,
    name: "Marcus Chen",
    role: "Lead Renderer",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1e55653a7-1763293949617.png",
    avatarAlt: "Asian man with short black hair wearing navy blue shirt in professional studio setting",
    status: "busy",
    workloadPercentage: 88,
    activeProjects: 4,
    upcomingDeadlines: 5,
    currentProjects: ["Residential Tower", "Shopping Mall", "Museum Design", "Park Landscape"]
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    role: "Post-Production Specialist",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1e4b58217-1763296801823.png",
    avatarAlt: "Hispanic woman with long dark hair in creative workspace with warm lighting and artistic background",
    status: "available",
    workloadPercentage: 52,
    activeProjects: 2,
    upcomingDeadlines: 1,
    currentProjects: ["Hotel Interior", "Luxury Villa Render"]
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Animation Director",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_151b9af34-1763295439157.png",
    avatarAlt: "Caucasian man with beard wearing casual shirt in modern creative studio environment",
    status: "busy",
    workloadPercentage: 92,
    activeProjects: 5,
    upcomingDeadlines: 4,
    currentProjects: ["Office Complex", "Residential Tower", "Shopping Mall", "Museum Design", "Park Landscape"]
  },
  {
    id: 5,
    name: "Priya Sharma",
    role: "Junior 3D Modeler",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1fe9b5695-1763296011297.png",
    avatarAlt: "Indian woman with long black hair in professional attire with bright office background",
    status: "available",
    workloadPercentage: 45,
    activeProjects: 2,
    upcomingDeadlines: 1,
    currentProjects: ["Museum Design", "Park Landscape"]
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Technical Artist",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_13f76fad5-1763294360028.png",
    avatarAlt: "African American man with short hair wearing glasses in technology-focused workspace",
    status: "offline",
    workloadPercentage: 0,
    activeProjects: 0,
    upcomingDeadlines: 0,
    currentProjects: []
  }];


  const workloadData = [
  { name: "Sarah M.", workload: 65, capacity: 40 },
  { name: "Marcus C.", workload: 88, capacity: 40 },
  { name: "Elena R.", workload: 52, capacity: 40 },
  { name: "David T.", workload: 92, capacity: 40 },
  { name: "Priya S.", workload: 45, capacity: 40 },
  { name: "James W.", workload: 0, capacity: 40 }];


  const activities = [
  {
    id: 1,
    type: "completion",
    title: "Luxury Villa Render - Final Delivery Completed",
    description: "All final renders delivered to client with post-production enhancements",
    userName: "Sarah Mitchell",
    userAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_18811c304-1763296452128.png",
    userAvatarAlt: "Professional woman with blonde hair in business attire smiling at camera",
    projectName: "Luxury Villa Render",
    timestamp: new Date(2025, 11, 31, 13, 30),
    celebration: "🎉 Project Milestone!"
  },
  {
    id: 2,
    type: "milestone",
    title: "Office Complex - Phase 2 Milestone Reached",
    description: "Completed all exterior renders for the second phase of the project",
    userName: "Marcus Chen",
    userAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1337d5eb4-1763293863190.png",
    userAvatarAlt: "Asian man with short black hair wearing navy blue shirt",
    projectName: "Office Complex",
    timestamp: new Date(2025, 11, 31, 11, 15)
  },
  {
    id: 3,
    type: "collaboration",
    title: "Team Sync - Hotel Interior Project",
    description: "Collaborative review session completed with client feedback integration",
    userName: "Elena Rodriguez",
    userAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1e4b58217-1763296801823.png",
    userAvatarAlt: "Hispanic woman with long dark hair in creative workspace",
    projectName: "Hotel Interior",
    timestamp: new Date(2025, 11, 31, 9, 45)
  },
  {
    id: 4,
    type: "celebration",
    title: "Residential Tower - Animation Sequence Approved",
    description: "Client approved the full walkthrough animation on first review",
    userName: "David Thompson",
    userAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_163e92a28-1763295238232.png",
    userAvatarAlt: "Caucasian man with beard wearing casual shirt",
    projectName: "Residential Tower",
    timestamp: new Date(2025, 11, 30, 16, 20),
    celebration: "⭐ Client Loved It!"
  },
  {
    id: 5,
    type: "completion",
    title: "Museum Design - 3D Modeling Complete",
    description: "All architectural elements modeled and ready for rendering phase",
    userName: "Priya Sharma",
    userAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b4a14d09-1763293764905.png",
    userAvatarAlt: "Indian woman with long black hair in professional attire",
    projectName: "Museum Design",
    timestamp: new Date(2025, 11, 30, 14, 10)
  }];


  const overviewStats = {
    totalMembers: 6,
    activeProjects: 8,
    tasksThisWeek: 24,
    upcomingDeadlines: 13
  };

  const calendarEvents = [
  {
    date: new Date(2025, 11, 31),
    type: "meeting",
    title: "Client Review - Luxury Villa"
  },
  {
    date: new Date(2026, 0, 2),
    type: "deadline",
    title: "Office Complex - Phase 2 Delivery"
  },
  {
    date: new Date(2026, 0, 5),
    type: "meeting",
    title: "Team Planning Session"
  },
  {
    date: new Date(2026, 0, 8),
    type: "deadline",
    title: "Hotel Interior - Final Renders"
  },
  {
    date: new Date(2026, 0, 10),
    type: "event",
    title: "Studio Workshop - New Rendering Techniques"
  }];


  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      project: 'all',
      skill: 'all',
      deadline: 'all'
    });
  };

  const handleAssignTask = (member) => {
    console.log('Assign task to:', member?.name);
  };

  const handleViewDetails = (member) => {
    console.log('View details for:', member?.name);
  };

  const handleMessage = (member) => {
    console.log('Message:', member?.name);
  };

  return (
    <>
      <Helmet>
        <title>Team Workspace - Visualise CRM</title>
        <meta name="description" content="Collaborative workload management with individual and collective performance visibility for studio team coordination" />
      </Helmet>
      <Sidebar />
      <TopBar />
      <main className="min-h-screen bg-background md:ml-[260px] pt-[60px]">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
          <div className="mb-6 md:mb-8">
            <h1 className="font-heading font-bold text-2xl md:text-3xl lg:text-4xl text-foreground mb-2">
              Team Workspace
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Collaborative workload management and team coordination
            </p>
          </div>

          <div className="space-y-6 md:space-y-8">
            <TeamOverviewStats stats={overviewStats} />

            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters} />


            <WorkloadChart data={workloadData} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2">
                <h2 className="font-heading font-semibold text-xl md:text-2xl text-foreground mb-4 md:mb-6">
                  Team Members
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
                  {teamMembers?.map((member) =>
                  <TeamMemberCard
                    key={member?.id}
                    member={member}
                    onAssignTask={handleAssignTask}
                    onViewDetails={handleViewDetails}
                    onMessage={handleMessage} />

                  )}
                </div>
              </div>

              <div className="space-y-6 md:space-y-8">
                <ActivityFeed activities={activities} />
              </div>
            </div>

            <TeamCalendar events={calendarEvents} />
          </div>
        </div>
      </main>
    </>);

};

export default TeamWorkspace;