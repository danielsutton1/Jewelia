"use client"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Clock, Info, X } from "lucide-react"

export function AlertsNotifications() {
  // Mock data for alerts and notifications
  const alerts = [
    {
      id: 1,
      type: "warning",
      message: "3 products have inventory discrepancies",
      time: "10 minutes ago",
      action: "Review",
    },
    {
      id: 2,
      type: "info",
      message: "New shipping rate changes effective next week",
      time: "2 hours ago",
      action: "View",
    },
    {
      id: 3,
      type: "success",
      message: "Integration successfully updated to v2.3",
      time: "Yesterday",
      action: null,
    },
    {
      id: 4,
      type: "warning",
      message: "Order #JW-5782 requires attention",
      time: "Yesterday",
      action: "Process",
    },
  ]

  // Helper function to render icon based on alert type
  const renderIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div key={alert.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
          <div className="mt-0.5">{renderIcon(alert.type)}</div>
          <div className="flex-1 space-y-1">
            <p className="text-sm">{alert.message}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{alert.time}</p>
              {alert.action && (
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                  {alert.action}
                </Button>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  )
}
