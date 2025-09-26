"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingBag, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react"
import { toast } from "sonner"

// Mock data for charts
const customerGrowthData = [
  { month: "Jan", customers: 1200, growth: 5.2 },
  { month: "Feb", customers: 1250, growth: 4.2 },
  { month: "Mar", customers: 1300, growth: 4.0 },
  { month: "Apr", customers: 1350, growth: 3.8 },
  { month: "May", customers: 1400, growth: 3.7 },
  { month: "Jun", customers: 1450, growth: 3.6 },
  { month: "Jul", customers: 1500, growth: 3.4 },
  { month: "Aug", customers: 1550, growth: 3.3 },
  { month: "Sep", customers: 1600, growth: 3.2 },
  { month: "Oct", customers: 1650, growth: 3.1 },
  { month: "Nov", customers: 1700, growth: 3.0 },
  { month: "Dec", customers: 1750, growth: 2.9 }
]

const revenueData = [
  { month: "Jan", revenue: 45000, orders: 180 },
  { month: "Feb", revenue: 52000, orders: 210 },
  { month: "Mar", revenue: 48000, orders: 195 },
  { month: "Apr", revenue: 55000, orders: 220 },
  { month: "May", revenue: 62000, orders: 250 },
  { month: "Jun", revenue: 58000, orders: 235 },
  { month: "Jul", revenue: 65000, orders: 260 },
  { month: "Aug", revenue: 72000, orders: 285 },
  { month: "Sep", revenue: 68000, orders: 270 },
  { month: "Oct", revenue: 75000, orders: 300 },
  { month: "Nov", revenue: 82000, orders: 325 },
  { month: "Dec", revenue: 78000, orders: 310 }
]

const customerSegmentsData = [
  { name: "VIP Customers", value: 156, color: "#10b981" },
  { name: "Regular Buyers", value: 423, color: "#3b82f6" },
  { name: "Occasional", value: 298, color: "#f59e0b" },
  { name: "New Customers", value: 89, color: "#8b5cf6" },
  { name: "At Risk", value: 67, color: "#ef4444" }
]

const topProductsData = [
  { product: "Diamond Rings", sales: 45, revenue: 125000 },
  { product: "Gold Necklaces", sales: 38, revenue: 89000 },
  { product: "Silver Bracelets", sales: 32, revenue: 67000 },
  { product: "Pearl Earrings", sales: 28, revenue: 54000 },
  { product: "Gemstone Pendants", sales: 25, revenue: 48000 }
]

export function CustomerAnalytics() {
  const [timeRange, setTimeRange] = useState("12")
  const [chartType, setChartType] = useState("bar")
  const [isLoading, setIsLoading] = useState(false)

  const handleExportData = () => {
    setIsLoading(true)
    // Simulate export process
    setTimeout(() => {
      toast.success("Analytics data exported successfully!")
      setIsLoading(false)
    }, 2000)
  }

  const handleRefreshData = () => {
    setIsLoading(true)
    // Simulate data refresh
    setTimeout(() => {
      toast.success("Analytics data refreshed!")
      setIsLoading(false)
    }, 1500)
  }

  const handleViewDetails = (metric: string) => {
    toast.info(`Viewing detailed ${metric} analytics...`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into customer behavior and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="12">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" onClick={handleExportData} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12.5% from last month
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 p-0 h-auto text-xs"
              onClick={() => handleViewDetails("customers")}
            >
              View details →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$78,450</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +8.2% from last month
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 p-0 h-auto text-xs"
              onClick={() => handleViewDetails("revenue")}
            >
              View details →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">310</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +15.3% from last month
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 p-0 h-auto text-xs"
              onClick={() => handleViewDetails("orders")}
            >
              View details →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$253</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -2.1% from last month
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 p-0 h-auto text-xs"
              onClick={() => handleViewDetails("order value")}
            >
              View details →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="growth">Customer Growth</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Growth Trend</CardTitle>
              <CardDescription>
                Monthly customer acquisition and growth rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={customerGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="customers" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Orders</CardTitle>
              <CardDescription>
                Monthly revenue and order volume comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" />
                    <Bar yAxisId="right" dataKey="orders" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>
                Distribution of customers across different segments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerSegmentsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {customerSegmentsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Products by Sales</CardTitle>
              <CardDescription>
                Best performing products in terms of sales and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProductsData.map((product, index) => (
                  <div key={product.product} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{product.product}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sales} sales • ${product.revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
 