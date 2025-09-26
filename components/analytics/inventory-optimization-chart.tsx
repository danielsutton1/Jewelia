"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, AlertTriangle, CheckCircle } from "lucide-react"

interface InventoryOptimizationData {
  productId: string
  productName: string
  currentStock: number
  optimalStock: number
  reorderPoint: number
  recommendation: string
  stockoutRisk: number
}

interface InventoryOptimizationChartProps {
  data: InventoryOptimizationData[]
  loading?: boolean
}

export function InventoryOptimizationChart({ data, loading }: InventoryOptimizationChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventory Optimization
          </CardTitle>
          <CardDescription>Inventory optimization recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="text-muted-foreground">Loading inventory optimization...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Inventory Optimization
        </CardTitle>
        <CardDescription>Inventory optimization recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length > 0 ? (
            data.map((item) => (
              <div key={item.productId} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{item.productName}</h4>
                  <p className="text-sm text-muted-foreground">
                    Current: {item.currentStock} | Optimal: {item.optimalStock}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.recommendation}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {item.stockoutRisk > 0.7 ? (
                    <Badge variant="destructive">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      High Risk
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Normal
                    </Badge>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No inventory optimization data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 