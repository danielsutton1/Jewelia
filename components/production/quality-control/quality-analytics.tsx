"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award,
  BarChart3,
  Calendar,
  Users,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Eye,
  Settings
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { toast } from "@/components/ui/use-toast"

// Mock data for quality analytics
const qualityData = {
  passRate: {
    current: 91.2,
    previous: 88.5,
    trend: "up",
    target: 95.0
  },
  efficiency: {
    current: 87.8,
    previous: 85.2,
    trend: "up",
    target: 90.0
  },
  averageTime: {
    current: 14.5,
    previous: 16.2,
    trend: "down",
    target: 12.0
  },
  customerSatisfaction: {
    current: 4.8,
    previous: 4.6,
    trend: "up",
    target: 4.9
  }
}

const weeklyTrends = [
  { day: "Mon", passRate: 89, efficiency: 85, avgTime: 15.2, inspections: 28 },
  { day: "Tue", passRate: 92, efficiency: 88, avgTime: 14.8, inspections: 32 },
  { day: "Wed", passRate: 91, efficiency: 87, avgTime: 14.5, inspections: 30 },
  { day: "Thu", passRate: 93, efficiency: 89, avgTime: 14.2, inspections: 35 },
  { day: "Fri", passRate: 90, efficiency: 86, avgTime: 14.8, inspections: 31 },
  { day: "Sat", passRate: 88, efficiency: 84, avgTime: 15.5, inspections: 20 },
  { day: "Sun", passRate: 85, efficiency: 82, avgTime: 16.0, inspections: 15 },
]

const failureReasons = [
  { name: "Stone Setting", value: 35, color: "#ef4444" },
  { name: "Finish Quality", value: 25, color: "#f97316" },
  { name: "Measurements", value: 20, color: "#eab308" },
  { name: "Metal Quality", value: 15, color: "#8b5cf6" },
  { name: "Functionality", value: 5, color: "#06b6d4" },
]

const inspectorPerformance = [
  { name: "Sarah Johnson", passRate: 94, efficiency: 92, inspections: 45 },
  { name: "Mike Chen", passRate: 89, efficiency: 88, inspections: 38 },
  { name: "Lisa Wong", passRate: 91, efficiency: 90, inspections: 42 },
  { name: "David Kim", passRate: 87, efficiency: 85, inspections: 35 },
  { name: "Emma Wilson", passRate: 93, efficiency: 91, inspections: 40 },
]

export function QualityAnalytics() {
  const [timeRange, setTimeRange] = React.useState("week")
  const [selectedMetric, setSelectedMetric] = React.useState("passRate")
  const [isExporting, setIsExporting] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "text-green-600" : "text-red-600"
  }

  const getMetricData = (metric: string) => {
    return qualityData[metric as keyof typeof qualityData]
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create comprehensive report
      const reportContent = `
Quality Analytics Report - ${timeRange}
Generated: ${new Date().toLocaleDateString()}

Key Metrics:
- Pass Rate: ${qualityData.passRate.current}%
- Efficiency: ${qualityData.efficiency.current}%
- Average Time: ${qualityData.averageTime.current} minutes
- Customer Satisfaction: ${qualityData.customerSatisfaction.current}/5

Weekly Trends:
${weeklyTrends.map(day => `${day.day}: ${day.passRate}% pass rate, ${day.inspections} inspections`).join('\n')}

Failure Analysis:
${failureReasons.map(reason => `${reason.name}: ${reason.value}%`).join('\n')}

Inspector Performance:
${inspectorPerformance.map(inspector => `${inspector.name}: ${inspector.passRate}% pass rate, ${inspector.inspections} inspections`).join('\n')}
      `.trim()

      // Download file
      const blob = new Blob([reportContent], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `quality-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.txt`
      link.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export Complete",
        description: "Quality analytics report has been downloaded successfully."
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export analytics report. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast({
        title: "Data Refreshed",
        description: "Quality analytics data has been updated with latest metrics."
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh analytics data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleFilter = () => {
    toast({
      title: "Filters Applied",
      description: `Analytics filtered for ${timeRange} time period.`
    })
  }

  const handleViewInspectorDetails = (inspectorName: string) => {
    toast({
      title: "View Inspector Details",
      description: `Opening detailed performance report for ${inspectorName}...`
    })
    // In a real app, this would navigate to inspector details
  }

  const handleViewFailureDetails = (failureType: string) => {
    toast({
      title: "View Failure Details",
      description: `Opening detailed analysis for ${failureType} failures...`
    })
    // In a real app, this would navigate to failure analysis
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis of quality control performance and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleFilter}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
                <p className="text-2xl font-bold">{qualityData.passRate.current}%</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(qualityData.passRate.trend)}
                  <span className={`text-sm ${getTrendColor(qualityData.passRate.trend)}`}>
                    +{qualityData.passRate.current - qualityData.passRate.previous}%
                  </span>
                </div>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <Progress 
              value={(qualityData.passRate.current / qualityData.passRate.target) * 100} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Target: {qualityData.passRate.target}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Efficiency</p>
                <p className="text-2xl font-bold">{qualityData.efficiency.current}%</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(qualityData.efficiency.trend)}
                  <span className={`text-sm ${getTrendColor(qualityData.efficiency.trend)}`}>
                    +{qualityData.efficiency.current - qualityData.efficiency.previous}%
                  </span>
                </div>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
            <Progress 
              value={(qualityData.efficiency.current / qualityData.efficiency.target) * 100} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Target: {qualityData.efficiency.target}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Time</p>
                <p className="text-2xl font-bold">{qualityData.averageTime.current}m</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(qualityData.averageTime.trend)}
                  <span className={`text-sm ${getTrendColor(qualityData.averageTime.trend)}`}>
                    {qualityData.averageTime.trend === "down" ? "-" : "+"}{Math.abs(qualityData.averageTime.current - qualityData.averageTime.previous)}m
                  </span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
            <Progress 
              value={100 - ((qualityData.averageTime.current / qualityData.averageTime.target) * 100)} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Target: {qualityData.averageTime.target}m
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold">{qualityData.customerSatisfaction.current}/5</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(qualityData.customerSatisfaction.trend)}
                  <span className={`text-sm ${getTrendColor(qualityData.customerSatisfaction.trend)}`}>
                    +{(qualityData.customerSatisfaction.current - qualityData.customerSatisfaction.previous).toFixed(1)}
                  </span>
                </div>
              </div>
              <Award className="h-8 w-8 text-amber-500" />
            </div>
            <Progress 
              value={(qualityData.customerSatisfaction.current / qualityData.customerSatisfaction.target) * 100} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Target: {qualityData.customerSatisfaction.target}/5
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analysis */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Weekly Trends</TabsTrigger>
          <TabsTrigger value="failures">Failure Analysis</TabsTrigger>
          <TabsTrigger value="inspectors">Inspector Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance Trends</CardTitle>
              <CardDescription>Daily quality metrics over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="passRate" stroke="#3b82f6" name="Pass Rate (%)" />
                  <Line type="monotone" dataKey="efficiency" stroke="#10b981" name="Efficiency (%)" />
                  <Line type="monotone" dataKey="avgTime" stroke="#8b5cf6" name="Avg Time (min)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failure Reasons Distribution</CardTitle>
              <CardDescription>Breakdown of quality control failures by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={failureReasons}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {failureReasons.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {failureReasons.map((reason) => (
                    <div key={reason.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: reason.color }}
                        />
                        <span className="font-medium">{reason.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{reason.value}%</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewFailureDetails(reason.name)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inspector Performance</CardTitle>
              <CardDescription>Individual inspector quality metrics and efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={inspectorPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="passRate" fill="#3b82f6" name="Pass Rate (%)" />
                  <Bar dataKey="efficiency" fill="#10b981" name="Efficiency (%)" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {inspectorPerformance.map((inspector) => (
                  <div key={inspector.name} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{inspector.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {inspector.inspections} inspections this week
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-bold text-blue-600">{inspector.passRate}%</p>
                        <p className="text-xs text-muted-foreground">Pass Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-green-600">{inspector.efficiency}%</p>
                        <p className="text-xs text-muted-foreground">Efficiency</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewInspectorDetails(inspector.name)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
 