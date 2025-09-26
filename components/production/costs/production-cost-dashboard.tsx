"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CostOverview } from "./cost-overview"
import { CostBreakdown } from "./cost-breakdown"
import { CostComparison } from "./cost-comparison"
import { ProfitabilityAnalysis } from "./profitability-analysis"
import { CostExport } from "./cost-export"
import { CostFilters } from "./cost-filters"

export function ProductionCostDashboard() {
  const [filters, setFilters] = useState({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
    },
    productCategory: "all",
    workOrderIds: [],
    costCategories: ["materials", "labor", "machine", "overhead", "outsourced"],
  })

  return (
    <div className="space-y-6">
      <CostFilters filters={filters} setFilters={setFilters} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="comparison">Actual vs. Estimated</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <CostOverview filters={filters} />
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <CostBreakdown filters={filters} />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <CostComparison filters={filters} />
        </TabsContent>

        <TabsContent value="profitability" className="space-y-4">
          <ProfitabilityAnalysis filters={filters} />
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <CostExport filters={filters} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
