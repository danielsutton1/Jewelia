"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for the charts
const performanceData = [
  { month: "Jan", satisfaction: 4.2, delivery: 4.5, quality: 4.3, cost: 3.9, response: 4.1 },
  { month: "Feb", satisfaction: 4.3, delivery: 4.3, quality: 4.4, cost: 3.8, response: 4.2 },
  { month: "Mar", satisfaction: 4.1, delivery: 4.2, quality: 4.2, cost: 3.7, response: 4.0 },
  { month: "Apr", satisfaction: 4.4, delivery: 4.6, quality: 4.5, cost: 4.0, response: 4.3 },
  { month: "May", satisfaction: 4.5, delivery: 4.7, quality: 4.6, cost: 4.1, response: 4.4 },
  { month: "Jun", satisfaction: 4.6, delivery: 4.8, quality: 4.7, cost: 4.2, response: 4.5 },
  { month: "Jul", satisfaction: 4.5, delivery: 4.7, quality: 4.6, cost: 4.1, response: 4.4 },
  { month: "Aug", satisfaction: 4.7, delivery: 4.9, quality: 4.8, cost: 4.3, response: 4.6 },
  { month: "Sep", satisfaction: 4.8, delivery: 4.9, quality: 4.9, cost: 4.4, response: 4.7 },
  { month: "Oct", satisfaction: 4.7, delivery: 4.8, quality: 4.8, cost: 4.3, response: 4.6 },
  { month: "Nov", satisfaction: 4.9, delivery: 5.0, quality: 4.9, cost: 4.5, response: 4.8 },
  { month: "Dec", satisfaction: 4.8, delivery: 4.9, quality: 4.8, cost: 4.4, response: 4.7 },
]

const categoryData = [
  { category: "Metal Suppliers", score: 4.7 },
  { category: "Stone Suppliers", score: 4.5 },
  { category: "Findings Suppliers", score: 4.3 },
  { category: "Casting Services", score: 4.8 },
  { category: "Engraving Services", score: 4.6 },
  { category: "Plating Services", score: 4.4 },
  { category: "Contractors", score: 4.2 },
  { category: "Shipping Partners", score: 4.1 },
]

export function PartnerPerformanceOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Partner Performance Overview</CardTitle>
        <CardDescription>Aggregated performance metrics across all partners over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trends">
          <TabsList className="mb-4">
            <TabsTrigger value="trends">Performance Trends</TabsTrigger>
            <TabsTrigger value="categories">Category Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <div className="h-[400px]">
              <ChartContainer
                config={{
                  satisfaction: {
                    label: "Satisfaction",
                    color: "hsl(var(--chart-1))",
                  },
                  delivery: {
                    label: "Delivery",
                    color: "hsl(var(--chart-2))",
                  },
                  quality: {
                    label: "Quality",
                    color: "hsl(var(--chart-3))",
                  },
                  cost: {
                    label: "Cost",
                    color: "hsl(var(--chart-4))",
                  },
                  response: {
                    label: "Response Time",
                    color: "hsl(var(--chart-5))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 5]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="satisfaction"
                      stroke="var(--color-satisfaction)"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="delivery" stroke="var(--color-delivery)" />
                    <Line type="monotone" dataKey="quality" stroke="var(--color-quality)" />
                    <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" />
                    <Line type="monotone" dataKey="response" stroke="var(--color-response)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="h-[400px]">
              <ChartContainer
                config={{
                  score: {
                    label: "Average Score",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis domain={[0, 5]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="score" fill="var(--color-score)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
