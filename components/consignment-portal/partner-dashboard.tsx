"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { InventorySummary } from "./dashboard/inventory-summary"
import { SalesPerformance } from "./dashboard/sales-performance"
import { SettlementStatus } from "./dashboard/settlement-status"
import { CommissionSummary } from "./dashboard/commission-summary"
import { RecentActivity } from "./dashboard/recent-activity"
import { UpcomingSettlements } from "./dashboard/upcoming-settlements"
import { AlertsNotifications } from "./dashboard/alerts-notifications"
import Link from "next/link"

export function PartnerDashboard() {
  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight partner-dashboard-heading">Partner Dashboard</h2>
          <p className="text-sm sm:text-base text-muted-foreground partner-dashboard-subtext">Welcome back! Here's an overview of your consignment business.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" asChild className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">
            <Link href="/consignment-portal/inventory/add">Add New Item</Link>
          </Button>
          <Button asChild className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">
            <Link href="/consignment-portal/reports">View Reports</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-x-auto">
        <InventorySummary />
        <SalesPerformance />
        <SettlementStatus />
        <CommissionSummary />
      </div>

      <Tabs defaultValue="activity" className="space-y-3 sm:space-y-4">
        <TabsList className="grid w-full grid-cols-3 overflow-x-auto">
          <TabsTrigger value="activity" className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Recent Activity</TabsTrigger>
          <TabsTrigger value="settlements" className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Upcoming Settlements</TabsTrigger>
          <TabsTrigger value="alerts" className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">Alerts & Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="space-y-3 sm:space-y-4">
          <RecentActivity />
        </TabsContent>
        <TabsContent value="settlements" className="space-y-3 sm:space-y-4">
          <UpcomingSettlements />
        </TabsContent>
        <TabsContent value="alerts" className="space-y-3 sm:space-y-4">
          <AlertsNotifications />
        </TabsContent>
      </Tabs>
    </div>
  )
}
