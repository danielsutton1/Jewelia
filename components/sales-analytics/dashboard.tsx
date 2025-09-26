"use client"

import { useState, useCallback } from "react"
import { SalesFilters } from "@/components/sales-analytics/sales-filters"
import { MetricsCards } from "@/components/sales-analytics/metrics-cards"
import { RevenueTrendChart } from "@/components/sales-analytics/revenue-trend-chart"
import { SalesByCategoryChart } from "@/components/sales-analytics/sales-by-category-chart"
import { ChannelPerformanceChart } from "@/components/sales-analytics/channel-performance-chart"
import { AverageOrderValueChart } from "@/components/sales-analytics/average-order-value-chart"
import { ConversionFunnelChart } from "@/components/sales-analytics/conversion-funnel-chart"
import { PredictiveTrending } from "@/components/sales-analytics/predictive-trending"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"

export function SalesAnalyticsDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    // Trigger refresh by updating the key, which will cause all components to re-fetch data
    setRefreshKey(prev => prev + 1)
    
    // Simulate refresh time
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1500)
  }, [])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight sales-analytics-heading">Sales Analytics</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="min-h-[44px] min-w-[44px]">
            <RefreshCw className={`mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
            <span className="sm:hidden">{isRefreshing ? "..." : "Refresh"}</span>
          </Button>
          <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px]">
            <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      <SalesFilters />

      {/* Pass refreshKey to force re-render and data refetch */}
      <div key={refreshKey}>
        <MetricsCards />
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <div key={`revenue-${refreshKey}`}>
          <RevenueTrendChart />
        </div>
        <div key={`category-${refreshKey}`}>
          <SalesByCategoryChart />
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <div key={`channel-${refreshKey}`}>
          <ChannelPerformanceChart />
        </div>
        <div key={`aov-${refreshKey}`}>
          <AverageOrderValueChart />
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-1 lg:grid-cols-3">
        <Card className="md:col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base sales-analytics-card-title">Conversion Funnel</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Tracking customer journey from view to purchase</CardDescription>
          </CardHeader>
          <CardContent>
            <ConversionFunnelChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base sales-analytics-card-title">Predictive Trending</CardTitle>
            <CardDescription className="text-xs sm:text-sm">AI-powered sales forecasts</CardDescription>
          </CardHeader>
          <CardContent>
            <PredictiveTrending />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
