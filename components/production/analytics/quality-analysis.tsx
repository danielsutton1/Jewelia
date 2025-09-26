"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

export function QualityAnalysis({ filters }: { filters: any }) {
  // Sample data - in a real app, this would come from your database based on filters
  const data = [
    { name: "First Pass", value: 68 },
    { name: "Minor Rework", value: 24 },
    { name: "Major Rework", value: 8 },
  ]

  const defectData = [
    { name: "Stone Setting", value: 42 },
    { name: "Finishing", value: 28 },
    { name: "Casting", value: 18 },
    { name: "Design", value: 12 },
  ]

  const COLORS = ["#4ade80", "#facc15", "#f87171"]
  const DEFECT_COLORS = ["#60a5fa", "#a78bfa", "#f97316", "#ec4899"]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Quality Analysis</CardTitle>
        <CardDescription>Quality pass rates and defect distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-[250px]">
            <p className="mb-2 text-center text-sm font-medium">Quality Pass Rates</p>
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
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="h-[250px]">
            <p className="mb-2 text-center text-sm font-medium">Defect Distribution</p>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={defectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {defectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DEFECT_COLORS[index % DEFECT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
