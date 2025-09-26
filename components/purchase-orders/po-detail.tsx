"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import type { PurchaseOrder } from "@/types/purchase-order"
import { PDFGenerator } from "@/components/purchase-orders/pdf-generator"
import { StatusWorkflow } from "@/components/purchase-orders/status-workflow"
import { ApprovalChain } from "@/components/purchase-orders/approval-chain"
import { DeliveryTrackingComponent } from "@/components/purchase-orders/delivery-tracking"
import { InvoiceMatching } from "@/components/purchase-orders/invoice-matching"
import { QualityInspectionComponent } from "@/components/purchase-orders/quality-inspection"
import { ArrowLeft, Edit, Copy, Send, Check, X, AlertTriangle, Truck } from "lucide-react"
import { useRouter } from "next/navigation"

interface PODetailProps {
  purchaseOrder: PurchaseOrder
}

export function PODetail({ purchaseOrder }: PODetailProps) {
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-200 text-gray-800"
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "partially_received":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-200 text-green-900"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderActionButtons = () => {
    switch (purchaseOrder.status) {
      case "draft":
        return (
          <>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button size="sm">
              <Send className="mr-2 h-4 w-4" />
              Submit for Approval
            </Button>
          </>
        )
      case "pending_approval":
        return (
          <>
            <Button variant="outline" size="sm" className="text-red-600">
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </>
        )
      case "approved":
        return (
          <Button size="sm">
            <Send className="mr-2 h-4 w-4" />
            Send to Supplier
          </Button>
        )
      case "sent":
        return (
          <Button size="sm">
            <Truck className="mr-2 h-4 w-4" />
            Record Delivery
          </Button>
        )
      case "partially_received":
        return (
          <Button size="sm">
            <Truck className="mr-2 h-4 w-4" />
            Complete Delivery
          </Button>
        )
      case "completed":
        return (
          <Button variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
        )
      case "cancelled":
        return (
          <Button variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/purchase-orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Purchase Order: {purchaseOrder.poNumber}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(purchaseOrder.status)} variant="outline">
                {purchaseOrder.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created on {new Date(purchaseOrder.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PDFGenerator purchaseOrder={purchaseOrder} />
          {renderActionButtons()}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">{purchaseOrder.supplierName}</div>
            <div className="text-sm text-muted-foreground mt-1">Address not available</div>
            <div className="text-sm text-muted-foreground">Email not available</div>
            <div className="text-sm text-muted-foreground">Phone not available</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivery Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">
              Expected: {new Date(purchaseOrder.deliveryDate).toLocaleDateString()}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {purchaseOrder.deliveryInstructions || "No special instructions"}
            </div>
            {new Date(purchaseOrder.deliveryDate) < new Date() &&
              purchaseOrder.status !== "completed" &&
              purchaseOrder.status !== "cancelled" && (
                <div className="flex items-center gap-1 mt-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Overdue</span>
                </div>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-sm">Subtotal:</span>
              <span>{formatCurrency(purchaseOrder.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0))}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm">Tax:</span>
              <span>{formatCurrency(purchaseOrder.lineItems.reduce((sum, item) => sum + (item.tax || 0), 0))}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm">Shipping:</span>
              <span>{formatCurrency(0)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-center font-medium">
              <span>Total:</span>
              <span>{formatCurrency(purchaseOrder.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Line Items</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Item</th>
                    <th className="text-left p-4">Description</th>
                    <th className="text-center p-4">Quantity</th>
                    <th className="text-right p-4">Unit Price</th>
                    <th className="text-right p-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrder.lineItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-4">
                        <div className="font-medium">{item.productId || "Custom Item"}</div>
                        <div className="text-sm text-muted-foreground">{(item as any).category || "Uncategorized"}</div>
                      </td>
                      <td className="p-4">{item.description}</td>
                      <td className="p-4 text-center">{item.quantity}</td>
                      <td className="p-4 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-4 text-right">{formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t">
                    <td colSpan={3} className="p-4"></td>
                    <td className="p-4 text-right font-medium">Subtotal:</td>
                    <td className="p-4 text-right">{formatCurrency(purchaseOrder.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0))}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="p-4"></td>
                    <td className="p-4 text-right font-medium">Tax:</td>
                    <td className="p-4 text-right">{formatCurrency(purchaseOrder.lineItems.reduce((sum, item) => sum + (item.tax || 0), 0))}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="p-4"></td>
                    <td className="p-4 text-right font-medium">Shipping:</td>
                    <td className="p-4 text-right">{formatCurrency(0)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="p-4"></td>
                    <td className="p-4 text-right font-medium text-lg">Total:</td>
                    <td className="p-4 text-right font-bold text-lg">{formatCurrency(purchaseOrder.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>

          {purchaseOrder.notes && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{purchaseOrder.notes}</p>
              </CardContent>
            </Card>
          )}

          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{purchaseOrder.paymentTerms || "Standard terms and conditions apply."}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="mt-4">
          <StatusWorkflow currentStatus={purchaseOrder.status} />
        </TabsContent>

        <TabsContent value="approvals" className="mt-4">
          <ApprovalChain steps={purchaseOrder.approvalChain} />
        </TabsContent>

        <TabsContent value="delivery" className="mt-4">
          <DeliveryTrackingComponent tracking={purchaseOrder.deliveryTracking!} />
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <InvoiceMatching invoices={purchaseOrder.invoices || []} lineItems={purchaseOrder.lineItems} />
        </TabsContent>

        <TabsContent value="quality" className="mt-4">
          <QualityInspectionComponent inspections={purchaseOrder.qualityInspections || []} lineItems={purchaseOrder.lineItems} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
