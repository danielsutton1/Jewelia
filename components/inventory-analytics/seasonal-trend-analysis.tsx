"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

const seasonalData = {
  rings: [
    { month: "Jan", sales: 65, inventory: 85 },
    { month: "Feb", sales: 59, inventory: 80 },
    { month: "Mar", sales: 80, inventory: 90 },
    { month: "Apr", sales: 81, inventory: 85 },
    { month: "May", sales: 90, inventory: 95 },
    { month: "Jun", sales: 125, inventory: 110 },
    { month: "Jul", sales: 110, inventory: 100 },
    { month: "Aug", sales: 100, inventory: 95 },
    { month: "Sep", sales: 85, inventory: 90 },
    { month: "Oct", sales: 95, inventory: 95 },
    { month: "Nov", sales: 120, inventory: 105 },
    { month: "Dec", sales: 150, inventory: 120 },
  ],
  necklaces: [
    { month: "Jan", sales: 55, inventory: 75 },
    { month: "Feb", sales: 49, inventory: 70 },
    { month: "Mar", sales: 70, inventory: 80 },
    { month: "Apr", sales: 71, inventory: 75 },
    { month: "May", sales: 80, inventory: 85 },
    { month: "Jun", sales: 115, inventory: 100 },
    { month: "Jul", sales: 100, inventory: 90 },
    { month: "Aug", sales: 90, inventory: 85 },
    { month: "Sep", sales: 75, inventory: 80 },
    { month: "Oct", sales: 85, inventory: 85 },
    { month: "Nov", sales: 110, inventory: 95 },
    { month: "Dec", sales: 140, inventory: 110 },
  ],
  earrings: [
    { month: "Jan", sales: 75, inventory: 95 },
    { month: "Feb", sales: 69, inventory: 90 },
    { month: "Mar", sales: 90, inventory: 100 },
    { month: "Apr", sales: 91, inventory: 95 },
    { month: "May", sales: 100, inventory: 105 },
    { month: "Jun", sales: 135, inventory: 120 },
    { month: "Jul", sales: 120, inventory: 110 },
    { month: "Aug", sales: 110, inventory: 105 },
    { month: "Sep", sales: 95, inventory: 100 },
    { month: "Oct", sales: 105, inventory: 105 },
    { month: "Nov", sales: 130, inventory: 115 },
    { month: "Dec", sales: 160, inventory: 130 },
  ],
}

export function SeasonalTrendAnalysis() {
  const [category, setCategory] = useState("rings")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Seasonal Trend Analysis</CardTitle>
          <CardDescription>Monthly sales patterns to identify seasonal trends</CardDescription>
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rings">Rings</SelectItem>
            <SelectItem value="necklaces">Necklaces</SelectItem>
            <SelectItem value="earrings">Earrings</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={seasonalData[category as keyof typeof seasonalData]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} units`, ""]} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" name="Sales" strokeWidth={2} />
              <Line type="monotone" dataKey="inventory" stroke="#82ca9d" name="Inventory" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
