"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import { Loader2 } from "lucide-react"

interface CategorySales {
  name: string
  revenue: number
  units: number
}

export function SalesByCategoryChart() {
  const [chartType, setChartType] = useState("pie")
  const [dataType, setDataType] = useState("revenue")
  const [data, setData] = useState<CategorySales[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategorySales()
  }, [])

  const fetchCategorySales = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics?type=sales')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch category sales')
      }
      
      setData(result.data.salesByCategory)
    } catch (err: any) {
      console.error('Error fetching category sales:', err)
      setError(err.message || 'Failed to load category sales data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Distribution of sales across product categories</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Tabs defaultValue="pie">
              <TabsList>
                <TabsTrigger value="pie">Pie</TabsTrigger>
                <TabsTrigger value="donut">Donut</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs defaultValue="revenue">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="units">Units</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading category sales...</span>
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
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Distribution of sales across product categories</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Tabs defaultValue="pie">
              <TabsList>
                <TabsTrigger value="pie">Pie</TabsTrigger>
                <TabsTrigger value="donut">Donut</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs defaultValue="revenue">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="units">Units</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
              <button 
                onClick={fetchCategorySales}
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
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Distribution of sales across product categories</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Tabs defaultValue="pie">
              <TabsList>
                <TabsTrigger value="pie">Pie</TabsTrigger>
                <TabsTrigger value="donut">Donut</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs defaultValue="revenue">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="units">Units</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No category sales data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const COLORS = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c", "#d0ed57", "#ffc658", "#ff8042"]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sales by Category</CardTitle>
          <CardDescription>Distribution of sales across product categories</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Tabs defaultValue="pie" value={chartType} onValueChange={setChartType}>
            <TabsList>
              <TabsTrigger value="pie">Pie</TabsTrigger>
              <TabsTrigger value="donut">Donut</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs defaultValue="revenue" value={dataType} onValueChange={setDataType}>
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="units">Units</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={chartType === "pie" ? 100 : 100}
                innerRadius={chartType === "pie" ? 0 : 60}
                dataKey={dataType}
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [
                  dataType === "revenue" ? `$${value.toLocaleString()}` : value.toLocaleString(),
                  dataType === "revenue" ? "Revenue" : "Units",
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
