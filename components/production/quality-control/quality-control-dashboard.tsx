"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addDays, subDays, format } from "date-fns"
import { 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Eye,
  Camera,
  FileText,
  BarChart3,
  Settings,
  Bell,
  RefreshCw,
  Plus,
  Calendar,
  Users,
  Target,
  Award
} from "lucide-react"
import { InspectionForm } from "./inspection-form"
import { InspectionHistory } from "./inspection-history"
import { InspectionMetrics } from "./inspection-metrics"
import { QualityAnalytics } from "./quality-analytics"
import { QualitySettings } from "./quality-settings"
import { QualityAlerts } from "./quality-alerts"
import { toast } from "@/components/ui/use-toast"

// Mock data for dashboard stats
const dashboardStats = {
  today: {
    totalInspections: 24,
    passed: 21,
    failed: 2,
    pending: 1,
    efficiency: 87.5,
    averageTime: 15.2
  },
  week: {
    totalInspections: 156,
    passed: 142,
    failed: 11,
    pending: 3,
    efficiency: 91.0,
    averageTime: 14.8
  },
  alerts: [
    { id: 1, type: "critical", message: "High failure rate in stone setting", count: 5 },
    { id: 2, type: "warning", message: "Inspection backlog growing", count: 12 },
    { id: 3, type: "info", message: "New quality standards implemented", count: 1 }
  ],
  recentFailures: [
    { id: "WO-1234", item: "Diamond Ring", issue: "Stone setting loose", inspector: "Sarah Johnson", date: "2024-01-15" },
    { id: "WO-1235", item: "Gold Necklace", issue: "Finish quality below standard", inspector: "Mike Chen", date: "2024-01-15" }
  ]
}

export function QualityControlDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [inspectorFilter, setInspectorFilter] = useState("all")
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 7),
    to: new Date(),
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSync = async () => {
    setIsLoading(true)
    try {
      // Simulate API sync
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: "Sync Complete",
        description: "Quality control data has been synchronized successfully."
      })
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync quality control data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Preparing quality control report for download..."
    })
    
    // Simulate file download
    setTimeout(() => {
      const link = document.createElement('a')
      link.href = 'data:text/csv;charset=utf-8,Quality Control Report\nDate,Inspections,Passed,Failed\n2024-01-15,24,21,2'
      link.download = `quality-control-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
      link.click()
      
      toast({
        title: "Export Complete",
        description: "Quality control report has been downloaded successfully."
      })
    }, 2000)
  }

  const handleNewInspection = () => {
    setActiveTab("new-inspection")
    toast({
      title: "New Inspection",
      description: "Starting new quality control inspection..."
    })
  }

  const handleViewFailure = (failureId: string) => {
    toast({
      title: "View Failure Details",
      description: `Opening details for failure ${failureId}...`
    })
    // In a real app, this would navigate to a detailed view
    router.push(`/dashboard/production/quality-control/failures/${failureId}`)
  }

  const handleViewAlert = (alertId: number) => {
    toast({
      title: "View Alert Details",
      description: `Opening details for alert #${alertId}...`
    })
    // In a real app, this would navigate to alert details
    router.push(`/dashboard/production/quality-control/alerts/${alertId}`)
  }

  const handleFilterChange = () => {
    toast({
      title: "Filters Applied",
      description: "Quality control data has been filtered based on your criteria."
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed": return "bg-green-100 text-green-800"
      case "failed": return "bg-red-100 text-red-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Apply filters when they change
  useEffect(() => {
    if (searchTerm || statusFilter !== "all" || inspectorFilter !== "all") {
      handleFilterChange()
    }
  }, [searchTerm, statusFilter, inspectorFilter])

  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-6 h-auto p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20">
        <TabsTrigger 
          value="overview" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <Eye className="h-4 w-4 text-white" />
          </div>
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="new-inspection" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <Plus className="h-4 w-4 text-white" />
          </div>
          New Inspection
        </TabsTrigger>
        <TabsTrigger 
          value="history" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <FileText className="h-4 w-4 text-white" />
          </div>
          History
        </TabsTrigger>
        <TabsTrigger 
          value="metrics" 
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
        >
          <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          Metrics
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

      <TabsContent value="overview" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <QualityAlerts />
        </div>
      </TabsContent>

      <TabsContent value="new-inspection" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <InspectionForm />
        </div>
      </TabsContent>

      <TabsContent value="history" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <InspectionHistory />
        </div>
      </TabsContent>

      <TabsContent value="metrics" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <InspectionMetrics />
        </div>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <QualityAnalytics />
        </div>
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <QualitySettings />
        </div>
      </TabsContent>
    </Tabs>
  )
}
