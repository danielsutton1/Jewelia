"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  Package,
  Factory,
  BarChart3,
  Calendar,
  Users,
  Target
} from "lucide-react"

interface DrillDownModalProps {
  isOpen: boolean
  onClose: () => void
  metric: string | null
  data: any
  onExport: (type: string) => void
}

export function DrillDownModal({ isOpen, onClose, metric, data, onExport }: DrillDownModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!metric || !data) return null

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'sales':
        return <DollarSign className="h-6 w-6" />
      case 'demand':
        return <Package className="h-6 w-6" />
      case 'inventory':
        return <BarChart3 className="h-6 w-6" />
      case 'capacity':
        return <Factory className="h-6 w-6" />
      default:
        return <BarChart3 className="h-6 w-6" />
    }
  }

  const getMetricTitle = (metric: string) => {
    switch (metric) {
      case 'sales':
        return 'Sales Forecast Analysis'
      case 'demand':
        return 'Demand Prediction Analysis'
      case 'inventory':
        return 'Inventory Optimization Analysis'
      case 'capacity':
        return 'Production Capacity Analysis'
      default:
        return 'Analytics Analysis'
    }
  }

  const renderSalesAnalysis = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            ${data[0]?.predictedRevenue?.toLocaleString() || '0'}
          </div>
          <p className="text-sm text-muted-foreground">Next Period</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {data[0]?.growthRate || 0}%
          </div>
          <p className="text-sm text-muted-foreground">Growth Rate</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {data.length}
          </div>
          <p className="text-sm text-muted-foreground">Forecast Periods</p>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Growth Factors</h4>
        <div className="space-y-2">
          {data[0]?.factors?.map((factor: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">{factor}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Confidence Intervals</h4>
        <div className="space-y-2">
          {data.slice(0, 5).map((item: any, index: number) => (
            <div key={index} className="flex justify-between items-center p-2 border rounded">
              <span className="text-sm font-medium">{item.period}</span>
              <span className="text-sm text-muted-foreground">
                ${item.confidenceInterval.lower.toLocaleString()} - ${item.confidenceInterval.upper.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderDemandAnalysis = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {data.length}
          </div>
          <p className="text-sm text-muted-foreground">Categories Analyzed</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {data.filter((item: any) => item.riskLevel === 'high').length}
          </div>
          <p className="text-sm text-muted-foreground">High Risk Items</p>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Demand by Category</h4>
        <div className="space-y-3">
          {data.map((item: any, index: number) => (
            <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="font-medium">{item.productCategory}</p>
                <p className="text-sm text-muted-foreground">
                  Current Stock: {item.currentStock}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{item.predictedDemand}</p>
                <Badge variant={item.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                  {item.riskLevel.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderInventoryAnalysis = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {data.length}
          </div>
          <p className="text-sm text-muted-foreground">Products Analyzed</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            ${data.reduce((sum: number, item: any) => sum + item.excessStock, 0).toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">Excess Stock Value</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {data.filter((item: any) => item.stockoutRisk > 0.3).length}
          </div>
          <p className="text-sm text-muted-foreground">High Stockout Risk</p>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Optimization Recommendations</h4>
        <div className="space-y-3">
          {data.slice(0, 10).map((item: any, index: number) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium">{item.productName}</p>
                <Badge variant={item.stockoutRisk > 0.3 ? 'destructive' : 'secondary'}>
                  {item.stockoutRisk > 0.3 ? 'HIGH RISK' : 'LOW RISK'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Current Stock</p>
                  <p className="font-medium">{item.currentStock}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Optimal Stock</p>
                  <p className="font-medium">{item.optimalStock}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Recommendation:</strong> {item.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderCapacityAnalysis = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {data?.currentCapacity || 0}
          </div>
          <p className="text-sm text-muted-foreground">Current Capacity</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold">
            {data?.capacityUtilization || 0}%
          </div>
          <p className="text-sm text-muted-foreground">Utilization Rate</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {data?.bottleneckStages?.length || 0}
          </div>
          <p className="text-sm text-muted-foreground">Bottlenecks</p>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Bottleneck Analysis</h4>
        <div className="space-y-2">
          {data?.bottleneckStages?.map((stage: string, index: number) => (
            <div key={index} className="flex items-center space-x-2 p-2 border rounded">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm">{stage}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Recommended Actions</h4>
        <div className="space-y-3">
          <div>
            <h5 className="font-medium text-sm mb-2">Short Term</h5>
            <div className="space-y-1">
              {data?.timeline?.shortTerm?.map((action: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-sm">{action}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h5 className="font-medium text-sm mb-2">Medium Term</h5>
            <div className="space-y-1">
              {data?.timeline?.mediumTerm?.map((action: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <Target className="h-3 w-3 text-blue-600" />
                  <span className="text-sm">{action}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h5 className="font-medium text-sm mb-2">Long Term</h5>
            <div className="space-y-1">
              {data?.timeline?.longTerm?.map((action: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <TrendingUp className="h-3 w-3 text-purple-600" />
                  <span className="text-sm">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (metric) {
      case 'sales':
        return renderSalesAnalysis()
      case 'demand':
        return renderDemandAnalysis()
      case 'inventory':
        return renderInventoryAnalysis()
      case 'capacity':
        return renderCapacityAnalysis()
      default:
        return <p>No detailed analysis available</p>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getMetricIcon(metric)}
            <span>{getMetricTitle(metric)}</span>
          </DialogTitle>
          <DialogDescription>
            Detailed analysis and insights for {metric} metrics
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center mb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={() => onExport(metric)} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-4">
          {renderContent()}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">Raw Data</h4>
            <pre className="text-xs overflow-auto max-h-64">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Key Insights</h4>
              <ul className="space-y-2 text-sm">
                <li>• Data based on real business metrics</li>
                <li>• Predictive models use historical patterns</li>
                <li>• Confidence intervals provide risk assessment</li>
                <li>• Recommendations are actionable</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Next Steps</h4>
              <ul className="space-y-2 text-sm">
                <li>• Review recommendations</li>
                <li>• Implement suggested actions</li>
                <li>• Monitor performance changes</li>
                <li>• Update forecasts regularly</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </DialogContent>
    </Dialog>
  )
} 