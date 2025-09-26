"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SupplierPerformanceFilters from "./supplier-performance-filters"
import DeliveryPerformance from "./delivery-performance"
import QualityScores from "./quality-scores"
import PriceCompetitiveness from "./price-competitiveness"
import ResponseTimes from "./response-times"
import IssueResolution from "./issue-resolution"
import SupplierRankings from "./supplier-rankings"
import CategoryAnalysis from "./category-analysis"
import CostTrending from "./cost-trending"
import RiskAssessment from "./risk-assessment"
import SupplierScorecard from "./supplier-scorecard"
import SupplierSpendAnalysis from "./supplier-spend-analysis"
import PerformanceTrends from "./performance-trends"
import SupplierComplianceStatus from "./supplier-compliance-status"
import SourcingOptimization from "./sourcing-optimization"

export default function SupplierPerformanceDashboard() {
  const [timeRange, setTimeRange] = useState("last-quarter")
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const handleFiltersChange = (
    newTimeRange: string,
    newSelectedSuppliers: string[],
    newSelectedCategories: string[],
  ) => {
    setTimeRange(newTimeRange)
    setSelectedSuppliers(newSelectedSuppliers)
    setSelectedCategories(newSelectedCategories)
  }

  return (
    <div className="container mx-auto py-3 sm:py-4 md:py-6 space-y-4 sm:space-y-6 md:space-y-8 px-3 sm:px-4 md:px-6">
      <div className="flex flex-col space-y-1 sm:space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Supplier Performance Analytics</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Comprehensive analytics and insights for supplier performance management
        </p>
      </div>

      <SupplierPerformanceFilters
        timeRange={timeRange}
        selectedSuppliers={selectedSuppliers}
        selectedCategories={selectedCategories}
        onFiltersChange={handleFiltersChange}
      />

      <Tabs defaultValue="kpis" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 w-full max-w-4xl gap-1 sm:gap-2 overflow-x-auto">
          <TabsTrigger value="kpis" className="text-xs sm:text-sm min-h-[44px]">KPI Tracking</TabsTrigger>
          <TabsTrigger value="comparisons" className="text-xs sm:text-sm min-h-[44px]">Comparisons</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm min-h-[44px]">Reports</TabsTrigger>
          <TabsTrigger value="sourcing" className="text-xs sm:text-sm min-h-[44px]">Sourcing Optimization</TabsTrigger>
          <TabsTrigger value="dashboard" className="text-xs sm:text-sm min-h-[44px]">Executive Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="kpis" className="space-y-4 sm:space-y-6 pt-3 sm:pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <DeliveryPerformance
              timeRange={timeRange}
              selectedSuppliers={selectedSuppliers}
              selectedCategories={selectedCategories}
            />
            <QualityScores
              timeRange={timeRange}
              selectedSuppliers={selectedSuppliers}
              selectedCategories={selectedCategories}
            />
            <PriceCompetitiveness
              timeRange={timeRange}
              selectedSuppliers={selectedSuppliers}
              selectedCategories={selectedCategories}
            />
            <ResponseTimes
              timeRange={timeRange}
              selectedSuppliers={selectedSuppliers}
              selectedCategories={selectedCategories}
            />
            <IssueResolution
              timeRange={timeRange}
              selectedSuppliers={selectedSuppliers}
              selectedCategories={selectedCategories}
            />
          </div>
        </TabsContent>

        <TabsContent value="comparisons" className="space-y-4 sm:space-y-6 pt-3 sm:pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <SupplierRankings
              timeRange={timeRange}
              selectedSuppliers={selectedSuppliers}
              selectedCategories={selectedCategories}
            />
            <CategoryAnalysis
              timeRange={timeRange}
              selectedSuppliers={selectedSuppliers}
              selectedCategories={selectedCategories}
            />
            <CostTrending
              timeRange={timeRange}
              selectedSuppliers={selectedSuppliers}
              selectedCategories={selectedCategories}
            />
            <RiskAssessment
              timeRange={timeRange}
              selectedSuppliers={selectedSuppliers}
              selectedCategories={selectedCategories}
            />
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 sm:space-y-6 pt-3 sm:pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <SupplierScorecard
              timeRange={timeRange}
              selectedSuppliers={selectedSuppliers}
              selectedCategories={selectedCategories}
            />
            <SupplierSpendAnalysis
              timeRange={timeRange}
              selectedSuppliers={selectedSuppliers}
              selectedCategories={selectedCategories}
            />
            <PerformanceTrends
              timeRange={timeRange}
              selectedSuppliers={selectedSuppliers}
              selectedCategories={selectedCategories}
            />
            <SupplierComplianceStatus
              timeRange={timeRange}
              selectedSuppliers={selectedSuppliers}
              selectedCategories={selectedCategories}
            />
          </div>
        </TabsContent>

        <TabsContent value="sourcing" className="space-y-4 sm:space-y-6 pt-3 sm:pt-4">
          <SourcingOptimization
            timeRange={timeRange}
            selectedSuppliers={selectedSuppliers}
            selectedCategories={selectedCategories}
          />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4 sm:space-y-6 pt-3 sm:pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <Card>
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-base">Top Performing Suppliers</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Based on overall score</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-3 sm:space-y-4">
                  {/* Top 5 suppliers would be displayed here */}
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm sm:text-base">Diamond Direct</span>
                    <span className="text-green-600 font-semibold text-sm sm:text-base">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm sm:text-base">Precision Casting</span>
                    <span className="text-green-600 font-semibold text-sm sm:text-base">92%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm sm:text-base">Gem Source</span>
                    <span className="text-green-600 font-semibold text-sm sm:text-base">89%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm sm:text-base">Master Plating</span>
                    <span className="text-green-600 font-semibold text-sm sm:text-base">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm sm:text-base">Goldsmith Supplies</span>
                    <span className="text-green-600 font-semibold text-sm sm:text-base">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-base">Critical Issues</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-3 sm:space-y-4">
                  <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="font-medium text-red-800 text-sm sm:text-base">Silver Source</div>
                    <div className="text-xs sm:text-sm text-red-700">3 consecutive late deliveries</div>
                  </div>
                  <div className="p-2 sm:p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="font-medium text-amber-800 text-sm sm:text-base">Artisan Engraving</div>
                    <div className="text-xs sm:text-sm text-amber-700">Quality score dropped 15%</div>
                  </div>
                  <div className="p-2 sm:p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="font-medium text-amber-800 text-sm sm:text-base">Express Shipping</div>
                    <div className="text-xs sm:text-sm text-amber-700">Price increase of 12%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-base">Sourcing Opportunities</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Potential cost savings</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-3 sm:space-y-4">
                  <div className="p-2 sm:p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="font-medium text-green-800 text-sm sm:text-base">Gold Findings</div>
                    <div className="text-xs sm:text-sm text-green-700">Potential 8% savings with new supplier</div>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="font-medium text-green-800 text-sm sm:text-base">Packaging Materials</div>
                    <div className="text-xs sm:text-sm text-green-700">Consolidate 3 suppliers to save 12%</div>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="font-medium text-green-800 text-sm sm:text-base">Silver Chains</div>
                    <div className="text-xs sm:text-sm text-green-700">Volume discount opportunity (15%)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
