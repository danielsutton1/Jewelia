"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export function BottleneckAnalysis({ filters }: { filters: any }) {
  // Sample data - in a real app, this would come from your database based on filters
  const data = [
    {
      stage: "Design",
      waitTime: 0.3,
      processTime: 1.2,
      capacity: 30,
      utilization: 80,
    },
    {
      stage: "Casting",
      waitTime: 0.5,
      processTime: 0.8,
      capacity: 40,
      utilization: 75,
    },
    {
      stage: "Stone Setting",
      waitTime: 1.8,
      processTime: 1.5,
      capacity: 25,
      utilization: 95,
    },
    {
      stage: "Polishing",
      waitTime: 0.2,
      processTime: 0.5,
      capacity: 45,
      utilization: 65,
    },
    {
      stage: "QC",
      waitTime: 0.1,
      processTime: 0.2,
      capacity: 50,
      utilization: 60,
    },
  ]

  // Find the bottleneck stage
  const bottleneckStage = data.reduce((prev, current) => (current.waitTime > prev.waitTime ? current : prev))

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Bottleneck Analysis</CardTitle>
        <CardDescription>Wait time vs. process time by production stage (days)</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Bottleneck Detected</AlertTitle>
          <AlertDescription className="text-amber-700">
            {bottleneckStage.stage} has the highest wait time ({bottleneckStage.waitTime} days) and{" "}
            {bottleneckStage.utilization}% utilization, indicating a critical bottleneck.
          </AlertDescription>
        </Alert>

        <div className="h-[220px]">
          <ChartContainer
            config={{
              waitTime: {
                label: "Wait Time (days)",
                color: "hsl(var(--gold-primary))",
              },
              processTime: {
                label: "Process Time (days)",
                color: "hsl(var(--primary))",
              },
              utilization: {
                label: "Utilization (%)",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar yAxisId="left" dataKey="waitTime" fill="var(--color-waitTime)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="processTime" fill="var(--color-processTime)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="utilization" fill="var(--color-utilization)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
