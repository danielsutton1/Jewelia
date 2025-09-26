"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function PerformanceMetrics() {
  // Mock data for performance metrics
  const orderData = [
    { name: "Jan", orders: 65, revenue: 12400, fulfillment: 98 },
    { name: "Feb", orders: 78, revenue: 14800, fulfillment: 97 },
    { name: "Mar", orders: 82, revenue: 15600, fulfillment: 99 },
    { name: "Apr", orders: 75, revenue: 14200, fulfillment: 98 },
    { name: "May", orders: 85, revenue: 16200, fulfillment: 97 },
    { name: "Jun", orders: 92, revenue: 17500, fulfillment: 98 },
    { name: "Jul", orders: 105, revenue: 20000, fulfillment: 99 },
    { name: "Aug", orders: 110, revenue: 21000, fulfillment: 98 },
    { name: "Sep", orders: 115, revenue: 22000, fulfillment: 97 },
    { name: "Oct", orders: 120, revenue: 23000, fulfillment: 98 },
    { name: "Nov", orders: 125, revenue: 24000, fulfillment: 99 },
    { name: "Dec", orders: 130, revenue: 25000, fulfillment: 98 },
  ]

  const shippingData = [
    { name: "Standard", count: 450, percentage: 60 },
    { name: "Express", count: 225, percentage: 30 },
    { name: "Overnight", count: 75, percentage: 10 },
  ]

  return (
    <Tabs defaultValue="orders">
      <TabsList className="mb-4">
        <TabsTrigger value="orders">Orders & Revenue</TabsTrigger>
        <TabsTrigger value="fulfillment">Fulfillment Rate</TabsTrigger>
        <TabsTrigger value="shipping">Shipping Methods</TabsTrigger>
      </TabsList>

      <TabsContent value="orders">
        <div className="h-[300px]">
          <ChartContainer
            config={{
              orders: {
                label: "Orders",
                color: "hsl(var(--chart-1))",
              },
              revenue: {
                label: "Revenue ($)",
                color: "hsl(var(--chart-2))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={orderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="orders"
                  stroke="var(--color-orders)"
                  activeDot={{ r: 8 }}
                />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="var(--color-revenue)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </TabsContent>

      <TabsContent value="fulfillment">
        <div className="h-[300px]">
          <ChartContainer
            config={{
              fulfillment: {
                label: "Fulfillment Rate (%)",
                color: "hsl(var(--chart-3))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={orderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[90, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="fulfillment" stroke="var(--color-fulfillment)" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </TabsContent>

      <TabsContent value="shipping">
        <div className="h-[300px]">
          <ChartContainer
            config={{
              count: {
                label: "Order Count",
                color: "hsl(var(--chart-4))",
              },
              percentage: {
                label: "Percentage (%)",
                color: "hsl(var(--chart-5))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shippingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="var(--color-count)" />
                <Bar yAxisId="right" dataKey="percentage" fill="var(--color-percentage)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </TabsContent>
    </Tabs>
  )
}
