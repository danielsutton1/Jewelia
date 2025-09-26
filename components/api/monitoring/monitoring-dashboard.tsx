import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { RealTimeStatus } from "./real-time-status"
import { PerformanceMetrics } from "./performance-metrics"
import { ErrorAlerts } from "./error-alerts"
import { UsageGraphs } from "./usage-graphs"

export function MonitoringDashboard() {
  return (
    <Card className="p-6">
      <Tabs defaultValue="real-time" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="real-time">Real-Time Status</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Error Alerts</TabsTrigger>
          <TabsTrigger value="usage">Usage Graphs</TabsTrigger>
        </TabsList>

        <TabsContent value="real-time" className="pt-6">
          <RealTimeStatus />
        </TabsContent>

        <TabsContent value="performance" className="pt-6">
          <PerformanceMetrics />
        </TabsContent>

        <TabsContent value="errors" className="pt-6">
          <ErrorAlerts />
        </TabsContent>

        <TabsContent value="usage" className="pt-6">
          <UsageGraphs />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
