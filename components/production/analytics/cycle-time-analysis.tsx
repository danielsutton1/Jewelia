"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Loader2 } from "lucide-react"

interface CycleTimeData {
  stage: string
  avgTime: number
  minTime: number
  maxTime: number
}

export function CycleTimeAnalysis({ filters }: { filters: any }) {
  const [data, setData] = useState<CycleTimeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCycleTimeData()
  }, [filters])

  const fetchCycleTimeData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics?type=production')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch cycle time data')
      }
      
      setData(result.data.cycleTime || [])
    } catch (err: any) {
      console.error('Error fetching cycle time data:', err)
      setError(err.message || 'Failed to load cycle time data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Cycle Time Analysis</CardTitle>
          <CardDescription>Average time spent in each production stage (days)</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Cycle Time Analysis</CardTitle>
          <CardDescription>Average time spent in each production stage (days)</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <button 
                onClick={fetchCycleTimeData}
                className="text-sm text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Cycle Time Analysis</CardTitle>
          <CardDescription>Average time spent in each production stage (days)</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No cycle time data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Cycle Time Analysis</CardTitle>
        <CardDescription>Average time spent in each production stage (days)</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer
          config={{
            avgTime: {
              label: "Average Time",
              color: "hsl(var(--gold-primary))",
            },
            minTime: {
              label: "Minimum Time",
              color: "hsl(var(--primary))",
            },
            maxTime: {
              label: "Maximum Time",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="stage" />
              <YAxis label={{ value: "Days", angle: -90, position: "insideLeft" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="avgTime" fill="var(--color-avgTime)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="minTime" fill="var(--color-minTime)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="maxTime" fill="var(--color-maxTime)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
