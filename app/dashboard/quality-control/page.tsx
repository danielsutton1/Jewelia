"use client"

import { QualityControlDashboard } from "@/components/quality-control/quality-control-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InspectionQueue } from "@/components/quality-control/inspection-queue"
import { QualityMetrics } from "@/components/quality-control/quality-metrics"
import { PartnerPerformance } from "@/components/quality-control/partner-performance"
import { IssueTracking } from "@/components/quality-control/issue-tracking"

export default function QualityControlPage() {
  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-7xl w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight quality-control-heading">Quality Control</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 min-h-[44px] min-w-[44px] text-xs sm:text-sm">
            New Inspection
          </button>
        </div>
      </div>

      <QualityControlDashboard />

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 sm:p-2 overflow-x-auto">
          <TabsTrigger value="queue" className="text-xs sm:text-sm min-h-[44px] px-2 sm:px-4 py-2 sm:py-3">Inspection Queue</TabsTrigger>
          <TabsTrigger value="metrics" className="text-xs sm:text-sm min-h-[44px] px-2 sm:px-4 py-2 sm:py-3">Quality Metrics</TabsTrigger>
          <TabsTrigger value="partners" className="text-xs sm:text-sm min-h-[44px] px-2 sm:px-4 py-2 sm:py-3">Partner Performance</TabsTrigger>
          <TabsTrigger value="issues" className="text-xs sm:text-sm min-h-[44px] px-2 sm:px-4 py-2 sm:py-3">Issue Tracking</TabsTrigger>
        </TabsList>
        <TabsContent value="queue" className="mt-4 sm:mt-6">
          <InspectionQueue />
        </TabsContent>
        <TabsContent value="metrics" className="mt-4 sm:mt-6">
          <QualityMetrics />
        </TabsContent>
        <TabsContent value="partners" className="mt-4 sm:mt-6">
          <PartnerPerformance />
        </TabsContent>
        <TabsContent value="issues" className="mt-4 sm:mt-6">
          <IssueTracking />
        </TabsContent>
      </Tabs>
    </div>
  )
}
