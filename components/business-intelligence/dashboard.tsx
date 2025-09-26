"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/business-intelligence/date-range-picker"
import { KeyMetricsCards } from "@/components/business-intelligence/key-metrics-cards"
import { RevenueChart } from "@/components/business-intelligence/revenue-chart"
import { CategoryPerformance } from "@/components/business-intelligence/category-performance"
import { TopCustomers } from "@/components/business-intelligence/top-customers"
import { TopProducts } from "@/components/business-intelligence/top-products"
import { InventoryHealth } from "@/components/business-intelligence/inventory-health"
import { ExportButton } from "@/components/business-intelligence/export-button"
import { ComparisonToggle } from "@/components/business-intelligence/comparison-toggle"
import { RefreshButton } from "@/components/business-intelligence/refresh-button"

export function BusinessIntelligenceDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [showComparison, setShowComparison] = useState(false)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight business-intelligence-heading">Business Intelligence</h1>
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
          <ComparisonToggle showComparison={showComparison} setShowComparison={setShowComparison} />
          <RefreshButton />
          <ExportButton />
        </div>
      </div>

      <KeyMetricsCards dateRange={dateRange} showComparison={showComparison} />

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <RevenueChart dateRange={dateRange} showComparison={showComparison} />
        </div>
        <div>
          <InventoryHealth />
        </div>
      </div>

      <CategoryPerformance dateRange={dateRange} showComparison={showComparison} />

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <TopCustomers dateRange={dateRange} />
        <TopProducts dateRange={dateRange} />
      </div>
    </div>
  )
}
