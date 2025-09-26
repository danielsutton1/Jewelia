import type { Metadata } from "next"
import { ActivePOs } from "@/components/purchase-orders/dashboard/active-pos"
import { OverdueDeliveries } from "@/components/purchase-orders/dashboard/overdue-deliveries"
import { PendingApprovals } from "@/components/purchase-orders/dashboard/pending-approvals"
import { SpendAnalytics } from "@/components/purchase-orders/dashboard/spend-analytics"
import { mockPurchaseOrders } from "@/data/mock-purchase-orders"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { FileText, TrendingUp, Clock, AlertTriangle } from "lucide-react"

export const metadata: Metadata = {
  title: "Purchase Orders Dashboard | Jewelia CRM",
  description: "Monitor and manage your purchase orders",
}

export default function PODashboardPage() {
  // Calculate summary metrics
  const totalPOs = mockPurchaseOrders.length
  const activePOs = mockPurchaseOrders.filter((po) => po.status !== "completed" && po.status !== "cancelled").length

  const totalSpend = mockPurchaseOrders.filter((po) => po.status !== "cancelled").reduce((sum, po) => sum + po.totalAmount, 0)

  const pendingApprovals = mockPurchaseOrders.filter((po) => po.status === "pending_approval").length

  const today = new Date()
  const overduePOs = mockPurchaseOrders.filter((po) => {
    if (po.status === "completed" || po.status === "cancelled") return false

    const expectedDelivery = new Date(po.deliveryDate)
    return expectedDelivery < today && (po.status === "sent" || po.status === "partially_received")
  }).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Purchase Orders Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your purchase orders, track deliveries, and analyze spending
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchase Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPOs}</div>
            <p className="text-xs text-muted-foreground mt-1">{activePOs} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpend)}</div>
            <p className="text-xs text-muted-foreground mt-1">Year to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Deliveries</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overduePOs}</div>
            <p className="text-xs text-muted-foreground mt-1">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ActivePOs purchaseOrders={mockPurchaseOrders} />
        <PendingApprovals purchaseOrders={mockPurchaseOrders} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <OverdueDeliveries purchaseOrders={mockPurchaseOrders} />
        <SpendAnalytics purchaseOrders={mockPurchaseOrders} />
      </div>
    </div>
  )
}
