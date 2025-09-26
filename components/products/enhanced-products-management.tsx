"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Package, 
  TrendingUp, 
  Activity, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Star,
  DollarSign,
  Calendar,
  MapPin,
  ShoppingBag,
  Bell,
  Crown,
  Sparkles,
  Gem,
  Diamond,
  Circle,
  Square,
  Hexagon,
  Users,
  Award,
  Heart,
  Zap,
  Shield,
  Globe,
  Database
} from "lucide-react"
import { toast } from "sonner"

interface ProductData {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  category: string
  status: string
  created_at: string
  updated_at: string
  description?: string
  image_url?: string
  vendor?: string
  cost?: number
  margin?: number
}

interface ProductMetrics {
  totalProducts: number
  totalValue: number
  activeProducts: number
  lowStockProducts: number
  averagePrice: number
  totalRevenue: number
  profitMargin: number
  topCategory: string
}

export function EnhancedProductsManagement() {
  const [products, setProducts] = useState<ProductData[]>([])
  const [metrics, setMetrics] = useState<ProductMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchProductData()
  }, [])

  const fetchProductData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch real products data
      const productsResponse = await fetch('/api/products?limit=1000')
      const productsData = await productsResponse.json()
      const productsList = productsData.data?.products || []
      
      setProducts(productsList)
      
      // Calculate metrics from real data
      const calculatedMetrics: ProductMetrics = {
        totalProducts: productsList.length,
        totalValue: productsList.reduce((sum: number, product: any) => sum + (product.price * product.stock), 0),
        activeProducts: productsList.filter((product: any) => product.status === 'active').length,
        lowStockProducts: productsList.filter((product: any) => product.stock <= 5 && product.stock > 0).length,
        averagePrice: productsList.length > 0 ? productsList.reduce((sum: number, product: any) => sum + product.price, 0) / productsList.length : 0,
        totalRevenue: productsList.reduce((sum: number, product: any) => sum + (product.price * product.stock * 0.3), 0), // Mock revenue
        profitMargin: 65.2, // Mock data
        topCategory: productsList.length > 0 ? 
          productsList.reduce((acc: any, product: any) => {
            acc[product.category] = (acc[product.category] || 0) + 1
            return acc
          }, {}) : 'General'
      }
      
      setMetrics(calculatedMetrics)
      toast.success('Enhanced products management loaded successfully!')
    } catch (err: any) {
      console.error('Error fetching product data:', err)
      setError(err.message || 'Failed to load product data')
      toast.error('Failed to load enhanced product data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchProductData()
  }

  const handleExport = () => {
    if (!products.length) return
    
    const csvContent = [
      ['Product ID', 'Name', 'SKU', 'Price', 'Stock', 'Category', 'Status', 'Value'],
      ...products.map(product => [
        product.id,
        product.name,
        product.sku,
        product.price,
        product.stock,
        product.category,
        product.status,
        product.price * product.stock
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `enhanced-products-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Enhanced product data exported successfully!')
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'inactive': { color: 'bg-gray-100 text-gray-800', icon: Clock },
      'discontinued': { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    )
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
    } else if (stock <= 5) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800">In Stock</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading enhanced products management...</p>
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
          <Button onClick={fetchProductData} className="mt-4">
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
          <h2 className="text-2xl font-bold">Enhanced Products Management</h2>
          <p className="text-muted-foreground">
            Advanced product analytics, inventory optimization, and comprehensive product insights
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

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Products</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatNumber(metrics.totalProducts)}</div>
            <div className="text-xs text-blue-700">
              {formatCurrency(metrics.totalValue)} total value
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Active Products</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{formatNumber(metrics.activeProducts)}</div>
            <div className="text-xs text-green-700">
              {((metrics.activeProducts / metrics.totalProducts) * 100).toFixed(1)}% of total
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{formatNumber(metrics.lowStockProducts)}</div>
            <div className="text-xs text-orange-700">
              Need restocking
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Avg Product Price</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{formatCurrency(metrics.averagePrice)}</div>
            <div className="text-xs text-purple-700">
              {metrics.profitMargin}% profit margin
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
            Product Overview
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
          >
            <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-green-500 data-[state=active]:to-green-600">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            Product Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="insights" 
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
          >
            <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-purple-500 data-[state=active]:to-purple-600">
              <Star className="h-4 w-4 text-white" />
            </div>
            Business Insights
          </TabsTrigger>
        </TabsList>

        {/* Product Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800">Product Catalog</CardTitle>
              <CardDescription className="text-slate-600">
                Complete product catalog with real-time inventory status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.slice(0, 10).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.sku} • {product.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(product.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(product.price)}</div>
                        <div className="text-sm text-muted-foreground">{product.stock} in stock</div>
                      </div>
                      {getStockBadge(product.stock)}
                      {getStatusBadge(product.status)}
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Category Performance */}
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-emerald-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Category Performance
                </CardTitle>
                <CardDescription className="text-emerald-700">
                  Product performance by category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(
                  products.reduce((acc: any, product) => {
                    acc[product.category] = (acc[product.category] || 0) + 1
                    return acc
                  }, {})
                ).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-emerald-800">{category}</span>
                    <span className="text-lg font-bold text-emerald-900">{count as number}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Price Analysis */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Price Analysis
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Price distribution and value metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">Average Price</span>
                  <span className="text-lg font-bold text-blue-900">{formatCurrency(metrics.averagePrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">Total Value</span>
                  <span className="text-lg font-bold text-blue-900">{formatCurrency(metrics.totalValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">Profit Margin</span>
                  <span className="text-lg font-bold text-blue-900">{metrics.profitMargin}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Business Insights Tab */}
        <TabsContent value="insights" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Inventory Insights */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory Insights
                </CardTitle>
                <CardDescription className="text-purple-700">
                  Inventory optimization recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-white/50 rounded-lg">
                  <p className="text-sm font-medium text-purple-800">Restock Priority</p>
                  <p className="text-xs text-purple-700">Consider restocking {metrics.lowStockProducts} items with low inventory levels</p>
                </div>
                <div className="p-3 bg-white/50 rounded-lg">
                  <p className="text-sm font-medium text-purple-800">Value Optimization</p>
                  <p className="text-xs text-purple-700">Review pricing for high-value items to maximize profit margins</p>
                </div>
                <div className="p-3 bg-white/50 rounded-lg">
                  <p className="text-sm font-medium text-purple-800">Category Growth</p>
                  <p className="text-xs text-purple-700">Focus on expanding the most profitable product categories</p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-orange-800 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription className="text-orange-700">
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-orange-800">Product Utilization</span>
                  <span className="text-lg font-bold text-orange-900">
                    {((metrics.activeProducts / metrics.totalProducts) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-orange-800">Stock Efficiency</span>
                  <span className="text-lg font-bold text-orange-900">
                    {((metrics.totalProducts - metrics.lowStockProducts) / metrics.totalProducts * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-orange-800">Revenue Potential</span>
                  <span className="text-lg font-bold text-orange-900">{formatCurrency(metrics.totalRevenue)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 