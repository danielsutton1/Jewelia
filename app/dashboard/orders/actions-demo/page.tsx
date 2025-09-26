"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { OrderQuickActions } from "@/components/orders/order-quick-actions"

export default function OrderActionsDemo() {
  const [lastAction, setLastAction] = useState<string | null>(null)

  const handleActionComplete = (action: string) => {
    setLastAction(action)

    // Clear the notification after 3 seconds
    setTimeout(() => {
      setLastAction(null)
    }, 3000)
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Quick Actions</h1>
        <p className="text-muted-foreground mt-2">
          Demonstration of different order action menu variants for the Jewelia CRM
        </p>
      </div>

      {lastAction && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Action Performed</AlertTitle>
          <AlertDescription>
            Successfully executed action: <strong>{lastAction}</strong>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="actionBar">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="actionBar">Action Bar</TabsTrigger>
          <TabsTrigger value="dropdown">Dropdown Menu</TabsTrigger>
          <TabsTrigger value="compact">Compact View</TabsTrigger>
        </TabsList>

        <TabsContent value="actionBar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Action Bar Variant</CardTitle>
              <CardDescription>
                Shows all actions in a horizontal bar, ideal for desktop views with ample space
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-md">
                <OrderQuickActions
                  orderId="ORD-12345"
                  variant="actionBar"
                  onActionComplete={handleActionComplete}
                  currentStatus="Pending"
                  customerName="Emma Thompson"
                  assigneeName="John Smith"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dropdown" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dropdown Menu Variant</CardTitle>
              <CardDescription>Consolidates all actions into a dropdown menu, perfect for saving space</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-md flex justify-end">
                <OrderQuickActions
                  orderId="ORD-12345"
                  variant="dropdown"
                  onActionComplete={handleActionComplete}
                  currentStatus="Processing"
                  customerName="Emma Thompson"
                  assigneeName="John Smith"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compact" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Compact Variant</CardTitle>
              <CardDescription>
                Shows only icon buttons for primary actions, ideal for mobile or tight spaces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-md">
                <OrderQuickActions
                  orderId="ORD-12345"
                  variant="compact"
                  onActionComplete={handleActionComplete}
                  currentStatus="Ready"
                  customerName="Emma Thompson"
                  assigneeName="John Smith"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Example</CardTitle>
          <CardDescription>How the quick actions would appear in an order management context</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">Order #ORD-12345</h2>
                <p className="text-muted-foreground">Customer: Emma Thompson • May 15, 2023</p>
              </div>
              <OrderQuickActions
                orderId="ORD-12345"
                variant="dropdown"
                onActionComplete={handleActionComplete}
                currentStatus="Pending"
                customerName="Emma Thompson"
                assigneeName="John Smith"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Quick Actions</h3>
              <OrderQuickActions
                orderId="ORD-12345"
                variant="actionBar"
                onActionComplete={handleActionComplete}
                currentStatus="Pending"
                customerName="Emma Thompson"
                assigneeName="John Smith"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
