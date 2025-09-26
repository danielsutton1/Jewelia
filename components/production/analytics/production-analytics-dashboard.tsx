"use client"

import { useState, useCallback } from "react"
import { AnalyticsFilters } from "./analytics-filters"
import { KeyMetrics } from "./key-metrics"
import { ProductionFlow } from "./production-flow"
import { CycleTimeAnalysis } from "./cycle-time-analysis"
import { CraftspersonPerformance } from "./craftsperson-performance"
import { QualityAnalysis } from "./quality-analysis"
import { TrendAnalysis } from "./trend-analysis"
import { CapacityUtilization } from "./capacity-utilization"
import { BottleneckAnalysis } from "./bottleneck-analysis"
import { AlertsConfiguration } from "./alerts-configuration"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"

export function ProductionAnalyticsDashboard() {
  const [filters, setFilters] = useState({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
    },
    productCategory: "all",
    craftsperson: "all",
    stage: "all",
  })

  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  const handleExport = () => {
    // In a real implementation, this would generate and download a report
    alert("Exporting production analytics report...")
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Filters and Export Row */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl"></div>
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-6">
          <AnalyticsFilters filters={filters} setFilters={setFilters} />
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="w-full md:w-auto"
              aria-label="Refresh Data"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={handleExport} 
              className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
              aria-label="Export Report"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Boxes */}
      <KeyMetrics key={`metrics-${refreshKey}`} filters={filters} />

      {/* Main Analytics Content */}
      <div className="relative flex flex-col gap-8">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl"></div>
        <div className="relative flex flex-col gap-8 p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ProductionFlow key={`flow-${refreshKey}`} filters={filters} />
            <CycleTimeAnalysis key={`cycle-${refreshKey}`} filters={filters} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <BottleneckAnalysis key={`bottleneck-${refreshKey}`} filters={filters} />
            <QualityAnalysis key={`quality-${refreshKey}`} filters={filters} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CraftspersonPerformance key={`craftsperson-${refreshKey}`} filters={filters} />
            <CapacityUtilization key={`capacity-${refreshKey}`} filters={filters} />
          </div>

          <TrendAnalysis key={`trend-${refreshKey}`} filters={filters} />

          <AlertsConfiguration />
        </div>
      </div>
    </div>
  )
}
