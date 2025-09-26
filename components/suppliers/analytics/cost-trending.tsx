"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface CostTrendingProps {
  timeRange: string
  selectedSuppliers: string[]
  selectedCategories: string[]
}

export default function CostTrending({ timeRange, selectedSuppliers, selectedCategories }: CostTrendingProps) {
  // Mock data - in a real app, this would be fetched based on the filters
  const data = [
    { month: "Jan", gemstones: 100, preciousMetals: 100, findings: 100, packaging: 100 },
    { month: "Feb", gemstones: 102, preciousMetals: 105, findings: 101, packaging: 100 },
    { month: "Mar", gemstones: 103, preciousMetals: 108, findings: 102, packaging: 101 },
    { month: "Apr", gemstones: 105, preciousMetals: 112, findings: 103, packaging: 102 },
    { month: "May", gemstones: 108, preciousMetals: 115, findings: 105, packaging: 102 },
    { month: "Jun", gemstones: 110, preciousMetals: 118, findings: 106, packaging: 103 },
  ]

  // Calculate average price increase
  const calculateIncrease = (category: string) => {
    const firstValue = data[0][category as keyof (typeof data)[0]] as number
    const lastValue = data[data.length - 1][category as keyof (typeof data)[0]] as number
    return (((lastValue - firstValue) / firstValue) * 100).toFixed(1)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Cost Trending</CardTitle>
        <CardDescription>Price changes over time (indexed)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Precious Metals</span>
              <div className="text-xl font-bold text-amber-600">+{calculateIncrease("preciousMetals")}%</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Gemstones</span>
              <div className="text-xl font-bold text-blue-600">+{calculateIncrease("gemstones")}%</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Findings</span>
              <div className="text-xl font-bold text-green-600">+{calculateIncrease("findings")}%</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Packaging</span>
              <div className="text-xl font-bold text-purple-600">+{calculateIncrease("packaging")}%</div>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis domain={[95, 120]} />
                <Tooltip formatter={(value) => [`${value} (index)`, ""]} />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                <Line
                  type="monotone"
                  dataKey="preciousMetals"
                  stroke="hsl(var(--gold-primary))"
                  name="Precious Metals"
                  strokeWidth={2}
                />
                <Line type="monotone" dataKey="gemstones" stroke="hsl(var(--primary))" name="Gemstones" strokeWidth={2} />
                <Line type="monotone" dataKey="findings" stroke="hsl(var(--chart-2))" name="Findings" strokeWidth={2} />
                <Line type="monotone" dataKey="packaging" stroke="hsl(var(--chart-3))" name="Packaging" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Index: Jan 2023 = 100</p>
            <p>Overall weighted average increase: +8.4%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
