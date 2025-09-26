"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface RevenueChartProps {
  dateRange: DateRange
  showComparison: boolean
}

export function RevenueChart({ dateRange, showComparison }: RevenueChartProps) {
  const [chartView, setChartView] = useState("daily")

  // In a real app, this data would come from an API call based on the date range
  const dailyData = [
    { date: "May 1", revenue: 4200, previousRevenue: 3800 },
    { date: "May 2", revenue: 3800, previousRevenue: 3600 },
    { date: "May 3", revenue: 4100, previousRevenue: 3900 },
    { date: "May 4", revenue: 5200, previousRevenue: 4100 },
    { date: "May 5", revenue: 4900, previousRevenue: 4300 },
    { date: "May 6", revenue: 5800, previousRevenue: 4800 },
    { date: "May 7", revenue: 6200, previousRevenue: 5100 },
    { date: "May 8", revenue: 5600, previousRevenue: 5300 },
    { date: "May 9", revenue: 5900, previousRevenue: 5200 },
    { date: "May 10", revenue: 6100, previousRevenue: 5400 },
    { date: "May 11", revenue: 6500, previousRevenue: 5600 },
    { date: "May 12", revenue: 7000, previousRevenue: 5900 },
    { date: "May 13", revenue: 6800, previousRevenue: 6100 },
    { date: "May 14", revenue: 7200, previousRevenue: 6300 },
  ]

  const weeklyData = [
    { date: "Week 1", revenue: 28000, previousRevenue: 24000 },
    { date: "Week 2", revenue: 32000, previousRevenue: 27000 },
    { date: "Week 3", revenue: 34000, previousRevenue: 29000 },
    { date: "Week 4", revenue: 36000, previousRevenue: 31000 },
  ]

  const monthlyData = [
    { date: "Jan", revenue: 98000, previousRevenue: 85000 },
    { date: "Feb", revenue: 102000, previousRevenue: 92000 },
    { date: "Mar", revenue: 118000, previousRevenue: 104000 },
    { date: "Apr", revenue: 125000, previousRevenue: 110000 },
    { date: "May", revenue: 132000, previousRevenue: 118000 },
  ]

  const data = chartView === "daily" ? dailyData : chartView === "weekly" ? weeklyData : monthlyData

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Revenue trends over time</CardDescription>
        </div>
        <Tabs defaultValue="daily" value={chartView} onValueChange={setChartView}>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                {showComparison && (
                  <linearGradient id="colorPreviousRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                  </linearGradient>
                )}
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Current Period"
              />
              {showComparison && (
                <Area
                  type="monotone"
                  dataKey="previousRevenue"
                  stroke="#82ca9d"
                  fillOpacity={1}
                  fill="url(#colorPreviousRevenue)"
                  name="Previous Period"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
