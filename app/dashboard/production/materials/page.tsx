"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  DollarSign, 
  Filter, 
  Download, 
  Plus, 
  Search, 
  BarChart3, 
  Calendar,
  Users,
  Target,
  Zap,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  ShoppingCart,
  Truck,
  Scale,
  Gem,
  Crown,
  Settings,
  ArrowLeft,
  Sparkles,
  Award,
  Globe,
  Briefcase,
  Database,
  Warehouse,
  Diamond,
  Circle,
  Square,
  Hexagon,
  Star,
  Heart,
  ShoppingBag
} from "lucide-react"
import { MaterialRequisitionDashboard } from "@/components/production/materials/material-requisition-dashboard"
import { MaterialInventoryManager } from "@/components/production/materials/material-inventory-manager"
import { MaterialAnalytics } from "@/components/production/materials/material-analytics"
import { MaterialSuppliers } from "@/components/production/materials/material-suppliers"
import { MaterialCostTracker } from "@/components/production/materials/material-cost-tracker"
import { MaterialQualityControl } from "@/components/production/materials/material-quality-control"
import { MaterialForecasting } from "@/components/production/materials/material-forecasting"
import { QuickRequestDialog } from "@/components/production/materials/quick-request-dialog"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface MaterialStats {
  totalMaterials: number
  lowStockItems: number
  pendingRequests: number
  approvedRequests: number
  totalValue: number
  monthlySpend: number
  suppliers: number
  qualityIssues: number
}

interface MaterialRequest {
  id: string
  material: string
  category: string
  quantity: number
  unit: string
  urgency: "low" | "medium" | "high" | "critical"
  priority: "normal" | "high" | "urgent"
  supplier: string
  estimatedCost: number
  requiredBy: string
  reason: string
  notes: string
  status: "draft" | "submitted" | "approved" | "rejected" | "ordered"
  submittedBy: string
  submittedAt: string
  approvedBy?: string
  approvedAt?: string
}

export default function MaterialRequisitionPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [quickRequestOpen, setQuickRequestOpen] = useState(false)
  const [materialStats, setMaterialStats] = useState<MaterialStats>({
    totalMaterials: 0,
    lowStockItems: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    totalValue: 0,
    monthlySpend: 0,
    suppliers: 0,
    qualityIssues: 0
  })

  useEffect(() => {
    // Simulate loading material statistics
    setMaterialStats({
      totalMaterials: 156,
      lowStockItems: 12,
      pendingRequests: 8,
      approvedRequests: 23,
      totalValue: 125000,
      monthlySpend: 45000,
      suppliers: 15,
      qualityIssues: 3
    })
  }, [])

  const handleExportData = () => {
    toast({ title: "Export Started", description: "Material data export has been initiated." })
  }

  const handleRefreshData = () => {
    toast({ title: "Data Refreshed", description: "Material data has been updated." })
  }

  const handleQuickRequest = () => {
    setQuickRequestOpen(true)
  }

  const handleRequestSubmitted = (request: MaterialRequest) => {
    // Update the pending requests count
    setMaterialStats(prev => ({
      ...prev,
      pendingRequests: prev.pendingRequests + 1
    }))
    
    // In a real application, you would save this to your database
    console.log("New material request submitted:", request)
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
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                    <Package className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight">
                      Materials Management
                    </h1>
                    <p className="text-slate-600 text-lg font-medium">Comprehensive material management for jewelry production</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    <span>Advanced Inventory Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-emerald-500" />
                    <span>Cost Optimization</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 items-center">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleRefreshData}
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  aria-label="Refresh"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleExportData}
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  aria-label="Export"
                  title="Export"
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={handleQuickRequest}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  Quick Request
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
                {/* Total Materials */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Total Materials</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Inventory
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {materialStats.totalMaterials}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{materialStats.lowStockItems} low stock items</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total materials in inventory
                    </p>
                  </CardContent>
                </Card>
                
                {/* Pending Requests */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Pending Requests</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Operations
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {materialStats.pendingRequests}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>{materialStats.approvedRequests} approved</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Material requests awaiting approval
                    </p>
                  </CardContent>
                </Card>
                
                {/* Inventory Value */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Inventory Value</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Financial
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        ${materialStats.totalValue.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>${materialStats.monthlySpend.toLocaleString()} monthly spend</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Total value of material inventory
                    </p>
                  </CardContent>
                </Card>
                
                {/* Quality Issues */}
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <AlertTriangle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">Quality Issues</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Quality
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                        {materialStats.qualityIssues}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Users className="h-3 w-3" />
                        <span>{materialStats.suppliers} active suppliers</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      Quality issues requiring attention
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Alerts */}
        {(materialStats.lowStockItems > 0 || materialStats.pendingRequests > 0 || materialStats.qualityIssues > 0) && (
          <div className="space-y-4">
            {materialStats.lowStockItems > 0 && (
              <Alert className="bg-white/80 backdrop-blur-xl border-orange-200/50 shadow-lg">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-800">Low Stock Alert</AlertTitle>
                <AlertDescription className="text-orange-700">
                  {materialStats.lowStockItems} materials are running low on stock. Review inventory and place orders.
                </AlertDescription>
              </Alert>
            )}
            {materialStats.pendingRequests > 0 && (
              <Alert className="bg-white/80 backdrop-blur-xl border-blue-200/50 shadow-lg">
                <Clock className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Pending Requests</AlertTitle>
                <AlertDescription className="text-blue-700">
                  {materialStats.pendingRequests} material requests are awaiting approval. Review and process them.
                </AlertDescription>
              </Alert>
            )}
            {materialStats.qualityIssues > 0 && (
              <Alert className="bg-white/80 backdrop-blur-xl border-red-200/50 shadow-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Quality Issues</AlertTitle>
                <AlertDescription className="text-red-700">
                  {materialStats.qualityIssues} quality issues detected. Review quality control reports.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Enhanced Main Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-8 h-auto p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20">
                <TabsTrigger 
                  value="dashboard" 
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <BarChart3 className="h-3 w-3 text-white" />
                  </div>
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="inventory" 
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Package className="h-3 w-3 text-white" />
                  </div>
                  Inventory
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <TrendingUp className="h-3 w-3 text-white" />
                  </div>
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="suppliers" 
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                  Suppliers
                </TabsTrigger>
                <TabsTrigger 
                  value="costs" 
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <DollarSign className="h-3 w-3 text-white" />
                  </div>
                  Costs
                </TabsTrigger>
                <TabsTrigger 
                  value="quality" 
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Target className="h-3 w-3 text-white" />
                  </div>
                  Quality
                </TabsTrigger>
                <TabsTrigger 
                  value="forecasting" 
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                  Forecast
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
                >
                  <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                    <Settings className="h-3 w-3 text-white" />
                  </div>
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                  <MaterialRequisitionDashboard />
                </div>
              </TabsContent>

              <TabsContent value="inventory" className="mt-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                  <MaterialInventoryManager />
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                  <MaterialAnalytics />
                </div>
              </TabsContent>

              <TabsContent value="suppliers" className="mt-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                  <MaterialSuppliers />
                </div>
              </TabsContent>

              <TabsContent value="costs" className="mt-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                  <MaterialCostTracker />
                </div>
              </TabsContent>

              <TabsContent value="quality" className="mt-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                  <MaterialQualityControl />
                </div>
              </TabsContent>

              <TabsContent value="forecasting" className="mt-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden">
                  <MaterialForecasting />
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <CardHeader>
                    <CardTitle>Material Management Settings</CardTitle>
                    <CardDescription>Configure material management preferences and automation rules</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Automation Rules</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Auto-reorder threshold</span>
                            <Badge variant="outline">Enabled</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Quality alerts</span>
                            <Badge variant="outline">Enabled</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Cost tracking</span>
                            <Badge variant="outline">Enabled</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Notifications</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Low stock alerts</span>
                            <Badge variant="outline">Daily</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Price changes</span>
                            <Badge variant="outline">Immediate</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Quality issues</span>
                            <Badge variant="outline">Immediate</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Quick Request Dialog */}
        <QuickRequestDialog
          open={quickRequestOpen}
          onOpenChange={setQuickRequestOpen}
          onRequestSubmitted={handleRequestSubmitted}
        />
      </div>
    </div>
  )
}
