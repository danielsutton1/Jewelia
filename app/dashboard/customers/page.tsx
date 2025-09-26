"use client"

import { useState, useEffect, Suspense, lazy } from "react"
import { PlusCircle, Download, Filter, BarChart3, Users, TrendingUp, Mail, Phone, Calendar, Search, MoreHorizontal, Eye, Edit, Trash2, Star, Clock, DollarSign, ShoppingBag, Heart, AlertCircle, Plus, Clock3, MessageSquare, Send, Target, Settings, RefreshCw, Crown, Sparkles, Gem } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// Direct imports for now to fix lazy loading issues
import { CustomerTable } from "@/components/customers/customer-table"
import { EnhancedCustomerAnalytics } from "@/components/customers/enhanced-customer-analytics"
import { EnhancedCustomerSegments } from "@/components/customers/enhanced-customer-segments"
import { EnhancedCustomerInteractions } from "@/components/customers/enhanced-customer-interactions"
import { QuickInteractionForm } from "@/components/customers/quick-interaction-form"
import { CustomerInteractionHistory } from "@/components/customers/customer-interaction-history"
import { CustomerInsights } from "@/components/customers/customer-insights"
import { CombinedHeader } from "@/components/customers/combined-header"
import { QuickActionsSection } from "@/components/customers/quick-actions-section"
import Link from "next/link"
import { toast } from "sonner"
import { optimizeImages, debounce } from "@/lib/performance"

// Customer type definition
interface Customer {
  id: string
  full_name: string
  email: string
  phone?: string
  address?: string
  notes?: string
  company?: string
  created_at: string
  updated_at: string
}

// Mock data for analytics (will be replaced with real API data)
const mockAnalytics = {
  totalCustomers: 1247,
  newThisMonth: 89,
  activeCustomers: 892,
  averageOrderValue: 2450,
  customerSatisfaction: 4.6,
  retentionRate: 87.3,
  topSegments: [
    { name: "VIP Customers", count: 156, growth: 12.5 },
    { name: "Regular Buyers", count: 423, growth: 8.2 },
    { name: "New Customers", count: 89, growth: 15.7 },
    { name: "At Risk", count: 67, growth: -5.3 }
  ],
  recentActivity: [
    { type: "purchase", customer: "Sarah Johnson", amount: 3200, time: "2 hours ago" },
    { type: "inquiry", customer: "Mike Chen", time: "4 hours ago" },
    { type: "appointment", customer: "Emma Davis", time: "6 hours ago" },
    { type: "review", customer: "David Wilson", rating: 5, time: "1 day ago" }
  ]
}

// API functions
const fetchCustomers = async (search?: string): Promise<Customer[]> => {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  
  const response = await fetch(`/api/customers?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch customers')
  }
  
  const result = await response.json()
  return result.data || []
}

export default function CustomersPage() {
  const [view, setView] = useState("table")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isBulkActionsDialogOpen, setIsBulkActionsDialogOpen] = useState(false)
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [isCallLogDialogOpen, setIsCallLogDialogOpen] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const data = await fetchCustomers()
        setCustomers(data)
      } catch (error) {
        console.error("Failed to load customers:", error)
        toast.error("Failed to load customers")
      } finally {
        setLoading(false)
      }
    }
    loadCustomers()
    
    // Optimize images after component mounts
    optimizeImages()
  }, [])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success("Customer data exported successfully!")
    } catch (error) {
      toast.error("Failed to export customer data")
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const data = await fetchCustomers()
      setCustomers(data)
      toast.success("Customer data refreshed!")
    } catch (error) {
      toast.error("Failed to refresh customer data")
    } finally {
      setIsRefreshing(false)
    }
  }

  // Debounced search function
  const debouncedSearch = debounce(async (searchTerm: string) => {
    setLoading(true)
    try {
      const data = await fetchCustomers(searchTerm)
      setCustomers(data)
    } catch (error) {
      console.error("Failed to search customers:", error)
      toast.error("Failed to search customers")
    } finally {
      setLoading(false)
    }
  }, 300)

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm)
    debouncedSearch(searchTerm)
  }

  const handleBulkAction = (action: string) => {
    if (selectedCustomers.length === 0) {
      toast.error("Please select customers first")
      return
    }
    
    toast.success(`${action} initiated for ${selectedCustomers.length} customers`)
    setIsBulkActionsDialogOpen(false)
    setSelectedCustomers([])
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/50 relative overflow-hidden">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-200/20 to-teal-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
      </div>

      <main className="relative z-10 flex flex-col gap-2 sm:gap-4 lg:gap-6 p-2 sm:p-4 lg:p-6 w-full">
        {/* Page Header */}
        <header className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-3 sm:p-4 lg:p-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 bg-clip-text text-transparent tracking-tight">
              Customer Management
            </h1>
            <p className="text-sm text-slate-600 font-medium mt-1 hidden sm:block">Manage your jewelry customers, track interactions, and analyze customer data</p>
            <p className="text-xs text-slate-600 font-medium mt-1 sm:hidden">Manage customers and track interactions</p>
          </div>
        </header>

        {/* Combined Header with Analytics */}
        <CombinedHeader analytics={mockAnalytics} />

        {/* Quick Actions Section */}
        <QuickActionsSection />

        {/* Enhanced Main Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-3 sm:p-4 lg:p-6">
            <Tabs defaultValue="overview" className="space-y-2">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 sm:p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20 overflow-x-auto">
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 min-h-[44px]"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 min-h-[44px]"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="segments" 
                  className="flex items-center gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 min-h-[44px]"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  Segments
                </TabsTrigger>
                <TabsTrigger 
                  value="insights" 
                  className="flex items-center gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200 min-h-[44px]"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-2">
                {/* Enhanced View Toggle */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant={view === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setView("table")}
                      className={`${view === "table" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg" : "bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg"} min-h-[32px] px-3 py-1 text-xs`}
                    >
                      Table View
                    </Button>
                    <Button
                      variant={view === "cards" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setView("cards")}
                      className={`${view === "cards" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg" : "bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg"} min-h-[32px] px-3 py-1 text-xs`}
                    >
                      Card View
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="search"
                      placeholder="Search customers by name, email, phone, or company..."
                      value={search}
                      onChange={e => handleSearch(e.target.value)}
                      className="w-full sm:w-80 pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300 min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Enhanced Customer Display */}
                {view === "table" ? (
                  <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                    <CustomerTable searchQuery={search} isCallLogDialogOpen={isCallLogDialogOpen} setIsCallLogDialogOpen={setIsCallLogDialogOpen} />
                  </div>
                ) : (
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {customers
                      .filter(customer => {
                        const q = search.toLowerCase()
                        const fullName = customer.full_name.toLowerCase()
                        return (
                          fullName.includes(q) ||
                          (customer.email?.toLowerCase() || "").includes(q) ||
                          (customer.phone || "").includes(q)
                        )
                      })
                      .slice(0, 12)
                      .map((customer) => {
                        const fullName = customer.full_name
                        return (
                        <Card key={customer.id} className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <CardHeader className="pb-3 relative z-10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <Avatar className="h-12 w-12 ring-2 ring-white shadow-lg">
                                    <AvatarImage src="/diverse-group-avatars.png" alt={fullName} />
                                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-semibold">
                                      {customer.full_name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {customer.id.startsWith("VIP") && (
                                    <div className="absolute -top-1 -right-1 p-1 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg">
                                      <Crown className="h-3 w-3 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <Link href={`/dashboard/customers/${customer.id}`} className="font-semibold text-slate-800 hover:text-emerald-600 transition-colors duration-300">
                                    {fullName}
                                  </Link>
                                  <p className="text-sm text-slate-600">{customer.email}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-slate-400" />
                                  <span className="text-sm text-slate-600">{customer.phone || 'N/A'}</span>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`mt-2 ${
                                    customer.id.startsWith("VIP") 
                                      ? "border-green-200 bg-green-50 text-green-700" 
                                      : customer.id.includes("NEW") 
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700" 
                                        : "border-slate-200 bg-slate-50 text-slate-700"
                                  }`}
                                >
                                  {customer.id.startsWith("VIP") ? "VIP" : customer.id.includes("NEW") ? "New" : "Active"}
                                </Badge>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
                                  <DropdownMenuLabel className="text-slate-700">Actions</DropdownMenuLabel>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/customers/${customer.id}`} className="flex items-center gap-2">
                                      <Eye className="h-4 w-4" />
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Send Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Call
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600 flex items-center gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 relative z-10">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-600">{customer.email || "No email"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-600">{customer.phone || "No phone"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                                {customer.id.startsWith("VIP") ? "VIP" : "Regular"}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                                Active
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-600">Last activity: 2 days ago</span>
                            </div>
                            <div className="pt-3 border-t border-slate-200">
                              <QuickInteractionForm openLogActivityDialog={() => setIsCallLogDialogOpen(true)} />
                            </div>
                          </CardContent>
                        </Card>
                      )})}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analytics">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden p-2">
                  <EnhancedCustomerAnalytics />
                </div>
              </TabsContent>

              <TabsContent value="segments">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden p-2">
                  <EnhancedCustomerSegments />
                </div>
              </TabsContent>

              <TabsContent value="insights">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden p-2">
                  <EnhancedCustomerInteractions />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Enhanced Bulk Actions Dialog */}
        <Dialog open={isBulkActionsDialogOpen} onOpenChange={setIsBulkActionsDialogOpen}>
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-800">Bulk Actions</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-slate-600">
                Select an action to perform on multiple customers
              </p>
              <div className="grid gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start bg-white/50 border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  onClick={() => handleBulkAction("Email Campaign")}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email Campaign
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start bg-white/50 border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  onClick={() => handleBulkAction("SMS Campaign")}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send SMS Campaign
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start bg-white/50 border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  onClick={() => handleBulkAction("Export Data")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Customer Data
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start bg-white/50 border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  onClick={() => handleBulkAction("Add to Segment")}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Add to Segment
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBulkActionsDialogOpen(false)} className="border-slate-200">
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
