"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

const chartConfig = {
  value: {
    label: "Partners",
  },
}

// Mock data for category breakdown
const categoryData = [
  { name: "Metal Suppliers", value: 28, color: "#4f46e5" },
  { name: "Stone Suppliers", value: 22, color: "#0ea5e9" },
  { name: "Findings Suppliers", value: 15, color: "#14b8a6" },
  { name: "Casting Services", value: 12, color: "#f59e0b" },
  { name: "Engraving Services", value: 8, color: "#ec4899" },
  { name: "Plating Services", value: 7, color: "#8b5cf6" },
  { name: "Contractors", value: 5, color: "#10b981" },
  { name: "Shipping Partners", value: 3, color: "#ef4444" },
]

export function CategoryBreakdown() {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{`${payload[0].value}% of partners`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>Distribution of partners by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
