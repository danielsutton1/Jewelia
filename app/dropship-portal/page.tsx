"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropshipDashboard } from "@/components/dropship-portal/dropship-dashboard"
import { IntegrationStatus } from "@/components/dropship-portal/integration/integration-status"
import { RecentOrders } from "@/components/dropship-portal/orders/recent-orders"
import { PerformanceMetrics } from "@/components/dropship-portal/dashboard/performance-metrics"
import { AlertsNotifications } from "@/components/dropship-portal/dashboard/alerts-notifications"

export default function DropshipPortalPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 space-y-6 sm:space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dropship-portal-heading">Drop-Shipping Partner Portal</h1>
        <p className="text-sm sm:text-base text-muted-foreground dropship-portal-subtext">
          Manage your product catalog, inventory, orders, and integration settings
        </p>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-3xl overflow-x-auto">
          <TabsTrigger value="dashboard" className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Dashboard</TabsTrigger>
          <TabsTrigger value="integration" className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Integration</TabsTrigger>
          <TabsTrigger value="orders" className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Orders</TabsTrigger>
          <TabsTrigger value="settings" className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-3 sm:space-y-4">
          <DropshipDashboard />

          <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Recent Orders</CardTitle>
                <CardDescription className="text-sm sm:text-base">Latest orders requiring your attention</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <RecentOrders />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Alerts & Notifications</CardTitle>
                <CardDescription className="text-sm sm:text-base">Important updates and alerts</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <AlertsNotifications />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Performance Metrics</CardTitle>
              <CardDescription className="text-sm sm:text-base">Key performance indicators for your drop-shipping partnership</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <PerformanceMetrics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-3 sm:space-y-4">
          <IntegrationStatus />
        </TabsContent>

        <TabsContent value="orders" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Order Management</CardTitle>
              <CardDescription className="text-sm sm:text-base">View and manage all orders from Jewelia customers</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Please use the navigation below to access different order management features.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Partner Settings</CardTitle>
              <CardDescription className="text-sm sm:text-base">Configure your drop-shipping integration settings</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Please use the navigation below to access different settings.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
// FORCE DEPLOYMENT - Thu Aug 21 20:12:08 EDT 2025 - All Supabase .or() method errors fixed
