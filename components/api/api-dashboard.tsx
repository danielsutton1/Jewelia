"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActiveIntegrations } from "./active-integrations"
import { UsageStatistics } from "./usage-statistics"
import { ErrorLogs } from "./error-logs"
import { RateLimits } from "./rate-limits"
import { ConfigurationPanel } from "./configuration/configuration-panel"
import { MonitoringDashboard } from "./monitoring/monitoring-dashboard"
import { TestingTools } from "./testing/testing-tools"

export default function ApiDashboard() {
  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">API Management</h1>
        <p className="text-muted-foreground">Manage your API integrations, monitor usage, and configure settings</p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <ActiveIntegrations />
            <UsageStatistics />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <ErrorLogs />
            <RateLimits />
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="pt-4">
          <ConfigurationPanel />
        </TabsContent>

        <TabsContent value="monitoring" className="pt-4">
          <MonitoringDashboard />
        </TabsContent>

        <TabsContent value="testing" className="pt-4">
          <TestingTools />
        </TabsContent>
      </Tabs>
    </div>
  )
}
