"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
  Cell,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

const chartConfig = {
  x: {
    label: "Quality Score",
  },
  y: {
    label: "Price Score",
  },
  z: {
    label: "Volume",
  },
}

// Mock data for comparison matrix
const partnerData = [
  {
    name: "GoldCraft Suppliers",
    quality: 4.7,
    cost: 3.8,
    delivery: 4.5,
    response: 4.8,
    volume: 120,
    category: "supplier-metals",
  },
  {
    name: "Diamond District Gems",
    quality: 4.9,
    cost: 3.2,
    delivery: 4.1,
    response: 3.9,
    volume: 85,
    category: "supplier-stones",
  },
  {
    name: "Precision Casting Co.",
    quality: 4.6,
    cost: 4.1,
    delivery: 4.7,
    response: 4.2,
    volume: 95,
    category: "service-casting",
  },
  {
    name: "Master Engravers Guild",
    quality: 4.8,
    cost: 3.5,
    delivery: 3.9,
    response: 3.6,
    volume: 45,
    category: "service-engraving",
  },
  {
    name: "Shine Plating Services",
    quality: 4.5,
    cost: 4.3,
    delivery: 4.4,
    response: 4.5,
    volume: 70,
    category: "service-plating",
  },
  {
    name: "Elite Craftspeople",
    quality: 4.9,
    cost: 3.1,
    delivery: 4.2,
    response: 4.7,
    volume: 55,
    category: "contractor",
  },
  {
    name: "Swift Shipping Partners",
    quality: 4.3,
    cost: 4.5,
    delivery: 4.8,
    response: 4.9,
    volume: 150,
    category: "shipping",
  },
  {
    name: "Pearl Perfection",
    quality: 4.8,
    cost: 3.3,
    delivery: 4.0,
    response: 4.1,
    volume: 65,
    category: "supplier-stones",
  },
]

// Colors for different partner categories
const categoryColors = {
  "supplier-metals": "#4f46e5",
  "supplier-stones": "#0ea5e9",
  "supplier-findings": "#14b8a6",
  "service-casting": "#f59e0b",
  "service-engraving": "#ec4899",
  "service-plating": "#8b5cf6",
  contractor: "#10b981",
  shipping: "#ef4444",
}

export function PartnerComparisonMatrix() {
  const [xAxis, setXAxis] = useState("quality")
  const [yAxis, setYAxis] = useState("cost")

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{`${xAxis.charAt(0).toUpperCase() + xAxis.slice(1)}: ${data[xAxis]}`}</p>
          <p className="text-sm">{`${yAxis.charAt(0).toUpperCase() + yAxis.slice(1)}: ${data[yAxis]}`}</p>
          <p className="text-sm">{`Volume: ${data.volume} orders`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Partner Comparison Matrix</CardTitle>
            <CardDescription>Compare partners across different performance dimensions</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={xAxis} onValueChange={setXAxis}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="X Axis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quality">Quality</SelectItem>
                <SelectItem value="cost">Cost</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="response">Response</SelectItem>
              </SelectContent>
            </Select>

            <Select value={yAxis} onValueChange={setYAxis}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Y Axis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quality">Quality</SelectItem>
                <SelectItem value="cost">Cost</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="response">Response</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[500px]">
          <ChartContainer config={chartConfig}>
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
                  dataKey={xAxis}
                  name={xAxis}
                  domain={[3, 5]}
                  label={{
                    value: xAxis.charAt(0).toUpperCase() + xAxis.slice(1),
                    position: "bottom",
                  }}
                />
                <YAxis
                  type="number"
                  dataKey={yAxis}
                  name={yAxis}
                  domain={[3, 5]}
                  label={{
                    value: yAxis.charAt(0).toUpperCase() + yAxis.slice(1),
                    angle: -90,
                    position: "left",
                  }}
                />
                <ZAxis dataKey="volume" range={[50, 200]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Scatter name="Partners" data={partnerData} fill="#8884d8">
                  {partnerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[entry.category as keyof typeof categoryColors]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="text-xs">
                {category
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
