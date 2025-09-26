"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface PriceCompetitivenessProps {
  timeRange: string
  selectedSuppliers: string[]
  selectedCategories: string[]
}

export default function PriceCompetitiveness({
  timeRange,
  selectedSuppliers,
  selectedCategories,
}: PriceCompetitivenessProps) {
  // Mock data - in a real app, this would be fetched based on the filters
  const data = [
    { month: "Jan", marketAvg: 100, topSuppliers: 95, bottomSuppliers: 110 },
    { month: "Feb", marketAvg: 102, topSuppliers: 96, bottomSuppliers: 112 },
    { month: "Mar", marketAvg: 101, topSuppliers: 94, bottomSuppliers: 111 },
    { month: "Apr", marketAvg: 103, topSuppliers: 97, bottomSuppliers: 114 },
    { month: "May", marketAvg: 105, topSuppliers: 99, bottomSuppliers: 116 },
    { month: "Jun", marketAvg: 104, topSuppliers: 98, bottomSuppliers: 115 },
  ]

  // Mock savings opportunity
  const savingsOpportunity = "$24,500"

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Price Competitiveness</CardTitle>
        <CardDescription>Relative to market averages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">Potential Savings</span>
              <div className="text-2xl font-bold text-green-600">{savingsOpportunity}</div>
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">Price Index</span>
              <div className="text-xl font-semibold">104</div>
              <div className="text-xs text-muted-foreground">(Market Avg = 100)</div>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis domain={[90, 120]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="marketAvg" stroke="#6b7280" name="Market Average" strokeWidth={2} />
                <Line type="monotone" dataKey="topSuppliers" stroke="#22c55e" name="Top Suppliers" strokeWidth={2} />
                <Line
                  type="monotone"
                  dataKey="bottomSuppliers"
                  stroke="#ef4444"
                  name="Bottom Suppliers"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-green-50 p-2 rounded-md">
              <div className="font-medium text-green-700">4</div>
              <div className="text-xs text-muted-foreground">Below Market Avg</div>
            </div>
            <div className="bg-amber-50 p-2 rounded-md">
              <div className="font-medium text-amber-700">6</div>
              <div className="text-xs text-muted-foreground">Above Market Avg</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
