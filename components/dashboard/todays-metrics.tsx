'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useApi } from "@/lib/api-service"
import { useEffect, useState } from "react"
import { ShoppingCart, DollarSign, Users, Package, TrendingUp, UserPlus, CreditCard, Box } from "lucide-react"

interface Metrics {
  todaysRevenue: number
  todaysOrders: number
  todaysVisitors: number
  itemsSold: number
  totalRevenue: number
  customers: number
  sales: number
  activeOrders: number
}

export function TodaysMetrics() {
  const api = useApi()
  const [metrics, setMetrics] = useState<Metrics>({
    todaysRevenue: 0,
    todaysOrders: 0,
    todaysVisitors: 0,
    itemsSold: 0,
    totalRevenue: 0,
    customers: 0,
    sales: 0,
    activeOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const ordersResponse = await api.orders.list()
        
        // Handle both possible return types from api.orders.list()
        let orders: any[] = []
        if ('orders' in ordersResponse && Array.isArray(ordersResponse.orders)) {
          orders = ordersResponse.orders
        } else if (Array.isArray(ordersResponse)) {
          orders = ordersResponse
        }
        
        const today = new Date().toISOString().split('T')[0]
        
        const todayOrders = orders.filter(order => 
          new Date(order.createdAt).toISOString().split('T')[0] === today
        )

        setMetrics({
          todaysRevenue: 0,
          todaysOrders: todayOrders.length,
          todaysVisitors: 0,
          itemsSold: 0,
          totalRevenue: todayOrders.reduce((sum, order) => sum + order.total, 0),
          customers: 0,
          sales: 0,
          activeOrders: todayOrders.filter(order => order.status === 'pending').length
        })
        setError(null)
      } catch (error) {
        console.error('Error fetching metrics:', error)
        setError('Failed to load metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [api])

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 w-full">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="grid w-full gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 auto-rows-fr">
      <Card className="flex flex-col justify-between h-full min-h-[160px]">
        <CardHeader className="pb-2 flex flex-col items-center">
          <span className="inline-flex items-center justify-center rounded-full bg-green-100 p-2 mb-2 mt-1">
            <DollarSign className="h-7 w-7 text-green-600" />
          </span>
          <span className="block text-sm text-muted-foreground font-medium text-center">Today's Revenue</span>
          <span className="block text-3xl font-bold leading-tight mt-1 text-center">${metrics.todaysRevenue.toLocaleString()}</span>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 pt-0 items-center">
          <span className="text-xs text-green-600 font-semibold">+15.2%</span>
          <span className="text-xs text-muted-foreground">from last month</span>
        </CardContent>
      </Card>
      <Card className="flex flex-col justify-between h-full min-h-[160px]">
        <CardHeader className="pb-2 flex flex-col items-center">
          <span className="inline-flex items-center justify-center rounded-full bg-blue-100 p-2 mb-2 mt-1">
            <ShoppingCart className="h-7 w-7 text-blue-600" />
          </span>
          <span className="block text-sm text-muted-foreground font-medium text-center">Today's Orders</span>
          <span className="block text-3xl font-bold leading-tight mt-1 text-center">{metrics.todaysOrders}</span>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 pt-0 items-center">
          <span className="text-xs text-green-600 font-semibold">+8.4%</span>
          <span className="text-xs text-muted-foreground">from last month</span>
        </CardContent>
      </Card>
      <Card className="flex flex-col justify-between h-full min-h-[160px]">
        <CardHeader className="pb-2 flex flex-col items-center">
          <span className="inline-flex items-center justify-center rounded-full bg-orange-100 p-2 mb-2 mt-1">
            <Package className="h-7 w-7 text-orange-500" />
          </span>
          <span className="block text-sm text-muted-foreground font-medium text-center">Items Sold</span>
          <span className="block text-3xl font-bold leading-tight mt-1 text-center">{metrics.itemsSold}</span>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 pt-0 items-center">
          <span className="text-xs text-green-600 font-semibold">+12.5%</span>
          <span className="text-xs text-muted-foreground">from last month</span>
        </CardContent>
      </Card>
      <Card className="flex flex-col justify-between h-full min-h-[160px]">
        <CardHeader className="pb-2 flex flex-col items-center">
          <span className="inline-flex items-center justify-center rounded-full bg-purple-100 p-2 mb-2 mt-1">
            <UserPlus className="h-7 w-7 text-purple-600" />
          </span>
          <span className="block text-sm text-muted-foreground font-medium text-center">Customers</span>
          <span className="block text-3xl font-bold leading-tight mt-1 text-center">+{metrics.customers.toLocaleString()}</span>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 pt-0 items-center">
          <span className="text-xs text-green-600 font-semibold">+4%</span>
          <span className="text-xs text-muted-foreground">from last month</span>
        </CardContent>
      </Card>
      <Card className="flex flex-col justify-between h-full min-h-[160px]">
        <CardHeader className="pb-2 flex flex-col items-center">
          <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 p-2 mb-2 mt-1">
            <CreditCard className="h-7 w-7 text-emerald-600" />
          </span>
          <span className="block text-sm text-muted-foreground font-medium text-center">Sales</span>
          <span className="block text-3xl font-bold leading-tight mt-1 text-center">+{metrics.sales.toLocaleString()}</span>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 pt-0 items-center">
          <span className="text-xs text-green-600 font-semibold">+8%</span>
          <span className="text-xs text-muted-foreground">from last month</span>
        </CardContent>
      </Card>
      <Card className="flex flex-col justify-between h-full min-h-[160px]">
        <CardHeader className="pb-2 flex flex-col items-center">
          <span className="inline-flex items-center justify-center rounded-full bg-pink-100 p-2 mb-2 mt-1">
            <Box className="h-7 w-7 text-pink-500" />
          </span>
          <span className="block text-sm text-muted-foreground font-medium text-center">Active Orders</span>
          <span className="block text-3xl font-bold leading-tight mt-1 text-center">+{metrics.activeOrders}</span>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 pt-0 items-center">
          <span className="text-xs text-red-600 font-semibold">-2%</span>
          <span className="text-xs text-muted-foreground">from last month</span>
          <span className="block text-xs text-muted-foreground mt-1">12 pending</span>
        </CardContent>
      </Card>
    </div>
  )
}
