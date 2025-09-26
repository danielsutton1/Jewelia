"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Activity, 
  UserPlus, 
  Eye, 
  MessageSquare, 
  Share2, 
  Award, 
  Image,
  TrendingUp,
  Calendar,
  Filter,
  MoreHorizontal
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'profile_view' | 'connection' | 'message' | 'qr_scan' | 'achievement' | 'portfolio_update' | 'skill_added';
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
    company?: string;
  };
  metadata?: {
    views?: number;
    connections?: number;
    messages?: number;
    achievement?: string;
    skill?: string;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  onActivityClick?: (activity: ActivityItem) => void;
}

const activityIcons = {
  profile_view: Eye,
  connection: UserPlus,
  message: MessageSquare,
  qr_scan: Share2,
  achievement: Award,
  portfolio_update: Image,
  skill_added: TrendingUp
};

const activityColors = {
  profile_view: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200',
  connection: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-200',
  message: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200',
  qr_scan: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200',
  achievement: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200',
  portfolio_update: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-200',
  skill_added: 'text-pink-600 bg-pink-100 dark:bg-pink-900 dark:text-pink-200'
};

export function ActivityFeed({ activities, onActivityClick }: ActivityFeedProps) {
  const [filter, setFilter] = useState<'all' | 'views' | 'connections' | 'engagement'>('all');
  const [showAll, setShowAll] = useState(false);

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'views') return activity.type === 'profile_view';
    if (filter === 'connections') return activity.type === 'connection';
    if (filter === 'engagement') return ['message', 'qr_scan', 'achievement'].includes(activity.type);
    return true;
  });

  const displayedActivities = showAll ? filteredActivities : filteredActivities.slice(0, 10);

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getActivityContent = (activity: ActivityItem) => {
    const IconComponent = activityIcons[activity.type];
    
    switch (activity.type) {
      case 'profile_view':
        return {
          icon: IconComponent,
          color: activityColors[activity.type],
          content: (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user?.avatar} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {activity.user?.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.user?.name} viewed your profile
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {activity.user?.company} • {getTimeAgo(activity.timestamp)}
                </p>
              </div>
              {activity.metadata?.views && (
                <Badge variant="outline" className="text-xs">
                  {activity.metadata.views} views
                </Badge>
              )}
            </div>
          )
        };

      case 'connection':
        return {
          icon: IconComponent,
          color: activityColors[activity.type],
          content: (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user?.avatar} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {activity.user?.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.user?.name} connected with you
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {activity.user?.company} • {getTimeAgo(activity.timestamp)}
                </p>
              </div>
              <Button size="sm" variant="outline">
                Message
              </Button>
            </div>
          )
        };

      case 'message':
        return {
          icon: IconComponent,
          color: activityColors[activity.type],
          content: (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user?.avatar} />
                <AvatarFallback className="bg-purple-100 text-purple-700">
                  {activity.user?.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  New message from {activity.user?.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {getTimeAgo(activity.timestamp)}
                </p>
              </div>
              <Button size="sm" variant="outline">
                Reply
              </Button>
            </div>
          )
        };

      case 'qr_scan':
        return {
          icon: IconComponent,
          color: activityColors[activity.type],
          content: (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <IconComponent className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Your QR code was scanned
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {getTimeAgo(activity.timestamp)}
                </p>
              </div>
              {activity.metadata?.views && (
                <Badge variant="outline" className="text-xs">
                  {activity.metadata.views} scans
                </Badge>
              )}
            </div>
          )
        };

      case 'achievement':
        return {
          icon: IconComponent,
          color: activityColors[activity.type],
          content: (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <IconComponent className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Achievement unlocked: {activity.metadata?.achievement}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {getTimeAgo(activity.timestamp)}
                </p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                New
              </Badge>
            </div>
          )
        };

      case 'portfolio_update':
        return {
          icon: IconComponent,
          color: activityColors[activity.type],
          content: (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <IconComponent className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Portfolio item updated
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {getTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          )
        };

      case 'skill_added':
        return {
          icon: IconComponent,
          color: activityColors[activity.type],
          content: (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <IconComponent className="h-4 w-4 text-pink-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Skill added: {activity.metadata?.skill}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {getTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          )
        };

      default:
        return {
          icon: Activity,
          color: 'text-gray-600 bg-gray-100',
          content: (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Activity className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {getTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          )
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        <Badge variant="outline" className="text-sm">
          {activities.length} activities
        </Badge>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'all', label: 'All', count: activities.length },
          { id: 'views', label: 'Views', count: activities.filter(a => a.type === 'profile_view').length },
          { id: 'connections', label: 'Connections', count: activities.filter(a => a.type === 'connection').length },
          { id: 'engagement', label: 'Engagement', count: activities.filter(a => ['message', 'qr_scan', 'achievement'].includes(a.type)).length }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={filter === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(tab.id as any)}
            className="flex items-center gap-2"
          >
            {tab.label}
            <Badge variant="secondary" className="text-xs">
              {tab.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Activity List */}
      <Card>
        <CardContent className="p-0">
          {displayedActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No activity yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Start connecting and sharing to see your activity here
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {displayedActivities.map((activity) => {
                const activityContent = getActivityContent(activity);
                
                return (
                  <div
                    key={activity.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => onActivityClick?.(activity)}
                  >
                    {activityContent.content}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Show More Button */}
      {filteredActivities.length > 10 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="w-full"
          >
            {showAll ? 'Show Less' : `Show ${filteredActivities.length - 10} More Activities`}
          </Button>
        </div>
      )}

      {/* Activity Summary */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20">
        <CardContent className="p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Activity Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {activities.filter(a => a.type === 'profile_view').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Profile Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {activities.filter(a => a.type === 'connection').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">New Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {activities.filter(a => a.type === 'message').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {activities.filter(a => a.type === 'qr_scan').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">QR Scans</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 