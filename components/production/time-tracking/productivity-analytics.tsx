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
  Clock, 
  Award,
  BarChart3,
  Calendar,
  Users,
  Download,
  Filter
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for productivity analytics
const productivityData = {
  efficiency: {
    current: 88,
    previous: 82,
    trend: "up",
    target: 90
  },
  productivity: {
    current: 6.5,
    previous: 6.2,
    trend: "up",
    target: 7.0
  },
  quality: {
    current: 95,
    previous: 93,
    trend: "up",
    target: 96
  },
  utilization: {
    current: 92,
    previous: 89,
    trend: "up",
    target: 95
  }
}

const weeklyTrends = [
  { day: "Mon", efficiency: 85, productivity: 6.2, quality: 94, utilization: 88 },
  { day: "Tue", efficiency: 87, productivity: 6.4, quality: 95, utilization: 90 },
  { day: "Wed", efficiency: 89, productivity: 6.6, quality: 96, utilization: 92 },
  { day: "Thu", efficiency: 88, productivity: 6.5, quality: 95, utilization: 91 },
  { day: "Fri", efficiency: 90, productivity: 6.8, quality: 97, utilization: 93 },
  { day: "Sat", efficiency: 86, productivity: 6.3, quality: 94, utilization: 89 },
  { day: "Sun", efficiency: 82, productivity: 6.0, quality: 93, utilization: 85 },
]

const skillRadarData = [
  { skill: "Stone Setting", value: 95 },
  { skill: "Polishing", value: 88 },
  { skill: "Casting", value: 92 },
  { skill: "Design/CAD", value: 85 },
  { skill: "Quality Control", value: 90 },
  { skill: "Assembly", value: 87 },
]

const teamPerformance = [
  { name: "Michael Chen", efficiency: 92, hours: 38.5, quality: 96 },
  { name: "Sophia Rodriguez", efficiency: 88, hours: 35.2, quality: 94 },
  { name: "David Kim", efficiency: 95, hours: 40.0, quality: 98 },
  { name: "Emma Johnson", efficiency: 85, hours: 32.5, quality: 92 },
  { name: "James Wilson", efficiency: 90, hours: 36.8, quality: 95 },
]

export function ProductivityAnalytics() {
  const [timeRange, setTimeRange] = React.useState("week")
  const [selectedMetric, setSelectedMetric] = React.useState("efficiency")

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
    return productivityData[metric as keyof typeof productivityData]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Productivity Analytics</h2>
          <p className="text-muted-foreground">
            Track and analyze productivity metrics and performance trends
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
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
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
                <p className="text-sm font-medium text-muted-foreground">Efficiency</p>
                <p className="text-2xl font-bold">{productivityData.efficiency.current}%</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(productivityData.efficiency.trend)}
                  <span className={`text-sm ${getTrendColor(productivityData.efficiency.trend)}`}>
                    +{productivityData.efficiency.current - productivityData.efficiency.previous}%
                  </span>
                </div>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <Progress 
              value={(productivityData.efficiency.current / productivityData.efficiency.target) * 100} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Target: {productivityData.efficiency.target}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Productivity</p>
                <p className="text-2xl font-bold">{productivityData.productivity.current}h/day</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(productivityData.productivity.trend)}
                  <span className={`text-sm ${getTrendColor(productivityData.productivity.trend)}`}>
                    +{productivityData.productivity.current - productivityData.productivity.previous}h
                  </span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <Progress 
              value={(productivityData.productivity.current / productivityData.productivity.target) * 100} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Target: {productivityData.productivity.target}h/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quality Score</p>
                <p className="text-2xl font-bold">{productivityData.quality.current}%</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(productivityData.quality.trend)}
                  <span className={`text-sm ${getTrendColor(productivityData.quality.trend)}`}>
                    +{productivityData.quality.current - productivityData.quality.previous}%
                  </span>
                </div>
              </div>
              <Award className="h-8 w-8 text-amber-500" />
            </div>
            <Progress 
              value={(productivityData.quality.current / productivityData.quality.target) * 100} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Target: {productivityData.quality.target}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilization</p>
                <p className="text-2xl font-bold">{productivityData.utilization.current}%</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(productivityData.utilization.trend)}
                  <span className={`text-sm ${getTrendColor(productivityData.utilization.trend)}`}>
                    +{productivityData.utilization.current - productivityData.utilization.previous}%
                  </span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
            <Progress 
              value={(productivityData.utilization.current / productivityData.utilization.target) * 100} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Target: {productivityData.utilization.target}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Weekly Trends</TabsTrigger>
          <TabsTrigger value="skills">Skill Analysis</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance Trends</CardTitle>
              <CardDescription>Track how key metrics change throughout the week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ChartContainer
                  config={{
                    efficiency: {
                      label: "Efficiency (%)",
                      color: "hsl(var(--chart-1))",
                    },
                    productivity: {
                      label: "Productivity (h)",
                      color: "hsl(var(--chart-2))",
                    },
                    quality: {
                      label: "Quality (%)",
                      color: "hsl(var(--chart-3))",
                    },
                    utilization: {
                      label: "Utilization (%)",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyTrends} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="efficiency" 
                        stroke="#6366f1" 
                        strokeWidth={2}
                        dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="productivity" 
                        stroke="#06b6d4" 
                        strokeWidth={2}
                        dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="quality" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="utilization" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skill Proficiency Analysis</CardTitle>
              <CardDescription>Radar chart showing proficiency across different skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={skillRadarData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Skill Level"
                      dataKey="value"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Comparison</CardTitle>
              <CardDescription>Compare team members across key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="efficiency" name="Efficiency (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="quality" name="Quality (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Efficiency Improved</p>
                      <p className="text-sm text-green-600">6% increase from last week</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">Quality Target Met</p>
                      <p className="text-sm text-blue-600">95% quality score achieved</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-800">Utilization High</p>
                      <p className="text-sm text-amber-600">92% time utilization rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="font-medium">Focus on Stone Setting</p>
                    <p className="text-sm text-muted-foreground">
                      Your stone setting skills are excellent. Consider mentoring others.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="font-medium">Improve Design/CAD</p>
                    <p className="text-sm text-muted-foreground">
                      Design/CAD skills could be enhanced with additional training.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="font-medium">Maintain Quality</p>
                    <p className="text-sm text-muted-foreground">
                      Quality scores are strong. Keep up the excellent work.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
 