"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Plus,
  Brain,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ForecastData {
  period: string
  totalDemand: number
  currentInventory: number
  projectedShortage: number
  accuracy: number
  demandForecast: Array<{
    material: string
    currentDemand: number
    projectedDemand: number
    growth: number
    confidence: number
  }>
  seasonalTrends: Array<{
    month: string
    demand: number
    trend: "up" | "down" | "stable"
  }>
  recommendations: Array<{
    type: "increase" | "decrease" | "maintain"
    material: string
    action: string
    impact: string
    priority: "high" | "medium" | "low"
  }>
}

// Sample forecast data
const sampleForecastData: ForecastData = {
  period: "Q2 2024",
  totalDemand: 85000,
  currentInventory: 125000,
  projectedShortage: 15000,
  accuracy: 87,
  demandForecast: [
    { material: "14K Yellow Gold", currentDemand: 25000, projectedDemand: 32000, growth: 28, confidence: 92 },
    { material: "Diamond 1ct Round", currentDemand: 8500, projectedDemand: 12000, growth: 41, confidence: 85 },
    { material: "18K White Gold", currentDemand: 18000, projectedDemand: 22000, growth: 22, confidence: 88 },
    { material: "Sapphire 2ct Oval", currentDemand: 4200, projectedDemand: 5800, growth: 38, confidence: 78 },
    { material: "Platinum", currentDemand: 3800, projectedDemand: 4200, growth: 11, confidence: 95 }
  ],
  seasonalTrends: [
    { month: "Apr", demand: 28000, trend: "up" },
    { month: "May", demand: 32000, trend: "up" },
    { month: "Jun", demand: 25000, trend: "down" },
    { month: "Jul", demand: 22000, trend: "down" },
    { month: "Aug", demand: 24000, trend: "stable" },
    { month: "Sep", demand: 28000, trend: "up" }
  ],
  recommendations: [
    {
      type: "increase",
      material: "14K Yellow Gold",
      action: "Increase order by 25%",
      impact: "Prevent stockout during peak season",
      priority: "high"
    },
    {
      type: "increase",
      material: "Diamond 1ct Round",
      action: "Place advance order for 3 units",
      impact: "Ensure availability for premium orders",
      priority: "high"
    },
    {
      type: "maintain",
      material: "18K White Gold",
      action: "Maintain current order levels",
      impact: "Stable demand pattern",
      priority: "medium"
    },
    {
      type: "decrease",
      material: "Platinum",
      action: "Reduce order by 10%",
      impact: "Lower demand expected",
      priority: "low"
    }
  ]
}

export function MaterialForecasting() {
  const [data, setData] = useState<ForecastData>(sampleForecastData)

  const handleRefreshForecast = () => {
    toast({ title: "Forecast Updated", description: "Material demand forecast has been refreshed." })
  }

  const handleExportForecast = () => {
    toast({ title: "Export Started", description: "Forecast data export has been initiated." })
  }

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case "down":
        return <ArrowDownRight className="h-4 w-4 text-red-600" />
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800">Medium</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "increase":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "decrease":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "maintain":
        return <BarChart3 className="h-4 w-4 text-blue-600" />
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Material Forecasting</h2>
          <p className="text-muted-foreground">AI-powered demand forecasting and inventory planning</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefreshForecast} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExportForecast} aria-label="Export">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Forecast Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Demand</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalDemand.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.period} projection
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Inventory</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.currentInventory.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Available stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Shortage</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">${data.projectedShortage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Potential stockout risk
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forecast Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.accuracy}%</div>
            <p className="text-xs text-muted-foreground">
              AI model confidence
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Alerts */}
      {data.projectedShortage > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Inventory Shortage Predicted</AlertTitle>
          <AlertDescription>
            Projected shortage of ${data.projectedShortage.toLocaleString()} in {data.period}. Review recommendations to prevent stockouts.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="demand" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demand">Demand Forecast</TabsTrigger>
          <TabsTrigger value="trends">Seasonal Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="demand" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Material Demand Forecast</CardTitle>
              <CardDescription>Projected demand for key materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.demandForecast.map((forecast) => (
                  <div key={forecast.material} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium">{forecast.material}</div>
                        <div className="text-sm text-muted-foreground">
                          Current: ${forecast.currentDemand.toLocaleString()} • Projected: ${forecast.projectedDemand.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Confidence: {forecast.confidence}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-medium ${forecast.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {forecast.growth > 0 ? '+' : ''}{forecast.growth}%
                      </div>
                      <div className="text-sm text-muted-foreground">Growth</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Demand Trends</CardTitle>
              <CardDescription>Monthly demand patterns and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end justify-between h-32 border-b border-l">
                  {data.seasonalTrends.map((trend, index) => (
                    <div key={trend.month} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-primary rounded-t"
                        style={{ height: `${(trend.demand / 35000) * 100}%` }}
                      />
                      <div className="text-xs mt-2">{trend.month}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">+15%</div>
                    <div className="text-xs text-muted-foreground">Peak Season Growth</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">$27.5K</div>
                    <div className="text-xs text-muted-foreground">Monthly Average</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">May</div>
                  <div className="text-xs text-muted-foreground">Peak Month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>Actionable recommendations based on forecast analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getRecommendationIcon(rec.type)}
                      <div>
                        <div className="font-medium">{rec.material}</div>
                        <div className="text-sm text-muted-foreground">{rec.action}</div>
                        <div className="text-xs text-muted-foreground">{rec.impact}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(rec.priority)}
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
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>Machine learning analysis and predictions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Demand Pattern Recognition</h4>
                    <p className="text-sm text-blue-700">
                      Wedding season (May-June) shows 25% increase in gold demand. Consider advance ordering.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Optimization Opportunity</h4>
                    <p className="text-sm text-green-700">
                      Diamond demand correlates with engagement ring trends. Stock up for Valentine's Day.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900">Risk Assessment</h4>
                    <p className="text-sm text-amber-700">
                      Platinum demand declining due to price sensitivity. Consider alternative metals.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forecast Accuracy</CardTitle>
                <CardDescription>Model performance and confidence metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Overall Accuracy</span>
                    <span className="text-sm font-medium">{data.accuracy}%</span>
                  </div>
                  <Progress value={data.accuracy} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Gold Forecast</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Diamond Forecast</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Gemstone Forecast</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Model Improvements</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Enhanced seasonal pattern recognition</li>
                    <li>• Improved price sensitivity analysis</li>
                    <li>• Better correlation with market trends</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
 