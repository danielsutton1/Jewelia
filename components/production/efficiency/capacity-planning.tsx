"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function CapacityPlanning({ filters }: { filters: any }) {
  // Sample data - in a real app, this would come from your database based on filters
  const data = [
    {
      department: "Design",
      currentCapacity: 30,
      projectedDemand: 35,
      recommendedCapacity: 38,
    },
    {
      department: "Casting",
      currentCapacity: 40,
      projectedDemand: 42,
      recommendedCapacity: 45,
    },
    {
      department: "Stone Setting",
      currentCapacity: 25,
      projectedDemand: 35,
      recommendedCapacity: 40,
    },
    {
      department: "Polishing",
      currentCapacity: 45,
      projectedDemand: 40,
      recommendedCapacity: 45,
    },
    {
      department: "QC",
      currentCapacity: 50,
      projectedDemand: 45,
      recommendedCapacity: 50,
    },
  ]

  // Find departments that need capacity increases
  const capacityIssues = data.filter((d) => d.projectedDemand > d.currentCapacity)

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Capacity Planning</CardTitle>
        <CardDescription>Current capacity vs. projected demand by department</CardDescription>
      </CardHeader>
      <CardContent>
        {capacityIssues.length > 0 && (
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Capacity Planning Alert</AlertTitle>
            <AlertDescription className="text-blue-700">
              {capacityIssues.length} department(s) need capacity increases to meet projected demand, with Stone Setting
              requiring the most urgent attention.
            </AlertDescription>
          </Alert>
        )}

        <div className="h-[300px]">
          <ChartContainer
            config={{
              currentCapacity: {
                label: "Current Capacity",
                color: "hsl(var(--chart-1))",
              },
              projectedDemand: {
                label: "Projected Demand",
                color: "hsl(var(--chart-2))",
              },
              recommendedCapacity: {
                label: "Recommended Capacity",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="department" />
                <YAxis label={{ value: "Units/Day", angle: -90, position: "insideLeft" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="currentCapacity" fill="var(--color-currentCapacity)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="projectedDemand" fill="var(--color-projectedDemand)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recommendedCapacity" fill="var(--color-recommendedCapacity)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
