"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, AlertTriangle, Truck, Package, ExternalLink } from "lucide-react"

export function RecentOrders() {
  // Mock data for recent orders
  const orders = [
    {
      id: "JW-5782",
      customer: "Emma Johnson",
      date: "2023-11-15T10:30:00Z",
      items: 3,
      total: "$245.99",
      status: "pending",
    },
    {
      id: "JW-5781",
      customer: "Michael Smith",
      date: "2023-11-15T09:15:00Z",
      items: 1,
      total: "$129.50",
      status: "processing",
    },
    {
      id: "JW-5780",
      customer: "Sophia Williams",
      date: "2023-11-15T08:45:00Z",
      items: 2,
      total: "$178.25",
      status: "shipped",
    },
    {
      id: "JW-5779",
      customer: "James Brown",
      date: "2023-11-14T16:20:00Z",
      items: 4,
      total: "$312.75",
      status: "exception",
    },
    {
      id: "JW-5778",
      customer: "Olivia Davis",
      date: "2023-11-14T14:10:00Z",
      items: 2,
      total: "$156.50",
      status: "shipped",
    },
  ]

  // Helper function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
            <Clock className="h-3.5 w-3.5" />
            Pending
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
            <Package className="h-3.5 w-3.5" />
            Processing
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
            <Truck className="h-3.5 w-3.5" />
            Shipped
          </Badge>
        )
      case "exception":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Exception
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{order.id}</span>
              {renderStatusBadge(order.status)}
            </div>
            <p className="text-sm text-muted-foreground">{order.customer}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(order.date).toLocaleString()} • {order.items} items • {order.total}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="gap-1">
            <ExternalLink className="h-4 w-4" />
            View
          </Button>
        </div>
      ))}

      <div className="text-center">
        <Button variant="outline" size="sm">
          View All Orders
        </Button>
      </div>
    </div>
  )
}
