"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for performance trends
const performanceTrendData = [
  { month: "Jan", delivery: 4.2, quality: 4.0, price: 3.9, response: 4.1, overall: 4.1 },
  { month: "Feb", delivery: 4.3, quality: 4.1, price: 3.9, response: 4.2, overall: 4.1 },
  { month: "Mar", delivery: 4.3, quality: 4.2, price: 4.0, response: 4.2, overall: 4.2 },
  { month: "Apr", delivery: 4.4, quality: 4.3, price: 4.0, response: 4.3, overall: 4.3 },
  { month: "May", delivery: 4.5, quality: 4.3, price: 4.1, response: 4.4, overall: 4.3 },
  { month: "Jun", delivery: 4.5, quality: 4.4, price: 4.1, response: 4.5, overall: 4.4 },
  { month: "Jul", delivery: 4.6, quality: 4.4, price: 4.2, response: 4.5, overall: 4.4 },
  { month: "Aug", delivery: 4.6, quality: 4.5, price: 4.2, response: 4.6, overall: 4.5 },
  { month: "Sep", delivery: 4.7, quality: 4.5, price: 4.3, response: 4.6, overall: 4.5 },
  { month: "Oct", delivery: 4.7, quality: 4.6, price: 4.3, response: 4.7, overall: 4.6 },
  { month: "Nov", delivery: 4.8, quality: 4.6, price: 4.4, response: 4.7, overall: 4.6 },
  { month: "Dec", delivery: 4.8, quality: 4.7, price: 4.4, response: 4.8, overall: 4.7 },
]

interface PerformanceTrendsProps {
  timeRange: string
  selectedSuppliers: string[]
  selectedCategories: string[]
}

export function PerformanceTrends({ timeRange, selectedSuppliers, selectedCategories }: PerformanceTrendsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
        <CardDescription>Historical performance analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overall">
          <TabsList className="mb-4">
            <TabsTrigger value="overall">Overall Performance</TabsTrigger>
            <TabsTrigger value="metrics">Individual Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overall">
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  overall: {
                    label: "Overall Performance",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[3.5, 5]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="overall"
                      stroke="var(--color-overall)"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  delivery: {
                    label: "Delivery Performance",
                    color: "hsl(var(--chart-1))",
                  },
                  quality: {
                    label: "Quality Score",
                    color: "hsl(var(--chart-2))",
                  },
                  price: {
                    label: "Price Competitiveness",
                    color: "hsl(var(--chart-3))",
                  },
                  response: {
                    label: "Response Time",
                    color: "hsl(var(--chart-4))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[3.5, 5]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="delivery" stroke="var(--color-delivery)" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="quality" stroke="var(--color-quality)" />
                    <Line type="monotone" dataKey="price" stroke="var(--color-price)" />
                    <Line type="monotone" dataKey="response" stroke="var(--color-response)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
          <div className="bg-muted p-2 rounded-md">
            <div className="text-sm font-medium">Delivery Trend</div>
            <div className="text-xl font-bold text-green-600">+0.6</div>
          </div>
          <div className="bg-muted p-2 rounded-md">
            <div className="text-sm font-medium">Quality Trend</div>
            <div className="text-xl font-bold text-green-600">+0.7</div>
          </div>
          <div className="bg-muted p-2 rounded-md">
            <div className="text-sm font-medium">Price Trend</div>
            <div className="text-xl font-bold text-green-600">+0.5</div>
          </div>
          <div className="bg-muted p-2 rounded-md">
            <div className="text-sm font-medium">Response Trend</div>
            <div className="text-xl font-bold text-green-600">+0.7</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PerformanceTrends;
