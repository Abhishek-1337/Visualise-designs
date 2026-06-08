import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const QuickAccessWidget = () => {
  const recentInteractions = [
  {
    id: 1,
    client: "Al Maktoum Properties",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_14cd28b20-1763293428165.png",
    avatarAlt: "Professional headshot of Middle Eastern businessman with short black hair wearing navy suit and red tie",
    type: "call",
    message: "Discussed final render revisions for Marina Tower project",
    timestamp: new Date(Date.now() - 3600000),
    status: "completed"
  },
  {
    id: 2,
    client: "Kensington Estates",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_164575629-1763297045093.png",
    avatarAlt: "Professional headshot of British woman with blonde hair in elegant black blazer",
    type: "email",
    message: "Sent updated penthouse interior renders with lighting adjustments",
    timestamp: new Date(Date.now() - 7200000),
    status: "sent"
  },
  {
    id: 3,
    client: "Marina Bay Developments",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1139e8212-1763295319278.png",
    avatarAlt: "Professional headshot of Asian businessman with glasses wearing charcoal suit",
    type: "meeting",
    message: "Contract review meeting scheduled for tomorrow at 2 PM SGT",
    timestamp: new Date(Date.now() - 10800000),
    status: "scheduled"
  }];


  const projectUpdates = [
  {
    id: 1,
    project: "Dubai Marina Tower",
    client: "Al Maktoum Properties",
    progress: 85,
    status: "on-track",
    milestone: "Final render approval",
    dueDate: "2026-01-05"
  },
  {
    id: 2,
    project: "London Penthouse",
    client: "Kensington Estates",
    progress: 60,
    status: "in-progress",
    milestone: "Interior lighting refinement",
    dueDate: "2026-01-08"
  },
  {
    id: 3,
    project: "Singapore Office Complex",
    client: "Marina Bay Developments",
    progress: 40,
    status: "at-risk",
    milestone: "Exterior facade modeling",
    dueDate: "2026-01-03"
  }];


  const teamActivity = [
  {
    id: 1,
    member: "Sarah Chen",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_18a713e78-1763297858426.png",
    avatarAlt: "Professional headshot of Asian woman with long black hair wearing white blouse",
    action: "completed render review",
    project: "Dubai Marina Tower",
    timestamp: new Date(Date.now() - 1800000)
  },
  {
    id: 2,
    member: "Marcus Rodriguez",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_115906522-1763299231172.png",
    avatarAlt: "Professional headshot of Hispanic man with short brown hair wearing blue shirt",
    action: "updated project timeline",
    project: "NYC Residential Tower",
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: 3,
    member: "Emily Watson",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17784c577-1763297418164.png",
    avatarAlt: "Professional headshot of Caucasian woman with red hair wearing green blazer",
    action: "sent client proposal",
    project: "Tokyo Office Complex",
    timestamp: new Date(Date.now() - 5400000)
  }];


  const getInteractionIcon = (type) => {
    switch (type) {
      case 'call':
        return 'Phone';
      case 'email':
        return 'Mail';
      case 'meeting':
        return 'Video';
      default:
        return 'MessageSquare';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-track':
        return 'bg-success/10 text-success border-success/20';
      case 'in-progress':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'at-risk':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatTimeAgo = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);
    const intervals = {
      hour: 3600,
      minute: 60
    };

    if (seconds < intervals?.minute) {
      return 'Just now';
    } else if (seconds < intervals?.hour) {
      const minutes = Math.floor(seconds / intervals?.minute);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      const hours = Math.floor(seconds / intervals?.hour);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-card rounded-lg shadow-soft-lg p-5 md:p-6 transition-smooth hover-lift border border-border/50">
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="MessageSquare" size={18} color="var(--color-primary)" />
            </div>
            <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">
              Recent Interactions
            </h3>
          </div>
          <Link to="/lead-client-flow">
            <button className="p-1.5 rounded-lg hover:bg-muted transition-smooth">
              <Icon name="ExternalLink" size={16} color="currentColor" />
            </button>
          </Link>
        </div>

        <div className="space-y-3 md:space-y-4">
          {recentInteractions?.map((interaction) =>
          <div
            key={interaction?.id}
            className="p-3 rounded-lg border border-border bg-background hover:border-primary/30 hover:shadow-soft-sm transition-smooth">

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-card">
                  <Image
                  src={interaction?.avatar}
                  alt={interaction?.avatarAlt}
                  className="w-full h-full object-cover" />

                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {interaction?.client}
                    </h4>
                    <Icon
                    name={getInteractionIcon(interaction?.type)}
                    size={14}
                    color="var(--color-muted-foreground)" />

                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {interaction?.message}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(interaction?.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <Link to="/lead-client-flow" className="block mt-5">
          <button className="w-full py-2 text-sm text-primary hover:text-primary/80 font-medium transition-smooth">
            View All Interactions →
          </button>
        </Link>
      </div>
      <div className="bg-card rounded-lg shadow-soft-lg p-5 md:p-6 transition-smooth hover-lift border border-border/50">
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <Icon name="FolderKanban" size={18} color="var(--color-accent)" />
            </div>
            <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">
              Project Updates
            </h3>
          </div>
          <Link to="/project-management">
            <button className="p-1.5 rounded-lg hover:bg-muted transition-smooth">
              <Icon name="ExternalLink" size={16} color="currentColor" />
            </button>
          </Link>
        </div>

        <div className="space-y-3 md:space-y-4">
          {projectUpdates?.map((project) =>
          <div
            key={project?.id}
            className="p-3 rounded-lg border border-border bg-background hover:border-accent/30 hover:shadow-soft-sm transition-smooth">

              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {project?.project}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {project?.client}
                  </p>
                </div>
                <span className={`
                  px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap
                  ${getStatusColor(project?.status)}
                `}>
                  {project?.status?.replace('-', ' ')}
                </span>
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span className="font-medium data-text">{project?.progress}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                  className="h-full bg-accent transition-smooth"
                  style={{ width: `${project?.progress}%` }} />

                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate">{project?.milestone}</span>
                <span className="text-muted-foreground whitespace-nowrap ml-2">
                  Due {new Date(project.dueDate)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          )}
        </div>

        <Link to="/project-management" className="block mt-5">
          <button className="w-full py-2 text-sm text-accent hover:text-accent/80 font-medium transition-smooth">
            View All Projects →
          </button>
        </Link>
      </div>
      <div className="bg-card rounded-lg shadow-soft-lg p-5 md:p-6 transition-smooth hover-lift border border-border/50">
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Icon name="Users" size={18} color="var(--color-secondary)" />
            </div>
            <h3 className="text-base md:text-lg font-heading font-semibold text-foreground">
              Team Activity
            </h3>
          </div>
          <Link to="/team-workspace">
            <button className="p-1.5 rounded-lg hover:bg-muted transition-smooth">
              <Icon name="ExternalLink" size={16} color="currentColor" />
            </button>
          </Link>
        </div>

        <div className="space-y-3 md:space-y-4">
          {teamActivity?.map((activity) =>
          <div
            key={activity?.id}
            className="p-3 rounded-lg border border-border bg-background hover:border-secondary/30 hover:shadow-soft-sm transition-smooth">

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-card">
                  <Image
                  src={activity?.avatar}
                  alt={activity?.avatarAlt}
                  className="w-full h-full object-cover" />

                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground mb-1">
                    {activity?.member}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-1">
                    {activity?.action}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground truncate">
                      {activity?.project}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(activity?.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Link to="/team-workspace" className="block mt-5">
          <button className="w-full py-2 text-sm text-secondary hover:text-secondary/80 font-medium transition-smooth">
            View Team Workspace →
          </button>
        </Link>
      </div>
    </div>);

};

export default QuickAccessWidget;