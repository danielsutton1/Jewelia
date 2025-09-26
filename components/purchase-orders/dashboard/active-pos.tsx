"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import type { PurchaseOrder } from "@/types/purchase-order"

interface ActivePOsProps {
  purchaseOrders: PurchaseOrder[]
}

export function ActivePOs({ purchaseOrders }: ActivePOsProps) {
  const router = useRouter()

  // Filter active POs (not completed or cancelled)
  const activePOs = purchaseOrders.filter((po) => po.status !== "completed" && po.status !== "cancelled").slice(0, 5) // Show only the first 5 for the dashboard

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-gray-200 text-gray-800"
      case "Pending Approval":
        return "bg-yellow-100 text-yellow-800"
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Ordered":
        return "bg-blue-100 text-blue-800"
      case "Partially Received":
        return "bg-purple-100 text-purple-800"
      case "Completed":
        return "bg-green-200 text-green-900"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Active Purchase Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {activePOs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activePOs.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.poNumber}</TableCell>
                  <TableCell>{po.supplierName ?? "Unknown Supplier"}</TableCell>
                  <TableCell>{new Date(po.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{formatCurrency(po.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(po.status)} variant="outline">
                      {po.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/dashboard/purchase-orders/${po.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">No active purchase orders</p>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/purchase-orders")}>
            View All
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
