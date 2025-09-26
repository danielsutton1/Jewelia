"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, DollarSign, ShoppingBag, Users, Package, RotateCcw, Loader2 } from "lucide-react"

interface SalesMetrics {
  totalRevenue: number
  orderCount: number
  averageOrderValue: number
  returnRate: number
  newCustomers: number
}

export function MetricsCards() {
  const [data, setData] = useState<SalesMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSalesMetrics()
  }, [])

  const fetchSalesMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics?type=sales')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sales metrics')
      }
      
      setData(result.data.metrics)
    } catch (err: any) {
      console.error('Error fetching sales metrics:', err)
      setError(err.message || 'Failed to load sales metrics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full overflow-x-auto md:overflow-visible">
        <div className="flex md:grid md:grid-cols-5 gap-3 sm:gap-4 min-w-[800px] md:min-w-0 flex-nowrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="flex-shrink-0 w-80 md:w-auto">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full overflow-x-auto md:overflow-visible">
        <div className="flex md:grid md:grid-cols-5 gap-3 sm:gap-4 min-w-[800px] md:min-w-0 flex-nowrap">
          <Card className="flex-shrink-0 w-80 md:w-auto md:col-span-5">
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-sm text-destructive mb-2">{error}</p>
                <button 
                  onClick={fetchSalesMetrics}
                  className="text-sm text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="w-full overflow-x-auto md:overflow-visible">
        <div className="flex md:grid md:grid-cols-5 gap-3 sm:gap-4 min-w-[800px] md:min-w-0 flex-nowrap">
          <Card className="flex-shrink-0 w-80 md:w-auto md:col-span-5">
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-sm text-muted-foreground">No sales metrics available</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Calculate percentage changes (mock for now - in real app would compare with previous period)
  const metrics = [
    {
      title: "Total Revenue",
      value: `$${data.totalRevenue.toLocaleString()}`,
      change: 12.2, // Mock change - would calculate from historical data
      icon: DollarSign,
    },
    {
      title: "Transaction Count",
      value: data.orderCount.toLocaleString(),
      change: 8.7, // Mock change
      icon: ShoppingBag,
    },
    {
      title: "Average Basket",
      value: `$${data.averageOrderValue.toFixed(2)}`,
      change: 3.2, // Mock change
      icon: Package,
    },
    {
      title: "Return Rate",
      value: `${(data.returnRate * 100).toFixed(1)}%`,
      change: -0.8, // Mock change
      isNegativeGood: true,
      icon: RotateCcw,
    },
    {
      title: "New Customers",
      value: data.newCustomers.toString(),
      change: 15.3, // Mock change
      icon: Users,
    },
  ]

  return (
    <div className="w-full overflow-x-auto md:overflow-visible">
      <div className="flex md:grid md:grid-cols-5 gap-3 sm:gap-4 min-w-[800px] md:min-w-0 flex-nowrap">
        {metrics.map((metric) => (
          <Card key={metric.title} className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group flex-shrink-0 w-80 md:w-auto">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    <metric.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">{metric.title}</h4>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Sales
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                  {metric.value}
                </div>
                <div className={`flex items-center gap-1 text-xs ${
                  (metric.change > 0 && !metric.isNegativeGood) || (metric.change < 0 && metric.isNegativeGood)
                    ? "text-green-600"
                    : "text-red-600"
                }`}>
                  {metric.change > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  <span>{Math.abs(metric.change)}% from previous period</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                {metric.title === "Total Revenue" && "Total revenue generated from all sales"}
                {metric.title === "Transaction Count" && "Total number of completed transactions"}
                {metric.title === "Average Basket" && "Average value per transaction"}
                {metric.title === "Return Rate" && "Percentage of items returned by customers"}
                {metric.title === "New Customers" && "Number of new customers acquired"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
