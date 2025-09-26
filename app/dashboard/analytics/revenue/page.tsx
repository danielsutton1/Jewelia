"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  PieChart, 
  LineChart, 
  Calendar,
  Download,
  Filter,
  ArrowLeft,
  Target,
  Award,
  Users,
  ShoppingCart,
  Globe,
  Clock
} from 'lucide-react'
import { formatDistanceToNow, format, subDays, startOfDay, endOfDay } from 'date-fns'
import Link from 'next/link'

interface RevenueData {
  totalRevenue: number
  monthlyRevenue: number
  dailyRevenue: number
  revenueGrowth: number
  averageOrderValue: number
  revenueByChannel: Array<{
    channel: string
    revenue: number
    percentage: number
  }>
  revenueByProduct: Array<{
    product: string
    revenue: number
    percentage: number
  }>
  revenueByRegion: Array<{
    region: string
    revenue: number
    percentage: number
  }>
  monthlyTrend: Array<{
    month: string
    revenue: number
    orders: number
  }>
  topCustomers: Array<{
    name: string
    revenue: number
    orders: number
  }>
}

export default function RevenueAnalyticsPage() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Simulate API call
    const fetchRevenueData = async () => {
      setLoading(true)
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setRevenueData({
        totalRevenue: 1250000,
        monthlyRevenue: 125000,
        dailyRevenue: 4167,
        revenueGrowth: 12.5,
        averageOrderValue: 850,
        revenueByChannel: [
          { channel: 'Online Store', revenue: 750000, percentage: 60 },
          { channel: 'Retail Store', revenue: 375000, percentage: 30 },
          { channel: 'Wholesale', revenue: 125000, percentage: 10 }
        ],
        revenueByProduct: [
          { product: 'Diamond Rings', revenue: 500000, percentage: 40 },
          { product: 'Gold Necklaces', revenue: 375000, percentage: 30 },
          { product: 'Silver Earrings', revenue: 250000, percentage: 20 },
          { product: 'Custom Pieces', revenue: 125000, percentage: 10 }
        ],
        revenueByRegion: [
          { region: 'North America', revenue: 625000, percentage: 50 },
          { region: 'Europe', revenue: 375000, percentage: 30 },
          { region: 'Asia', revenue: 250000, percentage: 20 }
        ],
        monthlyTrend: [
          { month: 'Jan', revenue: 95000, orders: 112 },
          { month: 'Feb', revenue: 105000, orders: 124 },
          { month: 'Mar', revenue: 115000, orders: 135 },
          { month: 'Apr', revenue: 120000, orders: 141 },
          { month: 'May', revenue: 125000, orders: 147 },
          { month: 'Jun', revenue: 130000, orders: 153 }
        ],
        topCustomers: [
          { name: 'Sarah Johnson', revenue: 25000, orders: 15 },
          { name: 'Michael Chen', revenue: 22000, orders: 12 },
          { name: 'Emma Rodriguez', revenue: 18000, orders: 10 },
          { name: 'David Thompson', revenue: 15000, orders: 8 },
          { name: 'Lisa Anderson', revenue: 12000, orders: 6 }
        ]
      })
      setLoading(false)
    }

    fetchRevenueData()
  }, [dateRange])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!revenueData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Revenue Data Available</h2>
            <p className="text-gray-600">Unable to load revenue analytics at this time.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
              <p className="text-gray-600">Detailed revenue insights and trends</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${revenueData.totalRevenue.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                +{revenueData.revenueGrowth}% from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${revenueData.monthlyRevenue.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                +8.2% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${revenueData.dailyRevenue.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                +5.1% from last week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${revenueData.averageOrderValue}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                +3.7% from last period
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="channels">Sales Channels</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="regions">Regions</TabsTrigger>
            <TabsTrigger value="customers">Top Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueData.monthlyTrend.map((month, index) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 text-sm font-medium">{month.month}</div>
                          <div className="flex-1">
                            <Progress 
                              value={(month.revenue / Math.max(...revenueData.monthlyTrend.map(m => m.revenue))) * 100} 
                              className="h-2"
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${month.revenue.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{month.orders} orders</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueData.revenueByChannel.map((channel) => (
                      <div key={channel.channel} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-24 text-sm font-medium">{channel.channel}</div>
                          <div className="flex-1">
                            <Progress value={channel.percentage} className="h-2" />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${channel.revenue.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{channel.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="channels" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {revenueData.revenueByChannel.map((channel) => (
                <Card key={channel.channel}>
                  <CardHeader>
                    <CardTitle className="text-lg">{channel.channel}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      ${channel.revenue.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={channel.percentage} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{channel.percentage}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {revenueData.revenueByProduct.map((product) => (
                <Card key={product.product}>
                  <CardHeader>
                    <CardTitle className="text-lg">{product.product}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      ${product.revenue.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={product.percentage} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{product.percentage}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="regions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {revenueData.revenueByRegion.map((region) => (
                <Card key={region.region}>
                  <CardHeader>
                    <CardTitle className="text-lg">{region.region}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      ${region.revenue.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={region.percentage} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{region.percentage}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Customers by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData.topCustomers.map((customer, index) => (
                    <div key={customer.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.orders} orders</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${customer.revenue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          ${Math.round(customer.revenue / customer.orders).toLocaleString()} avg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
