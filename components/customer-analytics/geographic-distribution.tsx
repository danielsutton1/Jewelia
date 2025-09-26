"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import { Loader2 } from "lucide-react"

interface GeographicData {
  location: string
  count: number
  percentage: number
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F", "#FFBB28", "#FF8042"]

export function GeographicDistribution() {
  const [data, setData] = useState<GeographicData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGeographicData()
  }, [])

  const fetchGeographicData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics/customers?type=geographic')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch geographic data')
      }
      
      setData(result.data.geographic)
    } catch (err: any) {
      console.error('Error fetching geographic data:', err)
      setError(err.message || 'Failed to load geographic distribution data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>Customer distribution by geographic region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading geographic data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>Customer distribution by geographic region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <button 
                onClick={fetchGeographicData}
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
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>Customer distribution by geographic region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No geographic data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform data for pie chart
  const chartData = data.map((item, index) => ({
    region: item.location,
    value: item.percentage,
    count: item.count,
    color: COLORS[index % COLORS.length]
  }))

  // Find top regions
  const topRegion = data[0] // Data is already sorted by count
  const totalCustomers = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geographic Distribution</CardTitle>
        <CardDescription>Customer distribution by geographic region</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ region, value }) => `${region} ${value.toFixed(1)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  `${props.payload.count} customers (${value.toFixed(1)}%)`, 
                  "Distribution"
                ]} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Top region:</div>
              <div>{topRegion.location} ({topRegion.count} customers)</div>
            </div>
            <div>
              <div className="font-medium">Total customers:</div>
              <div>{totalCustomers} across {data.length} regions</div>
            </div>
            <div>
              <div className="font-medium">Regions covered:</div>
              <div>{data.length} different locations</div>
            </div>
            <div>
              <div className="font-medium">Distribution:</div>
              <div>From {data[data.length - 1]?.location || 'Unknown'} to {topRegion.location}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
