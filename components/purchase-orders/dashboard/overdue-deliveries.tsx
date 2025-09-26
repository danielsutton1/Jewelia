"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import type { PurchaseOrder } from "@/types/purchase-order"

interface OverdueDeliveriesProps {
  purchaseOrders: PurchaseOrder[]
}

export function OverdueDeliveries({ purchaseOrders }: OverdueDeliveriesProps) {
  const router = useRouter()
  const today = new Date()

  // Filter overdue POs
  const overduePOs = purchaseOrders
    .filter((po) => {
      if (po.status === "completed" || po.status === "cancelled") return false
      const expectedDelivery = new Date(po.deliveryDate)
      return expectedDelivery < today && (po.status === "sent" || po.status === "partially_received")
    })
    .slice(0, 5) // Show only the first 5 for the dashboard

  const getDaysOverdue = (date: string) => {
    const expectedDate = new Date(date)
    const diffTime = Math.abs(today.getTime() - expectedDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Overdue Deliveries</CardTitle>
          {overduePOs.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {overduePOs.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {overduePOs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overduePOs.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.poNumber}</TableCell>
                  <TableCell>{po.supplierName ?? "Unknown Supplier"}</TableCell>
                  <TableCell>{new Date(po.deliveryDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-500 font-medium">{getDaysOverdue(po.deliveryDate)} days</span>
                    </div>
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
            <p className="text-muted-foreground">No overdue deliveries</p>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/purchase-orders?filter=overdue")}>
            View All
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
