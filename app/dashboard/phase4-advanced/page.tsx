'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Smartphone, 
  Link, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  Zap,
  Target,
  PieChart,
  Activity,
  Settings,
  Download,
  Bell,
  Wifi,
  WifiOff
} from 'lucide-react';

// Mock data for demonstration
const mockAnalytics = {
  totalPosts: 156,
  totalLikes: 2847,
  totalComments: 892,
  totalShares: 445,
  totalViews: 15600,
  engagementRate: 24.2,
  dailyActiveUsers: 1247,
  weeklyGrowth: 12.5,
  viralPosts: 8,
  trendingTopics: ['jewelry_design', 'gemology', 'business_tips', 'craftsmanship']
};

const mockMonetization = {
  totalRevenue: 2847.50,
  monthlyRevenue: 892.30,
  revenueGrowth: 23.4,
  activeRevenueStreams: 4,
  subscribers: 156,
  creatorLevel: 'silver',
  topStream: 'content_subscription',
  conversionRate: 3.2
};

const mockPWAData = {
  isInstalled: true,
  offlineSupport: true,
  pushNotifications: true,
  backgroundSync: true,
  storageUsed: '24.5 MB',
  cacheHitRate: 87.3,
  installPrompt: false
};

const mockCRMIntegrations = [
  { id: '1', name: 'HubSpot', type: 'hubspot', status: 'active', lastSync: '2 hours ago', syncSuccess: 98.5 },
  { id: '2', name: 'Salesforce', type: 'salesforce', status: 'inactive', lastSync: 'Never', syncSuccess: 0 },
  { id: '3', name: 'Pipedrive', type: 'pipedrive', status: 'error', lastSync: '1 day ago', syncSuccess: 45.2 }
];

export default function Phase4AdvancedPage() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getCreatorLevelColor = (level: string) => {
    const colors = {
      bronze: 'bg-amber-600',
      silver: 'bg-gray-400',
      gold: 'bg-yellow-500',
      platinum: 'bg-blue-400',
      diamond: 'bg-purple-500'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-600';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-500',
      inactive: 'bg-gray-500',
      error: 'bg-red-500',
      syncing: 'bg-blue-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phase 4: Advanced Features</h1>
          <p className="text-gray-600 mt-2">
            Analytics, Monetization, PWA, and CRM Integration Dashboard
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isOnline ? 'default' : 'destructive'} className="flex items-center space-x-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="monetization" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Monetization</span>
          </TabsTrigger>
          <TabsTrigger value="pwa" className="flex items-center space-x-2">
            <Smartphone className="h-4 w-4" />
            <span>PWA & Mobile</span>
          </TabsTrigger>
          <TabsTrigger value="crm" className="flex items-center space-x-2">
            <Link className="h-4 w-4" />
            <span>CRM Integration</span>
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockAnalytics.totalPosts}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockAnalytics.engagementRate}%</div>
                <p className="text-xs text-muted-foreground">
                  +5.2% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockAnalytics.dailyActiveUsers}</div>
                <p className="text-xs text-muted-foreground">
                  +{mockAnalytics.weeklyGrowth}% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Viral Posts</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockAnalytics.viralPosts}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Breakdown</CardTitle>
                <CardDescription>Your content performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span>Views</span>
                  </span>
                  <span className="font-semibold">{mockAnalytics.totalViews.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Likes</span>
                  </span>
                  <span className="font-semibold">{mockAnalytics.totalLikes.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    <span>Comments</span>
                  </span>
                  <span className="font-semibold">{mockAnalytics.totalComments.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Share2 className="h-4 w-4 text-purple-500" />
                    <span>Shares</span>
                  </span>
                  <span className="font-semibold">{mockAnalytics.totalShares.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
                <CardDescription>What's hot in your community</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockAnalytics.trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Badge variant="secondary">#{topic.replace('_', ' ')}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 1000) + 100} mentions
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monetization Tab */}
        <TabsContent value="monetization" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${mockMonetization.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  All time earnings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${mockMonetization.monthlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{mockMonetization.revenueGrowth}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Creator Level</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge className={`${getCreatorLevelColor(mockMonetization.creatorLevel)} text-white capitalize`}>
                  {mockMonetization.creatorLevel}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Next: Gold Level
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockMonetization.subscribers}</div>
                <p className="text-xs text-muted-foreground">
                  Active subscribers
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Streams</CardTitle>
                <CardDescription>Your monetization channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Content Subscriptions</span>
                    <span className="font-semibold">$1,247.80</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Community Memberships</span>
                    <span className="font-semibold">$892.30</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Digital Products</span>
                    <span className="font-semibold">$456.20</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Sponsored Content</span>
                    <span className="font-semibold">$251.20</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key conversion indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Conversion Rate</span>
                  <span className="font-semibold">{mockMonetization.conversionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Revenue Streams</span>
                  <span className="font-semibold">{mockMonetization.activeRevenueStreams}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Top Revenue Stream</span>
                  <span className="font-semibold capitalize">{mockMonetization.topStream.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Revenue Growth</span>
                  <span className="font-semibold text-green-600">+{mockMonetization.revenueGrowth}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PWA & Mobile Tab */}
        <TabsContent value="pwa" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PWA Status</CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge variant={mockPWAData.isInstalled ? 'default' : 'secondary'}>
                  {mockPWAData.isInstalled ? 'Installed' : 'Not Installed'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Progressive Web App
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offline Support</CardTitle>
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge variant={mockPWAData.offlineSupport ? 'default' : 'destructive'}>
                  {mockPWAData.offlineSupport ? 'Enabled' : 'Disabled'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Cache Strategy: Network First
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Push Notifications</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge variant={mockPWAData.pushNotifications ? 'default' : 'secondary'}>
                  {mockPWAData.pushNotifications ? 'Active' : 'Inactive'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Real-time updates
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockPWAData.storageUsed}</div>
                <p className="text-xs text-muted-foreground">
                  Cache hit rate: {mockPWAData.cacheHitRate}%
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>PWA Features</CardTitle>
                <CardDescription>Available mobile app capabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Download className="h-4 w-4 text-green-500" />
                    <span>Install to Home Screen</span>
                  </span>
                  <Badge variant="default">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <WifiOff className="h-4 w-4 text-blue-500" />
                    <span>Offline Mode</span>
                  </span>
                  <Badge variant="default">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-purple-500" />
                    <span>Push Notifications</span>
                  </span>
                  <Badge variant="default">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-orange-500" />
                    <span>Background Sync</span>
                  </span>
                  <Badge variant="default">Available</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Mobile app performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Cache Hit Rate</span>
                    <span className="font-semibold">{mockPWAData.cacheHitRate}%</span>
                  </div>
                  <Progress value={mockPWAData.cacheHitRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Storage Efficiency</span>
                    <span className="font-semibold">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Load Time</span>
                    <span className="font-semibold">1.2s</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>User Experience</span>
                    <span className="font-semibold">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CRM Integration Tab */}
        <TabsContent value="crm" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
                <Link className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockCRMIntegrations.filter(i => i.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {mockCRMIntegrations.length} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sync Success Rate</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(mockCRMIntegrations.reduce((sum, i) => sum + i.syncSuccess, 0) / mockCRMIntegrations.length)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average across integrations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2h ago</div>
                <p className="text-xs text-muted-foreground">
                  Most recent sync
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">
                  Overall data quality score
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>CRM Integrations</CardTitle>
              <CardDescription>Manage your CRM connections and sync settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCRMIntegrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Link className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{integration.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {integration.type} • Last sync: {integration.lastSync}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={`${getStatusColor(integration.status)} text-white`}>
                        {integration.status}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-medium">{integration.syncSuccess}%</div>
                        <div className="text-xs text-gray-600">Success Rate</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sync Performance</CardTitle>
                <CardDescription>Data synchronization metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Records Synced Today</span>
                    <span className="font-semibold">1,247</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Sync Errors</span>
                    <span className="font-semibold">23</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Data Quality Score</span>
                    <span className="font-semibold">94.2%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Health</CardTitle>
                <CardDescription>System status and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>HubSpot</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="text-xs text-gray-600">All systems operational</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Salesforce</span>
                    <Badge variant="secondary">Inactive</Badge>
                  </div>
                  <div className="text-xs text-gray-600">Configure connection</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Pipedrive</span>
                    <Badge variant="destructive">Error</Badge>
                  </div>
                  <div className="text-xs text-gray-600">Check API credentials</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 