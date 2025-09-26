"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

const trendData = [
  {
    month: "Jan",
    passRate: 82,
    defectRate: 18,
    avgResolutionDays: 4.2,
  },
  {
    month: "Feb",
    passRate: 83,
    defectRate: 17,
    avgResolutionDays: 4.0,
  },
  {
    month: "Mar",
    passRate: 85,
    defectRate: 15,
    avgResolutionDays: 3.8,
  },
  {
    month: "Apr",
    passRate: 84,
    defectRate: 16,
    avgResolutionDays: 3.9,
  },
  {
    month: "May",
    passRate: 86,
    defectRate: 14,
    avgResolutionDays: 3.5,
  },
  {
    month: "Jun",
    passRate: 87,
    defectRate: 13,
    avgResolutionDays: 3.2,
  },
]

export function TrendAnalysis() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Quality Trends (6 Months)</CardTitle>
          <CardDescription>Pass rate and defect rate over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[400px]" config={{
            month: {
              label: "Month",
            },
            passRate: {
              label: "Pass Rate (%)",
            },
            failRate: {
              label: "Fail Rate (%)",
            },
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="passRate"
                  name="Pass Rate (%)"
                  stroke="#22c55e"
                  activeDot={{ r: 8 }}
                />
                <Line yAxisId="left" type="monotone" dataKey="defectRate" name="Defect Rate (%)" stroke="#ef4444" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgResolutionDays"
                  name="Avg. Resolution Time (days)"
                  stroke="#3b82f6"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quality Improvement</CardTitle>
          <CardDescription>Month-over-month changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Pass Rate</p>
                <p className="text-sm font-medium text-green-600">+1.0%</p>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-green-500" style={{ width: "87%" }} />
              </div>
              <p className="text-xs text-muted-foreground">Improved from 86% to 87% in the last month</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Defect Rate</p>
                <p className="text-sm font-medium text-green-600">-1.0%</p>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-red-500" style={{ width: "13%" }} />
              </div>
              <p className="text-xs text-muted-foreground">Decreased from 14% to 13% in the last month</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Resolution Time</p>
                <p className="text-sm font-medium text-green-600">-0.3 days</p>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: "64%" }} />
              </div>
              <p className="text-xs text-muted-foreground">Improved from 3.5 days to 3.2 days in the last month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>Quality improvement opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border p-4">
              <h4 className="font-medium">Stone Setting Issues</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Stone setting defects have the highest critical rate (32%). Focus training on Diamond Direct and
                Precision Casting partners.
              </p>
            </div>
            <div className="rounded-md border p-4">
              <h4 className="font-medium">Surface Finish Improvements</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Surface finish issues remain the most common defect but have decreased by 12% since implementing new
                polishing guidelines.
              </p>
            </div>
            <div className="rounded-md border p-4">
              <h4 className="font-medium">Resolution Time</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Average resolution time has improved by 24% over the past 6 months due to the new feedback system.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
