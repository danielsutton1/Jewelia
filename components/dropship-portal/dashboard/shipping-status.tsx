"use client"
import { Badge } from "@/components/ui/badge"
import { Truck, Clock, CheckCircle, AlertTriangle } from "lucide-react"

export function ShippingStatus() {
  // Mock data for shipping status
  const shippingData = {
    pendingShipments: 12,
    inTransit: 24,
    delivered: 18,
    delayed: 3,
    averageShippingTime: "2.3 days",
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Shipping Status</h3>
          <p className="text-sm text-muted-foreground">Current shipping metrics and delivery status</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
          <Truck className="h-3.5 w-3.5" />
          Avg: {shippingData.averageShippingTime}
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <div className="text-xs font-medium">Pending</div>
          </div>
          <div className="mt-1 text-xl font-bold">{shippingData.pendingShipments}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-500" />
            <div className="text-xs font-medium">In Transit</div>
          </div>
          <div className="mt-1 text-xl font-bold">{shippingData.inTransit}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div className="text-xs font-medium">Delivered</div>
          </div>
          <div className="mt-1 text-xl font-bold">{shippingData.delivered}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div className="text-xs font-medium">Delayed</div>
          </div>
          <div className="mt-1 text-xl font-bold">{shippingData.delayed}</div>
        </div>
      </div>
    </div>
  )
}
