"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  DollarSign, 
  Users, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  Zap,
  Globe,
  ShoppingCart,
  Truck,
  Wrench,
  Gem,
  Crown,
  Settings,
  Eye,
  EyeOff,
  Plus,
  X,
  Star,
  Activity,
  Calendar,
  MessageSquare,
  FileText,
  Shield,
  Building,
  UserCheck,
  Briefcase,
  Palette,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw
} from "lucide-react"

// Department-specific KPI configurations
const DEPARTMENT_KPIS = {
  // Executive/Management
  executive: {
    name: "Executive Dashboard",
    icon: Crown,
    color: "bg-purple-500",
    kpis: [
      { key: "totalRevenue", label: "Total Revenue", icon: DollarSign, category: "financial" },
      { key: "totalOrders", label: "Total Orders", icon: ShoppingCart, category: "sales" },
      { key: "activeCustomers", label: "Active Customers", icon: Users, category: "customer" },
      { key: "productionEfficiency", label: "Production Efficiency", icon: TrendingUp, category: "operations" },
      { key: "profitMargin", label: "Profit Margin", icon: BarChart3, category: "financial" },
      { key: "customerSatisfaction", label: "Customer Satisfaction", icon: Star, category: "customer" },
      { key: "marketShare", label: "Market Share", icon: Globe, category: "business" },
      { key: "teamPerformance", label: "Team Performance", icon: Award, category: "hr" }
    ]
  },

  // Sales Department
  sales: {
    name: "Sales Dashboard",
    icon: ShoppingCart,
    color: "bg-green-500",
    kpis: [
      { key: "totalRevenue", label: "Total Revenue", icon: DollarSign, category: "financial" },
      { key: "totalOrders", label: "Total Orders", icon: ShoppingCart, category: "sales" },
      { key: "activeCustomers", label: "Active Customers", icon: Users, category: "customer" },
      { key: "conversionRate", label: "Conversion Rate", icon: Target, category: "sales" },
      { key: "averageOrderValue", label: "Average Order Value", icon: BarChart3, category: "sales" },
      { key: "salesPipeline", label: "Sales Pipeline", icon: TrendingUp, category: "sales" },
      { key: "customerRetention", label: "Customer Retention", icon: UserCheck, category: "customer" },
      { key: "topProducts", label: "Top Products", icon: Package, category: "product" }
    ]
  },

  // Production Department
  production: {
    name: "Production Dashboard",
    icon: Settings,
    color: "bg-blue-500",
    kpis: [
      { key: "productionEfficiency", label: "Production Efficiency", icon: TrendingUp, category: "operations" },
      { key: "workOrdersCompleted", label: "Work Orders Completed", icon: CheckCircle, category: "operations" },
      { key: "qualityDefectRate", label: "Quality Defect Rate", icon: AlertCircle, category: "quality" },
      { key: "productionCapacity", label: "Production Capacity", icon: BarChart3, category: "operations" },
      { key: "equipmentUtilization", label: "Equipment Utilization", icon: Activity, category: "operations" },
      { key: "cycleTime", label: "Average Cycle Time", icon: Clock, category: "operations" },
      { key: "materialWaste", label: "Material Waste %", icon: AlertCircle, category: "cost" },
      { key: "onTimeDelivery", label: "On-Time Delivery", icon: CheckCircle, category: "delivery" }
    ]
  },

  // CAD/Design Department
  cad: {
    name: "CAD & Design Dashboard",
    icon: Palette,
    color: "bg-pink-500",
    kpis: [
      { key: "designsCompleted", label: "Designs Completed", icon: CheckCircle, category: "design" },
      { key: "designApprovalRate", label: "Design Approval Rate", icon: Target, category: "design" },
      { key: "averageDesignTime", label: "Average Design Time", icon: Clock, category: "design" },
      { key: "revisionRequests", label: "Revision Requests", icon: AlertCircle, category: "design" },
      { key: "clientSatisfaction", label: "Client Satisfaction", icon: Star, category: "client" },
      { key: "designComplexity", label: "Design Complexity Score", icon: BarChart3, category: "design" },
      { key: "softwareUtilization", label: "Software Utilization", icon: Activity, category: "tools" },
      { key: "projectDeadlines", label: "Project Deadlines Met", icon: Calendar, category: "timeline" }
    ]
  },

  // Polishing Department
  polishing: {
    name: "Polishing Dashboard",
    icon: Gem,
    color: "bg-yellow-500",
    kpis: [
      { key: "piecesPolished", label: "Pieces Polished", icon: CheckCircle, category: "output" },
      { key: "polishingQuality", label: "Polishing Quality Score", icon: Star, category: "quality" },
      { key: "averagePolishingTime", label: "Average Polishing Time", icon: Clock, category: "efficiency" },
      { key: "polishingDefects", label: "Polishing Defects", icon: AlertCircle, category: "quality" },
      { key: "equipmentDowntime", label: "Equipment Downtime", icon: AlertCircle, category: "maintenance" },
      { key: "materialUsage", label: "Polishing Material Usage", icon: Package, category: "materials" },
      { key: "workloadDistribution", label: "Workload Distribution", icon: BarChart3, category: "capacity" },
      { key: "safetyIncidents", label: "Safety Incidents", icon: Shield, category: "safety" }
    ]
  },

  // Setting Department
  setting: {
    name: "Setting Dashboard",
    icon: Crown,
    color: "bg-indigo-500",
    kpis: [
      { key: "stonesSet", label: "Stones Set", icon: CheckCircle, category: "output" },
      { key: "settingQuality", label: "Setting Quality Score", icon: Star, category: "quality" },
      { key: "averageSettingTime", label: "Average Setting Time", icon: Clock, category: "efficiency" },
      { key: "stoneLossRate", label: "Stone Loss Rate", icon: AlertCircle, category: "loss" },
      { key: "settingDefects", label: "Setting Defects", icon: AlertCircle, category: "quality" },
      { key: "toolUtilization", label: "Tool Utilization", icon: Activity, category: "tools" },
      { key: "skillLevel", label: "Average Skill Level", icon: Award, category: "expertise" },
      { key: "reworkRate", label: "Rework Rate", icon: RefreshCw, category: "quality" }
    ]
  },

  // Quality Control
  quality: {
    name: "Quality Control Dashboard",
    icon: Shield,
    color: "bg-red-500",
    kpis: [
      { key: "inspectionCount", label: "Inspections Completed", icon: CheckCircle, category: "inspection" },
      { key: "defectRate", label: "Overall Defect Rate", icon: AlertCircle, category: "quality" },
      { key: "passRate", label: "Pass Rate", icon: Target, category: "quality" },
      { key: "averageInspectionTime", label: "Average Inspection Time", icon: Clock, category: "efficiency" },
      { key: "criticalDefects", label: "Critical Defects", icon: AlertCircle, category: "critical" },
      { key: "qualityTrends", label: "Quality Trends", icon: TrendingUp, category: "trends" },
      { key: "supplierQuality", label: "Supplier Quality Score", icon: Building, category: "supplier" },
      { key: "customerComplaints", label: "Customer Complaints", icon: MessageSquare, category: "feedback" }
    ]
  },

  // Inventory Management
  inventory: {
    name: "Inventory Dashboard",
    icon: Package,
    color: "bg-orange-500",
    kpis: [
      { key: "inventoryValue", label: "Total Inventory Value", icon: DollarSign, category: "financial" },
      { key: "stockLevels", label: "Stock Levels", icon: Package, category: "stock" },
      { key: "turnoverRate", label: "Inventory Turnover", icon: TrendingUp, category: "efficiency" },
      { key: "lowStockAlerts", label: "Low Stock Alerts", icon: AlertCircle, category: "alerts" },
      { key: "wastePercentage", label: "Waste Percentage", icon: AlertCircle, category: "waste" },
      { key: "supplierPerformance", label: "Supplier Performance", icon: Building, category: "supplier" },
      { key: "orderAccuracy", label: "Order Accuracy", icon: Target, category: "accuracy" },
      { key: "storageEfficiency", label: "Storage Efficiency", icon: BarChart3, category: "space" }
    ]
  },

  // Customer Service
  customer_service: {
    name: "Customer Service Dashboard",
    icon: Users,
    color: "bg-teal-500",
    kpis: [
      { key: "activeCustomers", label: "Active Customers", icon: Users, category: "customer" },
      { key: "customerSatisfaction", label: "Customer Satisfaction", icon: Star, category: "satisfaction" },
      { key: "responseTime", label: "Average Response Time", icon: Clock, category: "response" },
      { key: "ticketResolution", label: "Ticket Resolution Rate", icon: CheckCircle, category: "resolution" },
      { key: "customerRetention", label: "Customer Retention", icon: UserCheck, category: "retention" },
      { key: "supportVolume", label: "Support Volume", icon: MessageSquare, category: "volume" },
      { key: "firstCallResolution", label: "First Call Resolution", icon: Target, category: "efficiency" },
      { key: "customerLifetimeValue", label: "Customer Lifetime Value", icon: DollarSign, category: "value" }
    ]
  },

  // Finance/Accounting
  finance: {
    name: "Finance Dashboard",
    icon: DollarSign,
    color: "bg-emerald-500",
    kpis: [
      { key: "totalRevenue", label: "Total Revenue", icon: DollarSign, category: "revenue" },
      { key: "profitMargin", label: "Profit Margin", icon: BarChart3, category: "profit" },
      { key: "cashFlow", label: "Cash Flow", icon: TrendingUp, category: "cash" },
      { key: "accountsReceivable", label: "Accounts Receivable", icon: FileText, category: "receivables" },
      { key: "accountsPayable", label: "Accounts Payable", icon: FileText, category: "payables" },
      { key: "expenseRatio", label: "Expense Ratio", icon: PieChart, category: "expenses" },
      { key: "budgetVariance", label: "Budget Variance", icon: AlertCircle, category: "budget" },
      { key: "roi", label: "Return on Investment", icon: Target, category: "returns" }
    ]
  },

  // Marketing
  marketing: {
    name: "Marketing Dashboard",
    icon: Globe,
    color: "bg-purple-500",
    kpis: [
      { key: "leadGeneration", label: "Lead Generation", icon: Users, category: "leads" },
      { key: "conversionRate", label: "Conversion Rate", icon: Target, category: "conversion" },
      { key: "marketingROI", label: "Marketing ROI", icon: DollarSign, category: "roi" },
      { key: "brandAwareness", label: "Brand Awareness", icon: Globe, category: "awareness" },
      { key: "socialMediaEngagement", label: "Social Media Engagement", icon: MessageSquare, category: "social" },
      { key: "campaignPerformance", label: "Campaign Performance", icon: BarChart3, category: "campaigns" },
      { key: "customerAcquisition", label: "Customer Acquisition Cost", icon: DollarSign, category: "acquisition" },
      { key: "marketShare", label: "Market Share", icon: PieChart, category: "market" }
    ]
  }
}

// KPI categories for organization
const KPI_CATEGORIES = {
  financial: { label: "Financial", icon: DollarSign, color: "text-green-600" },
  sales: { label: "Sales", icon: ShoppingCart, color: "text-blue-600" },
  customer: { label: "Customer", icon: Users, color: "text-purple-600" },
  operations: { label: "Operations", icon: Settings, color: "text-orange-600" },
  quality: { label: "Quality", icon: Shield, color: "text-red-600" },
  hr: { label: "Human Resources", icon: Briefcase, color: "text-indigo-600" },
  business: { label: "Business", icon: Building, color: "text-gray-600" },
  design: { label: "Design", icon: Palette, color: "text-pink-600" },
  output: { label: "Output", icon: Package, color: "text-yellow-600" },
  efficiency: { label: "Efficiency", icon: TrendingUp, color: "text-emerald-600" },
  timeline: { label: "Timeline", icon: Calendar, color: "text-cyan-600" },
  tools: { label: "Tools", icon: Wrench, color: "text-slate-600" },
  maintenance: { label: "Maintenance", icon: Settings, color: "text-amber-600" },
  safety: { label: "Safety", icon: Shield, color: "text-red-600" },
  materials: { label: "Materials", icon: Package, color: "text-orange-600" },
  capacity: { label: "Capacity", icon: BarChart3, color: "text-blue-600" },
  loss: { label: "Loss", icon: AlertCircle, color: "text-red-600" },
  expertise: { label: "Expertise", icon: Award, color: "text-purple-600" },
  inspection: { label: "Inspection", icon: Eye, color: "text-indigo-600" },
  critical: { label: "Critical", icon: AlertCircle, color: "text-red-600" },
  trends: { label: "Trends", icon: TrendingUp, color: "text-green-600" },
  supplier: { label: "Supplier", icon: Building, color: "text-gray-600" },
  feedback: { label: "Feedback", icon: MessageSquare, color: "text-blue-600" },
  stock: { label: "Stock", icon: Package, color: "text-orange-600" },
  alerts: { label: "Alerts", icon: AlertCircle, color: "text-red-600" },
  waste: { label: "Waste", icon: AlertCircle, color: "text-red-600" },
  accuracy: { label: "Accuracy", icon: Target, color: "text-green-600" },
  space: { label: "Space", icon: BarChart3, color: "text-blue-600" },
  satisfaction: { label: "Satisfaction", icon: Star, color: "text-yellow-600" },
  response: { label: "Response", icon: Clock, color: "text-blue-600" },
  resolution: { label: "Resolution", icon: CheckCircle, color: "text-green-600" },
  retention: { label: "Retention", icon: UserCheck, color: "text-purple-600" },
  volume: { label: "Volume", icon: BarChart3, color: "text-blue-600" },
  revenue: { label: "Revenue", icon: DollarSign, color: "text-green-600" },
  profit: { label: "Profit", icon: TrendingUp, color: "text-emerald-600" },
  cash: { label: "Cash", icon: DollarSign, color: "text-green-600" },
  receivables: { label: "Receivables", icon: FileText, color: "text-blue-600" },
  payables: { label: "Payables", icon: FileText, color: "text-red-600" },
  expenses: { label: "Expenses", icon: PieChart, color: "text-orange-600" },
  budget: { label: "Budget", icon: BarChart3, color: "text-purple-600" },
  returns: { label: "Returns", icon: Target, color: "text-green-600" },
  leads: { label: "Leads", icon: Users, color: "text-blue-600" },
  conversion: { label: "Conversion", icon: Target, color: "text-green-600" },
  roi: { label: "ROI", icon: DollarSign, color: "text-emerald-600" },
  awareness: { label: "Awareness", icon: Globe, color: "text-purple-600" },
  social: { label: "Social", icon: MessageSquare, color: "text-blue-600" },
  campaigns: { label: "Campaigns", icon: BarChart3, color: "text-purple-600" },
  acquisition: { label: "Acquisition", icon: DollarSign, color: "text-green-600" },
  market: { label: "Market", icon: PieChart, color: "text-indigo-600" },
  client: { label: "Client", icon: Users, color: "text-purple-600" },
  delivery: { label: "Delivery", icon: Truck, color: "text-blue-600" },
  cost: { label: "Cost", icon: DollarSign, color: "text-red-600" },
  product: { label: "Product", icon: Package, color: "text-orange-600" }
}

interface EnhancedDashboardCustomizationProps {
  isOpen: boolean
  onClose: () => void
  currentMetrics: string[]
  onSave: (metrics: string[]) => void
  userRole?: string
  userDepartment?: string
}

export function EnhancedDashboardCustomization({
  isOpen,
  onClose,
  currentMetrics,
  onSave,
  userRole = 'admin',
  userDepartment = 'executive'
}: EnhancedDashboardCustomizationProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(currentMetrics)
  const [selectedDepartment, setSelectedDepartment] = useState(userDepartment)
  const [customMetricInput, setCustomMetricInput] = useState("")
  const [customMetrics, setCustomMetrics] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("department")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Get current department KPIs
  const currentDepartmentKPIs = DEPARTMENT_KPIS[selectedDepartment as keyof typeof DEPARTMENT_KPIS] || DEPARTMENT_KPIS.executive

  // Filter KPIs based on search and category
  const filteredKPIs = currentDepartmentKPIs.kpis.filter(kpi => {
    const matchesSearch = kpi.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         kpi.key.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || kpi.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get all available categories for current department
  const availableCategories = Array.from(new Set(currentDepartmentKPIs.kpis.map(kpi => kpi.category)))

  const handleMetricToggle = (metricKey: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricKey) 
        ? prev.filter(m => m !== metricKey)
        : [...prev, metricKey]
    )
  }

  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department)
    // Auto-select default metrics for the department
    const departmentKPIs = DEPARTMENT_KPIS[department as keyof typeof DEPARTMENT_KPIS]
    if (departmentKPIs) {
      const defaultMetrics = departmentKPIs.kpis.slice(0, 4).map(kpi => kpi.key)
      setSelectedMetrics(defaultMetrics)
    }
  }

  const handleAddCustomMetric = () => {
    if (customMetricInput.trim() && !customMetrics.includes(customMetricInput.trim())) {
      setCustomMetrics(prev => [...prev, customMetricInput.trim()])
      setCustomMetricInput("")
    }
  }

  const handleRemoveCustomMetric = (metric: string) => {
    setCustomMetrics(prev => prev.filter(m => m !== metric))
    setSelectedMetrics(prev => prev.filter(m => m !== metric))
  }

  const handleSave = () => {
    console.log('Saving metrics:', selectedMetrics)
    onSave(selectedMetrics)
    onClose()
  }

  const handleQuickSelect = (department: string) => {
    const departmentKPIs = DEPARTMENT_KPIS[department as keyof typeof DEPARTMENT_KPIS]
    if (departmentKPIs) {
      const allMetrics = departmentKPIs.kpis.map(kpi => kpi.key)
      setSelectedMetrics(allMetrics)
    }
  }

  const handleClearAll = () => {
    setSelectedMetrics([])
  }

  const handleSelectAll = () => {
    const allMetrics = currentDepartmentKPIs.kpis.map(kpi => kpi.key)
    setSelectedMetrics(allMetrics)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5" />
            Customize Dashboard Metrics
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 px-6 overflow-y-auto max-h-[50vh]">
          <div className="flex flex-col gap-4">
          {/* Mobile-Friendly Dashboard Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Dashboard Type:</label>
            <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a dashboard type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DEPARTMENT_KPIS).map(([key, dept]) => {
                  const Icon = dept.icon
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{dept.name}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="department">Department KPIs</TabsTrigger>
              <TabsTrigger value="custom">Custom Metrics</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="department" className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search KPIs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {availableCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {KPI_CATEGORIES[category as keyof typeof KPI_CATEGORIES]?.label || category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearAll}>
                  Clear All
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickSelect(selectedDepartment)}>
                  Quick Select All
                </Button>
              </div>

              {/* KPIs Grid */}
              <ScrollArea className="h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredKPIs.map((kpi) => {
                    const Icon = kpi.icon
                    const category = KPI_CATEGORIES[kpi.category as keyof typeof KPI_CATEGORIES]
                    const isSelected = selectedMetrics.includes(kpi.key)
                    
                    return (
                      <Card 
                        key={kpi.key} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => handleMetricToggle(kpi.key)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${currentDepartmentKPIs.color} bg-opacity-20`}>
                                <Icon className="h-4 w-4 text-gray-700" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">{kpi.label}</h4>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {category?.label || kpi.category}
                                </Badge>
                              </div>
                            </div>
                            <Checkbox 
                              checked={isSelected}
                              onChange={() => handleMetricToggle(kpi.key)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom metric (e.g. Net Profit, Customer Churn Rate)"
                    value={customMetricInput}
                    onChange={(e) => setCustomMetricInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomMetric()}
                  />
                  <Button onClick={handleAddCustomMetric} disabled={!customMetricInput.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-sm text-gray-600">
                  Type a metric and our AI will fetch the data from your account.
                </p>

                {customMetrics.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Custom Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {customMetrics.map((metric) => (
                        <Card key={metric} className="p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{metric}</span>
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                checked={selectedMetrics.includes(metric)}
                                onChange={() => handleMetricToggle(metric)}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveCustomMetric(metric)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">Selected Metrics Preview</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedMetrics.map((metricKey) => {
                    const kpi = currentDepartmentKPIs.kpis.find(k => k.key === metricKey)
                    if (!kpi) return null
                    
                    const Icon = kpi.icon
                    return (
                      <Card key={metricKey} className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${currentDepartmentKPIs.color} bg-opacity-20`}>
                            <Icon className="h-4 w-4 text-gray-700" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{kpi.label}</h4>
                            <p className="text-xs text-gray-500">Sample Data</p>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />
          </div>
        </div>

        <DialogFooter className="flex justify-between p-6 pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedMetrics.length} metrics selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Dashboard
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
