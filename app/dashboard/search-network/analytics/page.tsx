"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Filter, RefreshCw } from "lucide-react"
import { PartnerPerformanceOverview } from "@/components/partners/analytics/performance-overview"
import { PartnerSatisfactionScores } from "@/components/partners/analytics/satisfaction-scores"
import { DeliveryPerformance } from "@/components/partners/analytics/delivery-performance"
import { QualityRatings } from "@/components/partners/analytics/quality-ratings"
import { CostComparisons } from "@/components/partners/analytics/cost-comparisons"
import { ResponseTimes } from "@/components/partners/analytics/response-times"
import { PartnerComparisonMatrix } from "@/components/partners/analytics/comparison-matrix"
import { GeographicDistribution } from "@/components/partners/analytics/geographic-distribution"
import { CategoryBreakdown } from "@/components/partners/analytics/category-breakdown"
import { PartnerScorecard } from "@/components/partners/analytics/partner-scorecard"
import { ImprovementAreas } from "@/components/partners/analytics/improvement-areas"
import { RiskAssessment } from "@/components/partners/analytics/risk-assessment"
import { RecommendationEngine } from "@/components/partners/analytics/recommendation-engine"
import { PartnerAnalyticsFilters } from "@/components/partners/analytics/analytics-filters"

export default function PartnerAnalyticsPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedTimeRange, setSelectedTimeRange] = useState("last-12-months")
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const handleRefresh = () => {
    // In a real app, this would fetch fresh data
    setLastUpdated(new Date())
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Partner Analytics</h1>
          <p className="text-muted-foreground">Analyze and track your relationships with external partners</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {showFilters && <PartnerAnalyticsFilters />}

      <div className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleString()}</div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PartnerPerformanceOverview />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Top Performing Partners</CardTitle>
                <CardDescription>Based on overall satisfaction score</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Top partners component would go here */}
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  Top partners visualization
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Partners Needing Attention</CardTitle>
                <CardDescription>Based on declining performance</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Partners needing attention component would go here */}
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  Partners needing attention visualization
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Partner Activity</CardTitle>
              <CardDescription>Last 30 days of partner interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Recent activity component would go here */}
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                Recent activity timeline
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PartnerSatisfactionScores />
            <DeliveryPerformance />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QualityRatings />
            <CostComparisons />
          </div>

          <ResponseTimes />
        </TabsContent>

        <TabsContent value="visualizations" className="space-y-6">
          <PartnerComparisonMatrix />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GeographicDistribution />
            <CategoryBreakdown />
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PartnerScorecard />
            <ImprovementAreas />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RiskAssessment />
            <RecommendationEngine />
          </div>
        </TabsContent>

        <TabsContent value="partners" className="space-y-6">
          {/* Partner drill-down would go here */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Partner Performance Comparison</CardTitle>
              <CardDescription>Select partners to compare metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] flex items-center justify-center bg-muted/20 rounded-md">
                Partner comparison tool
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
