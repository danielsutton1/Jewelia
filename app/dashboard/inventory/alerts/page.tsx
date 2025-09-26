import type { Metadata } from "next"
import { StockAlertDashboard } from "@/components/inventory/stock-alert-dashboard"

export const metadata: Metadata = {
  title: "Stock Alert Management | Jewelia CRM",
  description: "Configure and manage inventory alerts for your jewelry business",
}

export default function StockAlertPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Alert Management</h1>
        <p className="text-muted-foreground">Configure alerts and notifications for your inventory management system</p>
      </div>

      <StockAlertDashboard />
    </div>
  )
}
