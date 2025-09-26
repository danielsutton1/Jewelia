"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Factory, Clock, TrendingUp } from "lucide-react"

interface ProductionCapacityData {
  period: string
  currentCapacity: number
  optimalCapacity: number
  utilizationRate: number
  recommendation: string
}

interface ProductionCapacityChartProps {
  data: ProductionCapacityData[]
  loading?: boolean
}

export function ProductionCapacityChart({ data, loading }: ProductionCapacityChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5" />
            Production Capacity Planning
          </CardTitle>
          <CardDescription>Production capacity analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="text-muted-foreground">Loading production capacity...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Factory className="w-5 h-5" />
          Production Capacity Planning
        </CardTitle>
        <CardDescription>Production capacity analysis and recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length > 0 ? (
            data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{item.period}</h4>
                  <p className="text-sm text-muted-foreground">
                    Current: {item.currentCapacity} | Optimal: {item.optimalCapacity}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.recommendation}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.utilizationRate > 80 ? 'default' : 'secondary'}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {item.utilizationRate}% utilized
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No production capacity data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 