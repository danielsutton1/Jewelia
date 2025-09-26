'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, TrendingUp, Users, Package, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

interface DashboardMetrics {
  totalRevenue: number
  totalOrders: number
  activeCustomers: number
  totalInventory: number
  lowStockItems: number
  pendingOrders: number
}

export function RealDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      
      // Fetch metrics from our APIs
      const [ordersRes, customersRes, inventoryRes] = await Promise.all([
        fetch('/api/orders?limit=1000'),
        fetch('/api/customers?limit=1000'),
        fetch('/api/inventory?limit=1000')
      ])

      if (!ordersRes.ok || !customersRes.ok || !inventoryRes.ok) {
        throw new Error('Failed to fetch data from APIs')
      }

      const [ordersData, customersData, inventoryData] = await Promise.all([
        ordersRes.json(),
        customersRes.json(),
        inventoryRes.json()
      ])

      // Check success field from each API response
      if (!ordersData.success || !customersData.success || !inventoryData.success) {
        const errors = []
        if (!ordersData.success) errors.push(`Orders: ${ordersData.error || 'Unknown error'}`)
        if (!customersData.success) errors.push(`Customers: ${customersData.error || 'Unknown error'}`)
        if (!inventoryData.success) errors.push(`Inventory: ${inventoryData.error || 'Unknown error'}`)
        throw new Error(`API errors: ${errors.join(', ')}`)
      }

      // Calculate metrics
      const orders = ordersData.data || []
      const customers = customersData.data || []
      const inventory = inventoryData.data || []

      const calculatedMetrics: DashboardMetrics = {
        totalRevenue: orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0),
        totalOrders: orders.length,
        activeCustomers: customers.length,
        totalInventory: inventory.length,
        lowStockItems: inventory.filter((item: any) => item.status === 'low_stock').length,
        pendingOrders: orders.filter((order: any) => order.status === 'pending').length
      }

      setMetrics(calculatedMetrics)
      toast.success('Dashboard updated successfully!')
    } catch (error) {
      console.error('Error fetching metrics:', error)
      toast.error('Failed to load dashboard metrics')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchMetrics()
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Metrics</h2>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics?.totalRevenue.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              All time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalOrders || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.pendingOrders || '0'} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.activeCustomers || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalInventory || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.lowStockItems || '0'} low stock
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 