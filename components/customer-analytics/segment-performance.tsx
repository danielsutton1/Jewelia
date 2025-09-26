"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts"
import { Loader2 } from "lucide-react"

interface SegmentationData {
  highValue: { count: number; customers: any[]; totalRevenue: number }
  regular: { count: number; customers: any[]; totalRevenue: number }
  new: { count: number; customers: any[]; totalRevenue: number }
  dormant: { count: number; customers: any[]; totalRevenue: number }
}

export function SegmentPerformance() {
  const [data, setData] = useState<SegmentationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSegmentationData()
  }, [])

  const fetchSegmentationData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics/customers?type=segmentation')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch segmentation data')
      }
      
      setData(result.data.segmentation)
    } catch (err: any) {
      console.error('Error fetching segmentation data:', err)
      setError(err.message || 'Failed to load segmentation data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Segment Performance</CardTitle>
          <CardDescription>Performance metrics across different customer segments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading segmentation data...</span>
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
          <CardTitle>Segment Performance</CardTitle>
          <CardDescription>Performance metrics across different customer segments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <button 
                onClick={fetchSegmentationData}
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

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Segment Performance</CardTitle>
          <CardDescription>Performance metrics across different customer segments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No segmentation data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate performance metrics for each segment
  const calculateSegmentMetrics = (segment: { count: number; totalRevenue: number }) => {
    const totalCustomers = data.highValue.count + data.regular.count + data.new.count + data.dormant.count
    const totalRevenue = data.highValue.totalRevenue + data.regular.totalRevenue + data.new.totalRevenue
    
    const customerShare = totalCustomers > 0 ? (segment.count / totalCustomers) * 100 : 0
    const revenueShare = totalRevenue > 0 ? (segment.totalRevenue / totalRevenue) * 100 : 0
    const avgRevenue = segment.count > 0 ? segment.totalRevenue / segment.count : 0
    
    return {
      customerShare: Math.round(customerShare * 10) / 10,
      revenueShare: Math.round(revenueShare * 10) / 10,
      avgRevenue: Math.round(avgRevenue * 100) / 100
    }
  }

  const highValueMetrics = calculateSegmentMetrics(data.highValue)
  const regularMetrics = calculateSegmentMetrics(data.regular)
  const newMetrics = calculateSegmentMetrics(data.new)
  const dormantMetrics = calculateSegmentMetrics(data.dormant)

  // Transform data for radar chart
  const chartData = [
    {
      segment: "High Value",
      revenue: highValueMetrics.revenueShare,
      customers: highValueMetrics.customerShare,
      avgRevenue: Math.min(100, highValueMetrics.avgRevenue / 100), // Normalize to 0-100
      growth: data.highValue.count > 0 ? 90 : 0,
    },
    {
      segment: "Regular",
      revenue: regularMetrics.revenueShare,
      customers: regularMetrics.customerShare,
      avgRevenue: Math.min(100, regularMetrics.avgRevenue / 100),
      growth: data.regular.count > 0 ? 70 : 0,
    },
    {
      segment: "New",
      revenue: newMetrics.revenueShare,
      customers: newMetrics.customerShare,
      avgRevenue: Math.min(100, newMetrics.avgRevenue / 100),
      growth: data.new.count > 0 ? 85 : 0,
    },
    {
      segment: "Dormant",
      revenue: dormantMetrics.revenueShare,
      customers: dormantMetrics.customerShare,
      avgRevenue: Math.min(100, dormantMetrics.avgRevenue / 100),
      growth: data.dormant.count > 0 ? 30 : 0,
    },
  ]

  // Find top performing segment
  const topSegment = chartData.reduce((prev, current) => 
    (current.revenue + current.customers + current.avgRevenue) > (prev.revenue + prev.customers + prev.avgRevenue) ? current : prev
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Segment Performance</CardTitle>
        <CardDescription>Performance metrics across different customer segments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="segment" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Revenue Share"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary)/0.2)"
                fillOpacity={0.6}
              />
              <Radar
                name="Customer Share"
                dataKey="customers"
                stroke="hsl(var(--secondary))"
                fill="hsl(var(--secondary)/0.2)"
                fillOpacity={0.6}
              />
              <Radar
                name="Avg Revenue"
                dataKey="avgRevenue"
                stroke="hsl(var(--accent))"
                fill="hsl(var(--accent)/0.2)"
                fillOpacity={0.6}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Top performing segment:</div>
              <div>{topSegment.segment} ({Math.round((topSegment.revenue + topSegment.customers + topSegment.avgRevenue) / 3)} performance score)</div>
            </div>
            <div>
              <div className="font-medium">Total customers:</div>
              <div>{data.highValue.count + data.regular.count + data.new.count + data.dormant.count} across all segments</div>
            </div>
            <div>
              <div className="font-medium">High-value customers:</div>
              <div>{data.highValue.count} (${data.highValue.totalRevenue.toLocaleString()} revenue)</div>
            </div>
            <div>
              <div className="font-medium">Regular customers:</div>
              <div>{data.regular.count} (${data.regular.totalRevenue.toLocaleString()} revenue)</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
