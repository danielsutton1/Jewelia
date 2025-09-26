"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function CapacityUtilization({ filters }: { filters: any }) {
  // Sample data - in a real app, this would come from your database based on filters
  const data = [
    {
      department: "Design",
      capacity: 100,
      utilized: 85,
      scheduled: 92,
    },
    {
      department: "Casting",
      capacity: 100,
      utilized: 78,
      scheduled: 85,
    },
    {
      department: "Stone Setting",
      capacity: 100,
      utilized: 92,
      scheduled: 95,
    },
    {
      department: "Polishing",
      capacity: 100,
      utilized: 65,
      scheduled: 70,
    },
    {
      department: "QC",
      capacity: 100,
      utilized: 72,
      scheduled: 80,
    },
  ]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Capacity Utilization</CardTitle>
        <CardDescription>Current and scheduled capacity by department</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer
          config={{
            utilized: {
              label: "Current Utilization",
              color: "hsl(var(--primary))",
            },
            scheduled: {
              label: "Scheduled Utilization",
              color: "hsl(var(--gold-primary))",
            },
          }}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="department" />
              <YAxis domain={[0, 100]} label={{ value: "%", position: "insideTopLeft", dy: -10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="utilized" fill="var(--color-utilized)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="scheduled" fill="var(--color-scheduled)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
