"use client"

import { AlertTriangle, ArrowUpRight, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// Sample low stock data
const lowStockItems = [
  {
    id: "M004",
    name: "Platinum",
    category: "metal",
    currentStock: 50,
    unit: "g",
    minThreshold: 100,
    reorderPoint: 75,
    trend: "decreasing",
    estimatedDaysRemaining: 14,
  },
  {
    id: "S003",
    name: "Emerald Square 0.75ct",
    category: "stones",
    currentStock: 5,
    unit: "pcs",
    minThreshold: 10,
    reorderPoint: 8,
    trend: "stable",
    estimatedDaysRemaining: 21,
  },
  {
    id: "F004",
    name: 'Box Chain 18"',
    category: "findings",
    currentStock: 20,
    unit: "pcs",
    minThreshold: 50,
    reorderPoint: 30,
    trend: "decreasing",
    estimatedDaysRemaining: 10,
  },
]

export function LowStockWarnings() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Low Stock Warnings
        </CardTitle>
        <CardDescription>Materials that need to be reordered soon</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          {lowStockItems.map((item) => {
            // Calculate percentage of stock remaining
            const stockPercentage = (item.currentStock / item.minThreshold) * 100

            return (
              <div key={item.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {item.currentStock} {item.unit}
                      {item.trend === "decreasing" && <TrendingDown className="h-3 w-3 text-red-500 inline ml-1" />}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Min: {item.minThreshold} {item.unit}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Progress
                    value={stockPercentage}
                    className="h-2"
                    // Color based on percentage
                    style={
                      {
                        backgroundColor: stockPercentage < 30 ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)",
                        "--progress-color": stockPercentage < 30 ? "rgb(239, 68, 68)" : "rgb(245, 158, 11)",
                      } as any
                    }
                  />
                  <p className="text-xs text-muted-foreground">Est. {item.estimatedDaysRemaining} days remaining</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
      <div>
        <Button variant="outline" className="w-full text-xs" size="sm">
          View All Low Stock Items
          <ArrowUpRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </Card>
  )
}
