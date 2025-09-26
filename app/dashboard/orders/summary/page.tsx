"use client"

import { useState, useEffect } from "react"
import { OrderSummarySidebar } from "@/components/orders/order-summary-sidebar"
import { OrderItemsTable, OrderItem } from "@/components/orders/order-items-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function OrderSummaryPage() {
  const [orderStatus, setOrderStatus] = useState<"pending" | "processing" | "completed" | "cancelled" | "on-hold">(
    "processing",
  )
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  // Load order items from localStorage on component mount
  useEffect(() => {
    const savedOrder = localStorage.getItem("checkoutOrder")
    if (savedOrder) {
      try {
        const items = JSON.parse(savedOrder)
        setOrderItems(items)
      } catch (error) {
        console.error("Error parsing saved order:", error)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground">View and manage order information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
              <CardDescription>View and manage order details</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="items" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="items">Items</TabsTrigger>
                  <TabsTrigger value="customer">Customer</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="items" className="pt-4">
                  <OrderItemsTable 
                    items={orderItems} 
                    onItemsChange={setOrderItems}
                  />
                </TabsContent>
                <TabsContent value="customer" className="pt-4">
                  <div className="rounded-md border p-4">
                    <h3 className="mb-2 font-medium">Customer Information</h3>
                    <p>This tab would display customer details and contact information.</p>
                  </div>
                </TabsContent>
                <TabsContent value="shipping" className="pt-4">
                  <div className="rounded-md border p-4">
                    <h3 className="mb-2 font-medium">Shipping Information</h3>
                    <p>This tab would display shipping address and delivery details.</p>
                  </div>
                </TabsContent>
                <TabsContent value="history" className="pt-4">
                  <div className="rounded-md border p-4">
                    <h3 className="mb-2 font-medium">Order History</h3>
                    <p>This tab would display the history of actions taken on this order.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Update the current order status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={orderStatus === "pending" ? "default" : "outline"}
                  onClick={() => setOrderStatus("pending")}
                >
                  Pending
                </Button>
                <Button
                  variant={orderStatus === "processing" ? "default" : "outline"}
                  onClick={() => setOrderStatus("processing")}
                >
                  Processing
                </Button>
                <Button
                  variant={orderStatus === "completed" ? "default" : "outline"}
                  onClick={() => setOrderStatus("completed")}
                >
                  Completed
                </Button>
                <Button
                  variant={orderStatus === "on-hold" ? "default" : "outline"}
                  onClick={() => setOrderStatus("on-hold")}
                >
                  On Hold
                </Button>
                <Button
                  variant={orderStatus === "cancelled" ? "default" : "outline"}
                  onClick={() => setOrderStatus("cancelled")}
                >
                  Cancelled
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add more content here to demonstrate scrolling */}
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>Additional Order Information</CardTitle>
                  <CardDescription>Scroll to see the sticky sidebar in action</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    This content is added to demonstrate the sticky behavior of the order summary sidebar. As you scroll
                    down the page, the sidebar will stick to the viewport.
                  </p>
                  <p>
                    The order summary sidebar provides a quick overview of the order details, including item count,
                    subtotal, discounts, tax, shipping, total due, paid amount, and balance remaining.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <OrderSummarySidebar 
            orderStatus={orderStatus} 
            orderItems={orderItems.map(item => ({
              id: item.id,
              name: item.name,
              sku: item.sku,
              price: item.unitPrice,
              quantity: item.quantity,
              discount: item.discount.type === "percentage" ? (item.unitPrice * item.quantity * item.discount.value / 100) : item.discount.value,
            }))}
          />
        </div>
      </div>
    </div>
  )
}
