"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

const data = [
  { name: "Pass", value: 874, color: "#22c55e" },
  { name: "Fail", value: 126, color: "#ef4444" },
  { name: "Conditional Pass", value: 284, color: "#f59e0b" },
]

const COLORS = ["#22c55e", "#ef4444", "#f59e0b"]

export function PassFailRates() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Pass/Fail Distribution</CardTitle>
          <CardDescription>Overall inspection results distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[300px]" config={{
            name: {
              label: "Status",
            },
            value: {
              label: "Count",
            },
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Pass/Fail by Product Category</CardTitle>
          <CardDescription>Inspection results by product type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Rings</p>
                <p className="text-sm font-medium">92%</p>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-green-500" style={{ width: "92%" }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Necklaces</p>
                <p className="text-sm font-medium">88%</p>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-green-500" style={{ width: "88%" }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Bracelets</p>
                <p className="text-sm font-medium">85%</p>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-green-500" style={{ width: "85%" }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Earrings</p>
                <p className="text-sm font-medium">79%</p>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-green-500" style={{ width: "79%" }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Watches</p>
                <p className="text-sm font-medium">94%</p>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-green-500" style={{ width: "94%" }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
