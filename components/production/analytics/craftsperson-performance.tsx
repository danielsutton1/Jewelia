"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Loader2 } from "lucide-react"

interface CraftspersonData {
  name: string
  items: number
  completed: number
  completionRate: number
  avgTime: number
  qualityScore: number
}

export function CraftspersonPerformance({ filters }: { filters: any }) {
  const [data, setData] = useState<CraftspersonData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCraftspersonData()
  }, [filters])

  const fetchCraftspersonData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics?type=production')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch craftsperson data')
      }
      
      setData(result.data.craftspersonPerformance || [])
    } catch (err: any) {
      console.error('Error fetching craftsperson data:', err)
      setError(err.message || 'Failed to load craftsperson data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Craftsperson Performance</CardTitle>
          <CardDescription>Efficiency and quality scores by craftsperson</CardDescription>
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
          <CardTitle>Craftsperson Performance</CardTitle>
          <CardDescription>Efficiency and quality scores by craftsperson</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <button 
                onClick={fetchCraftspersonData}
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
          <CardTitle>Craftsperson Performance</CardTitle>
          <CardDescription>Efficiency and quality scores by craftsperson</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No craftsperson performance data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform data for chart display
  const chartData = data.map(craftsperson => ({
    name: craftsperson.name,
    completionRate: craftsperson.completionRate,
    qualityScore: craftsperson.qualityScore,
    itemsCompleted: craftsperson.completed
  }))

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Craftsperson Performance</CardTitle>
        <CardDescription>Completion rate and quality scores by craftsperson</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer
          config={{
            completionRate: {
              label: "Completion Rate",
              color: "hsl(var(--primary))",
            },
            qualityScore: {
              label: "Quality Score",
              color: "hsl(var(--gold-primary))",
            },
          }}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={80} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="completionRate" fill="var(--color-completionRate)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="qualityScore" fill="var(--color-qualityScore)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
