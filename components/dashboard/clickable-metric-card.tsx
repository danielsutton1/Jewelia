"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  RefreshCw,
  ArrowRight,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ClickableMetricCardProps {
  metricKey: string
  label: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ComponentType<any>
  category?: string
  description?: string
  isLoading?: boolean
  className?: string
}

// Mapping of metrics to their detail pages
const METRIC_DETAIL_PAGES = {
  // Financial Metrics
  totalRevenue: '/dashboard/analytics/revenue',
  profitMargin: '/dashboard/analytics/profit',
  cashFlow: '/dashboard/analytics/cash-flow',
  accountsReceivable: '/dashboard/analytics/receivables',
  accountsPayable: '/dashboard/analytics/payables',
  expenseRatio: '/dashboard/analytics/expenses',
  budgetVariance: '/dashboard/analytics/budget',
  roi: '/dashboard/analytics/roi',
  inventoryValue: '/dashboard/analytics/inventory-value',
  customerLifetimeValue: '/dashboard/analytics/customer-lifetime-value',
  marketingROI: '/dashboard/analytics/marketing-roi',
  customerAcquisition: '/dashboard/analytics/acquisition-cost',

  // Sales Metrics
  totalOrders: '/dashboard/orders',
  conversionRate: '/dashboard/analytics/conversion',
  averageOrderValue: '/dashboard/analytics/average-order-value',
  salesPipeline: '/dashboard/analytics/sales-pipeline',
  topProducts: '/dashboard/analytics/top-products',
  leadGeneration: '/dashboard/analytics/leads',

  // Customer Metrics
  activeCustomers: '/dashboard/customers',
  customerSatisfaction: '/dashboard/analytics/customer-satisfaction',
  customerRetention: '/dashboard/analytics/customer-retention',
  customerComplaints: '/dashboard/analytics/customer-complaints',

  // Production Metrics
  productionEfficiency: '/dashboard/production/efficiency',
  workOrdersCompleted: '/dashboard/production/work-orders',
  qualityDefectRate: '/dashboard/quality-control/defects',
  productionCapacity: '/dashboard/production/capacity',
  equipmentUtilization: '/dashboard/production/equipment',
  cycleTime: '/dashboard/production/cycle-time',
  materialWaste: '/dashboard/production/waste',
  onTimeDelivery: '/dashboard/production/delivery',

  // CAD/Design Metrics
  designsCompleted: '/dashboard/design/completed',
  designApprovalRate: '/dashboard/design/approval-rate',
  averageDesignTime: '/dashboard/design/design-time',
  revisionRequests: '/dashboard/design/revisions',
  designComplexity: '/dashboard/design/complexity',
  softwareUtilization: '/dashboard/design/software-usage',
  projectDeadlines: '/dashboard/design/deadlines',

  // Polishing Metrics
  piecesPolished: '/dashboard/production/polishing',
  polishingQuality: '/dashboard/quality-control/polishing',
  averagePolishingTime: '/dashboard/production/polishing-time',
  polishingDefects: '/dashboard/quality-control/polishing-defects',
  equipmentDowntime: '/dashboard/production/equipment-downtime',
  materialUsage: '/dashboard/production/polishing-materials',
  workloadDistribution: '/dashboard/production/workload',
  safetyIncidents: '/dashboard/safety/incidents',

  // Setting Metrics
  stonesSet: '/dashboard/production/setting',
  settingQuality: '/dashboard/quality-control/setting',
  averageSettingTime: '/dashboard/production/setting-time',
  stoneLossRate: '/dashboard/production/stone-loss',
  settingDefects: '/dashboard/quality-control/setting-defects',
  toolUtilization: '/dashboard/production/setting-tools',
  skillLevel: '/dashboard/hr/skills',
  reworkRate: '/dashboard/production/rework',

  // Quality Control Metrics
  inspectionCount: '/dashboard/quality-control/inspections',
  defectRate: '/dashboard/quality-control/defects',
  passRate: '/dashboard/quality-control/pass-rate',
  averageInspectionTime: '/dashboard/quality-control/inspection-time',
  criticalDefects: '/dashboard/quality-control/critical-defects',
  qualityTrends: '/dashboard/quality-control/trends',
  supplierQuality: '/dashboard/suppliers/quality',

  // Inventory Metrics
  stockLevels: '/dashboard/inventory/stock-levels',
  turnoverRate: '/dashboard/inventory/turnover',
  lowStockAlerts: '/dashboard/inventory/alerts',
  wastePercentage: '/dashboard/inventory/waste',
  supplierPerformance: '/dashboard/suppliers/performance',
  orderAccuracy: '/dashboard/inventory/accuracy',
  storageEfficiency: '/dashboard/inventory/storage',

  // Customer Service Metrics
  responseTime: '/dashboard/customer-service/response-time',
  ticketResolution: '/dashboard/customer-service/resolution',
  supportVolume: '/dashboard/customer-service/volume',
  firstCallResolution: '/dashboard/customer-service/first-call',

  // Marketing Metrics
  brandAwareness: '/dashboard/marketing/awareness',
  socialMediaEngagement: '/dashboard/marketing/social',
  campaignPerformance: '/dashboard/marketing/campaigns',
  marketShare: '/dashboard/marketing/market-share',

  // HR Metrics
  teamPerformance: '/dashboard/hr/performance',

  // Business Metrics
  globalReach: '/dashboard/analytics/global-reach'
}

// Icon mapping for metrics
const METRIC_ICONS = {
  totalRevenue: DollarSign,
  totalOrders: ShoppingCart,
  activeCustomers: Users,
  productionEfficiency: TrendingUp,
  profitMargin: BarChart3,
  customerSatisfaction: Star,
  marketShare: Globe,
  teamPerformance: Award,
  conversionRate: Target,
  averageOrderValue: BarChart3,
  salesPipeline: TrendingUp,
  customerRetention: UserCheck,
  topProducts: Package,
  workOrdersCompleted: CheckCircle,
  qualityDefectRate: AlertCircle,
  productionCapacity: BarChart3,
  equipmentUtilization: Activity,
  cycleTime: Clock,
  materialWaste: AlertCircle,
  onTimeDelivery: CheckCircle,
  designsCompleted: CheckCircle,
  designApprovalRate: Target,
  averageDesignTime: Clock,
  revisionRequests: AlertCircle,
  clientSatisfaction: Star,
  designComplexity: BarChart3,
  softwareUtilization: Activity,
  projectDeadlines: Calendar,
  piecesPolished: CheckCircle,
  polishingQuality: Star,
  averagePolishingTime: Clock,
  polishingDefects: AlertCircle,
  equipmentDowntime: AlertCircle,
  materialUsage: Package,
  workloadDistribution: BarChart3,
  safetyIncidents: Shield,
  stonesSet: CheckCircle,
  settingQuality: Star,
  averageSettingTime: Clock,
  stoneLossRate: AlertCircle,
  settingDefects: AlertCircle,
  toolUtilization: Activity,
  skillLevel: Award,
  reworkRate: RefreshCw,
  inspectionCount: CheckCircle,
  defectRate: AlertCircle,
  passRate: Target,
  averageInspectionTime: Clock,
  criticalDefects: AlertCircle,
  qualityTrends: TrendingUp,
  supplierQuality: Building,
  customerComplaints: MessageSquare,
  inventoryValue: DollarSign,
  stockLevels: Package,
  turnoverRate: TrendingUp,
  lowStockAlerts: AlertCircle,
  wastePercentage: AlertCircle,
  supplierPerformance: Building,
  orderAccuracy: Target,
  storageEfficiency: BarChart3,
  responseTime: Clock,
  ticketResolution: CheckCircle,
  supportVolume: BarChart3,
  firstCallResolution: Target,
  leadGeneration: Users,
  marketingROI: DollarSign,
  brandAwareness: Globe,
  socialMediaEngagement: MessageSquare,
  campaignPerformance: BarChart3,
  customerAcquisition: DollarSign,
  cashFlow: TrendingUp,
  accountsReceivable: FileText,
  accountsPayable: FileText,
  expenseRatio: PieChart,
  budgetVariance: AlertCircle,
  globalReach: Globe
}

export function ClickableMetricCard({
  metricKey,
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  category,
  description,
  isLoading = false,
  className = ""
}: ClickableMetricCardProps) {
  const router = useRouter()
  const detailPage = METRIC_DETAIL_PAGES[metricKey as keyof typeof METRIC_DETAIL_PAGES]
  const IconComponent = icon || METRIC_ICONS[metricKey as keyof typeof METRIC_ICONS] || BarChart3

  const handleClick = () => {
    if (detailPage) {
      router.push(detailPage)
    }
  }

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="h-3 w-3" />
      case 'negative':
        return <TrendingUp className="h-3 w-3 rotate-180" />
      default:
        return null
    }
  }

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group ${className}`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
              <IconComponent className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900 truncate">{label}</h4>
              {category && (
                <Badge variant="secondary" className="text-xs mt-1">
                  {category}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
              {change && (
                <div className={`flex items-center gap-1 text-xs ${getChangeColor()}`}>
                  {getChangeIcon()}
                  <span>{change}</span>
                </div>
              )}
            </>
          )}
        </div>

        {description && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            {description}
          </p>
        )}

      </CardContent>
    </Card>
  )
}
