"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3,
  Target,
  Users,
  DollarSign,
  Package,
  Settings,
  RefreshCw,
  FileText,
  Calendar,
  Bell
} from "lucide-react"
import type { 
  ExecutiveSummary, 
  ComparativeAnalysis, 
  PerformanceBenchmark,
  AlertRule 
} from "@/lib/services/EnhancedAnalyticsService"

interface EnhancedAnalyticsData {
  executiveSummary?: ExecutiveSummary
  comparativeAnalysis?: ComparativeAnalysis
  performanceBenchmarks?: PerformanceBenchmark[]
  activeAlerts?: Array<{
    severity: string
    message: string
    metric: string
    value: number
    timestamp: string
  }>
}

export function EnhancedAnalyticsDashboard() {
  const [data, setData] = useState<EnhancedAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("executive")
  const [exporting, setExporting] = useState(false)
  const [scheduling, setScheduling] = useState(false)

  useEffect(() => {
    fetchEnhancedData()
  }, [])

  const fetchEnhancedData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch all enhanced analytics data
      const [executiveSummary, comparativeAnalysis, performanceBenchmarks, activeAlerts] = await Promise.all([
        fetch('/api/analytics/enhanced?type=executive-summary').then(r => r.json()),
        fetch('/api/analytics/enhanced?type=comparative-analysis&currentStart=2024-01-01&currentEnd=2024-03-31&previousStart=2023-10-01&previousEnd=2023-12-31').then(r => r.json()),
        fetch('/api/analytics/enhanced?type=performance-benchmarks').then(r => r.json()),
        fetch('/api/analytics/enhanced?type=active-alerts').then(r => r.json())
      ])

      setData({
        executiveSummary: executiveSummary.success ? executiveSummary.data : undefined,
        comparativeAnalysis: comparativeAnalysis.success ? comparativeAnalysis.data : undefined,
        performanceBenchmarks: performanceBenchmarks.success ? performanceBenchmarks.data : undefined,
        activeAlerts: activeAlerts.success ? activeAlerts.data : undefined
      })
    } catch (err: any) {
      console.error('Error fetching enhanced analytics data:', err)
      setError(err.message || 'Failed to load enhanced analytics data')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (type: string, format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      setExporting(true)
      
      const response = await fetch('/api/analytics/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export',
          type,
          options: {
            format,
            includeCharts: true,
            includeFilters: true
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // In a real implementation, this would download the file
        alert(`Export completed: ${result.data.filename}`)
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const handleScheduleReport = async () => {
    try {
      setScheduling(true)
      
      const response = await fetch('/api/analytics/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'schedule-report',
          reportType: 'executive-summary',
          schedule: {
            frequency: 'weekly',
            time: '09:00',
            recipients: ['admin@jewelia.com'],
            format: 'pdf'
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Report scheduled successfully!')
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error('Schedule failed:', error)
      alert('Failed to schedule report. Please try again.')
    } finally {
      setScheduling(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'average': return 'text-yellow-600'
      case 'below_average': return 'text-orange-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading enhanced analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Error loading enhanced analytics: {error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Analytics</h1>
          <p className="text-muted-foreground">
            Advanced business intelligence with predictive insights and automated reporting
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchEnhancedData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleScheduleReport} disabled={scheduling}>
            <Calendar className="mr-2 h-4 w-4" />
            {scheduling ? 'Scheduling...' : 'Schedule Report'}
          </Button>
        </div>
      </div>

      {/* Active Alerts */}
      {data?.activeAlerts && data.activeAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Bell className="h-5 w-5" />
              Active Alerts ({data.activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.activeAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`} />
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.metric}: {alert.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(alert.timestamp).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="executive">Executive Summary</TabsTrigger>
          <TabsTrigger value="comparative">Comparative Analysis</TabsTrigger>
          <TabsTrigger value="benchmarks">Performance Benchmarks</TabsTrigger>
          <TabsTrigger value="export">Export & Reports</TabsTrigger>
        </TabsList>

        {/* Executive Summary Tab */}
        <TabsContent value="executive" className="space-y-6">
          {data?.executiveSummary && (
            <>
              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${data.executiveSummary.keyMetrics.revenue.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {data.executiveSummary.keyMetrics.growth > 0 ? '+' : ''}
                      {(data.executiveSummary.keyMetrics.growth * 100).toFixed(1)}% growth
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Orders</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {data.executiveSummary.keyMetrics.orders.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active orders
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Customers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {data.executiveSummary.keyMetrics.customers.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active customers
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(data.executiveSummary.keyMetrics.efficiency * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Production efficiency
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performers */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.executiveSummary.topPerformers.products.map((product, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{product.name}</span>
                          <span className="text-sm text-muted-foreground">
                            ${product.revenue.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Customers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.executiveSummary.topPerformers.customers.map((customer, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{customer.name}</span>
                          <span className="text-sm text-muted-foreground">
                            ${customer.value.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.executiveSummary.topPerformers.categories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-sm text-muted-foreground">
                            ${category.revenue.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Strategic Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.executiveSummary.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <Badge variant={rec.impact === 'high' ? 'destructive' : rec.impact === 'medium' ? 'default' : 'secondary'}>
                            {rec.impact} impact
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                        </div>
                        <Badge variant="outline">{rec.effort} effort</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Comparative Analysis Tab */}
        <TabsContent value="comparative" className="space-y-6">
          {data?.comparativeAnalysis && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Period Comparison</CardTitle>
                  <CardDescription>
                    Current: {data.comparativeAnalysis.currentPeriod.start} to {data.comparativeAnalysis.currentPeriod.end} | 
                    Previous: {data.comparativeAnalysis.previousPeriod.start} to {data.comparativeAnalysis.previousPeriod.end}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(data.comparativeAnalysis.changes).map(([metric, change]) => (
                      <div key={metric} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{metric}</span>
                          {change.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : change.trend === 'down' ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : (
                            <div className="h-4 w-4" />
                          )}
                        </div>
                        <div className="text-2xl font-bold">
                          {change.percentage > 0 ? '+' : ''}{change.percentage.toFixed(1)}%
                        </div>
                        <Progress 
                          value={Math.abs(change.percentage)} 
                          className={change.trend === 'up' ? 'bg-green-100' : 'bg-red-100'}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.comparativeAnalysis.insights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          insight.impact === 'positive' ? 'bg-green-500' : 
                          insight.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium">{insight.insight}</h4>
                          {insight.recommendation && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Recommendation: {insight.recommendation}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Performance Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-6">
          {data?.performanceBenchmarks && (
            <div className="space-y-6">
              {data.performanceBenchmarks.map((benchmark, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {benchmark.metric}
                      <Badge className={getPerformanceColor(benchmark.performance)}>
                        {benchmark.performance.replace('_', ' ')}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm font-medium">Current Value</p>
                        <p className="text-2xl font-bold">{benchmark.currentValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Benchmark</p>
                        <p className="text-lg">{benchmark.benchmarkValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Industry Average</p>
                        <p className="text-lg">{benchmark.industryAverage.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Percentile</p>
                        <p className="text-lg">{benchmark.percentile.toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {benchmark.recommendations.map((rec, recIndex) => (
                          <div key={recIndex} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="font-medium">{rec.action}</p>
                              <p className="text-sm text-muted-foreground">{rec.expectedImpact}</p>
                            </div>
                            <Badge variant="outline">{rec.effort} effort</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Export & Reports Tab */}
        <TabsContent value="export" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Export Analytics Data</CardTitle>
                <CardDescription>
                  Export your analytics data in various formats for reporting and analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Available Formats</h4>
                  <div className="grid gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleExport('dashboard', 'csv')}
                      disabled={exporting}
                      className="justify-start"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Dashboard (CSV)
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleExport('customers', 'xlsx')}
                      disabled={exporting}
                      className="justify-start"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Customer Analytics (Excel)
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleExport('sales', 'pdf')}
                      disabled={exporting}
                      className="justify-start"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Sales Analytics (PDF)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automated Reports</CardTitle>
                <CardDescription>
                  Schedule automated report generation and delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Report Types</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Executive Summary</p>
                        <p className="text-sm text-muted-foreground">Weekly business overview</p>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Sales Performance</p>
                        <p className="text-sm text-muted-foreground">Monthly sales analysis</p>
                      </div>
                      <Badge variant="secondary">Inactive</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Production Metrics</p>
                        <p className="text-sm text-muted-foreground">Daily production status</p>
                      </div>
                      <Badge variant="secondary">Inactive</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Analytics Engine</p>
                    <p className="text-sm text-muted-foreground">Running normally</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Alert System</p>
                    <p className="text-sm text-muted-foreground">Monitoring active</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Cache System</p>
                    <p className="text-sm text-muted-foreground">85% hit rate</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 