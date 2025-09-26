"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductSync } from "./product-sync"
import { InventorySync } from "./inventory-sync"
import { OrderRouting } from "./order-routing"
import { ShippingUpdates } from "./shipping-updates"
import { TrackingInfo } from "./tracking-info"
import { ApiCredentials } from "./api-credentials"
import { WebhookSettings } from "./webhook-settings"
import { SyncHistory } from "./sync-history"

export function IntegrationStatus() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
          <CardDescription>Manage your product, inventory, order, and shipping integration</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="product-sync" className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="product-sync">Product Sync</TabsTrigger>
              <TabsTrigger value="inventory-sync">Inventory Levels</TabsTrigger>
              <TabsTrigger value="order-routing">Order Routing</TabsTrigger>
              <TabsTrigger value="shipping-updates">Shipping Updates</TabsTrigger>
              <TabsTrigger value="tracking-info">Tracking Info</TabsTrigger>
            </TabsList>

            <TabsContent value="product-sync">
              <ProductSync />
            </TabsContent>

            <TabsContent value="inventory-sync">
              <InventorySync />
            </TabsContent>

            <TabsContent value="order-routing">
              <OrderRouting />
            </TabsContent>

            <TabsContent value="shipping-updates">
              <ShippingUpdates />
            </TabsContent>

            <TabsContent value="tracking-info">
              <TrackingInfo />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>API Credentials</CardTitle>
            <CardDescription>Manage your API keys and authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <ApiCredentials />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhook Settings</CardTitle>
            <CardDescription>Configure webhooks for real-time updates</CardDescription>
          </CardHeader>
          <CardContent>
            <WebhookSettings />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sync History</CardTitle>
          <CardDescription>View recent synchronization activity and errors</CardDescription>
        </CardHeader>
        <CardContent>
          <SyncHistory />
        </CardContent>
      </Card>
    </div>
  )
}
