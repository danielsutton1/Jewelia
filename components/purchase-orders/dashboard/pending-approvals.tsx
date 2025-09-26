"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import type { PurchaseOrder } from "@/types/purchase-order"

interface PendingApprovalsProps {
  purchaseOrders: PurchaseOrder[]
}

export function PendingApprovals({ purchaseOrders }: PendingApprovalsProps) {
  const router = useRouter()

  // Filter POs pending approval
  const pendingApprovalPOs = purchaseOrders.filter((po) => po.status === "pending_approval").slice(0, 5) // Show only the first 5 for the dashboard

  const handleApprove = (id: string) => {
    // In a real app, this would call an API to approve the PO
    console.log(`Approving PO ${id}`)
  }

  const handleReject = (id: string) => {
    // In a real app, this would call an API to reject the PO
    console.log(`Rejecting PO ${id}`)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Pending Approvals</CardTitle>
          {pendingApprovalPOs.length > 0 && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 ml-2">
              {pendingApprovalPOs.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {pendingApprovalPOs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingApprovalPOs.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.poNumber}</TableCell>
                  <TableCell>{po.supplierName ?? "Unknown Supplier"}</TableCell>
                  <TableCell>{po.createdBy}</TableCell>
                  <TableCell>{formatCurrency(po.totalAmount)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/dashboard/purchase-orders/${po.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleApprove(po.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleReject(po.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">No pending approvals</p>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/purchase-orders?filter=pending")}>
            View All
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
