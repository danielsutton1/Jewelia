import { InventoryAnalyticsDashboard } from "@/components/inventory/analytics/inventory-analytics-dashboard"

export default function InventoryAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive insights and performance metrics for your jewelry inventory
        </p>
      </div>

      <InventoryAnalyticsDashboard />
    </div>
  )
}
