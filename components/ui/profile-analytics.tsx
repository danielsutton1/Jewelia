"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Eye, 
  Users, 
  Heart, 
  Share2, 
  MessageSquare, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Target,
  BarChart3,
  Activity
} from "lucide-react";

interface ProfileView {
  id: string;
  visitorName: string;
  visitorCompany: string;
  visitorTitle: string;
  viewedAt: Date;
  source: 'qr' | 'search' | 'network' | 'direct';
  duration: number; // seconds
  viewedSections: string[];
}

interface ConnectionMetric {
  date: string;
  connections: number;
  requests: number;
  accepted: number;
}

interface EngagementMetric {
  date: string;
  profileViews: number;
  qrScans: number;
  shares: number;
  messages: number;
}

interface ProfileAnalyticsProps {
  profileViews: ProfileView[];
  connectionMetrics: ConnectionMetric[];
  engagementMetrics: EngagementMetric[];
  timeRange: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
}

export function ProfileAnalytics({ 
  profileViews, 
  connectionMetrics, 
  engagementMetrics, 
  timeRange, 
  onTimeRangeChange 
}: ProfileAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'visitors' | 'connections' | 'engagement'>('overview');

  const getTimeRangeData = (data: any[], days: number) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return data.filter(item => new Date(item.date || item.viewedAt) >= cutoff);
  };

  const getCurrentData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    return {
      views: getTimeRangeData(profileViews, days),
      connections: getTimeRangeData(connectionMetrics, days),
      engagement: getTimeRangeData(engagementMetrics, days)
    };
  };

  const currentData = getCurrentData();

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getTopVisitors = () => {
    const visitorCounts = currentData.views.reduce((acc, view) => {
      const key = view.visitorName;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(visitorCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 5);
  };

  const getMostViewedSections = () => {
    const sectionCounts = currentData.views.reduce((acc, view) => {
      view.viewedSections.forEach((section: string) => {
        acc[section] = (acc[section] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sectionCounts)
      .map(([section, count]) => ({ section, count }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 5);
  };

  const getSourceBreakdown = () => {
    const sourceCounts = currentData.views.reduce((acc, view) => {
      acc[view.source] = (acc[view.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sourceCounts).map(([source, count]) => ({
      source: source.charAt(0).toUpperCase() + source.slice(1),
      count: count as number,
      percentage: ((count as number) / currentData.views.length) * 100
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Analytics</h3>
        </div>
        <Select value={timeRange} onValueChange={(value) => onTimeRangeChange(value as '7d' | '30d' | '90d' | '1y')}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'visitors', label: 'Visitors', icon: Eye },
          { id: 'connections', label: 'Connections', icon: Users },
          { id: 'engagement', label: 'Engagement', icon: Activity }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className="flex items-center gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Profile Views</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentData.views.length}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">+12%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">New Connections</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentData.connections.reduce((sum, c) => sum + c.accepted, 0)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">+8%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">QR Scans</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentData.engagement.reduce((sum, e) => sum + e.qrScans, 0)}
                    </p>
                  </div>
                  <Share2 className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">+15%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Messages</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentData.engagement.reduce((sum, e) => sum + e.messages, 0)}
                    </p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-orange-600" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">-3%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Source Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getSourceBreakdown().map((source) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="font-medium">{source.source}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full" 
                          style={{ width: `${source.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {source.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visitors Tab */}
      {activeTab === 'visitors' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Visitors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.views.slice(0, 10).map((view) => (
                  <div key={view.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-700 font-medium">
                          {view.visitorName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {view.visitorName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {view.visitorTitle} at {view.visitorCompany}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(view.viewedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(view.duration / 60)} min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most Viewed Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getMostViewedSections().map((section) => (
                  <div key={section.section} className="flex items-center justify-between">
                    <span className="font-medium">{section.section}</span>
                    <Badge variant="secondary">{String(section.count)} views</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.connections.map((metric) => (
                  <div key={metric.date} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{new Date(metric.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">
                        {metric.requests} requests, {metric.accepted} accepted
                      </p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800">
                      +{metric.accepted}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.engagement.map((metric) => (
                  <div key={metric.date} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{new Date(metric.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">
                        {metric.profileViews} views, {metric.qrScans} scans
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{metric.shares} shares</Badge>
                      <Badge variant="outline">{metric.messages} messages</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 