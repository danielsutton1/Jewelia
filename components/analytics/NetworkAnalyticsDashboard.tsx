'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  MessageCircle, 
  UserPlus, 
  Target,
  Activity,
  Globe,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  MapPin,
  Star,
  Award,
  Zap,
  Eye,
  Heart,
  Share2,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NetworkMetrics {
  totalConnections: number
  newConnectionsThisWeek: number
  connectionGrowthRate: number
  totalMessages: number
  messagesThisWeek: number
  messageGrowthRate: number
  activePartners: number
  responseRate: number
  averageResponseTime: number
  topSpecialties: Array<{ name: string; count: number; growth: number }>
  geographicDistribution: Array<{ location: string; count: number; percentage: number }>
  engagementTrends: Array<{ date: string; connections: number; messages: number; engagement: number }>
  partnerQuality: {
    averageRating: number
    totalReviews: number
    satisfactionScore: number
  }
}

interface NetworkAnalyticsDashboardProps {
  userId: string
  timeRange?: '7d' | '30d' | '90d' | '1y'
}

export function NetworkAnalyticsDashboard({ 
  userId, 
  timeRange = '30d' 
}: NetworkAnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<NetworkMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)

  useEffect(() => {
    fetchAnalytics()
  }, [selectedTimeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/network/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          timeRange: selectedTimeRange
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (rate < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Activity className="h-4 w-4 text-gray-500" />
  }

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return 'text-green-600'
    if (rate < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Network Analytics</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <select className="px-3 py-1 border rounded text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last year</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
        <p className="text-gray-600">Start building your network to see analytics insights</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Network Analytics</h2>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into your networking performance and engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select 
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Connections */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Connections</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.totalConnections)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(metrics.connectionGrowthRate)}
                  <span className={cn("text-sm", getGrowthColor(metrics.connectionGrowthRate))}>
                    {metrics.connectionGrowthRate > 0 ? '+' : ''}{metrics.connectionGrowthRate}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Connections */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Week</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.newConnectionsThisWeek)}</p>
                <p className="text-sm text-gray-500 mt-1">vs last week</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Messages */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.totalMessages)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(metrics.messageGrowthRate)}
                  <span className={cn("text-sm", getGrowthColor(metrics.messageGrowthRate))}>
                    {metrics.messageGrowthRate > 0 ? '+' : ''}{metrics.messageGrowthRate}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold">{metrics.responseRate}%</p>
                <p className="text-sm text-gray-500 mt-1">
                  Avg: {formatTime(metrics.averageResponseTime)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Engagement Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.engagementTrends.slice(-7).map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{trend.date}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-blue-500" />
                      <span className="text-sm">{trend.connections}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3 text-purple-500" />
                      <span className="text-sm">{trend.messages}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-red-500" />
                      <span className="text-sm">{trend.engagement}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Specialties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Top Specialties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topSpecialties.map((specialty, index) => (
                <div key={specialty.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="text-sm font-medium">{specialty.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{specialty.count}</span>
                    <div className="flex items-center gap-1">
                      {getGrowthIcon(specialty.growth)}
                      <span className={cn("text-xs", getGrowthColor(specialty.growth))}>
                        {specialty.growth > 0 ? '+' : ''}{specialty.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.geographicDistribution.map((location) => (
                <div key={location.location} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-sm font-medium">{location.location}</span>
                    </div>
                    <span className="text-sm text-gray-600">{location.count} partners</span>
                  </div>
                  <Progress value={location.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Partner Quality */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Partner Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{metrics.partnerQuality.averageRating.toFixed(1)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Reviews</span>
                <span className="font-medium">{formatNumber(metrics.partnerQuality.totalReviews)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Satisfaction Score</span>
                <div className="flex items-center gap-2">
                  <Progress value={metrics.partnerQuality.satisfactionScore} className="w-20 h-2" />
                  <span className="font-medium">{metrics.partnerQuality.satisfactionScore}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Profile Views</h3>
              <p className="text-2xl font-bold text-blue-600">+24%</p>
              <p className="text-sm text-gray-500">vs last period</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Share2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Content Shares</h3>
              <p className="text-2xl font-bold text-green-600">+18%</p>
              <p className="text-sm text-gray-500">vs last period</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Engagement Rate</h3>
              <p className="text-2xl font-bold text-purple-600">+32%</p>
              <p className="text-sm text-gray-500">vs last period</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 