"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface IssueResolutionProps {
  timeRange: string
  selectedSuppliers: string[]
  selectedCategories: string[]
}

export default function IssueResolution({ timeRange, selectedSuppliers, selectedCategories }: IssueResolutionProps) {
  // Mock data - in a real app, this would be fetched based on the filters
  const data = [
    { name: "Resolved < 24h", value: 42, color: "#22c55e" },
    { name: "Resolved 1-3 days", value: 28, color: "#3b82f6" },
    { name: "Resolved 4-7 days", value: 18, color: "#f59e0b" },
    { name: "Resolved > 7 days", value: 12, color: "#ef4444" },
  ]

  // Calculate resolution rate within SLA (assuming SLA is 3 days)
  const resolutionRateWithinSLA =
    ((data[0].value + data[1].value) / data.reduce((sum, item) => sum + item.value, 0)) * 100

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Issue Resolution</CardTitle>
        <CardDescription>Time to resolve reported issues</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">Within SLA (3 days)</span>
              <div className="text-2xl font-bold">{resolutionRateWithinSLA.toFixed(1)}%</div>
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">Total Issues</span>
              <div className="text-xl font-semibold">{data.reduce((sum, item) => sum + item.value, 0)}</div>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} issues`, name]} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-green-50 p-2 rounded-md">
              <div className="font-medium text-green-700">8</div>
              <div className="text-xs text-muted-foreground">Suppliers Meeting SLA</div>
            </div>
            <div className="bg-red-50 p-2 rounded-md">
              <div className="font-medium text-red-700">2</div>
              <div className="text-xs text-muted-foreground">Suppliers Below SLA</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
