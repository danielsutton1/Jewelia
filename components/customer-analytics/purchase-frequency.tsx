"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Loader2 } from "lucide-react"

interface FrequencyData {
  distribution: {
    '1 order': number
    '2-3 orders': number
    '4-6 orders': number
    '7-10 orders': number
    '10+ orders': number
  }
  averageFrequency: number
  totalCustomersWithOrders: number
}

export function PurchaseFrequency() {
  const [data, setData] = useState<FrequencyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFrequencyData()
  }, [])

  const fetchFrequencyData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics/customers?type=frequency')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch frequency data')
      }
      
      setData(result.data.frequency)
    } catch (err: any) {
      console.error('Error fetching frequency data:', err)
      setError(err.message || 'Failed to load purchase frequency data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Purchase Frequency Patterns</CardTitle>
          <CardDescription>How often customers make purchases over a 24-month period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading frequency data...</span>
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
          <CardTitle>Purchase Frequency Patterns</CardTitle>
          <CardDescription>How often customers make purchases over a 24-month period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <button 
                onClick={fetchFrequencyData}
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

  if (!data || !data.distribution) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Purchase Frequency Patterns</CardTitle>
          <CardDescription>How often customers make purchases over a 24-month period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No frequency data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform data for chart
  const chartData = Object.entries(data.distribution).map(([frequency, customers]) => ({
    frequency: frequency.replace(' orders', ''),
    customers,
    percentage: data.totalCustomersWithOrders > 0 ? 
      Math.round((customers / data.totalCustomersWithOrders) * 100) : 0
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Frequency Patterns</CardTitle>
        <CardDescription>How often customers make purchases over a 24-month period</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="frequency" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`${value} customers`, "Count"]}
                labelFormatter={(label) => `Purchase frequency: ${label}`}
              />
              <Bar dataKey="customers" fill="hsl(var(--primary))" name="Customers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-medium">Average purchases:</span> {data.averageFrequency}
            </div>
            <div>
              <span className="font-medium">Customers with orders:</span> {data.totalCustomersWithOrders}
            </div>
            <div>
              <span className="font-medium">Total orders:</span> {Math.round(data.averageFrequency * data.totalCustomersWithOrders)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
