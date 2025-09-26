"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmergencySuppliers } from "./emergency-suppliers"
import { RushServiceProviders } from "./rush-service-providers"
import { OverflowCapacity } from "./overflow-capacity"
import { QuickActivation } from "./quick-activation"
import { PerformanceTracking } from "./performance-tracking"
import { EscalationProcedures } from "./escalation-procedures"

export function BackupPartnerDashboard() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Backup Partner Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Activation</CardTitle>
            <CardDescription>Rapidly activate backup partners in emergency situations</CardDescription>
          </CardHeader>
          <CardContent>
            <QuickActivation />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Tracking</CardTitle>
            <CardDescription>Monitor backup partner performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceTracking />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Escalation Procedures</CardTitle>
          <CardDescription>Standard procedures for escalating partner issues</CardDescription>
        </CardHeader>
        <CardContent>
          <EscalationProcedures />
        </CardContent>
      </Card>

      <Tabs defaultValue="emergency">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="emergency">Emergency Suppliers</TabsTrigger>
          <TabsTrigger value="rush">Rush Service Providers</TabsTrigger>
          <TabsTrigger value="overflow">Overflow Capacity</TabsTrigger>
        </TabsList>
        <TabsContent value="emergency">
          <EmergencySuppliers />
        </TabsContent>
        <TabsContent value="rush">
          <RushServiceProviders />
        </TabsContent>
        <TabsContent value="overflow">
          <OverflowCapacity />
        </TabsContent>
      </Tabs>
    </div>
  )
}
