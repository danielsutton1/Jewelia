"use client"

import { PlusCircle, Filter, Download, Upload, ArrowRight, Package, TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle, Crown, Sparkles, Gem, ShoppingBag, Truck, CreditCard, Plus, UserPlus, ShoppingCart, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useRef, useState, useEffect } from "react"
import { OrdersTable } from "@/components/orders/orders-table"
import { OrderFilters } from "@/components/orders/order-filters"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// API functions for orders management
const fetchOrders = async (params?: {
  search?: string
  status?: string
  customerId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
}) => {
  const searchParams = new URLSearchParams()
  if (params?.search) searchParams.append('search', params.search)
  if (params?.status) searchParams.append('status', params.status)
  if (params?.customerId) searchParams.append('customerId', params.customerId)
  if (params?.startDate) searchParams.append('startDate', params.startDate)
  if (params?.endDate) searchParams.append('endDate', params.endDate)
  if (params?.page) searchParams.append('page', params.page.toString())
  if (params?.limit) searchParams.append('limit', params.limit.toString())
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder)

  const response = await fetch(`/api/orders?${searchParams.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch orders')
  }
  
  const result = await response.json()
  return result
}

const createOrder = async (orderData: {
  customer_id: string
  items: Array<{
    inventory_id: string
    quantity: number
    unit_price: number
  }>
  notes?: string
  payment_status?: string
}) => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create order')
  }

  const result = await response.json()
  return result.data
}

// Import the sample orders array for export
import { orders as sampleOrders } from "@/components/orders/orders-table"

// Mock analytics data for orders
const mockOrderAnalytics = {
  totalOrders: 1247,
  pendingOrders: 89,
  completedOrders: 892,
  totalRevenue: 2450000,
  averageOrderValue: 2450,
  processingTime: 3.2,
  topProducts: [
    { name: "Diamond Ring", count: 156, revenue: 320000 },
    { name: "Gold Necklace", count: 423, revenue: 280000 },
    { name: "Silver Bracelet", count: 89, revenue: 150000 },
    { name: "Pearl Earrings", count: 67, revenue: 98000 }
  ],
  recentActivity: [
    { type: "completed", order: "ORD-2024-001", customer: "Sarah Johnson", amount: 3200, time: "2 hours ago" },
    { type: "processing", order: "ORD-2024-002", customer: "Mike Chen", time: "4 hours ago" },
    { type: "shipped", order: "ORD-2024-003", customer: "Emma Davis", time: "6 hours ago" },
    { type: "payment", order: "ORD-2024-004", customer: "David Wilson", amount: 1800, time: "1 day ago" }
  ]
}

function convertOrdersToCSV(orders: any[]): string {
  if (!orders.length) return ""
  const header = [
    "Order ID",
    "Customer Name",
    "Customer Email",
    "Date",
    "Status",
    "Items",
    "Total",
    "Payment Status",
    "Shipping Status",
  ]
  const rows = orders.map((o: any) => [
    o.id,
    o.customer.name,
    o.customer.email,
    o.date,
    o.status,
    o.items,
    o.total,
    o.paymentStatus,
    o.shippingStatus,
  ])
  return [header, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
}

export default function OrdersPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add state for real orders data from API
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })

  // Fetch orders data from API
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await fetchOrders()
        setOrders(result.data || [])
        setPagination(result.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 })
      } catch (err: any) {
        setError(err.message || 'Failed to load orders')
        // Fallback to sample data when API fails
        setOrders(sampleOrders)
        setPagination({ page: 1, limit: 50, total: sampleOrders.length, totalPages: 1 })
        toast({
          title: "Warning",
          description: "Using sample data - API connection failed",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  // Function to refresh orders data
  const refreshOrders = async () => {
    try {
      setLoading(true)
      const result = await fetchOrders()
      setOrders(result.data || [])
      setPagination(result.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 })
      toast({
        title: "Success",
        description: "Orders refreshed successfully"
      })
    } catch (err: any) {
      // Fallback to sample data when API fails
      setOrders(sampleOrders)
      setPagination({ page: 1, limit: 50, total: sampleOrders.length, totalPages: 1 })
      toast({
        title: "Warning",
        description: "Using sample data - API connection failed",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const csv = convertOrdersToCSV(orders.length > 0 ? orders : sampleOrders)
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "orders.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ title: "Exported", description: `Exported ${orders.length || sampleOrders.length} orders as CSV.` })
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = typeof event.target?.result === "string" ? event.target.result : ""
      // Simple CSV parse: split by lines, skip header
      const lines = text.split(/\r?\n/).filter(Boolean)
      if (lines.length < 2) {
        toast({ title: "Import failed", description: "No orders found in file.", variant: "destructive" })
        return
      }
      const imported = lines.slice(1).map((line: string) => line.split(",").map((v) => v.replace(/^"|"$/g, "")))
      toast({ title: "Import complete", description: `Imported ${imported.length} orders (demo only).` })
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/50 relative overflow-hidden">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-200/20 to-teal-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
      </div>

      <main className="relative z-10 flex flex-col gap-2 sm:gap-4 lg:gap-6 p-2 sm:p-4 lg:p-6 w-full">
        {/* Enhanced Header */}
        <header className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 lg:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight">
                      Order Management
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base lg:text-lg font-medium hidden sm:block">Premium order processing and fulfillment system</p>
                    <p className="text-slate-600 text-xs font-medium sm:hidden">Order processing system</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span>Advanced Fulfillment</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Gem className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                    <span>Real-time Tracking</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-start sm:items-end gap-3">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    onClick={refreshOrders}
                    disabled={loading}
                    className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  >
                    <ArrowRight className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-h-[44px] min-w-[44px]" 
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48 bg-white border border-emerald-200 shadow-lg rounded-xl p-1"
                      align="end"
                    >
                      <DropdownMenuItem
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-emerald-50 cursor-pointer transition-colors"
                        onClick={() => router.push('/dashboard/orders/create')}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        <span>Create Order</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-emerald-50 cursor-pointer transition-colors"
                        onClick={() => router.push('/dashboard/customers/new')}
                      >
                        <UserPlus className="h-5 w-5" />
                        <span>New Customer</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Analytics Cards - Matching Dashboard Style */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-3 sm:p-4 lg:p-6">
            <div className="w-full overflow-x-auto lg:overflow-visible">
              <div className="flex lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4 min-w-[320px] lg:min-w-0 flex-nowrap">
                {/* Total Orders */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <ShoppingBag className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Total Orders</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Sales
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {orders.length}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>+{orders.filter(o => o.status === 'pending').length} pending</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total number of orders in the system
                    </p>
                  </CardContent>
                </Card>
                
                {/* Total Revenue */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Total Revenue</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Financial
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {orders.length > 0 ? `$${(orders.reduce((sum, o) => sum + o.total, 0) / 1000000).toFixed(1)}M` : '$0M'}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>
                          {orders.length > 0 ? `+$${Math.round(orders.reduce((sum, o) => sum + o.total, 0) / orders.length)}` : '+$0'} avg order
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total revenue generated from all orders
                    </p>
                  </CardContent>
                </Card>
                
                {/* Processing Time */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Processing Time</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Operations
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {orders.reduce((sum, o) => sum + (o.status === 'completed' ? 0 : 1), 0)} days
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>-0.5 days from last month</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Average time to process orders
                    </p>
                  </CardContent>
                </Card>
                
                {/* Completion Rate */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Completion Rate</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Operations
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {orders.length > 0 ? `${Math.round((orders.filter(o => o.status === 'completed').length / orders.length) * 100)}%` : '0%'}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>+{orders.filter(o => o.status === 'completed').length} completed</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Percentage of orders successfully completed
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-3 sm:p-4 lg:p-6">
            {/* Enhanced Action Bar */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
              <div className="flex flex-col sm:flex-row flex-1 items-start sm:items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search orders by number, customer, or amount..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 bg-white/80 backdrop-blur-sm border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-[44px]"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 min-h-[44px] min-w-[44px]"
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {orders.filter(o => o.status === 'completed').length} Completed
                  </Badge>
                  <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {orders.filter(o => o.status === 'pending').length} Pending
                  </Badge>
                  <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-xs">
                    <Truck className="h-3 w-3 mr-1" />
                    {orders.length - orders.filter(o => o.status === 'completed').length - orders.filter(o => o.status === 'pending').length} Processing
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 min-h-[44px]"
                      aria-label="Export or Import"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-40 bg-white border border-emerald-200 shadow-lg rounded-xl p-1"
                    align="end"
                  >
                    <DropdownMenuItem
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-emerald-50 cursor-pointer transition-colors"
                      onClick={handleExport}
                    >
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-emerald-50 cursor-pointer transition-colors"
                      onClick={handleImportClick}
                    >
                      <Upload className="h-4 w-4" />
                      <span>Import</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImport}
                />
              </div>
            </div>

            {/* Horizontal Filters and Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600 h-8 w-8 mx-auto mb-4"></div>
                    <p className="text-emerald-700 font-medium">Loading orders...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                    <p className="text-red-700 font-medium mb-2">Failed to load orders</p>
                    <p className="text-slate-600 text-sm mb-4">{error}</p>
                    <Button 
                      onClick={refreshOrders}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <Package className="h-8 w-8 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-700 font-medium mb-2">No orders found</p>
                    <p className="text-slate-600 text-sm mb-4">Get started by creating your first order</p>
                    <Button 
                      onClick={() => router.push('/dashboard/orders/create')}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      Create Order
                    </Button>
                  </div>
                </div>
              ) : (
                <OrdersTable />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
