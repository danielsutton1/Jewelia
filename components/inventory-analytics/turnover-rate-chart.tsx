"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

const data = [
  { name: "Rings", turnover: 4.2, value: 125000 },
  { name: "Necklaces", turnover: 3.8, value: 98000 },
  { name: "Earrings", turnover: 5.1, value: 76000 },
  { name: "Bracelets", turnover: 3.2, value: 62000 },
  { name: "Watches", turnover: 2.1, value: 145000 },
  { name: "Pendants", turnover: 4.5, value: 55000 },
  { name: "Anklets", turnover: 2.8, value: 28000 },
]

export function TurnoverRateChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Turnover Rate by Category</CardTitle>
        <CardDescription>Inventory turnover rates across product categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip formatter={(value) => [`${value}x`, "Turnover Rate"]} />
              <Legend />
              <Bar dataKey="turnover" fill="hsl(var(--primary))" name="Turnover Rate" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
