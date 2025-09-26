"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Package,
  Factory,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"
import { SalesForecastChart } from "./sales-forecast-chart"
import { DemandPredictionChart } from "./demand-prediction-chart"
import { InventoryOptimizationChart } from "./inventory-optimization-chart"
import { ProductionCapacityChart } from "./production-capacity-chart"
import { DrillDownModal } from "./drill-down-modal"

interface PredictiveData {
  salesForecast: any[]
  demandPrediction: any[]
  inventoryOptimization: any[]
  productionCapacity: any
}

export function AdvancedAnalyticsDashboard() {
  const [data, setData] = useState<PredictiveData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [drillDownData, setDrillDownData] = useState<any>(null)
  const [showDrillDown, setShowDrillDown] = useState(false)

  useEffect(() => {
    fetchPredictiveData()
  }, [])

  const fetchPredictiveData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics/advanced?type=all-predictive')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch predictive data')
      }
      
      setData(result.data)
    } catch (err: any) {
      console.error('Error fetching predictive data:', err)
      setError(err.message || 'Failed to load predictive data')
    } finally {
      setLoading(false)
    }
  }

  const handleDrillDown = (metric: string, data: any) => {
    setSelectedMetric(metric)
    setDrillDownData(data)
    setShowDrillDown(true)
  }

  const handleExport = async (type: string) => {
    try {
      const response = await fetch(`/api/analytics/advanced/export?type=${type}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-analytics-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading advanced analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchPredictiveData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No predictive data available</p>
      </div>
    )
  }

  const { salesForecast, demandPrediction, inventoryOptimization, productionCapacity } = data

  // Transform data for chart components
  const demandChartData = demandPrediction.map((item: any) => ({
    productId: item.productCategory,
    productName: item.productCategory,
    predictedDemand: item.predictedDemand,
    confidence: 85, // Mock confidence
    trend: (item.riskLevel === 'high' ? 'increasing' : 'stable') as 'increasing' | 'decreasing' | 'stable'
  }))

  const inventoryChartData = inventoryOptimization.map((item: any) => ({
    productId: item.productId,
    productName: item.productName,
    currentStock: item.currentStock,
    optimalStock: item.optimalStock,
    reorderPoint: item.reorderPoint,
    recommendation: item.recommendation,
    stockoutRisk: item.stockoutRisk
  }))

  const capacityChartData = productionCapacity ? [{
    period: 'Current',
    currentCapacity: productionCapacity.currentCapacity,
    optimalCapacity: productionCapacity.currentCapacity * 1.5, // Mock optimal
    utilizationRate: productionCapacity.capacityUtilization,
    recommendation: productionCapacity.recommendedActions[0] || 'Monitor capacity'
  }] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Predictive insights and strategic recommendations
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchPredictiveData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => handleExport('all')}>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Key Insights Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
              onClick={() => handleDrillDown('sales', salesForecast)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Forecast</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${salesForecast[0]?.predictedRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Next period prediction
            </p>
            <div className="flex items-center mt-2">
              {salesForecast[0]?.growthRate > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={`text-xs ${salesForecast[0]?.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {salesForecast[0]?.growthRate || 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleDrillDown('demand', demandPrediction)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demand Prediction</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {demandPrediction.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Categories analyzed
            </p>
            <div className="flex items-center mt-2">
              <Badge variant={demandPrediction.some((d: any) => d.riskLevel === 'high') ? 'destructive' : 'secondary'}>
                {demandPrediction.filter((d: any) => d.riskLevel === 'high').length} High Risk
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleDrillDown('inventory', inventoryOptimization)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Optimization</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryOptimization.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Products optimized
            </p>
            <div className="flex items-center mt-2">
              <Badge variant="outline">
                ${inventoryOptimization.reduce((sum: number, item: any) => sum + item.excessStock, 0).toLocaleString()} Excess
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleDrillDown('capacity', productionCapacity)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Capacity</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productionCapacity?.capacityUtilization || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Utilization rate
            </p>
            <div className="flex items-center mt-2">
              <Badge variant={productionCapacity?.capacityUtilization > 90 ? 'destructive' : 'secondary'}>
                {productionCapacity?.bottleneckStages?.length || 0} Bottlenecks
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Forecast</TabsTrigger>
          <TabsTrigger value="demand">Demand Prediction</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Optimization</TabsTrigger>
          <TabsTrigger value="capacity">Production Capacity</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Forecast & Trends</CardTitle>
              <CardDescription>
                Revenue predictions with confidence intervals and growth factors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalesForecastChart data={salesForecast} onDrillDown={handleDrillDown} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demand Prediction by Category</CardTitle>
              <CardDescription>
                Predicted demand vs current stock with risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DemandPredictionChart data={demandChartData} loading={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Optimization</CardTitle>
              <CardDescription>
                Stock level recommendations and excess inventory analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryOptimizationChart data={inventoryChartData} loading={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Capacity Planning</CardTitle>
              <CardDescription>
                Capacity utilization analysis and bottleneck identification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductionCapacityChart data={capacityChartData} loading={false} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Drill-Down Modal */}
      {showDrillDown && (
        <DrillDownModal
          isOpen={showDrillDown}
          onClose={() => setShowDrillDown(false)}
          metric={selectedMetric}
          data={drillDownData}
          onExport={handleExport}
        />
      )}
    </div>
  )
} 