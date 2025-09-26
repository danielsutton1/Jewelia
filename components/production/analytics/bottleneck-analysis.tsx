"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from "lucide-react"

interface BottleneckData {
  stage: string
  itemCount: number
  avgTime: number
  bottleneckScore: number
}

interface BottleneckAnalysisData {
  bottlenecks: BottleneckData[]
  topBottleneck: BottleneckData | null
}

export function BottleneckAnalysis({ filters }: { filters: any }) {
  const [data, setData] = useState<BottleneckAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBottleneckData()
  }, [filters])

  const fetchBottleneckData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics?type=production')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch bottleneck data')
      }
      
      setData(result.data.bottlenecks)
    } catch (err: any) {
      console.error('Error fetching bottleneck data:', err)
      setError(err.message || 'Failed to load bottleneck data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Bottleneck Analysis</CardTitle>
          <CardDescription>Wait time vs. process time by production stage (days)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[220px] items-center justify-center">
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
          <CardTitle>Bottleneck Analysis</CardTitle>
          <CardDescription>Wait time vs. process time by production stage (days)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[220px] items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <button 
                onClick={fetchBottleneckData}
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

  if (!data || !data.bottlenecks || data.bottlenecks.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Bottleneck Analysis</CardTitle>
          <CardDescription>Wait time vs. process time by production stage (days)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[220px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No bottleneck data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform data for chart display
  const chartData = data.bottlenecks.map(bottleneck => ({
    stage: bottleneck.stage,
    itemCount: bottleneck.itemCount,
    avgTime: bottleneck.avgTime,
    bottleneckScore: bottleneck.bottleneckScore
  }))

  const topBottleneck = data.topBottleneck

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Bottleneck Analysis</CardTitle>
        <CardDescription>Production stage analysis by item count and average time (days)</CardDescription>
      </CardHeader>
      <CardContent>
        {topBottleneck && (
          <Alert className="mb-4 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Bottleneck Detected</AlertTitle>
            <AlertDescription className="text-amber-700">
              {topBottleneck.stage} has the highest bottleneck score ({topBottleneck.bottleneckScore.toFixed(1)}) 
              with {topBottleneck.itemCount} items and {topBottleneck.avgTime} days average time.
            </AlertDescription>
          </Alert>
        )}

        <div className="h-[220px]">
          <ChartContainer
            config={{
              itemCount: {
                label: "Item Count",
                color: "hsl(var(--gold-primary))",
              },
              avgTime: {
                label: "Average Time",
                color: "hsl(var(--primary))",
              },
              bottleneckScore: {
                label: "Bottleneck Score",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" />
                <YAxis label={{ value: "Count/Time", angle: -90, position: "insideLeft" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="itemCount" fill="var(--color-itemCount)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgTime" fill="var(--color-avgTime)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bottleneckScore" fill="var(--color-bottleneckScore)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
