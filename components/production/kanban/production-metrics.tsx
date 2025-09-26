"use client"

import { cn } from "@/lib/utils"

import * as React from "react"
import { differenceInHours } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { WorkOrder, ProductionStage } from "./data"

interface ProductionMetricsProps {
  workOrders: WorkOrder[]
  stages: ProductionStage[]
}

export function ProductionMetrics({ workOrders, stages }: ProductionMetricsProps) {
  // Calculate WIP metrics
  const totalWip = workOrders.length
  const stageWipCounts = stages.map((stage) => ({
    name: stage.name,
    count: workOrders.filter((order) => order.currentStage === stage.id).length,
    limit: stage.wipLimit,
  }))

  // Calculate average cycle time (in hours)
  const calculateAverageCycleTime = () => {
    const completedOrders = workOrders.filter((order) => order.currentStage === "ready")
    if (completedOrders.length === 0) return 0

    const totalHours = completedOrders.reduce((sum, order) => {
      // Sum up time spent in each stage from history
      if (!order.stageHistory || order.stageHistory.length === 0) return sum

      const totalStageTime = order.stageHistory.reduce((stageSum, history) => {
        if (!history.enteredAt || !history.exitedAt) return stageSum
        const entered = new Date(history.enteredAt)
        const exited = new Date(history.exitedAt)
        return stageSum + differenceInHours(exited, entered)
      }, 0)

      return sum + totalStageTime
    }, 0)

    return Math.round(totalHours / completedOrders.length)
  }

  const averageCycleTime = calculateAverageCycleTime()

  // Calculate throughput (items completed per day)
  const calculateThroughput = () => {
    const completedOrders = workOrders.filter((order) => order.currentStage === "ready")
    if (completedOrders.length === 0) return 0

    // Assuming we have 5 completed orders over the last 5 days for this demo
    return completedOrders.length / 5
  }

  const throughput = calculateThroughput()

  // Calculate bottlenecks
  const bottlenecks = stages.filter((stage, index) => {
    if (index === 0) return false

    const stageCount = workOrders.filter((order) => order.currentStage === stage.id).length
    const isAtCapacity = stageCount >= stage.wipLimit

    const previousStage = stages[index - 1]
    const previousStageCount = workOrders.filter((order) => order.currentStage === previousStage.id).length

    return isAtCapacity && previousStageCount > 0
  })

  // Calculate workload by craftsperson
  const craftspersonWorkload = React.useMemo(() => {
    const workload: Record<string, number> = {}

    workOrders.forEach((order) => {
      if (!order.assignedTo) return

      if (!workload[order.assignedTo]) {
        workload[order.assignedTo] = 0
      }

      workload[order.assignedTo]++
    })

    return Object.entries(workload)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [workOrders])

  // Generate cycle time data for chart
  const cycleTimeData = React.useMemo(() => {
    return stages.map((stage) => {
      const stageOrders = workOrders.filter((order) =>
        order.stageHistory?.some((history) => history.stage === stage.id),
      )

      if (stageOrders.length === 0) return { name: stage.name, time: 0 }

      const totalTime = stageOrders.reduce((sum, order) => {
        const stageHistory = order.stageHistory?.find((history) => history.stage === stage.id)
        if (!stageHistory || !stageHistory.enteredAt || !stageHistory.exitedAt) return sum

        const entered = new Date(stageHistory.enteredAt)
        const exited = new Date(stageHistory.exitedAt)
        return sum + differenceInHours(exited, entered)
      }, 0)

      return {
        name: stage.name,
        time: Math.round(totalTime / stageOrders.length),
      }
    })
  }, [workOrders, stages])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Production Metrics</CardTitle>
        <CardDescription>Current workflow performance indicators</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="wip">WIP Limits</TabsTrigger>
            <TabsTrigger value="cycle">Cycle Time</TabsTrigger>
            <TabsTrigger value="workload">Workload</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total WIP</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{totalWip}</div>
                  <p className="text-xs text-muted-foreground">Items in production</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Cycle Time</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-baseline">
                    <div className="text-2xl font-bold">{averageCycleTime}</div>
                    <div className="ml-1 text-sm">hours</div>
                  </div>
                  <p className="text-xs text-muted-foreground">From start to finish</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Throughput</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-baseline">
                    <div className="text-2xl font-bold">{throughput.toFixed(1)}</div>
                    <div className="ml-1 text-sm">items/day</div>
                  </div>
                  <p className="text-xs text-muted-foreground">Completion rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Bottlenecks</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {bottlenecks.length > 0 ? (
                    <div>
                      <div className="text-2xl font-bold text-destructive">{bottlenecks.length}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {bottlenecks.map((stage) => (
                          <Badge key={stage.id} variant="outline" className="bg-red-50 text-red-700">
                            {stage.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">0</div>
                      <p className="text-xs text-muted-foreground">No bottlenecks detected</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="wip" className="pt-4">
            <div className="space-y-4">
              {stageWipCounts.map((stage) => {
                const percentage = (stage.count / stage.limit) * 100
                let statusColor = "bg-emerald-50 text-emerald-700"

                if (percentage >= 100) {
                  statusColor = "bg-red-50 text-red-700"
                } else if (percentage >= 75) {
                  statusColor = "bg-amber-50 text-amber-700"
                }

                return (
                  <div key={stage.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{stage.name}</div>
                      <Badge variant="outline" className={statusColor}>
                        {stage.count}/{stage.limit}
                      </Badge>
                    </div>
                    <Progress
                      value={percentage}
                      className={cn(
                        "h-2",
                        percentage >= 100 ? "bg-red-100" : "bg-slate-100",
                        percentage >= 75 && percentage < 100 ? "bg-amber-100" : "",
                      )}
                      indicatorClassName={cn(
                        percentage >= 100 ? "bg-red-500" : "bg-emerald-500",
                        percentage >= 75 && percentage < 100 ? "bg-amber-500" : "",
                      )}
                    />
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="cycle" className="pt-4">
            <div className="space-y-4">
              {cycleTimeData.map((stage) => {
                // Color logic: red if cycle time is high (e.g., > 24), green otherwise
                const isHigh = stage.time > 24
                const barColor = isHigh ? "bg-red-500" : "bg-emerald-500"
                const badgeColor = isHigh ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                // Find max time for scaling
                const maxTime = Math.max(...cycleTimeData.map(s => s.time)) || 1
                const percentage = (stage.time / maxTime) * 100
                return (
                  <div key={stage.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{stage.name}</div>
                      <span className={`badge ${badgeColor} px-2 py-0.5 rounded text-xs font-semibold`}>{stage.time}h</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded">
                      <div className={barColor + " h-2 rounded"} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="workload" className="pt-4">
            <div className="space-y-4">
              {craftspersonWorkload.slice(0, 5).map((person) => {
                const percentage = (person.count / 10) * 100 // Assuming 10 is max capacity

                return (
                  <div key={person.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{person.name}</div>
                      <Badge variant="outline">{person.count} items</Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
