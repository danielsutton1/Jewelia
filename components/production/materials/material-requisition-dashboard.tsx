"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { MaterialRequestForm } from "./material-request-form"
import { PendingRequests } from "./pending-requests"
import { RequestHistory } from "./request-history"
import { LowStockWarnings } from "./low-stock-warnings"
import { MaterialsOverview } from "./materials-overview"

export function MaterialRequisitionDashboard() {
  const [activeTab, setActiveTab] = useState("new-request")

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <Tabs defaultValue="new-request" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="new-request">New Request</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>
            <TabsContent value="new-request" className="p-6">
              <MaterialRequestForm />
            </TabsContent>
            <TabsContent value="pending" className="p-6">
              <PendingRequests />
            </TabsContent>
            <TabsContent value="history" className="p-6">
              <RequestHistory />
            </TabsContent>
            <TabsContent value="overview" className="p-6">
              <MaterialsOverview />
            </TabsContent>
          </Tabs>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Low Stock Alerts</h3>
              <LowStockWarnings />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
