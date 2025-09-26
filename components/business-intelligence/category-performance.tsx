"use client"

import type { DateRange } from "react-day-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface CategoryPerformanceProps {
  dateRange: DateRange
  showComparison: boolean
}

export function CategoryPerformance({ dateRange, showComparison }: CategoryPerformanceProps) {
  // In a real app, this data would come from an API call based on the date range
  const data = [
    {
      category: "Rings",
      revenue: 42500,
      previousRevenue: 38200,
      units: 320,
      previousUnits: 290,
      margin: 45,
      previousMargin: 43,
    },
    {
      category: "Necklaces",
      revenue: 38700,
      previousRevenue: 35100,
      units: 280,
      previousUnits: 260,
      margin: 48,
      previousMargin: 46,
    },
    {
      category: "Earrings",
      revenue: 25600,
      previousRevenue: 22800,
      units: 420,
      previousUnits: 380,
      margin: 38,
      previousMargin: 37,
    },
    {
      category: "Bracelets",
      revenue: 18900,
      previousRevenue: 16500,
      units: 210,
      previousUnits: 190,
      margin: 42,
      previousMargin: 40,
    },
    {
      category: "Watches",
      revenue: 32800,
      previousRevenue: 28900,
      units: 150,
      previousUnits: 130,
      margin: 52,
      previousMargin: 50,
    },
    {
      category: "Gemstones",
      revenue: 15600,
      previousRevenue: 14200,
      units: 180,
      previousUnits: 170,
      margin: 44,
      previousMargin: 42,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Category Performance</CardTitle>
        <CardDescription>Revenue, units sold, and margin by product category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "revenue" || name === "previousRevenue") {
                    return [`$${value}`, name === "revenue" ? "Revenue" : "Previous Revenue"]
                  }
                  if (name === "units" || name === "previousUnits") {
                    return [value, name === "units" ? "Units" : "Previous Units"]
                  }
                  return [`${value}%`, name === "margin" ? "Margin" : "Previous Margin"]
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
              {showComparison && (
                <Bar yAxisId="left" dataKey="previousRevenue" fill="#8884d8" name="Previous Revenue" />
              )}
              <Bar yAxisId="right" dataKey="units" fill="#82ca9d" name="Units" />
              {showComparison && <Bar yAxisId="right" dataKey="previousUnits" fill="#ffc658" name="Previous Units" />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
