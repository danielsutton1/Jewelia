"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EfficiencyMetricsOverview } from "./efficiency-metrics-overview"
import { EfficiencyFilters } from "./efficiency-filters"
import { GanttChartOverview } from "./gantt-chart-overview"
import { BottleneckAnalysis } from "./bottleneck-analysis"
import { EfficiencyTrending } from "./efficiency-trending"
import { CraftspersonPerformance } from "./craftsperson-performance"
import { CostPerUnit } from "./cost-per-unit"
import { ProcessImprovements } from "./process-improvements"
import { CapacityPlanning } from "./capacity-planning"
import { TrainingNeeds } from "./training-needs"
import { EquipmentROI } from "./equipment-roi"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function ProductionEfficiencyDashboard() {
  const [filters, setFilters] = useState({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
    },
    productCategory: "all",
    craftsperson: "all",
    stage: "all",
    location: "all",
  })

  const [isRealTime, setIsRealTime] = useState(false)

  const handleExport = () => {
    // In a real implementation, this would generate and download a report
    alert("Exporting efficiency analytics report...")
  }

  const handleRefresh = () => {
    // In a real implementation, this would refresh the data
    alert("Refreshing data...")
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Filters, Real-time, Export, Refresh Row */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl"></div>
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-6">
          <EfficiencyFilters filters={filters} setFilters={setFilters} />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center space-x-2">
              <Switch id="real-time" checked={isRealTime} onCheckedChange={setIsRealTime} />
              <Label htmlFor="real-time">Real-time updates</Label>
            </div>
            <Button variant="outline" onClick={handleRefresh} className="sm:ml-2 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={handleExport} className="mt-2 sm:mt-0 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Boxes */}
      <EfficiencyMetricsOverview filters={filters} isRealTime={isRealTime} />

      {/* Main Analytics Content with Tabs */}
      <div className="relative">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl"></div>
        <div className="relative p-8">
          <Tabs defaultValue="visualizations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-auto p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20">
              <TabsTrigger 
                value="visualizations" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
              >
                Visualizations
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
              >
                Insights
              </TabsTrigger>
              <TabsTrigger 
                value="details" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
              >
                Detailed Metrics
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
              >
                Reports
              </TabsTrigger>
            </TabsList>
            <TabsContent value="visualizations" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <GanttChartOverview filters={filters} />
                <BottleneckAnalysis filters={filters} />
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <EfficiencyTrending filters={filters} />
                <CraftspersonPerformance filters={filters} />
              </div>
              <CostPerUnit filters={filters} />
            </TabsContent>
            <TabsContent value="insights" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ProcessImprovements filters={filters} />
                <CapacityPlanning filters={filters} />
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <TrainingNeeds filters={filters} />
                <EquipmentROI filters={filters} />
              </div>
            </TabsContent>
            <TabsContent value="details" className="pt-4">
              <div className="rounded-md border bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                <div className="p-6">
                  <h3 className="text-lg font-medium">Detailed Metrics</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive breakdown of all production efficiency metrics
                  </p>
                  <div className="mt-4 text-center text-muted-foreground">
                    Select specific metrics and time periods for detailed analysis
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reports" className="pt-4">
              <div className="rounded-md border bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
                <div className="p-6">
                  <h3 className="text-lg font-medium">Saved Reports</h3>
                  <p className="text-sm text-muted-foreground">
                    Access and manage your saved production efficiency reports
                  </p>
                  <div className="mt-4 text-center text-muted-foreground">
                    No saved reports yet. Create and save reports from the Visualizations or Details tabs.
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
