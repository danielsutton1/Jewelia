"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  BarChart3, 
  PieChart, 
  LineChart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Target,
  Zap
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface AnalyticsData {
  period: string
  totalSpend: number
  totalOrders: number
  averageOrderValue: number
  topMaterials: Array<{
    name: string
    spend: number
    quantity: number
    percentage: number
  }>
  categoryBreakdown: Array<{
    category: string
    spend: number
    percentage: number
    trend: "up" | "down" | "stable"
  }>
  supplierPerformance: Array<{
    supplier: string
    totalSpend: number
    orders: number
    averageDeliveryTime: number
    qualityScore: number
  }>
  trends: Array<{
    month: string
    spend: number
    orders: number
    averagePrice: number
  }>
}

// Sample analytics data
const sampleAnalyticsData: AnalyticsData = {
  period: "Last 12 Months",
  totalSpend: 450000,
  totalOrders: 156,
  averageOrderValue: 2885,
  topMaterials: [
    { name: "14K Yellow Gold", spend: 125000, quantity: 2750, percentage: 28 },
    { name: "Diamond 1ct Round", spend: 85000, quantity: 10, percentage: 19 },
    { name: "18K White Gold", spend: 68000, quantity: 1500, percentage: 15 },
    { name: "Sapphire 2ct Oval", spend: 42000, quantity: 35, percentage: 9 },
    { name: "Platinum", spend: 38000, quantity: 1200, percentage: 8 }
  ],
  categoryBreakdown: [
    { category: "Precious Metals", spend: 231000, percentage: 51, trend: "up" },
    { category: "Gemstones", spend: 127000, percentage: 28, trend: "up" },
    { category: "Findings", spend: 58000, percentage: 13, trend: "stable" },
    { category: "Tools & Equipment", spend: 34000, percentage: 8, trend: "down" }
  ],
  supplierPerformance: [
    { supplier: "GoldCorp Metals", totalSpend: 125000, orders: 45, averageDeliveryTime: 3, qualityScore: 95 },
    { supplier: "Diamond Source Inc", totalSpend: 85000, orders: 12, averageDeliveryTime: 7, qualityScore: 98 },
    { supplier: "Silver Solutions", totalSpend: 42000, orders: 28, averageDeliveryTime: 2, qualityScore: 92 },
    { supplier: "Gemstone World", totalSpend: 38000, orders: 15, averageDeliveryTime: 5, qualityScore: 94 },
    { supplier: "Findings Factory", totalSpend: 32000, orders: 35, averageDeliveryTime: 1, qualityScore: 89 }
  ],
  trends: [
    { month: "Jan", spend: 38000, orders: 12, averagePrice: 3167 },
    { month: "Feb", spend: 42000, orders: 14, averagePrice: 3000 },
    { month: "Mar", spend: 45000, orders: 15, averagePrice: 3000 },
    { month: "Apr", spend: 48000, orders: 16, averagePrice: 3000 },
    { month: "May", spend: 52000, orders: 18, averagePrice: 2889 },
    { month: "Jun", spend: 55000, orders: 19, averagePrice: 2895 },
    { month: "Jul", spend: 58000, orders: 20, averagePrice: 2900 },
    { month: "Aug", spend: 62000, orders: 22, averagePrice: 2818 },
    { month: "Sep", spend: 65000, orders: 23, averagePrice: 2826 },
    { month: "Oct", spend: 68000, orders: 24, averagePrice: 2833 },
    { month: "Nov", spend: 72000, orders: 25, averagePrice: 2880 },
    { month: "Dec", spend: 75000, orders: 26, averagePrice: 2885 }
  ]
}

export function MaterialAnalytics() {
  const [data, setData] = useState<AnalyticsData>(sampleAnalyticsData)
  const [timeRange, setTimeRange] = useState("12months")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const handleExportAnalytics = () => {
    toast({ title: "Export Started", description: "Analytics data export has been initiated." })
  }

  const handleRefreshData = () => {
    toast({ title: "Data Refreshed", description: "Analytics data has been updated." })
  }

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />
    }
  }

  const getQualityScoreColor = (score: number) => {
    if (score >= 95) return "text-green-600"
    if (score >= 90) return "text-blue-600"
    if (score >= 85) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Material Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights into material spending, trends, and supplier performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="24months">Last 24 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefreshData} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExportAnalytics} aria-label="Export">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalSpend.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.period}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ${data.averageOrderValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Material</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.topMaterials[0].name}</div>
            <p className="text-xs text-muted-foreground">
              {data.topMaterials[0].percentage}% of total spend
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Supplier</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.supplierPerformance[0].supplier}</div>
            <p className="text-xs text-muted-foreground">
              {data.supplierPerformance[0].qualityScore}% quality score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Spend by Category</CardTitle>
                <CardDescription>Material spending breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.categoryBreakdown.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{category.category}</span>
                          {getTrendIcon(category.trend)}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">${category.spend.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{category.percentage}%</div>
                        </div>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Materials */}
            <Card>
              <CardHeader>
                <CardTitle>Top Materials by Spend</CardTitle>
                <CardDescription>Highest spending materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topMaterials.map((material, index) => (
                    <div key={material.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{material.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {material.quantity} units
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">${material.spend.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{material.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>Monthly material spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Simple trend visualization */}
                <div className="flex items-end justify-between h-32 border-b border-l">
                  {data.trends.map((trend, index) => (
                    <div key={trend.month} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-primary rounded-t"
                        style={{ height: `${(trend.spend / 75000) * 100}%` }}
                      />
                      <div className="text-xs mt-2">{trend.month}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">+12.5%</div>
                    <div className="text-xs text-muted-foreground">YoY Growth</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">$37.5K</div>
                    <div className="text-xs text-muted-foreground">Monthly Average</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">+8.3%</div>
                    <div className="text-xs text-muted-foreground">Order Growth</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance</CardTitle>
              <CardDescription>Supplier analysis and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.supplierPerformance.map((supplier) => (
                  <div key={supplier.supplier} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium">{supplier.supplier}</div>
                        <div className="text-sm text-muted-foreground">
                          {supplier.orders} orders • {supplier.averageDeliveryTime} days avg delivery
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${supplier.totalSpend.toLocaleString()}</div>
                      <div className={`text-sm font-medium ${getQualityScoreColor(supplier.qualityScore)}`}>
                        {supplier.qualityScore}% quality
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Material Analysis</CardTitle>
              <CardDescription>Detailed material spending and usage analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topMaterials.map((material) => (
                  <div key={material.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{material.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {material.quantity} units purchased
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${material.spend.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        ${Math.round(material.spend / material.quantity).toLocaleString()}/unit
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>AI-powered recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Spending Optimization</h4>
                    <p className="text-sm text-blue-700">
                      Consider bulk purchasing for 14K Yellow Gold to reduce costs by 8-12%.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Supplier Excellence</h4>
                    <p className="text-sm text-green-700">
                      GoldCorp Metals shows excellent performance. Consider increasing order volume.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900">Price Alert</h4>
                    <p className="text-sm text-amber-700">
                      Diamond prices have increased 15% this quarter. Consider forward contracts.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forecast</CardTitle>
                <CardDescription>Predicted spending and trends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Next Quarter Spend</span>
                    <span className="text-sm font-medium">$180,000</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Expected Growth</span>
                    <span className="text-sm font-medium text-green-600">+15%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Cost Savings Potential</span>
                    <span className="text-sm font-medium text-blue-600">$22,500</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
 