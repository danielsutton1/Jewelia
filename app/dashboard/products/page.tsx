"use client"

import { PlusCircle, Filter, Download, Upload, Package, TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle, Crown, Sparkles, Gem, ShoppingBag, Truck, CreditCard, Search, Star, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductsTable } from "@/components/products/products-table"
import { ProductFilters } from "@/components/products/product-filters"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

// API functions for products management
const fetchProducts = async (params?: {
  search?: string
  category?: string
  status?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
}) => {
  const searchParams = new URLSearchParams()
  if (params?.search) searchParams.append('search', params.search)
  if (params?.category) searchParams.append('category', params.category)
  if (params?.status) searchParams.append('status', params.status)
  if (params?.page) searchParams.append('page', params.page.toString())
  if (params?.limit) searchParams.append('limit', params.limit.toString())
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder)

  const response = await fetch(`/api/products?${searchParams.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }
  
  const result = await response.json()
  
  // Check success field from API response
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch products')
  }
  
  return result
}

const createProduct = async (productData: {
  name: string
  sku: string
  price: number
  quantity: number
  category: string
}) => {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create product')
  }

  const result = await response.json()
  
  // Check success field from API response
  if (!result.success) {
    throw new Error(result.error || 'Failed to create product')
  }
  
  return result.data
}

// Mock analytics data for products
const mockProductAnalytics = {
  totalProducts: 1247,
  activeProducts: 892,
  lowStockProducts: 67,
  totalValue: 2450000,
  averagePrice: 2450,
  topSellingCategory: "Diamond Rings",
  topProducts: [
    { name: "Diamond Ring", sales: 156, revenue: 320000, stock: 45 },
    { name: "Gold Necklace", sales: 423, revenue: 280000, stock: 23 },
    { name: "Silver Bracelet", sales: 89, revenue: 150000, stock: 67 },
    { name: "Pearl Earrings", sales: 67, revenue: 98000, stock: 34 }
  ],
  recentActivity: [
    { type: "added", product: "Diamond Ring", time: "2 hours ago" },
    { type: "updated", product: "Gold Necklace", time: "4 hours ago" },
    { type: "low_stock", product: "Silver Bracelet", time: "6 hours ago" },
    { type: "sold", product: "Pearl Earrings", time: "1 day ago" }
  ]
}

export default function ProductsPage() {
  const router = useRouter()
  
  // Add state for real products data from API
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })

  // Add filter state here
  const [category, setCategory] = useState("all")
  const [material, setMaterial] = useState("all")
  const [gemstone, setGemstone] = useState("all")
  const [stockStatus, setStockStatus] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [searchInput, setSearchInput] = useState("")
  // Add sort state
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")

  // Fetch products data from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          search: searchInput,
          category: category !== 'all' ? category : '',
          status: stockStatus !== 'all' ? stockStatus : '',
          material: material !== 'all' ? material : '',
          gemstone: gemstone !== 'all' ? gemstone : '',
          priceRange: priceRange !== 'all' ? priceRange : '',
          sortBy: sortBy,
          sortOrder: sortOrder
        })
        
        console.log('🔍 Loading products with params:', params.toString())
        
        const res = await fetch(`/api/products?${params.toString()}`)
        const result = await res.json()
        
        console.log('🔍 API response:', result)
        
        // FIX: set products to the products array inside data
        setProducts(result.data?.products || [])
        setPagination(p => ({
          ...p,
          total: result.data?.total || 0,
          totalPages: result.data?.totalPages || 1
        }))
      } catch (err: any) {
        console.error('❌ Error loading products:', err)
        setError('Failed to fetch products')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [category, material, gemstone, stockStatus, priceRange, searchInput, pagination.page, sortBy, sortOrder])

  // Function to refresh products data
  const refreshProducts = async () => {
    try {
      setLoading(true)
      const result = await fetchProducts()
      // Ensure products is always an array
      setProducts(Array.isArray(result.data) ? result.data : [])
      setPagination(result.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 })
      toast({
        title: "Success",
        description: "Products refreshed successfully"
      })
    } catch (err: any) {
      setProducts([]) // Ensure products is an empty array on error
      toast({
        title: "Error",
        description: "Failed to refresh products",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/50 relative overflow-hidden">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-200/20 to-teal-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-1 p-1 w-full">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-1">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                    <ShoppingBag className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight">
                      Product Management
                    </h1>
                    <p className="text-slate-600 text-lg font-medium">Premium jewelry inventory and catalog system</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    <span>Advanced Inventory</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-emerald-500" />
                    <span>Quality Control</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  onClick={refreshProducts}
                  disabled={loading}
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                >
                  <Package className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => router.push("/dashboard/products/new")}
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Product
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Cards - Matching Dashboard Style */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4">
            <div className="w-full overflow-x-auto md:overflow-visible">
              <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 min-w-[320px] md:min-w-0 flex-nowrap">
                {/* Total Products */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Total Products</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Inventory
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {(products?.length || 0).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>+{products?.length > 0 ? products.filter(p => p.status === 'active').length : 0} active</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total number of products in inventory
                    </p>
                  </CardContent>
                </Card>
                
                {/* Total Value */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Total Value</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Financial
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        ${((products?.reduce((sum, p) => sum + (p.price || 0), 0) || 0) / 1000000).toFixed(1)}M
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>
                          +${products?.length > 0 ? Math.round((products?.reduce((sum, p) => sum + (p.price || 0), 0) || 0) / (products?.length || 1)) : 0} avg price
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total value of all products in inventory
                    </p>
                  </CardContent>
                </Card>
                
                {/* Low Stock Alert */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <AlertCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Low Stock Alert</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Inventory
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {products?.filter(p => p.quantity < 10).length || 0}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        <span>-{products?.filter(p => p.quantity < 10).length || 0} need restock</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Products with low stock levels
                    </p>
                  </CardContent>
                </Card>
                
                {/* Top Category */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Star className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Top Category</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Analytics
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {products?.length > 0 
                          ? (() => {
                              const categories = products.map(p => p.category).filter(Boolean)
                              const categoryCounts = categories.reduce((acc, cat) => {
                                acc[cat] = (acc[cat] || 0) + 1
                                return acc
                              }, {} as Record<string, number>)
                              const topCategory = Object.entries(categoryCounts)
                                .sort(([,a], [,b]) => (b as number) - (a as number))[0]
                              return topCategory ? topCategory[0] : 'General'
                            })()
                          : 'General'
                        }
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>+{products?.length || 0} products total</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Most popular product category
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
          <div className="relative p-1">
            {/* Enhanced Action Bar */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search products..." 
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    className="w-56 pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
                  />
                </div>
                {/* Inline ProductFilters dropdowns */}
                <div className="flex gap-2">
                  <ProductFilters
                    category={category} setCategory={setCategory}
                    material={material} setMaterial={setMaterial}
                    gemstone={gemstone} setGemstone={setGemstone}
                    stockStatus={stockStatus} setStockStatus={setStockStatus}
                    priceRange={priceRange} setPriceRange={setPriceRange}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
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
                        onClick={() => alert('Export clicked!')}
                      >
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-emerald-50 cursor-pointer transition-colors"
                        onClick={() => alert('Import clicked!')}
                      >
                        <Upload className="h-4 w-4" />
                        <span>Import</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600 h-8 w-8 mx-auto mb-4"></div>
                    <p className="text-emerald-700 font-medium">Loading products...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                    <p className="text-red-700 font-medium mb-2">Failed to load products</p>
                    <p className="text-slate-600 text-sm mb-4">{error}</p>
                    <Button 
                      onClick={refreshProducts}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : products?.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <ShoppingBag className="h-8 w-8 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-700 font-medium mb-2">No products found</p>
                    <p className="text-slate-600 text-sm mb-4">Get started by adding your first product</p>
                    <Button 
                      onClick={() => router.push('/dashboard/products/new')}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      Add Product
                    </Button>
                  </div>
                </div>
              ) : (
                <ProductsTable
                  search={searchInput}
                  category={category}
                  material={material}
                  gemstone={gemstone}
                  stockStatus={stockStatus}
                  priceRange={priceRange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
