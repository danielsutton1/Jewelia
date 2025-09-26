"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Package, 
  TrendingUp, 
  Activity, 
  Target, 
  Settings, 
  RefreshCw,
  Download,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Warehouse,
  MapPin,
  Calendar,
  Users,
  Star,
  Award,
  Heart,
  Gem,
  Diamond,
  Circle,
  Square,
  Hexagon,
  Crown,
  Sparkles,
  Zap,
  Shield,
  Globe,
  Database
} from "lucide-react"
import { toast } from "sonner"
import { EnhancedInventoryAnalytics } from "@/components/inventory/enhanced-inventory-analytics"
import { EnhancedInventoryTracking } from "@/components/inventory/enhanced-inventory-tracking"

interface InventoryMetrics {
  totalItems: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  averageItemValue: number
  turnoverRate: number
  accuracy: number
  efficiency: number
  costSavings: number
}

export default function EnhancedInventoryManagementPage() {
  const [metrics, setMetrics] = useState<InventoryMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch real inventory data
      const inventoryResponse = await fetch('/api/inventory?limit=1000')
      const inventoryData = await inventoryResponse.json()
      const inventory = inventoryData.data || []
      
      // Calculate metrics from real data
      const calculatedMetrics: InventoryMetrics = {
        totalItems: inventory.length,
        totalValue: inventory.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
        lowStockItems: inventory.filter((item: any) => item.quantity <= 5 && item.quantity > 0).length,
        outOfStockItems: inventory.filter((item: any) => item.quantity === 0).length,
        averageItemValue: inventory.length > 0 ? inventory.reduce((sum: number, item: any) => sum + item.price, 0) / inventory.length : 0,
        turnoverRate: 85.2, // Mock data
        accuracy: 98.5, // Mock data
        efficiency: 94.2, // Mock data
        costSavings: inventory.length * 150 // Mock data
      }
      
      setMetrics(calculatedMetrics)
      toast.success('Enhanced inventory management loaded successfully!')
    } catch (err: any) {
      console.error('Error fetching metrics:', err)
      setError(err.message || 'Failed to load inventory metrics')
      toast.error('Failed to load enhanced inventory data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchMetrics()
  }

  const handleExport = () => {
    if (!metrics) return
    
    const csvContent = [
      ['Metric', 'Value', 'Unit'],
      ['Total Items', metrics.totalItems.toString(), 'Items'],
      ['Total Value', metrics.totalValue.toFixed(2), 'USD'],
      ['Low Stock Items', metrics.lowStockItems.toString(), 'Items'],
      ['Out of Stock Items', metrics.outOfStockItems.toString(), 'Items'],
      ['Average Item Value', metrics.averageItemValue.toFixed(2), 'USD'],
      ['Turnover Rate', metrics.turnoverRate.toFixed(1), '%'],
      ['Tracking Accuracy', metrics.accuracy.toFixed(1), '%'],
      ['Efficiency', metrics.efficiency.toFixed(1), '%'],
      ['Cost Savings', metrics.costSavings.toFixed(2), 'USD']
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `enhanced-inventory-metrics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Enhanced inventory metrics exported successfully!')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading enhanced inventory management...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchMetrics} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Inventory Management</h1>
          <p className="text-muted-foreground">
            Advanced analytics, real-time tracking, and comprehensive inventory insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Inventory</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatNumber(metrics.totalItems)}</div>
            <div className="text-xs text-blue-700">
              {formatCurrency(metrics.totalValue)} total value
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Tracking Accuracy</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.accuracy}%</div>
            <div className="text-xs text-green-700">
              Real-time accuracy
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Alerts</CardTitle>
            <Bell className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{metrics.lowStockItems}</div>
            <div className="text-xs text-orange-700">
              {metrics.outOfStockItems} critical
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Cost Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{formatCurrency(metrics.costSavings)}</div>
            <div className="text-xs text-purple-700">
              This month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Features Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
          >
            <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-blue-500 data-[state=active]:to-blue-600">
              <Activity className="h-4 w-4 text-white" />
            </div>
            Analytics Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="tracking" 
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
          >
            <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-green-500 data-[state=active]:to-green-600">
              <Target className="h-4 w-4 text-white" />
            </div>
            Real-Time Tracking
          </TabsTrigger>
          <TabsTrigger 
            value="insights" 
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
          >
            <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-purple-500 data-[state=active]:to-purple-600">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            Business Insights
          </TabsTrigger>
        </TabsList>

        {/* Analytics Dashboard Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800">Advanced Analytics Dashboard</CardTitle>
              <CardDescription className="text-slate-600">
                Comprehensive inventory analytics with real-time data visualization and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedInventoryAnalytics />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-Time Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6 mt-6">
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800">Real-Time Inventory Tracking</CardTitle>
              <CardDescription className="text-slate-600">
                Monitor inventory movements, track items, and manage alerts in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedInventoryTracking />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Insights Tab */}
        <TabsContent value="insights" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Performance Metrics */}
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-emerald-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription className="text-emerald-700">
                  Key performance indicators and efficiency metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-emerald-800">Turnover Rate</span>
                  <span className="text-lg font-bold text-emerald-900">{metrics.turnoverRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-emerald-800">Efficiency</span>
                  <span className="text-lg font-bold text-emerald-900">{metrics.efficiency}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-emerald-800">Average Item Value</span>
                  <span className="text-lg font-bold text-emerald-900">{formatCurrency(metrics.averageItemValue)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Cost Analysis */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cost Analysis
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Financial insights and cost optimization opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">Total Inventory Value</span>
                  <span className="text-lg font-bold text-blue-900">{formatCurrency(metrics.totalValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">Cost Savings</span>
                  <span className="text-lg font-bold text-blue-900">{formatCurrency(metrics.costSavings)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">ROI Improvement</span>
                  <span className="text-lg font-bold text-blue-900">+12.5%</span>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-orange-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
                <CardDescription className="text-orange-700">
                  Inventory risks and mitigation strategies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-orange-800">Low Stock Items</span>
                  <span className="text-lg font-bold text-orange-900">{metrics.lowStockItems}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-orange-800">Out of Stock</span>
                  <span className="text-lg font-bold text-orange-900">{metrics.outOfStockItems}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-orange-800">Risk Level</span>
                  <span className="text-lg font-bold text-orange-900">Medium</span>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Smart Recommendations
                </CardTitle>
                <CardDescription className="text-purple-700">
                  AI-powered suggestions for inventory optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-white/50 rounded-lg">
                  <p className="text-sm font-medium text-purple-800">Restock Priority</p>
                  <p className="text-xs text-purple-700">Consider restocking 15 items with low inventory levels</p>
                </div>
                <div className="p-3 bg-white/50 rounded-lg">
                  <p className="text-sm font-medium text-purple-800">Pricing Optimization</p>
                  <p className="text-xs text-purple-700">Review pricing for 8 items with high profit margins</p>
                </div>
                <div className="p-3 bg-white/50 rounded-lg">
                  <p className="text-sm font-medium text-purple-800">Category Analysis</p>
                  <p className="text-xs text-purple-700">Necklaces category shows 23% growth potential</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 