"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomerFilters } from "./customer-filters"
import { CustomerLifetimeValue } from "./customer-lifetime-value"
import { PurchaseFrequency } from "./purchase-frequency"
import { RetentionRate } from "./retention-rate"
import { SegmentPerformance } from "./segment-performance"
import { GeographicDistribution } from "./geographic-distribution"
import { CohortAnalysis } from "./cohort-analysis"
import { RfmSegmentation } from "./rfm-segmentation"
import { ChurnPrediction } from "./churn-prediction"
import { CustomerJourney } from "./customer-journey"
import { PreferenceClustering } from "./preference-clustering"
import { AtRiskCustomers } from "./at-risk-customers"
import { UpsellOpportunities } from "./upsell-opportunities"
import { OptimalContactTiming } from "./optimal-contact-timing"
import { ExportOptions } from "./export-options"

export function CustomerAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <CustomerFilters />
        <ExportOptions />
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1 sm:p-2 overflow-x-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 min-h-[44px] min-w-[44px]">
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="segments" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 min-h-[44px] min-w-[44px]">
            <span className="hidden sm:inline">Segmentation</span>
            <span className="sm:hidden">Segments</span>
          </TabsTrigger>
          <TabsTrigger value="behavior" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 min-h-[44px] min-w-[44px]">
            <span className="hidden sm:inline">Behavior</span>
            <span className="sm:hidden">Behavior</span>
          </TabsTrigger>
          <TabsTrigger value="journey" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 min-h-[44px] min-w-[44px]">
            <span className="hidden sm:inline">Journey</span>
            <span className="sm:hidden">Journey</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 min-h-[44px] min-w-[44px]">
            <span className="hidden sm:inline">Insights</span>
            <span className="sm:hidden">Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <CustomerLifetimeValue />
            <PurchaseFrequency />
          </div>
          <RetentionRate />
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <SegmentPerformance />
            <GeographicDistribution />
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
          <RfmSegmentation />
          <PreferenceClustering />
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
          <CohortAnalysis />
          <ChurnPrediction />
        </TabsContent>

        <TabsContent value="journey" className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
          <CustomerJourney />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-1 lg:grid-cols-3">
            <AtRiskCustomers />
            <UpsellOpportunities />
            <OptimalContactTiming />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
