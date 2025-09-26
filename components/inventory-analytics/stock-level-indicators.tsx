"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts"
import { Badge } from "@/components/ui/badge"

const data = [
  {
    name: "Rings",
    current: 85,
    optimal: 75,
    min: 30,
    max: 120,
    status: "optimal",
  },
  {
    name: "Necklaces",
    current: 120,
    optimal: 80,
    min: 35,
    max: 130,
    status: "overstock",
  },
  {
    name: "Earrings",
    current: 65,
    optimal: 60,
    min: 25,
    max: 100,
    status: "optimal",
  },
  {
    name: "Bracelets",
    current: 20,
    optimal: 50,
    min: 20,
    max: 90,
    status: "low",
  },
  {
    name: "Watches",
    current: 45,
    optimal: 40,
    min: 15,
    max: 70,
    status: "optimal",
  },
]

export function StockLevelIndicators() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Stock Level Indicators</CardTitle>
          <CardDescription>Current inventory levels relative to optimal ranges</CardDescription>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-emerald-500">Optimal</Badge>
          <Badge className="bg-amber-500">Low</Badge>
          <Badge className="bg-blue-500">Overstock</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "current") return [`${value} units`, "Current Stock"]
                  if (name === "optimal") return [`${value} units`, "Optimal Level"]
                  return [value, name]
                }}
              />
              <Legend />
              <Bar
                dataKey="current"
                name="Current Stock"
                fill="#8884d8"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.status === "low" ? "#f59e0b" :
                      entry.status === "overstock" ? "#3b82f6" :
                      "#10b981"
                    }
                  />
                ))}
              </Bar>
              <ReferenceLine y={0} stroke="#000" />
              <Bar dataKey="optimal" name="Optimal Level" fill="#8884d8" opacity={0.3} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
