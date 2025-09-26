"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InventoryMetricsCards } from "./inventory-metrics-cards"
import { InventoryFilters } from "./inventory-filters"
import { TurnoverRateChart } from "./turnover-rate-chart"
import { AgingInventoryHeatmap } from "./aging-inventory-heatmap"
import { StockLevelIndicators } from "./stock-level-indicators"
import { DeadStockAnalysis } from "./dead-stock-analysis"
import { SeasonalTrendAnalysis } from "./seasonal-trend-analysis"
import { SlowMovingItems } from "./slow-moving-items"
import { ReorderSuggestions } from "./reorder-suggestions"
import { CategoryPerformance } from "./category-performance"
import { VendorAnalysis } from "./vendor-analysis"
import { AbcAnalysis } from "./abc-analysis"
import { ExportButton } from "../business-intelligence/export-button"
import { RefreshButton } from "../business-intelligence/refresh-button"

export function InventoryAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:justify-between mb-4 sm:mb-6">
            <InventoryFilters />
            <div className="flex gap-2">
              <RefreshButton />
              <ExportButton />
            </div>
          </div>
        </CardContent>
      </Card>

      <InventoryMetricsCards />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1 sm:p-2 overflow-x-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 min-h-[44px] min-w-[44px]">
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 min-h-[44px] min-w-[44px]">
            <span className="hidden sm:inline">Reports</span>
            <span className="sm:hidden">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="abc" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 min-h-[44px] min-w-[44px]">
            <span className="hidden sm:inline">ABC Analysis</span>
            <span className="sm:hidden">ABC</span>
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 min-h-[44px] min-w-[44px]">
            <span className="hidden sm:inline">Seasonal</span>
            <span className="sm:hidden">Seasonal</span>
          </TabsTrigger>
          <TabsTrigger value="vendor" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 min-h-[44px] min-w-[44px]">
            <span className="hidden sm:inline">Vendor</span>
            <span className="sm:hidden">Vendor</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <TurnoverRateChart />
            <AgingInventoryHeatmap />
          </div>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <StockLevelIndicators />
            <DeadStockAnalysis />
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <SlowMovingItems />
            <ReorderSuggestions />
          </div>
          <CategoryPerformance />
        </TabsContent>

        <TabsContent value="abc" className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
          <AbcAnalysis />
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
          <SeasonalTrendAnalysis />
        </TabsContent>

        <TabsContent value="vendor" className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
          <VendorAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  )
}
