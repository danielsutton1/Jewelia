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
} from "recharts"

const categoryMatrix = [
  { name: "Rings", turnover: 4.2, profit: 35, inventory: 125000 },
  { name: "Necklaces", turnover: 3.8, profit: 32, inventory: 98000 },
  { name: "Earrings", turnover: 5.1, profit: 40, inventory: 76000 },
  { name: "Bracelets", turnover: 3.2, profit: 28, inventory: 62000 },
  { name: "Watches", turnover: 2.1, profit: 45, inventory: 145000 },
  { name: "Pendants", turnover: 4.5, profit: 38, inventory: 55000 },
  { name: "Anklets", turnover: 2.8, profit: 25, inventory: 28000 },
  { name: "Cufflinks", turnover: 1.5, profit: 30, inventory: 32000 },
]

export function CategoryPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Performance Matrix</CardTitle>
        <CardDescription>Turnover rate vs. profit margin by category (bubble size = inventory value)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="turnover"
                name="Turnover Rate"
                unit="x"
                domain={[0, 6]}
                label={{ value: "Turnover Rate (x)", position: "bottom", offset: 0 }}
              />
              <YAxis
                type="number"
                dataKey="profit"
                name="Profit Margin"
                unit="%"
                domain={[0, 50]}
                label={{ value: "Profit Margin (%)", angle: -90, position: "insideLeft" }}
              />
              <ZAxis type="number" dataKey="inventory" range={[100, 1000]} name="Inventory Value" unit="$" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(value, name, props) => {
                  if (name === "Inventory Value") return [`$${value.toLocaleString()}`, name]
                  if (name === "Turnover Rate") return [`${value}x`, name]
                  return [`${value}%`, name]
                }}
              />
              <Legend />
              <Scatter name="Categories" data={categoryMatrix} fill="hsl(var(--primary))" shape="circle" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
