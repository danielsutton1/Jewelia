"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

const chartConfig = {
  value: {
    label: "Deliveries",
  },
}

// Mock data for delivery performance
const deliveryData = [
  { name: "On Time", value: 78 },
  { name: "1-2 Days Late", value: 14 },
  { name: "3-7 Days Late", value: 6 },
  { name: "8+ Days Late", value: 2 },
]

const COLORS = ["#4ade80", "#facc15", "#fb923c", "#f87171"]

export function DeliveryPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Performance</CardTitle>
        <CardDescription>On-time delivery rates and delay analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deliveryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {deliveryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded-md">
            <div className="text-green-700 text-sm font-medium">Average Delivery Time</div>
            <div className="text-2xl font-bold text-green-800">3.2 days</div>
            <div className="text-xs text-green-600">Industry avg: 5.1 days</div>
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <div className="text-blue-700 text-sm font-medium">On-Time Delivery Rate</div>
            <div className="text-2xl font-bold text-blue-800">78%</div>
            <div className="text-xs text-blue-600">Target: 85%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
