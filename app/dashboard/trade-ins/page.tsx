"use client"

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import type { DateRange } from 'react-day-picker'
import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Package, TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle, Crown, Sparkles, Gem, ShoppingBag, Truck, CreditCard, Search, Star, Edit, Trash2, RefreshCw, Download, Upload, ArrowRight, Calculator, Brain, PlusCircle } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Mock data and loading/error states for now
const loading = false
const error = null
const stats = {
  totalThisMonth: 12,
  pending: 3,
  totalValue: 48250,
}
const mockTradeIns = [
  {
    id: 'TI-001',
    customer: 'John Smith',
    date: '2024-06-28',
    items: 2,
    value: 3200,
    newItemCost: 4000,
    net: 800,
    status: 'pending',
    lastAIQuote: '2024-06-28',
    aiBreakdown: {
      gold: 1800,
      gemstones: 900,
      brand: 300,
      condition: 200,
      market: {
        gold: 2319.82,
        diamond: 5200,
      },
      suggestion: 3200,
    },
    mostCommonItem: 'ring',
    aiType: 'AI',
  },
  {
    id: 'TI-002',
    customer: 'Jane Doe',
    date: '2024-06-27',
    items: 1,
    value: 1500,
    newItemCost: 2000,
    net: 500,
    status: 'approved',
    lastAIQuote: '2024-06-27',
    aiBreakdown: {
      gold: 1000,
      gemstones: 300,
      brand: 100,
      condition: 100,
      market: {
        gold: 2319.82,
        diamond: 5200,
      },
      suggestion: 1500,
    },
    mostCommonItem: 'necklace',
    aiType: 'Manual',
  },
]
const tradeIns = mockTradeIns

// Add summary cards for analytics
const avgValue = (tradeIns.reduce((sum, t) => sum + t.value, 0) / tradeIns.length).toFixed(2)
const mostCommonItem = tradeIns.sort((a,b) => tradeIns.filter(t=>t.mostCommonItem===a.mostCommonItem).length - tradeIns.filter(t=>t.mostCommonItem===b.mostCommonItem).length).pop()?.mostCommonItem || '-'
const aiCount = tradeIns.filter(t => t.aiType === 'AI').length
const manualCount = tradeIns.filter(t => t.aiType === 'Manual').length

// Mock analytics data for trade-ins
const mockTradeInAnalytics = {
  totalTradeIns: 1247,
  pendingTradeIns: 89,
  completedTradeIns: 892,
  totalValue: 2450000,
  averageValue: 2450,
  aiAccuracy: 94.5,
  topCategories: [
    { name: "Diamond Rings", count: 156, value: 320000 },
    { name: "Gold Necklaces", count: 423, value: 280000 },
    { name: "Silver Bracelets", count: 89, value: 150000 },
    { name: "Pearl Earrings", count: 67, value: 98000 }
  ],
  recentActivity: [
    { type: "completed", tradeIn: "TI-2024-001", customer: "Sarah Johnson", value: 3200, time: "2 hours ago" },
    { type: "pending", tradeIn: "TI-2024-002", customer: "Mike Chen", time: "4 hours ago" },
    { type: "ai_quote", tradeIn: "TI-2024-003", customer: "Emma Davis", time: "6 hours ago" },
    { type: "approved", tradeIn: "TI-2024-004", customer: "David Wilson", value: 1800, time: "1 day ago" }
  ]
}

export default function TradeInsPage() {
  const router = useRouter()
  const [filters, setFilters] = useState({
    dateRange: undefined as DateRange | undefined,
    status: 'all',
    customer: '',
    minValue: '',
    maxValue: '',
    staff: 'all',
    search: '',
  })
  const [aiModal, setAiModal] = useState(false)
  const [selectedTradeIn, setSelectedTradeIn] = useState<any>(null)

  // Filter trade-ins based on all filters
  const filteredTradeIns = useMemo(() => {
    return mockTradeIns.filter(tradeIn => {
      // Search filter - search across multiple fields
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          tradeIn.id.toLowerCase().includes(searchLower) ||
          tradeIn.customer.toLowerCase().includes(searchLower) ||
          tradeIn.mostCommonItem.toLowerCase().includes(searchLower) ||
          tradeIn.aiType.toLowerCase().includes(searchLower) ||
          tradeIn.status.toLowerCase().includes(searchLower)
        
        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status !== 'all' && tradeIn.status !== filters.status) {
        return false
      }

      // Customer filter
      if (filters.customer && !tradeIn.customer.toLowerCase().includes(filters.customer.toLowerCase())) {
        return false
      }

      // Value range filter
      if (filters.minValue && tradeIn.value < parseFloat(filters.minValue)) {
        return false
      }
      if (filters.maxValue && tradeIn.value > parseFloat(filters.maxValue)) {
        return false
      }

      // Date range filter
      if (filters.dateRange?.from || filters.dateRange?.to) {
        const tradeInDate = new Date(tradeIn.date)
        if (filters.dateRange?.from && tradeInDate < filters.dateRange.from) {
          return false
        }
        if (filters.dateRange?.to && tradeInDate > filters.dateRange.to) {
          return false
        }
      }

      // Staff filter (stub - since mock data doesn't have staff field)
      // if (filters.staff !== 'all' && tradeIn.staff !== filters.staff) {
      //   return false
      // }

      return true
    })
  }, [filters])

  // Handlers for filter changes would go here

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
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                    <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight">
                      Trade-In Management
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base lg:text-lg font-medium">AI-powered jewelry valuation and trade-in system</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span>AI Valuation</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Gem className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                    <span>Market Analysis</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <Button 
                  className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-h-[44px] min-w-[44px] text-sm sm:text-base"
                  onClick={() => router.push('/dashboard/trade-ins/new')}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">New Trade-In</span>
                  <span className="sm:hidden">New</span>
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
                {/* Total Trade-Ins */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Calculator className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Total Trade-Ins</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Trade-In
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {mockTradeInAnalytics.totalTradeIns.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>+{mockTradeInAnalytics.pendingTradeIns} pending</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total number of trade-in transactions
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
                        ${(mockTradeInAnalytics.totalValue / 1000000).toFixed(1)}M
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>+${mockTradeInAnalytics.averageValue} avg value</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total value of all trade-in transactions
                    </p>
                  </CardContent>
                </Card>
                
                {/* AI Accuracy */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Brain className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">AI Accuracy</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            AI
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {mockTradeInAnalytics.aiAccuracy}%
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>+2.3% from last month</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      AI valuation accuracy rate
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
                        {Math.round((mockTradeInAnalytics.completedTradeIns / mockTradeInAnalytics.totalTradeIns) * 100)}%
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>+{mockTradeInAnalytics.completedTradeIns} completed</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Percentage of trade-ins successfully completed
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
            {/* Enhanced Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-end mb-2">
              <div className="flex-1 min-w-0">
                <label className="block text-xs mb-1 text-slate-700 font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    value={filters.search} 
                    onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} 
                    placeholder="Search trade-ins..." 
                    className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1 text-slate-700 font-medium">Date Range</label>
                <DatePickerWithRange
                  dateRange={filters.dateRange}
                  onDateRangeChange={(v: DateRange | undefined) => setFilters(f => ({ ...f, dateRange: v }))}
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-slate-700 font-medium">Status</label>
                <Select value={filters.status} onValueChange={v => setFilters(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="w-24 sm:w-32 bg-white/80 backdrop-blur-sm border-slate-200 text-xs sm:text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs mb-1 text-slate-700 font-medium">Value Range</label>
                <div className="flex gap-1 sm:gap-2">
                  <Input 
                    value={filters.minValue} 
                    onChange={e => setFilters(f => ({ ...f, minValue: e.target.value }))} 
                    placeholder="Min" 
                    className="w-16 sm:w-20 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300 text-xs sm:text-sm" 
                    type="number" 
                  />
                  <span className="self-center text-slate-500 text-xs sm:text-sm">-</span>
                  <Input 
                    value={filters.maxValue} 
                    onChange={e => setFilters(f => ({ ...f, maxValue: e.target.value }))} 
                    placeholder="Max" 
                    className="w-16 sm:w-20 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300 text-xs sm:text-sm" 
                    type="number" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1 text-slate-700 font-medium">Staff</label>
                <Select value={filters.staff} onValueChange={v => setFilters(f => ({ ...f, staff: v }))}>
                  <SelectTrigger className="w-24 sm:w-32 bg-white/80 backdrop-blur-sm border-slate-200 text-xs sm:text-sm">
                    <SelectValue placeholder="Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="staff1">Emma Wilson</SelectItem>
                    <SelectItem value="staff2">Michael Chen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Enhanced Action Bar */}
            <div className="flex flex-wrap gap-2 items-center justify-end mb-2">
              <div className="flex gap-1 sm:gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 sm:gap-2 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 min-h-[44px] min-w-[44px] text-xs sm:text-sm"
                      aria-label="Bulk actions"
                    >
                      <span>Bulk</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-40 bg-white border border-emerald-200 shadow-lg rounded-xl p-1"
                    align="end"
                  >
                    <DropdownMenuItem
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-emerald-50 cursor-pointer transition-colors"
                      onClick={() => alert('Bulk Update Status clicked!')}
                    >
                      <Edit className="h-4 w-4" />
                      <span>Update Status</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-emerald-50 cursor-pointer transition-colors"
                      onClick={() => alert('Bulk Export clicked!')}
                    >
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 sm:gap-2 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 min-h-[44px] min-w-[44px]"
                      aria-label="Export options"
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
                      onClick={() => alert('Export PDF clicked!')}
                    >
                      <Download className="h-4 w-4" />
                      <span>Export PDF</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-emerald-50 cursor-pointer transition-colors"
                      onClick={() => alert('Export CSV clicked!')}
                    >
                      <Download className="h-4 w-4" />
                      <span>Export CSV</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Enhanced Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
              {loading ? (
                <div className="p-4 sm:p-8 text-center text-slate-600 text-sm sm:text-base">Loading trade-ins...</div>
              ) : error ? (
                <div className="p-4 sm:p-8 text-center text-red-600 text-sm sm:text-base">Error loading trade-ins.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50">
                        <TableHead className="text-slate-700 font-semibold text-xs sm:text-sm">Reference #</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs sm:text-sm">Customer</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs sm:text-sm">Date</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs sm:text-sm">Items Traded</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs sm:text-sm">Trade-In Value</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs sm:text-sm">New Item Cost</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs sm:text-sm">Net Difference</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs sm:text-sm">Status</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs sm:text-sm">Last AI Quote</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs sm:text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTradeIns.map((t) => (
                        <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                          <TableCell className="font-medium text-xs sm:text-sm">{t.id}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{t.customer}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{t.date}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{t.items}</TableCell>
                          <TableCell className="font-semibold text-emerald-600 text-xs sm:text-sm">${t.value.toLocaleString()}</TableCell>
                          <TableCell className="font-semibold text-slate-600 text-xs sm:text-sm">${t.newItemCost.toLocaleString()}</TableCell>
                          <TableCell className={`font-semibold text-xs sm:text-sm ${t.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            ${t.net.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`text-xs sm:text-sm ${
                                t.status === 'approved' 
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                                  : t.status === 'pending'
                                    ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                                    : t.status === 'completed'
                                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                                      : 'border-red-200 bg-red-50 text-red-700'
                              }`}
                            >
                              {t.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">{t.lastAIQuote}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 min-h-[44px] min-w-[44px] text-xs sm:text-sm"
                              onClick={() => { setSelectedTradeIn(t); setAiModal(true); }}
                            >
                              <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              <span className="hidden sm:inline">AI Quote</span>
                              <span className="sm:hidden">AI</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced AI Modal */}
        <Dialog open={aiModal} onOpenChange={setAiModal}>
          <DialogContent className="max-w-lg bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl mx-4">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-semibold text-slate-800">AI-Powered Value Breakdown</DialogTitle>
            </DialogHeader>
            {selectedTradeIn && (
              <div className="space-y-3 sm:space-y-4">
                <div className="font-semibold text-slate-700 text-sm sm:text-base">Reference: {selectedTradeIn.id}</div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 bg-slate-50/50 rounded-lg p-3 sm:p-4">
                  <div className="text-slate-600 text-xs sm:text-sm">Gold Value:</div>
                  <div className="text-right font-semibold text-emerald-600 text-xs sm:text-sm">${selectedTradeIn.aiBreakdown.gold.toLocaleString()}</div>
                  <div className="text-slate-600 text-xs sm:text-sm">Gemstones:</div>
                  <div className="text-right font-semibold text-emerald-600 text-xs sm:text-sm">${selectedTradeIn.aiBreakdown.gemstones.toLocaleString()}</div>
                  <div className="text-slate-600 text-xs sm:text-sm">Brand Premium:</div>
                  <div className="text-right font-semibold text-emerald-600 text-xs sm:text-sm">${selectedTradeIn.aiBreakdown.brand.toLocaleString()}</div>
                  <div className="text-slate-600 text-xs sm:text-sm">Condition Adj.:</div>
                  <div className="text-right font-semibold text-emerald-600 text-xs sm:text-sm">${selectedTradeIn.aiBreakdown.condition.toLocaleString()}</div>
                </div>
                <div className="text-xs text-slate-500 bg-slate-50/50 rounded p-2">
                  Market: Gold ${selectedTradeIn.aiBreakdown.market.gold}/oz, Diamond ${selectedTradeIn.aiBreakdown.market.diamond}/ct
                </div>
                <div className="text-base sm:text-lg font-bold text-slate-800 bg-gradient-to-r from-emerald-50 to-green-50 p-3 rounded-lg border border-emerald-200">
                  AI Suggested Value: <span className="text-emerald-700">${selectedTradeIn.aiBreakdown.suggestion.toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white min-h-[44px] min-w-[44px] text-xs sm:text-sm">
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-200 hover:bg-white min-h-[44px] min-w-[44px] text-xs sm:text-sm">
                    Override
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="ghost" onClick={() => setAiModal(false)} className="text-slate-600 hover:text-slate-800 min-h-[44px] min-w-[44px] text-xs sm:text-sm">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 