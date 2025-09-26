"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function CostPerUnit({ filters }: { filters: any }) {
  // Sample data - in a real app, this would come from your database based on filters
  const costBreakdownData = [
    {
      category: "Rings",
      materials: 120,
      labor: 85,
      overhead: 45,
      total: 250,
    },
    {
      category: "Necklaces",
      materials: 180,
      labor: 110,
      overhead: 60,
      total: 350,
    },
    {
      category: "Earrings",
      materials: 90,
      labor: 70,
      overhead: 40,
      total: 200,
    },
    {
      category: "Bracelets",
      materials: 150,
      labor: 95,
      overhead: 55,
      total: 300,
    },
    {
      category: "Custom",
      materials: 220,
      labor: 180,
      overhead: 100,
      total: 500,
    },
  ]

  const costTrendData = [
    {
      month: "Jan",
      materials: 135,
      labor: 105,
      overhead: 60,
      total: 300,
    },
    {
      month: "Feb",
      materials: 132,
      labor: 103,
      overhead: 58,
      total: 293,
    },
    {
      month: "Mar",
      materials: 130,
      labor: 100,
      overhead: 55,
      total: 285,
    },
    {
      month: "Apr",
      materials: 128,
      labor: 98,
      overhead: 54,
      total: 280,
    },
    {
      month: "May",
      materials: 125,
      labor: 95,
      overhead: 52,
      total: 272,
    },
    {
      month: "Jun",
      materials: 122,
      labor: 92,
      overhead: 50,
      total: 264,
    },
    {
      month: "Jul",
      materials: 120,
      labor: 90,
      overhead: 48,
      total: 258,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Per Unit Analysis</CardTitle>
        <CardDescription>Breakdown of production costs by category and over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
            <TabsTrigger value="trend">Cost Trend</TabsTrigger>
          </TabsList>
          <TabsContent value="breakdown" className="h-[300px] pt-4">
            <ChartContainer
              config={{
                materials: {
                  label: "Materials",
                  color: "hsl(var(--primary))",
                },
                labor: {
                  label: "Labor",
                  color: "hsl(var(--gold-primary))",
                },
                overhead: {
                  label: "Overhead",
                  color: "hsl(var(--chart-2))",
                },
                total: {
                  label: "Total Cost",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costBreakdownData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="materials" stackId="a" fill="var(--color-materials)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="labor" stackId="a" fill="var(--color-labor)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="overhead" stackId="a" fill="var(--color-overhead)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="trend" className="h-[300px] pt-4">
            <ChartContainer
              config={{
                materials: {
                  label: "Materials",
                  color: "hsl(var(--primary))",
                },
                labor: {
                  label: "Labor",
                  color: "hsl(var(--gold-primary))",
                },
                overhead: {
                  label: "Overhead",
                  color: "hsl(var(--chart-2))",
                },
                total: {
                  label: "Total Cost",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={costTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="materials" stroke="var(--color-materials)" />
                  <Line type="monotone" dataKey="labor" stroke="var(--color-labor)" />
                  <Line type="monotone" dataKey="overhead" stroke="var(--color-overhead)" />
                  <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
