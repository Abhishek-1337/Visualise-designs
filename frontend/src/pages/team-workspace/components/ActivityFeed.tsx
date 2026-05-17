import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

interface Activity {
  id?: string | number;
  type?: string;
  title?: string;
  description?: string;
  user?: { name?: string; avatar?: string };
  timestamp?: string | Date;
  [key: string]: any;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completion':
        return { name: 'CheckCircle2', color: 'var(--color-success)' };
      case 'milestone':
        return { name: 'Flag', color: 'var(--color-accent)' };
      case 'collaboration':
        return { name: 'Users', color: 'var(--color-primary)' };
      case 'celebration':
        return { name: 'Sparkles', color: 'var(--color-warning)' };
      default:
        return { name: 'Activity', color: 'var(--color-muted-foreground)' };
    }
  };

  const formatTimeAgo = (timestamp: string | Date) => {
    const now = new Date();
    const activityTime = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-card rounded-xl shadow-warm p-4 md:p-5 lg:p-6">
      <h2 className="font-heading font-semibold text-lg md:text-xl lg:text-2xl text-foreground mb-4 md:mb-6">
        Team Activity Feed
      </h2>
      <div className="space-y-3 md:space-y-4 max-h-[500px] md:max-h-[600px] overflow-y-auto">
        {activities?.map((activity) => {
          const iconConfig = getActivityIcon(activity?.type);
          return (
            <div
              key={activity?.id}
              className="flex gap-3 md:gap-4 p-3 md:p-4 bg-background rounded-lg transition-smooth hover:bg-muted"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-card flex items-center justify-center shadow-warm-sm">
                  <Icon name={iconConfig?.name} size={20} color={iconConfig?.color} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm md:text-base text-foreground font-medium line-clamp-2">
                    {activity?.title}
                  </p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimeAgo(activity?.timestamp)}
                  </span>
                </div>

                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2">
                  {activity?.description}
                </p>

                <div className="flex items-center gap-2">
                  <Image
                    src={activity?.userAvatar}
                    alt={activity?.userAvatarAlt}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs text-muted-foreground">{activity?.userName}</span>
                  {activity?.projectName && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-primary">{activity?.projectName}</span>
                    </>
                  )}
                </div>

                {activity?.celebration && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-warning/10 text-warning rounded-md text-xs">
                    <Icon name="Sparkles" size={14} color="var(--color-warning)" />
                    <span>{activity?.celebration}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;