"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
} from "recharts"
import { Badge } from "@/components/ui/badge"

export function PredictiveTrending() {
  // In a real app, this data would come from an API call with ML predictions
  const data = [
    // Historical data
    { month: "Jan", revenue: 198000, type: "historical" },
    { month: "Feb", revenue: 192000, type: "historical" },
    { month: "Mar", revenue: 218000, type: "historical" },
    { month: "Apr", revenue: 225000, type: "historical" },
    { month: "May", revenue: 252000, type: "historical" },
    // Predicted data
    { month: "Jun", revenue: 265000, type: "predicted" },
    { month: "Jul", revenue: 278000, type: "predicted" },
    { month: "Aug", revenue: 285000, type: "predicted" },
  ]

  // Find the point where predictions start
  const predictionStartIndex = data.findIndex((item) => item.type === "predicted")
  const predictionStartPoint = data[predictionStartIndex - 1]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="bg-primary/10">
          Historical Data
        </Badge>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">
          AI Prediction
        </Badge>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
          Confidence: 92%
        </Badge>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
              name="Revenue"
            />
            <ReferenceDot
              x={predictionStartPoint.month}
              y={predictionStartPoint.revenue}
              r={6}
              fill="hsl(var(--primary))"
              stroke="white"
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
              name="Predicted Revenue"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
