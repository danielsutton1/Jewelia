"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Package } from "lucide-react"

interface DemandPredictionData {
  productId: string
  productName: string
  predictedDemand: number
  confidence: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

interface DemandPredictionChartProps {
  data: DemandPredictionData[]
  loading?: boolean
}

export function DemandPredictionChart({ data, loading }: DemandPredictionChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Demand Prediction
          </CardTitle>
          <CardDescription>Predicted demand for jewelry products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="text-muted-foreground">Loading demand predictions...</div>
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
          Demand Prediction
        </CardTitle>
        <CardDescription>Predicted demand for jewelry products</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length > 0 ? (
            data.map((item) => (
              <div key={item.productId} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{item.productName}</h4>
                  <p className="text-sm text-muted-foreground">
                    Predicted demand: {item.predictedDemand} units
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.trend === 'increasing' ? 'default' : 'secondary'}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {item.confidence}% confidence
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No demand prediction data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 