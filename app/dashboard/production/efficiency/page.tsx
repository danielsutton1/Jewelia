"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Download,
  ArrowLeft,
  Target,
  Award,
  Users,
  Settings,
  Wrench,
  Zap,
  Activity
} from 'lucide-react'
import Link from 'next/link'

interface ProductionEfficiencyData {
  overallEfficiency: number
  efficiencyGrowth: number
  workOrdersCompleted: number
  averageCycleTime: number
  equipmentUtilization: number
  qualityDefectRate: number
  onTimeDelivery: number
  efficiencyByDepartment: Array<{
    department: string
    efficiency: number
    trend: 'up' | 'down' | 'stable'
  }>
  efficiencyByProduct: Array<{
    product: string
    efficiency: number
    complexity: 'low' | 'medium' | 'high'
  }>
  monthlyTrend: Array<{
    month: string
    efficiency: number
    orders: number
    defects: number
  }>
  topPerformers: Array<{
    name: string
    efficiency: number
    department: string
    ordersCompleted: number
  }>
  bottlenecks: Array<{
    process: string
    impact: number
    status: 'critical' | 'warning' | 'normal'
  }>
}

export default function ProductionEfficiencyPage() {
  const [efficiencyData, setEfficiencyData] = useState<ProductionEfficiencyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchEfficiencyData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setEfficiencyData({
        overallEfficiency: 87.5,
        efficiencyGrowth: 5.2,
        workOrdersCompleted: 1247,
        averageCycleTime: 3.2,
        equipmentUtilization: 82.3,
        qualityDefectRate: 0.8,
        onTimeDelivery: 94.2,
        efficiencyByDepartment: [
          { department: 'CAD Design', efficiency: 92.1, trend: 'up' },
          { department: 'Polishing', efficiency: 89.3, trend: 'up' },
          { department: 'Setting', efficiency: 85.7, trend: 'stable' },
          { department: 'Quality Control', efficiency: 88.9, trend: 'up' },
          { department: 'Assembly', efficiency: 84.2, trend: 'down' }
        ],
        efficiencyByProduct: [
          { product: 'Diamond Rings', efficiency: 91.2, complexity: 'high' },
          { product: 'Gold Necklaces', efficiency: 88.7, complexity: 'medium' },
          { product: 'Silver Earrings', efficiency: 85.3, complexity: 'low' },
          { product: 'Custom Pieces', efficiency: 79.8, complexity: 'high' }
        ],
        monthlyTrend: [
          { month: 'Jan', efficiency: 82.1, orders: 198, defects: 12 },
          { month: 'Feb', efficiency: 83.5, orders: 205, defects: 10 },
          { month: 'Mar', efficiency: 84.8, orders: 212, defects: 9 },
          { month: 'Apr', efficiency: 85.9, orders: 218, defects: 8 },
          { month: 'May', efficiency: 86.7, orders: 225, defects: 7 },
          { month: 'Jun', efficiency: 87.5, orders: 231, defects: 6 }
        ],
        topPerformers: [
          { name: 'Sarah Johnson', efficiency: 95.2, department: 'CAD Design', ordersCompleted: 45 },
          { name: 'Michael Chen', efficiency: 93.8, department: 'Polishing', ordersCompleted: 52 },
          { name: 'Emma Rodriguez', efficiency: 92.1, department: 'Setting', ordersCompleted: 38 },
          { name: 'David Thompson', efficiency: 91.5, department: 'Quality Control', ordersCompleted: 41 },
          { name: 'Lisa Anderson', efficiency: 90.3, department: 'Assembly', ordersCompleted: 35 }
        ],
        bottlenecks: [
          { process: 'Stone Setting', impact: 15, status: 'critical' },
          { process: 'Final Inspection', impact: 8, status: 'warning' },
          { process: 'Packaging', impact: 3, status: 'normal' }
        ]
      })
      setLoading(false)
    }

    fetchEfficiencyData()
  }, [dateRange])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="w-full">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!efficiencyData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="w-full">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Efficiency Data Available</h2>
            <p className="text-gray-600">Unable to load production efficiency analytics at this time.</p>
          </div>
        </div>
      </div>
    )
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600'
    if (efficiency >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEfficiencyBadgeColor = (efficiency: number) => {
    if (efficiency >= 90) return 'bg-green-100 text-green-800'
    if (efficiency >= 80) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Production Efficiency</h1>
              <p className="text-gray-600">Detailed production efficiency insights and optimization opportunities</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getEfficiencyColor(efficiencyData.overallEfficiency)}`}>
                {efficiencyData.overallEfficiency}%
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                +{efficiencyData.efficiencyGrowth}% from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Work Orders Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {efficiencyData.workOrdersCompleted.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                +12.3% from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Cycle Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {efficiencyData.averageCycleTime} days
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                -0.3 days from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipment Utilization</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {efficiencyData.equipmentUtilization}%
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                +2.1% from last period
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="performers">Top Performers</TabsTrigger>
            <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Efficiency Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {efficiencyData.monthlyTrend.map((month) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 text-sm font-medium">{month.month}</div>
                          <div className="flex-1">
                            <Progress 
                              value={month.efficiency} 
                              className="h-2"
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{month.efficiency}%</div>
                          <div className="text-sm text-muted-foreground">{month.orders} orders</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">On-Time Delivery</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{efficiencyData.onTimeDelivery}%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span className="font-medium">Defect Rate</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">{efficiencyData.qualityDefectRate}%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {efficiencyData.efficiencyByDepartment.map((dept) => (
                <Card key={dept.department}>
                  <CardHeader>
                    <CardTitle className="text-lg">{dept.department}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`text-3xl font-bold ${getEfficiencyColor(dept.efficiency)}`}>
                        {dept.efficiency}%
                      </div>
                      <Badge className={getEfficiencyBadgeColor(dept.efficiency)}>
                        {dept.trend === 'up' ? '↗' : dept.trend === 'down' ? '↘' : '→'}
                      </Badge>
                    </div>
                    <Progress value={dept.efficiency} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {efficiencyData.efficiencyByProduct.map((product) => (
                <Card key={product.product}>
                  <CardHeader>
                    <CardTitle className="text-lg">{product.product}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`text-3xl font-bold ${getEfficiencyColor(product.efficiency)}`}>
                        {product.efficiency}%
                      </div>
                      <Badge variant={
                        product.complexity === 'high' ? 'destructive' : 
                        product.complexity === 'medium' ? 'secondary' : 'default'
                      }>
                        {product.complexity} complexity
                      </Badge>
                    </div>
                    <Progress value={product.efficiency} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {efficiencyData.topPerformers.map((performer, index) => (
                    <div key={performer.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{performer.name}</div>
                          <div className="text-sm text-muted-foreground">{performer.department}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getEfficiencyColor(performer.efficiency)}`}>
                          {performer.efficiency}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {performer.ordersCompleted} orders
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bottlenecks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Process Bottlenecks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {efficiencyData.bottlenecks.map((bottleneck) => (
                    <div key={bottleneck.process} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          bottleneck.status === 'critical' ? 'bg-red-500' :
                          bottleneck.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <div className="font-medium">{bottleneck.process}</div>
                          <div className="text-sm text-muted-foreground">
                            {bottleneck.status === 'critical' ? 'Critical Impact' :
                             bottleneck.status === 'warning' ? 'Warning' : 'Normal'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{bottleneck.impact}% impact</div>
                        <div className="text-sm text-muted-foreground">on efficiency</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}