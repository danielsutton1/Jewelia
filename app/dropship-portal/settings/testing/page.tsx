"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TestingEnvironment } from "@/components/dropship-portal/settings/testing-environment"
import { TestOrders } from "@/components/dropship-portal/settings/test-orders"
import { TestResults } from "@/components/dropship-portal/settings/test-results"

export default function TestingPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Testing Environment</h1>
        <p className="text-muted-foreground">Test your integration before going live with real orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Testing</CardTitle>
          <CardDescription>Test your integration with Jewelia in a sandbox environment</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="environment" className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="test-orders">Test Orders</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="environment">
              <TestingEnvironment />
            </TabsContent>

            <TabsContent value="test-orders">
              <TestOrders />
            </TabsContent>

            <TabsContent value="results">
              <TestResults />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
