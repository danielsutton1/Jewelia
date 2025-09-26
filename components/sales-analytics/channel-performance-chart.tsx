"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Loader2 } from "lucide-react"

interface ChannelPerformance {
  name: string
  revenue: number
  units: number
}

export function ChannelPerformanceChart() {
  const [dataType, setDataType] = useState("revenue")
  const [data, setData] = useState<ChannelPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChannelPerformance()
  }, [])

  const fetchChannelPerformance = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics?type=sales')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch channel performance')
      }
      
      setData(result.data.channelPerformance)
    } catch (err: any) {
      console.error('Error fetching channel performance:', err)
      setError(err.message || 'Failed to load channel performance data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Channel Performance</CardTitle>
            <CardDescription>Sales performance across different channels</CardDescription>
          </div>
          <Tabs defaultValue="revenue">
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="units">Units</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading channel performance...</span>
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
            <CardTitle>Channel Performance</CardTitle>
            <CardDescription>Sales performance across different channels</CardDescription>
          </div>
          <Tabs defaultValue="revenue">
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="units">Units</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <button 
                onClick={fetchChannelPerformance}
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
            <CardTitle>Channel Performance</CardTitle>
            <CardDescription>Sales performance across different channels</CardDescription>
          </div>
          <Tabs defaultValue="revenue">
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="units">Units</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No channel performance data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const colors = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c", "#d0ed57", "#ffc658", "#ff8042"]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Channel Performance</CardTitle>
          <CardDescription>Sales performance across different channels</CardDescription>
        </div>
        <Tabs defaultValue="revenue" value={dataType} onValueChange={setDataType}>
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="units">Units</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  dataType === "revenue" ? `$${value.toLocaleString()}` : value.toLocaleString(),
                  dataType === "revenue" ? "Revenue" : "Units",
                ]}
              />
              <Legend />
              <Bar
                dataKey={dataType}
                fill={colors[0]}
                name={dataType === "revenue" ? "Revenue" : "Units"}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
