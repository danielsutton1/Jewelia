"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
} from "recharts"

// Sample data
const salesData = [
  { name: "Jan", revenue: 18000, orders: 120, profit: 5400 },
  { name: "Feb", revenue: 22000, orders: 145, profit: 6600 },
  { name: "Mar", revenue: 28000, orders: 190, profit: 8400 },
  { name: "Apr", revenue: 24000, orders: 170, profit: 7200 },
  { name: "May", revenue: 29000, orders: 210, profit: 8700 },
  { name: "Jun", revenue: 32000, orders: 230, profit: 9600 },
  { name: "Jul", revenue: 38000, orders: 270, profit: 11400 },
  { name: "Aug", revenue: 40000, orders: 290, profit: 12000 },
  { name: "Sep", revenue: 37000, orders: 260, profit: 11100 },
  { name: "Oct", revenue: 41000, orders: 300, profit: 12300 },
  { name: "Nov", revenue: 45000, orders: 320, profit: 13500 },
  { name: "Dec", revenue: 52000, orders: 380, profit: 15600 },
]

export function SalesOverview() {
  const [timeRange, setTimeRange] = useState("yearly")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Revenue trends over time</CardDescription>
          </div>
          <Tabs defaultValue={timeRange} onValueChange={setTimeRange} className="w-[250px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monthly">Month</TabsTrigger>
              <TabsTrigger value="quarterly">Quarter</TabsTrigger>
              <TabsTrigger value="yearly">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Orders vs Revenue</CardTitle>
            <CardDescription>Comparison between orders and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="orders" fill="hsl(var(--primary))" name="Orders" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit Margin</CardTitle>
            <CardDescription>Profit trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, "Profit"]} />
                  <Legend />
                  <Line type="monotone" dataKey="profit" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
