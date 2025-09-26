"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderList } from "@/components/dropship-portal/orders/order-list"
import { OrderDetail } from "@/components/dropship-portal/orders/order-detail"
import { OrderFilters } from "@/components/dropship-portal/orders/order-filters"
import { ExceptionHandling } from "@/components/dropship-portal/orders/exception-handling"
import { ReturnsProcess } from "@/components/dropship-portal/orders/returns-process"

export default function OrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [filters, setFilters] = useState<any>({})

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground">View and manage orders, handle exceptions, and process returns</p>
      </div>

      <Tabs defaultValue="all-orders" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="all-orders">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
        </TabsList>

        <TabsContent value="all-orders">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                  <CardDescription>Filter orders by status, date, and more</CardDescription>
                </CardHeader>
                <CardContent>
                  <OrderFilters onFiltersChange={handleFiltersChange} />
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              {selectedOrderId ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                    <CardDescription>View and manage order {selectedOrderId}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <OrderDetail orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Orders</CardTitle>
                    <CardDescription>View and manage all orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <OrderList onSelectOrder={setSelectedOrderId} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Orders</CardTitle>
              <CardDescription>Orders awaiting processing and shipment</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderList onSelectOrder={setSelectedOrderId} filterStatus="pending" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exceptions">
          <Card>
            <CardHeader>
              <CardTitle>Exception Handling</CardTitle>
              <CardDescription>Manage orders with exceptions or issues</CardDescription>
            </CardHeader>
            <CardContent>
              <ExceptionHandling />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns">
          <Card>
            <CardHeader>
              <CardTitle>Returns Process</CardTitle>
              <CardDescription>Manage customer returns and refunds</CardDescription>
            </CardHeader>
            <CardContent>
              <ReturnsProcess />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
