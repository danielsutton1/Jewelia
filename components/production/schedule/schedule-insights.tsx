"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Clock, Users, Target, AlertTriangle, CheckCircle2, XCircle, TrendingDown } from "lucide-react"

interface ScheduleStats {
  totalOrders: number
  scheduledOrders: number
  overdueOrders: number
  urgentOrders: number
  overallocatedResources: number
  conflicts: number
  averageCompletionTime: number
  capacityUtilization: number
}

interface WorkOrder {
  id: string
  itemDescription: string
  customerName: string
  currentStage: string
  priority: "high" | "medium" | "low"
  dueDate: string
  assignedTo: string
  estimatedHours: number
  actualHours?: number
  status: string
}

interface ScheduleInsightsProps {
  workOrders: WorkOrder[]
  stats: ScheduleStats
}

interface InsightMetric {
  label: string
  value: number
  change: number
  trend: "up" | "down" | "stable"
  color: string
}

export function ScheduleInsights({ workOrders, stats }: ScheduleInsightsProps) {
  const [metrics, setMetrics] = useState<InsightMetric[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState("week")

  useEffect(() => {
    // Generate sample metrics
    const sampleMetrics: InsightMetric[] = [
      {
        label: "Completion Rate",
        value: 85,
        change: 5.2,
        trend: "up",
        color: "text-green-600"
      },
      {
        label: "Average Cycle Time",
        value: 12.5,
        change: -2.1,
        trend: "down",
        color: "text-blue-600"
      },
      {
        label: "Resource Utilization",
        value: 78,
        change: 3.8,
        trend: "up",
        color: "text-purple-600"
      },
      {
        label: "On-Time Delivery",
        value: 92,
        change: -1.5,
        trend: "down",
        color: "text-amber-600"
      }
    ]
    setMetrics(sampleMetrics)
  }, [])

  // Calculate additional insights
  const stageDistribution = workOrders.reduce((acc, order) => {
    acc[order.currentStage] = (acc[order.currentStage] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const priorityDistribution = workOrders.reduce((acc, order) => {
    acc[order.priority] = (acc[order.priority] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const averageHours = workOrders.reduce((sum, order) => sum + (order.estimatedHours || 0), 0) / workOrders.length

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((stats.scheduledOrders / stats.totalOrders) * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.scheduledOrders} of {stats.totalOrders} orders scheduled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageCompletionTime}h</div>
            <p className="text-xs text-muted-foreground">
              Average hours per order
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.capacityUtilization}%</div>
            <p className="text-xs text-muted-foreground">
              Resource efficiency
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.conflicts}</div>
            <p className="text-xs text-muted-foreground">
              Active conflicts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stage Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Production Stage Distribution</CardTitle>
          <CardDescription>Current workload across production stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stageDistribution).map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {stage}
                  </Badge>
                  <span className="text-sm font-medium">{count} orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(count / stats.totalOrders) * 100} className="w-24 h-2" />
                  <span className="text-xs text-muted-foreground w-8">
                    {Math.round((count / stats.totalOrders) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Distribution</CardTitle>
          <CardDescription>Work orders by priority level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(priorityDistribution).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={priority === 'high' ? 'destructive' : priority === 'medium' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {priority}
                  </Badge>
                  <span className="text-sm font-medium">{count} orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(count / stats.totalOrders) * 100} className="w-24 h-2" />
                  <span className="text-xs text-muted-foreground w-8">
                    {Math.round((count / stats.totalOrders) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Analysis</CardTitle>
          <CardDescription>Workload and efficiency metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Workload Metrics</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Average Hours per Order:</span>
                  <span className="font-medium">{Math.round(averageHours)}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Estimated Hours:</span>
                  <span className="font-medium">{workOrders.reduce((sum, order) => sum + (order.estimatedHours || 0), 0)}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Unassigned Orders:</span>
                  <span className="font-medium text-amber-600">
                    {workOrders.filter(order => !order.assignedTo || order.assignedTo === "Unassigned").length}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Efficiency Metrics</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>On-Time Delivery:</span>
                  <span className="font-medium text-green-600">
                    {Math.round(((stats.totalOrders - stats.overdueOrders) / stats.totalOrders) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>High Priority Orders:</span>
                  <span className="font-medium text-red-600">{stats.urgentOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resource Conflicts:</span>
                  <span className="font-medium text-amber-600">{stats.overallocatedResources}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trends and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Trends & Recommendations</CardTitle>
          <CardDescription>AI-powered insights and suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Production Efficiency</h4>
                <p className="text-sm text-blue-700">
                  Your production efficiency is {stats.capacityUtilization}%. Consider redistributing workload to improve utilization.
                </p>
              </div>
            </div>
            
            {stats.overdueOrders > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">Overdue Orders</h4>
                  <p className="text-sm text-red-700">
                    {stats.overdueOrders} orders are overdue. Prioritize these orders and consider extending deadlines.
                  </p>
                </div>
              </div>
            )}
            
            {stats.conflicts > 0 && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <Target className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Schedule Conflicts</h4>
                  <p className="text-sm text-amber-700">
                    {stats.conflicts} scheduling conflicts detected. Review resource assignments to resolve conflicts.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Optimization Opportunity</h4>
                <p className="text-sm text-green-700">
                  Use the auto-schedule feature to optimize resource allocation and reduce conflicts.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
 