'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  ShoppingCart,
  Loader2,
  Calendar,
  Target
} from "lucide-react"

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalInventory: number
  averageOrderValue: number
  orderCompletionRate: number
  customerGrowth: number
  inventoryTurnover: number
  recentTrends: {
    revenue: number
    orders: number
    customers: number
  }
}

export function AdvancedAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch data from multiple APIs
        const [ordersRes, customersRes, inventoryRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/customers'),
          fetch('/api/inventory')
        ])

        if (!ordersRes.ok || !customersRes.ok || !inventoryRes.ok) {
          throw new Error('Failed to fetch analytics data')
        }

        const [ordersData, customersData, inventoryData] = await Promise.all([
          ordersRes.json(),
          customersRes.json(),
          inventoryRes.json()
        ])

        const orders = ordersData.data || []
        const customers = customersData.data || []
        const inventory = inventoryData.data || []

        // Calculate analytics
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)
        const totalOrders = orders.length
        const totalCustomers = customers.length
        const totalInventory = inventory.length
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
        const completedOrders = orders.filter((order: any) => order.status === 'completed').length
        const orderCompletionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0

        // Mock growth calculations (in real app, would compare with historical data)
        const customerGrowth = 12.5 // Mock percentage
        const inventoryTurnover = 8.2 // Mock rate

        const analyticsData: AnalyticsData = {
          totalRevenue,
          totalOrders,
          totalCustomers,
          totalInventory,
          averageOrderValue,
          orderCompletionRate,
          customerGrowth,
          inventoryTurnover,
          recentTrends: {
            revenue: 15.2, // Mock percentage
            orders: 8.7,   // Mock percentage
            customers: 12.5 // Mock percentage
          }
        }

        setData(analyticsData)
      } catch (error) {
        console.error('Error fetching analytics:', error)
        setError('Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analytics data available.</p>
      </div>
    )
  }

  const getTrendIcon = (value: number) => {
    return value > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  const getTrendColor = (value: number) => {
    return value > 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(data.recentTrends.revenue)}
              <span className={`ml-1 ${getTrendColor(data.recentTrends.revenue)}`}>
                +{data.recentTrends.revenue}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(data.recentTrends.orders)}
              <span className={`ml-1 ${getTrendColor(data.recentTrends.orders)}`}>
                +{data.recentTrends.orders}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCustomers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(data.recentTrends.customers)}
              <span className={`ml-1 ${getTrendColor(data.recentTrends.customers)}`}>
                +{data.recentTrends.customers}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalInventory}</div>
            <p className="text-xs text-muted-foreground">
              Turnover rate: {data.inventoryTurnover}x
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Average Order Value</span>
                <span className="font-medium">${data.averageOrderValue.toFixed(2)}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Order Completion Rate</span>
                <span className="font-medium">{data.orderCompletionRate.toFixed(1)}%</span>
              </div>
              <Progress value={data.orderCompletionRate} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Customer Growth</span>
                <Badge variant="outline" className={getTrendColor(data.customerGrowth)}>
                  +{data.customerGrowth}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Orders This Month</span>
              <Badge variant="secondary">{data.totalOrders}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>New Customers</span>
              <Badge variant="secondary">+{Math.floor(data.totalCustomers * 0.15)}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Revenue Growth</span>
              <Badge variant="outline" className="text-green-600">
                +{data.recentTrends.revenue}%
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Inventory Status</span>
              <Badge variant="outline" className="text-blue-600">
                {data.totalInventory} Items
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 