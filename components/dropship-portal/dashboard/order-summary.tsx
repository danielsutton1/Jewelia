"use client"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle, AlertTriangle } from "lucide-react"

export function OrderSummary() {
  // Mock data for order summary
  const orderData = {
    totalOrders: 32,
    newOrders: 8,
    processing: 12,
    shipped: 18,
    exceptions: 2,
    percentageChange: 12,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Order Summary</h3>
          <p className="text-sm text-muted-foreground">Current order status and processing metrics</p>
        </div>
        <Badge
          variant="outline"
          className={
            orderData.percentageChange >= 0
              ? "bg-green-50 text-green-700 border-green-200 gap-1"
              : "bg-red-50 text-red-700 border-red-200 gap-1"
          }
        >
          {orderData.percentageChange >= 0 ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {Math.abs(orderData.percentageChange)}% from last week
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <div className="text-xs font-medium">New</div>
          </div>
          <div className="mt-1 text-xl font-bold">{orderData.newOrders}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <div className="text-xs font-medium">Processing</div>
          </div>
          <div className="mt-1 text-xl font-bold">{orderData.processing}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div className="text-xs font-medium">Shipped</div>
          </div>
          <div className="mt-1 text-xl font-bold">{orderData.shipped}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div className="text-xs font-medium">Exceptions</div>
          </div>
          <div className="mt-1 text-xl font-bold">{orderData.exceptions}</div>
        </div>
      </div>
    </div>
  )
}
