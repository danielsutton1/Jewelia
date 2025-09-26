"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

// Mock data for cost comparisons
const costTrendData = [
  { month: "Jan", actual: 102, benchmark: 100, forecast: 101 },
  { month: "Feb", actual: 103, benchmark: 101, forecast: 102 },
  { month: "Mar", actual: 105, benchmark: 102, forecast: 104 },
  { month: "Apr", actual: 104, benchmark: 103, forecast: 105 },
  { month: "May", actual: 106, benchmark: 104, forecast: 106 },
  { month: "Jun", actual: 107, benchmark: 105, forecast: 107 },
  { month: "Jul", actual: 109, benchmark: 106, forecast: 108 },
  { month: "Aug", actual: 108, benchmark: 107, forecast: 109 },
  { month: "Sep", actual: 110, benchmark: 108, forecast: 110 },
  { month: "Oct", actual: 111, benchmark: 109, forecast: 111 },
  { month: "Nov", actual: 113, benchmark: 110, forecast: 112 },
  { month: "Dec", actual: 112, benchmark: 111, forecast: 113 },
]

export function CostComparisons() {
  const [costCategory, setCostCategory] = useState("all")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Cost Comparisons</CardTitle>
          <CardDescription>Cost trends compared to benchmarks and forecasts</CardDescription>
        </div>
        <Select value={costCategory} onValueChange={setCostCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="metals">Metals</SelectItem>
            <SelectItem value="stones">Stones</SelectItem>
            <SelectItem value="findings">Findings</SelectItem>
            <SelectItem value="services">Services</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              actual: {
                label: "Actual Cost Index",
                color: "hsl(var(--chart-1))",
              },
              benchmark: {
                label: "Industry Benchmark",
                color: "hsl(var(--chart-2))",
              },
              forecast: {
                label: "Cost Forecast",
                color: "hsl(var(--chart-3))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[95, 115]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <ReferenceLine y={100} stroke="#666" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="actual" stroke="var(--color-actual)" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="benchmark" stroke="var(--color-benchmark)" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="forecast" stroke="var(--color-forecast)" strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-amber-50 p-3 rounded-md">
            <div className="text-amber-700 text-sm font-medium">Cost Variance</div>
            <div className="text-2xl font-bold text-amber-800">+12%</div>
            <div className="text-xs text-amber-600">vs. Base Period (Jan)</div>
          </div>

          <div className="bg-purple-50 p-3 rounded-md">
            <div className="text-purple-700 text-sm font-medium">Benchmark Variance</div>
            <div className="text-2xl font-bold text-purple-800">+1%</div>
            <div className="text-xs text-purple-600">vs. Industry Average</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
