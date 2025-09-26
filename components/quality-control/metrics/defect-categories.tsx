"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

const defectData = [
  {
    name: "Surface Finish",
    count: 48,
    critical: 5,
    major: 18,
    minor: 25,
  },
  {
    name: "Stone Setting",
    count: 37,
    critical: 12,
    major: 15,
    minor: 10,
  },
  {
    name: "Dimensions",
    count: 29,
    critical: 2,
    major: 9,
    minor: 18,
  },
  {
    name: "Material",
    count: 22,
    critical: 7,
    major: 10,
    minor: 5,
  },
  {
    name: "Clasp/Mechanism",
    count: 18,
    critical: 3,
    major: 8,
    minor: 7,
  },
  {
    name: "Engraving",
    count: 15,
    critical: 0,
    major: 5,
    minor: 10,
  },
  {
    name: "Plating",
    count: 12,
    critical: 2,
    major: 4,
    minor: 6,
  },
]

export function DefectCategories() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Defect Categories</CardTitle>
          <CardDescription>Distribution of defects by category and severity</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[400px]" config={{
            defectType: {
              label: "Defect Type",
            },
            count: {
              label: "Count",
            },
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={defectData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                <Bar dataKey="major" stackId="a" fill="#f59e0b" name="Major" />
                <Bar dataKey="minor" stackId="a" fill="#3b82f6" name="Minor" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Top Defect Categories</CardTitle>
          <CardDescription>Most common quality issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {defectData
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map((category, index) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <p className="text-sm font-medium">{category.name}</p>
                    </div>
                    <p className="text-sm font-medium">{category.count}</p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${(category.count / defectData[0].count) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      <span>Critical: {category.critical}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span>Major: {category.major}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>Minor: {category.minor}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
