"use client"

import { Package, Truck, CheckCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DeliveryTracking } from "@/types/purchase-order"

interface DeliveryTrackingProps {
  tracking: DeliveryTracking
  className?: string
}

export function DeliveryTrackingComponent({ tracking, className }: DeliveryTrackingProps) {
  // Sort events by date in descending order
  const sortedEvents = [...tracking.events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase()

    if (statusLower.includes("delivered") || statusLower.includes("completed")) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else if (statusLower.includes("transit") || statusLower.includes("shipped")) {
      return <Truck className="h-5 w-5 text-blue-500" />
    } else if (statusLower.includes("picked up") || statusLower.includes("processed")) {
      return <Package className="h-5 w-5 text-purple-500" />
    } else {
      return <Clock className="h-5 w-5 text-amber-500" />
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Shipment Tracking</h3>
          <p className="text-sm text-muted-foreground">
            {tracking.carrier} • {tracking.trackingNumber}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">Status: {tracking.status}</div>
          <p className="text-xs text-muted-foreground">
            Last Updated: {new Date(tracking.lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>

      {tracking.estimatedDelivery && (
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="text-sm">Estimated Delivery</div>
          <div className="font-medium">
            {new Date(tracking.estimatedDelivery).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      )}

      <div className="space-y-4 mt-6">
        {sortedEvents.map((event, index) => (
          <div key={index} className="flex">
            <div className="mr-4 relative">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                {getStatusIcon(event.status)}
              </div>
              {index < sortedEvents.length - 1 && (
                <div className="absolute top-10 bottom-0 left-5 w-px bg-muted-foreground/30" />
              )}
            </div>

            <div className="flex-1 pb-6">
              <div className="font-medium">{event.status}</div>
              <div className="text-sm text-muted-foreground">{new Date(event.date).toLocaleString()}</div>
              {event.location && <div className="text-sm">{event.location}</div>}
              {event.description && <div className="text-sm mt-1">{event.description}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export { DeliveryTrackingComponent as DeliveryTracking };
