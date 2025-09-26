"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts"
import { Loader2 } from "lucide-react"

interface AOVData {
  period: string
  aov: number
  target: number
}

export function AverageOrderValueChart() {
  const [timeFrame, setTimeFrame] = useState("weekly")
  const [data, setData] = useState<AOVData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAOVData()
  }, [])

  const fetchAOVData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics?type=sales')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch AOV data')
      }
      
      // Calculate AOV trends from the sales data
      const aovData = calculateAOVTrends(result.data.trends, result.data.metrics.averageOrderValue)
      setData(aovData)
    } catch (err: any) {
      console.error('Error fetching AOV data:', err)
      setError(err.message || 'Failed to load AOV data')
    } finally {
      setLoading(false)
    }
  }

  const calculateAOVTrends = (trends: any, currentAOV: number) => {
    const weeklyData: AOVData[] = []
    const monthlyData: AOVData[] = []
    
    // Calculate weekly AOV from trends
    if (trends.weekly && trends.weekly.length > 0) {
      trends.weekly.forEach((week: any, index: number) => {
        const aov = week.transactions > 0 ? week.revenue / week.transactions : 0
        weeklyData.push({
          period: `W${index + 1}`,
          aov: Math.round(aov * 100) / 100,
          target: Math.round(currentAOV * 0.9 * 100) / 100 // Target at 90% of current AOV
        })
      })
    }
    
    // Calculate monthly AOV from trends
    if (trends.monthly && trends.monthly.length > 0) {
      trends.monthly.forEach((month: any, index: number) => {
        const aov = month.transactions > 0 ? month.revenue / month.transactions : 0
        monthlyData.push({
          period: month.date,
          aov: Math.round(aov * 100) / 100,
          target: Math.round(currentAOV * 0.9 * 100) / 100
        })
      })
    }
    
    return timeFrame === "weekly" ? weeklyData : monthlyData
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Average Order Value</CardTitle>
            <CardDescription>Trend of average order value over time</CardDescription>
          </div>
          <Tabs defaultValue="weekly">
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading AOV data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Average Order Value</CardTitle>
            <CardDescription>Trend of average order value over time</CardDescription>
          </div>
          <Tabs defaultValue="weekly">
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <button 
                onClick={fetchAOVData}
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Average Order Value</CardTitle>
            <CardDescription>Trend of average order value over time</CardDescription>
          </div>
          <Tabs defaultValue="weekly">
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No AOV data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const xKey = timeFrame === "weekly" ? "period" : "period"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Average Order Value</CardTitle>
          <CardDescription>Trend of average order value over time</CardDescription>
        </div>
        <Tabs defaultValue="weekly" value={timeFrame} onValueChange={setTimeFrame}>
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis domain={["dataMin - 10", "dataMax + 10"]} />
              <Tooltip
                formatter={(value) => [`$${value}`, value === data[0]?.target ? "Target" : "Average Order Value"]}
              />
              <Legend />
              {data[0] && <ReferenceLine y={data[0].target} stroke="red" strokeDasharray="3 3" />}
              <Line
                type="monotone"
                dataKey="aov"
                stroke="hsl(var(--primary))"
                activeDot={{ r: 8 }}
                name="Average Order Value"
              />
              <Line type="monotone" dataKey="target" stroke="red" strokeDasharray="3 3" name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
