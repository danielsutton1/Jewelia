"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TimerInterface } from "./timer-interface"
import { DailyTimesheet } from "./daily-timesheet"
import { TimeTrackingReports } from "./time-tracking-reports"
import { ProductivityAnalytics } from "./productivity-analytics"
import { TimeTrackingSettings } from "./time-tracking-settings"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { 
  Clock, 
  TrendingUp, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  BarChart3,
  Settings,
  Bell,
  Download,
  RefreshCw,
  Play
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Mock data for dashboard stats
const dashboardStats = {
  today: {
    totalHours: 6.5,
    productiveHours: 5.75,
    breakTime: 0.75,
    completedTasks: 4,
    efficiency: 88,
    workOrders: ["WO-1234", "WO-1235", "WO-1236"],
    pendingApprovals: 2,
    overdueTasks: 1
  },
  week: {
    totalHours: 32.5,
    productiveHours: 28.75,
    efficiency: 92,
    completedWorkOrders: 12,
    averageDailyHours: 6.5
  },
  alerts: [
    { id: 1, type: "warning", message: "WO-1234 is approaching deadline", workOrder: "WO-1234" },
    { id: 2, type: "info", message: "Timesheet approval pending", workOrder: null }
  ]
}

export function TimeTrackingDashboard() {
  const [activeTab, setActiveTab] = React.useState("timer")
  const [isLoading, setIsLoading] = React.useState(false)
  const [lastSync, setLastSync] = React.useState(new Date())
  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleSync = async () => {
    setIsLoading(true)
    try {
      // Simulate API sync
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLastSync(new Date())
      toast({
        title: "Sync Complete",
        description: "Time tracking data has been synchronized successfully."
      })
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync time tracking data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Preparing time tracking report for download..."
    })
    // In a real app, this would trigger a file download
  }

  return (
    <Tabs defaultValue="timer" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-5 h-auto p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20">
        <TabsTrigger 
          value="timer" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <Play className="h-4 w-4 text-white" />
          </div>
          Timer
        </TabsTrigger>
        <TabsTrigger 
          value="timesheet" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          Timesheet
        </TabsTrigger>
        <TabsTrigger 
          value="reports" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          Reports
        </TabsTrigger>
        <TabsTrigger 
          value="analytics" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          Analytics
        </TabsTrigger>
        <TabsTrigger 
          value="settings" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <Settings className="h-4 w-4 text-white" />
          </div>
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="timer" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <TimerInterface />
        </div>
      </TabsContent>

      <TabsContent value="timesheet" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <DailyTimesheet />
        </div>
      </TabsContent>

      <TabsContent value="reports" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <TimeTrackingReports />
        </div>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <ProductivityAnalytics />
        </div>
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <TimeTrackingSettings />
        </div>
      </TabsContent>
    </Tabs>
  )
}

function TodaySummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Summary</CardTitle>
        <CardDescription>Your time tracking for today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-bold">{dashboardStats.today.totalHours}h</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Productive Time</p>
              <p className="text-2xl font-bold">{dashboardStats.today.productiveHours}h</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Break Time</p>
              <p className="text-2xl font-bold">{dashboardStats.today.breakTime}h</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completed Tasks</p>
              <p className="text-2xl font-bold">{dashboardStats.today.completedTasks}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Active Work Orders</p>
            <div className="space-y-1">
              {dashboardStats.today.workOrders.map((wo) => (
                <div key={wo} className="rounded-md bg-muted px-3 py-2 text-sm">
                  {wo}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Efficiency</span>
              <span className="text-sm font-medium">{dashboardStats.today.efficiency}%</span>
            </div>
            <Progress value={dashboardStats.today.efficiency} className="mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActions() {
  const handleQuickStart = (workOrderId: string) => {
    toast({
      title: "Quick Start",
      description: `Starting timer for ${workOrderId}`
    })
  }

  const handleBreak = () => {
    toast({
      title: "Break Started",
      description: "Break timer has been started"
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common time tracking actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => handleQuickStart("WO-1234")}
        >
          <Play className="h-4 w-4 mr-2" />
          Start WO-1234
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => handleQuickStart("WO-1235")}
        >
          <Play className="h-4 w-4 mr-2" />
          Start WO-1235
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={handleBreak}
        >
          <Clock className="h-4 w-4 mr-2" />
          Start Break
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start"
        >
          <Target className="h-4 w-4 mr-2" />
          Set Goal
        </Button>
      </CardContent>
    </Card>
  )
}
