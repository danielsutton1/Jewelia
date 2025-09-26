"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function EfficiencyTrending({ filters }: { filters: any }) {
  // Sample data - in a real app, this would come from your database based on filters
  const data = [
    {
      month: "Jan",
      throughput: 18,
      cycleTime: 5.2,
      utilization: 72,
      qualityPass: 88,
    },
    {
      month: "Feb",
      throughput: 19,
      cycleTime: 5.0,
      utilization: 74,
      qualityPass: 89,
    },
    {
      month: "Mar",
      throughput: 20,
      cycleTime: 4.8,
      utilization: 75,
      qualityPass: 90,
    },
    {
      month: "Apr",
      throughput: 21,
      cycleTime: 4.6,
      utilization: 76,
      qualityPass: 90,
    },
    {
      month: "May",
      throughput: 22,
      cycleTime: 4.5,
      utilization: 77,
      qualityPass: 91,
    },
    {
      month: "Jun",
      throughput: 23,
      cycleTime: 4.3,
      utilization: 78,
      qualityPass: 91,
    },
    {
      month: "Jul",
      throughput: 24,
      cycleTime: 4.2,
      utilization: 78,
      qualityPass: 92,
    },
  ]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Efficiency Trending</CardTitle>
        <CardDescription>Key efficiency metrics over time</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer
          config={{
            throughput: {
              label: "Throughput (units/day)",
              color: "hsl(var(--primary))",
            },
            cycleTime: {
              label: "Cycle Time (days)",
              color: "hsl(var(--gold-primary))",
            },
            utilization: {
              label: "Resource Utilization (%)",
              color: "hsl(var(--chart-2))",
            },
            qualityPass: {
              label: "Quality Pass Rate (%)",
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
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="throughput"
                stroke="var(--color-throughput)"
                activeDot={{ r: 8 }}
              />
              <Line yAxisId="left" type="monotone" dataKey="cycleTime" stroke="var(--color-cycleTime)" />
              <Line yAxisId="right" type="monotone" dataKey="utilization" stroke="var(--color-utilization)" />
              <Line yAxisId="right" type="monotone" dataKey="qualityPass" stroke="var(--color-qualityPass)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
