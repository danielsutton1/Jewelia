"use client"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react"

export function IntegrationHealth() {
  // Mock data for integration health
  const integrationData = {
    overallHealth: 98,
    lastSync: "5 minutes ago",
    productSync: "Healthy",
    inventorySync: "Healthy",
    orderSync: "Warning",
    shippingSync: "Healthy",
  }

  // Helper function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Healthy":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
            <CheckCircle className="h-3.5 w-3.5" />
            Healthy
          </Badge>
        )
      case "Warning":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Warning
          </Badge>
        )
      case "Error":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
            <XCircle className="h-3.5 w-3.5" />
            Error
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3.5 w-3.5" />
            Unknown
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Integration Health</h3>
          <p className="text-sm text-muted-foreground">Status of your integration with Jewelia</p>
        </div>
        <Badge
          variant="outline"
          className={
            integrationData.overallHealth > 90
              ? "bg-green-50 text-green-700 border-green-200"
              : integrationData.overallHealth > 75
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-red-50 text-red-700 border-red-200"
          }
        >
          {integrationData.overallHealth}% Healthy
        </Badge>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium">Last Successful Sync</div>
          <div className="text-sm">{integrationData.lastSync}</div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm">Product Sync</div>
            {renderStatusBadge(integrationData.productSync)}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">Inventory Sync</div>
            {renderStatusBadge(integrationData.inventorySync)}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">Order Sync</div>
            {renderStatusBadge(integrationData.orderSync)}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">Shipping Sync</div>
            {renderStatusBadge(integrationData.shippingSync)}
          </div>
        </div>
      </div>
    </div>
  )
}
