"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Printer, Share2, MoreHorizontal, Edit, Download, Mail } from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { OrderItemsTable } from "./order-items-table"
import { OrderStatusWorkflow } from "./order-status-workflow"
import { OrderQuickActions } from "./order-quick-actions"
import { AddOrderItemDialog, InventoryItem } from "@/components/orders/add-order-item-dialog"
import { OrderItem as UIOrderItem } from "@/components/orders/order-items-table"
import { MessageActions } from "./message-actions"
import { ProductionConversationLog } from "./production-conversation-log"
import { StageManagement } from "./stage-management"
import { type ProductionStage } from "@/types/production"
import { copyToClipboard } from "@/components/ui/utils";

// Mock data for demonstration
const mockOrderData = {
  id: "ORD-12345",
  date: new Date(2023, 4, 15),
  status: "In Production",
  customer: {
    id: "CUST-789",
    name: "Emma Thompson",
    email: "emma.thompson@example.com",
    phone: "(555) 123-4567",
    avatar: "/abstract-geometric-shapes.png",
  },
  items: [
    { id: "ITEM-1", name: "Diamond Engagement Ring", quantity: 1, price: 2499.99, status: "In Production" },
    { id: "ITEM-2", name: "Gold Wedding Band", quantity: 1, price: 799.99, status: "Ready" },
  ],
  payments: [
    { id: "PAY-1", date: new Date(2023, 4, 15), amount: 1000, method: "Credit Card", status: "Completed" },
    { id: "PAY-2", date: new Date(2023, 4, 30), amount: 2299.98, method: "Financing", status: "Pending" },
  ],
  activities: [
    {
      id: "ACT-1",
      date: new Date(2023, 4, 15, 10, 30),
      user: "Sarah Johnson",
      action: "Created order",
      details: "Initial order creation",
    },
  ],
  documents: [
    { id: "DOC-1", name: "Order Agreement", type: "PDF", date: new Date(2023, 4, 15), size: "245 KB" },
  ],
  workflow: {
    stages: [
      { id: "stage-1", name: "Order Created", completed: true },
      { id: "stage-2", name: "Payment Received", completed: true },
      { id: "stage-3", name: "In Production", completed: false, current: true },
    ],
    approvals: [
      { id: "approval-1", name: "Design Approval", status: "approved", approver: "Customer" },
      { id: "approval-2", name: "Production Manager", status: "pending", approver: "Michael Chen" },
    ],
  },
  totalAmount: 3299.98,
  paidAmount: 1000,
  balanceDue: 2299.98,
  externalPartner: "Precision Casters Inc."
}

interface OrderDetailInterfaceProps {
  orderId: string
}

export function OrderDetailInterface({ orderId }: OrderDetailInterfaceProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("items")
  const order = mockOrderData
  const assignee = order.workflow.approvals.find(a => a.approver !== 'Customer')?.approver || 'Default Assignee'
  const partnerName = order.externalPartner || 'Default Partner'

  const [items, setItems] = useState<UIOrderItem[]>(
    order.items.map((item: any, idx: number) => ({
      id: item.id || `item-${idx}`,
      image: "/placeholder.svg",
      sku: item.sku || `SKU-${idx + 1}`,
      name: item.name || `Item ${idx + 1}`,
      description: item.description || "",
      quantity: item.quantity || 1,
      unitPrice: item.price || 100,
      discount: { type: "percentage", value: 0, reason: "" },
      taxExempt: false,
      notes: "",
    }))
  )
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const handleAddItem = () => {
    setAddDialogOpen(true)
  }
  
  const handleAddInventoryItem = (item: InventoryItem) => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        image: item.image,
        sku: item.sku,
        name: item.name,
        description: item.description || "",
        quantity: 1,
        unitPrice: item.unitPrice,
        discount: { type: "percentage", value: 0, reason: "" },
        taxExempt: false,
        notes: "",
      },
    ])
    setAddDialogOpen(false)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in production":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: `Order ${order.id}`, url })
    } else {
      copyToClipboard(url, (msg) => toast({ title: msg, description: "Order link copied to clipboard." }))
    }
  }

  const handleEdit = () => {
    router.push(`/dashboard/orders/${order.id}/edit`)
  }

  const handleExportPDF = () => {
    toast({ title: "Export as PDF", description: "PDF export is not available in this demo." })
  }

  const handleEmail = () => {
    window.open(`mailto:${order.customer.email}?subject=Order%20${order.id}`)
  }

  const handleAddPayment = () => {
    router.push(`/dashboard/orders/${order.id}/payment`)
    toast({ title: "Add Payment", description: `Navigating to add payment for order ${order.id}.` })
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleUploadDocument = () => {
    fileInputRef.current?.click()
  }
  
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      toast({ title: "Document Uploaded", description: `${e.target.files[0].name} uploaded (demo only).` })
    }
  }
  
  const handleViewDocument = (doc: any) => {
    toast({ title: "View Document", description: `Viewing ${doc.name} (demo only).` })
  }
  
  const handleDownloadDocument = (doc: any) => {
    toast({ title: "Download Document", description: `Downloading ${doc.name} (demo only).` })
  }

  const handleRefreshConversations = () => {
    // This will trigger a refresh of the conversation log
  }

  const mapOrderStatusToStage = (status: string): ProductionStage => {
    const statusMap: Record<string, ProductionStage> = {
      'pending': 'Design',
      'in_progress': 'Setting',
      'completed': 'Completed',
      'cancelled': 'Design',
      'on_hold': 'Design',
      'shipped': 'Shipping',
      'delivered': 'Completed'
    }
    return statusMap[status.toLowerCase()] || 'Design'
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="flex items-center justify-between mb-6 print:hidden">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <MessageActions 
            orderId={order.id}
            customerName={order.customer.name}
            assigneeName={assignee}
            partnerName={partnerName}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Order
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Email to Customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">{order.id}</h1>
                  <p className="text-muted-foreground">
                    {format(order.date, "MMMM dd, yyyy")}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
              <Separator className="my-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h2 className="font-semibold mb-2">Customer</h2>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={order.customer.avatar} />
                      <AvatarFallback>
                        {order.customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="font-semibold mb-2">Assigned To</h2>
                  <p>{assignee}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2 print:hidden">
            <div className="flex flex-wrap gap-2">
              <OrderQuickActions
                orderId={order.id}
                currentStatus={order.status}
                customerName={order.customer.name}
                assigneeName={assignee}
                include={[
                  'assign',
                  'production',
                  'note',
                  'pickup',
                  'duplicate',
                  'return',
                  'status',
                  'followUp'
                ]}
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="px-6 border-b">
                  <TabsTrigger value="items">Items</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="communications">Communications</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                <TabsContent value="items" className="p-6">
                  <OrderItemsTable
                    items={items}
                    onItemsChange={setItems}
                    onAddItem={handleAddItem}
                  />
                </TabsContent>
                <TabsContent value="payments" className="p-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between print:hidden">
                        <h3 className="text-lg font-medium">Payment History</h3>
                        <Button size="sm" onClick={handleAddPayment}>Add Payment</Button>
                      </div>
                      <div className="mt-4">
                        <div className="rounded-md border">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium">Date</th>
                                <th className="px-4 py-3 text-left font-medium">Amount</th>
                                <th className="px-4 py-3 text-left font-medium">Method</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.payments.map((payment) => (
                                <tr key={payment.id} className="border-b">
                                  <td className="px-4 py-3">{format(payment.date, "MMM d, yyyy")}</td>
                                  <td className="px-4 py-3">${payment.amount.toFixed(2)}</td>
                                  <td className="px-4 py-3">{payment.method}</td>
                                  <td className="px-4 py-3">
                                    <Badge variant={payment.status.toLowerCase() === "completed" ? "default" : "outline"}>
                                      {payment.status}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="timeline" className="p-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium">Activity Timeline</h3>
                      <div className="mt-4">
                        <div className="space-y-4">
                          {order.activities.map((activity, index) => (
                            <div key={activity.id} className="relative pl-6">
                              {index < order.activities.length - 1 && (
                                <div className="absolute left-2 top-3 h-full w-0.5 -translate-x-1/2 bg-muted" />
                              )}
                              <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                              <div>
                                <p className="font-medium">{activity.action}</p>
                                <p className="text-sm text-muted-foreground">{activity.details}</p>
                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{activity.user}</span>
                                  <span>•</span>
                                  <span>{format(activity.date, "MMM d, yyyy h:mm a")}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="communications" className="p-6">
                  <ProductionConversationLog orderId={orderId} />
                </TabsContent>
                <TabsContent value="documents" className="p-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between print:hidden">
                        <h3 className="text-lg font-medium">Documents</h3>
                        <Button size="sm" onClick={handleUploadDocument}>Upload Document</Button>
                      </div>
                      <div className="mt-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={handleDocumentUpload}
                        />
                        <div className="rounded-md border">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Type</th>
                                <th className="px-4 py-3 text-left font-medium">Date</th>
                                <th className="px-4 py-3 text-left font-medium">Size</th>
                                <th className="px-4 py-3 text-left font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.documents.map((doc) => (
                                <tr key={doc.id} className="border-b">
                                  <td className="px-4 py-3">{doc.name}</td>
                                  <td className="px-4 py-3">{doc.type}</td>
                                  <td className="px-4 py-3">{format(doc.date, "MMM d, yyyy")}</td>
                                  <td className="px-4 py-3">{doc.size}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="ghost" onClick={() => handleViewDocument(doc)}>
                                        View
                                      </Button>
                                      <Button size="sm" variant="ghost" onClick={() => handleDownloadDocument(doc)}>
                                        Download
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Amount</span>
                  <span className="font-medium">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Paid</span>
                  <span className="text-green-600">
                    ${order.paidAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Balance Due</span>
                  <span className="font-medium text-red-600">
                    ${order.balanceDue.toFixed(2)}
                  </span>
                </div>
              </div>
              <Progress value={(order.paidAmount / order.totalAmount) * 100} className="mt-4" />
            </CardContent>
          </Card>
          <OrderStatusWorkflow workflow={{...order.workflow, checklist: []}} />
          <StageManagement 
            orderId={orderId} 
            currentStage={mapOrderStatusToStage(order.status)} 
            onStageCreated={handleRefreshConversations}
          />
        </div>
      </div>
      <AddOrderItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddInventoryItem}
      />
    </div>
  )
}

