import { InventoryAnalyticsDashboard } from "@/components/inventory-analytics/dashboard"

export default function InventoryAnalyticsPage() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight inventory-analytics-heading">Inventory Performance Analytics</h1>
        <p className="text-sm sm:text-base text-muted-foreground inventory-analytics-subtext">
          Comprehensive analysis and insights for optimizing your jewelry inventory
        </p>
      </div>

      <InventoryAnalyticsDashboard />
    </div>
  )
}
