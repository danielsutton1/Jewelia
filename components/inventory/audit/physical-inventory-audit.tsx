"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { AuditDashboard } from "./audit-dashboard"
import { NewAudit } from "./new-audit"
import { AuditReports } from "./audit-reports"
import { AuditHistory } from "./audit-history"

export function PhysicalInventoryAudit() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <Card className="p-6">
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="new-audit">New Audit</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6">
          <AuditDashboard onStartNewAudit={() => setActiveTab("new-audit")} />
        </TabsContent>
        <TabsContent value="new-audit" className="mt-6">
          <NewAudit />
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
          <AuditReports />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <AuditHistory />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
