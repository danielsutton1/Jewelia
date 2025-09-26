"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  Building2, 
  MapPin, 
  Star,
  Activity,
  Target,
  Award,
  Loader2
} from "lucide-react"

interface NetworkStats {
  totalConnections: number
  pendingRequests: number
  acceptedConnections: number
  rejectedConnections: number
  connectionGrowth: {
    period: string
    growth: number
    newConnections: number
  }
  topIndustries: Array<{
    industry: string
    count: number
    percentage: number
  }>
  topLocations: Array<{
    location: string
    count: number
    percentage: number
  }>
  activityMetrics: {
    messagesSent: number
    messagesReceived: number
    profileViews: number
    searchQueries: number
  }
  recommendations: {
    total: number
    highCompatibility: number
    mutualConnections: number
    industryMatches: number
  }
}

export function NetworkAnalytics() {
  const [stats, setStats] = useState<NetworkStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNetworkStats()
  }, [])

  const fetchNetworkStats = async () => {
    try {
      const response = await fetch('/api/network/analytics')
      if (response.ok) {
        const data = await response.json()
        setStats(data.data || null)
      }
    } catch (error) {
      console.error('Error fetching network stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Activity className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Network analytics unavailable</p>
        </CardContent>
      </Card>
    )
  }

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280']

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Connections"
          value={stats.totalConnections}
          icon={<Users className="h-5 w-5" />}
          color="text-blue-600 bg-blue-50"
          trend={stats.connectionGrowth.growth > 0 ? "up" : "stable"}
          trendValue={`+${stats.connectionGrowth.newConnections} this month`}
        />
        
        <MetricCard
          title="Acceptance Rate"
          value={`${Math.round((stats.acceptedConnections / (stats.acceptedConnections + stats.rejectedConnections || 1)) * 100)}%`}
          icon={<Target className="h-5 w-5" />}
          color="text-green-600 bg-green-50"
          showPercentage={false}
        />
        
        <MetricCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={<Activity className="h-5 w-5" />}
          color="text-yellow-600 bg-yellow-50"
        />
        
        <MetricCard
          title="Network Score"
          value={`${Math.min(100, Math.round((stats.totalConnections * 2) + (stats.activityMetrics.messagesSent * 0.5)))}`}
          icon={<Award className="h-5 w-5" />}
          color="text-purple-600 bg-purple-50"
          showPercentage={false}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Network by Industry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.topIndustries}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="count"
                  nameKey="industry"
                >
                  {stats.topIndustries.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any, name: any) => [`${value} connections`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {stats.topIndustries.slice(0, 6).map((industry, index) => (
                <Badge 
                  key={industry.industry} 
                  variant="outline" 
                  className="text-xs"
                  style={{ borderColor: COLORS[index % COLORS.length] }}
                >
                  {industry.industry} ({industry.percentage}%)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Network by Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topLocations.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="location" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip formatter={(value: any) => [`${value} connections`, 'Count']} />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActivityCard
          title="Messages Sent"
          value={stats.activityMetrics.messagesSent}
          icon="💬"
          color="bg-blue-50 text-blue-700"
        />
        
        <ActivityCard
          title="Messages Received"
          value={stats.activityMetrics.messagesReceived}
          icon="📨"
          color="bg-green-50 text-green-700"
        />
        
        <ActivityCard
          title="Profile Views"
          value={stats.activityMetrics.profileViews}
          icon="👁️"
          color="bg-purple-50 text-purple-700"
        />
        
        <ActivityCard
          title="Searches Made"
          value={stats.activityMetrics.searchQueries}
          icon="🔍"
          color="bg-yellow-50 text-yellow-700"
        />
      </div>

      {/* Recommendations Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-600" />
            Recommendation Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.recommendations.total}</div>
              <div className="text-sm text-purple-700">Total Available</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.recommendations.highCompatibility}</div>
              <div className="text-sm text-green-700">High Match (80%+)</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.recommendations.mutualConnections}</div>
              <div className="text-sm text-blue-700">Mutual Connections</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.recommendations.industryMatches}</div>
              <div className="text-sm text-yellow-700">Industry Matches</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  trend?: "up" | "down" | "stable"
  trendValue?: string
  showPercentage?: boolean
}

function MetricCard({ title, value, icon, color, trend, trendValue, showPercentage = true }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <TrendingUp className={`h-3 w-3 ${trend === 'up' ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <div className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' && showPercentage && value > 100 ? value.toLocaleString() : value}
          </div>
          <div className="text-sm text-gray-600">{title}</div>
          {trendValue && (
            <div className="text-xs text-gray-500 mt-1">{trendValue}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface ActivityCardProps {
  title: string
  value: number
  icon: string
  color: string
}

function ActivityCard({ title, value, icon, color }: ActivityCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <span className="text-lg">{icon}</span>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{value.toLocaleString()}</div>
            <div className="text-xs text-gray-600">{title}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
