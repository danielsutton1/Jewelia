"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample RFM data
const rfmData = [
  { segment: "Champions", count: 120, recency: 90, frequency: 95, monetary: 95, color: "#8884d8" },
  { segment: "Loyal", count: 180, recency: 70, frequency: 90, monetary: 80, color: "#82ca9d" },
  { segment: "Potential Loyalists", count: 210, recency: 80, frequency: 60, monetary: 70, color: "#ffc658" },
  { segment: "Recent Customers", count: 250, recency: 85, frequency: 40, monetary: 50, color: "#0088fe" },
  { segment: "Promising", count: 180, recency: 75, frequency: 30, monetary: 60, color: "#00C49F" },
  { segment: "Needs Attention", count: 150, recency: 50, frequency: 65, monetary: 75, color: "#FFBB28" },
  { segment: "At Risk", count: 120, recency: 30, frequency: 70, monetary: 65, color: "#FF8042" },
  { segment: "Can't Lose", count: 90, recency: 20, frequency: 80, monetary: 85, color: "#ff0000" },
  { segment: "Hibernating", count: 140, recency: 25, frequency: 40, monetary: 45, color: "#00bcd4" },
  { segment: "Lost", count: 160, recency: 10, frequency: 20, monetary: 30, color: "#9e9e9e" },
]

// Convert to scatter plot data
const scatterData = rfmData.map((item) => ({
  x: item.frequency,
  y: item.monetary,
  z: item.recency,
  segment: item.segment,
  count: item.count,
  color: item.color,
}))

export function RfmSegmentation() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>RFM Segmentation</CardTitle>
          <CardDescription>Customer segmentation based on Recency, Frequency, and Monetary value</CardDescription>
        </div>
        <Tabs defaultValue="scatter">
          <TabsList>
            <TabsTrigger value="scatter">Scatter</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="x"
                name="Frequency"
                domain={[0, 100]}
                label={{ value: "Frequency", position: "bottom" }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Monetary"
                domain={[0, 100]}
                label={{ value: "Monetary Value", angle: -90, position: "left" }}
              />
              <ZAxis type="number" dataKey="z" range={[50, 400]} name="Recency" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(value, name) => {
                  if (name === "Frequency" || name === "Monetary" || name === "Recency") {
                    return [`${value}/100`, name]
                  }
                  return [value, name]
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="font-bold">{data.segment}</div>
                        <div className="text-sm">Customers: {data.count}</div>
                        <div className="text-sm">Recency: {data.z}/100</div>
                        <div className="text-sm">Frequency: {data.x}/100</div>
                        <div className="text-sm">Monetary: {data.y}/100</div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Scatter name="RFM Segments" data={scatterData} fill="#8884d8">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
          {rfmData.slice(0, 5).map((segment) => (
            <div key={segment.segment} className="text-center text-sm">
              <div className="mx-auto mb-1 h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
              <div className="font-medium">{segment.segment}</div>
              <div>{segment.count} customers</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
