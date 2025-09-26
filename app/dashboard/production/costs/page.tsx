import type { Metadata } from "next"
import { ProductionCostDashboard } from "@/components/production/costs/production-cost-dashboard"

export const metadata: Metadata = {
  title: "Production Cost Tracking | Jewelia CRM",
  description: "Track and analyze production costs for jewelry manufacturing",
}

export default function ProductionCostsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Production Cost Tracking</h1>
        <p className="text-muted-foreground">
          Track, analyze, and optimize production costs across all jewelry manufacturing processes
        </p>
      </div>
      <ProductionCostDashboard />
    </div>
  )
}
