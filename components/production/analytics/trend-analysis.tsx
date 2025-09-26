"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function TrendAnalysis({ filters }: { filters: any }) {
  // Sample data - in a real app, this would come from your database based on filters
  const data = [
    {
      month: "Jan",
      efficiency: 72,
      cycleTime: 5.2,
      qualityPass: 88,
      onTimeDelivery: 82,
    },
    {
      month: "Feb",
      efficiency: 70,
      cycleTime: 5.5,
      qualityPass: 86,
      onTimeDelivery: 80,
    },
    {
      month: "Mar",
      efficiency: 73,
      cycleTime: 5.0,
      qualityPass: 89,
      onTimeDelivery: 83,
    },
    {
      month: "Apr",
      efficiency: 75,
      cycleTime: 4.8,
      qualityPass: 90,
      onTimeDelivery: 85,
    },
    {
      month: "May",
      efficiency: 74,
      cycleTime: 4.9,
      qualityPass: 89,
      onTimeDelivery: 84,
    },
    {
      month: "Jun",
      efficiency: 76,
      cycleTime: 4.5,
      qualityPass: 91,
      onTimeDelivery: 86,
    },
    {
      month: "Jul",
      efficiency: 78,
      cycleTime: 4.2,
      qualityPass: 92,
      onTimeDelivery: 86,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trend Analysis</CardTitle>
        <CardDescription>Performance trends over time</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ChartContainer
          config={{
            efficiency: {
              label: "Efficiency (%)",
              color: "hsl(var(--primary))",
            },
            qualityPass: {
              label: "Quality Pass (%)",
              color: "hsl(var(--gold-primary))",
            },
            onTimeDelivery: {
              label: "On-Time Delivery (%)",
              color: "hsl(var(--chart-2))",
            },
            cycleTime: {
              label: "Cycle Time (days)",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="efficiency"
                stroke="var(--color-efficiency)"
                activeDot={{ r: 8 }}
              />
              <Line yAxisId="left" type="monotone" dataKey="qualityPass" stroke="var(--color-qualityPass)" />
              <Line yAxisId="left" type="monotone" dataKey="onTimeDelivery" stroke="var(--color-onTimeDelivery)" />
              <Line yAxisId="right" type="monotone" dataKey="cycleTime" stroke="var(--color-cycleTime)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
