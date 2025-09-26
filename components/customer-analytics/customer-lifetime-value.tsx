"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Loader2 } from "lucide-react"

interface CLVData {
  averageCLV: number
  medianCLV: number
  top10PercentCLV: number
  distribution: Array<{
    value: string
    count: number
    percentage: number
  }>
}

export function CustomerLifetimeValue() {
  const [data, setData] = useState<CLVData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCLVData()
  }, [])

  const fetchCLVData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics/customers?type=clv')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch CLV data')
      }
      
      setData(result.data.clv)
    } catch (err: any) {
      console.error('Error fetching CLV data:', err)
      setError(err.message || 'Failed to load customer lifetime value data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Lifetime Value Distribution</CardTitle>
          <CardDescription>Distribution of customers by total lifetime spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading CLV data...</span>
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
          <CardTitle>Customer Lifetime Value Distribution</CardTitle>
          <CardDescription>Distribution of customers by total lifetime spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <button 
                onClick={fetchCLVData}
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

  if (!data || !data.distribution || data.distribution.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Lifetime Value Distribution</CardTitle>
          <CardDescription>Distribution of customers by total lifetime spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No CLV data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Lifetime Value Distribution</CardTitle>
        <CardDescription>Distribution of customers by total lifetime spending</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.distribution}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="value" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`${value} customers`, "Count"]}
                labelFormatter={(label) => `CLV: ${label}`}
              />
              <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-medium">Average CLV:</span> ${data.averageCLV.toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Median CLV:</span> ${data.medianCLV.toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Top 10% CLV:</span> ${data.top10PercentCLV.toLocaleString()}+
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
