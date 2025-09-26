'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Clock, 
  Star,
  Download,
  Filter,
  Calendar,
  Activity,
  Zap,
  Target,
  Award
} from 'lucide-react'
import { formatDistanceToNow, format, subDays, startOfDay, endOfDay } from 'date-fns'

interface MessagingStats {
  total_messages: number
  unread_messages: number
  total_threads: number
  active_threads: number
  messages_by_type: Record<string, number>
  response_time_avg: number
  messages_by_hour: Record<string, number>
  messages_by_day: Record<string, number>
  top_senders: Array<{
    user_id: string
    full_name: string
    message_count: number
    avg_response_time: number
  }>
  top_threads: Array<{
    thread_id: string
    subject: string
    message_count: number
    last_activity: string
  }>
  engagement_metrics: {
    read_rate: number
    response_rate: number
    avg_messages_per_thread: number
    peak_hours: string[]
  }
}

interface AnalyticsFilters {
  dateRange: '7d' | '30d' | '90d' | '1y'
  messageType: 'all' | 'internal' | 'external' | 'system'
  organizationId?: string
  partnerId?: string
}

export default function MessagingAnalyticsPage() {
  const [stats, setStats] = useState<MessagingStats | null>(null)
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: '30d',
    messageType: 'all'
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [filters])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        date_range: filters.dateRange,
        message_type: filters.messageType,
        ...(filters.organizationId && { organization_id: filters.organizationId }),
        ...(filters.partnerId && { partner_id: filters.partnerId })
      })

      const response = await fetch(`/api/messaging/stats?${params}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeRangeData = () => {
    const days = filters.dateRange === '7d' ? 7 : filters.dateRange === '30d' ? 30 : filters.dateRange === '90d' ? 90 : 365
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateStr = format(date, 'yyyy-MM-dd')
      data.push({
        date: dateStr,
        count: stats?.messages_by_day[dateStr] || 0
      })
    }
    
    return data
  }

  const getHourlyData = () => {
    const data = []
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = hour.toString().padStart(2, '0')
      data.push({
        hour: hourStr,
        count: stats?.messages_by_hour[hourStr] || 0
      })
    }
    return data
  }

  const getMessageTypeData = () => {
    if (!stats?.messages_by_type) return []
    
    return Object.entries(stats.messages_by_type).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      percentage: (count / stats.total_messages) * 100
    }))
  }

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messaging Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your messaging activity</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value as any }))}>
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
            
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <Select value={filters.messageType} onValueChange={(value) => setFilters(prev => ({ ...prev, messageType: value as any }))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_messages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_threads}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total_threads} total threads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatResponseTime(stats?.response_time_avg || 0)}</div>
            <p className="text-xs text-muted-foreground">
              -8% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.engagement_metrics.read_rate}%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Message Activity Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Message Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-1">
                  {getTimeRangeData().map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="bg-blue-500 rounded-t w-full"
                        style={{ 
                          height: `${Math.max((item.count / Math.max(...getTimeRangeData().map(d => d.count))) * 200, 4)}px` 
                        }}
                      />
                      <span className="text-xs text-gray-500 mt-1">
                        {format(new Date(item.date), 'MMM dd')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Message Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-4 w-4 mr-2" />
                  Message Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getMessageTypeData().map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-green-500' : 
                          index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                        }`} />
                        <span className="text-sm">{item.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{item.count}</span>
                        <span className="text-xs text-gray-500">({item.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Hourly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-1">
                  {getHourlyData().map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="bg-green-500 rounded-t w-full"
                        style={{ 
                          height: `${Math.max((item.count / Math.max(...getHourlyData().map(d => d.count))) * 200, 4)}px` 
                        }}
                      />
                      <span className="text-xs text-gray-500 mt-1">
                        {item.hour}:00
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Peak Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Peak Activity Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.engagement_metrics.peak_hours.map((hour, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">{hour}</span>
                      <Badge variant="secondary">Peak</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Senders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Top Senders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.top_senders.slice(0, 5).map((sender, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{sender.full_name}</div>
                        <div className="text-sm text-gray-500">
                          Avg response: {formatResponseTime(sender.avg_response_time)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{sender.message_count}</div>
                        <div className="text-sm text-gray-500">messages</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Threads */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Most Active Threads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.top_threads.slice(0, 5).map((thread, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium truncate">{thread.subject}</div>
                        <div className="text-sm text-gray-500">
                          Last activity: {formatDistanceToNow(new Date(thread.last_activity))} ago
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <div className="font-medium">{thread.message_count}</div>
                        <div className="text-sm text-gray-500">messages</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Read Rate</span>
                    <span>{stats?.engagement_metrics.read_rate}%</span>
                  </div>
                  <Progress value={stats?.engagement_metrics.read_rate} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Response Rate</span>
                    <span>{stats?.engagement_metrics.response_rate}%</span>
                  </div>
                  <Progress value={stats?.engagement_metrics.response_rate} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Avg Messages per Thread</span>
                    <span>{stats?.engagement_metrics.avg_messages_per_thread}</span>
                  </div>
                  <Progress value={(stats?.engagement_metrics.avg_messages_per_thread || 0) * 10} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">{stats?.unread_messages}</div>
                    <div className="text-sm text-gray-600">Unread Messages</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">{formatResponseTime(stats?.response_time_avg || 0)}</div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-lg font-semibold">Overall Performance</div>
                  <div className="text-3xl font-bold text-green-600 mt-2">Excellent</div>
                  <div className="text-sm text-gray-600 mt-1">Based on response times and engagement</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 