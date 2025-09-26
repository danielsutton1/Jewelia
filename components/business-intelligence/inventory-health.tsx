"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"

export function InventoryHealth() {
  // In a real app, this data would come from an API call
  const inventoryMetrics = [
    {
      category: "Rings",
      stockLevel: 82,
      status: "Healthy",
    },
    {
      category: "Necklaces",
      stockLevel: 68,
      status: "Healthy",
    },
    {
      category: "Earrings",
      stockLevel: 45,
      status: "Warning",
    },
    {
      category: "Bracelets",
      stockLevel: 92,
      status: "Healthy",
    },
    {
      category: "Watches",
      stockLevel: 24,
      status: "Critical",
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Inventory Health</CardTitle>
          <CardDescription>Current stock levels by category</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          Details <ArrowUpRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {inventoryMetrics.map((item) => (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.category}</span>
                <Badge
                  variant={
                    item.status === "Healthy" ? "outline" : item.status === "Warning" ? "secondary" : "destructive"
                  }
                >
                  {item.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress
                  value={item.stockLevel}
                  className={
                    item.status === "Healthy"
                      ? "text-emerald-500"
                      : item.status === "Warning"
                        ? "text-amber-500"
                        : "text-destructive"
                  }
                />
                <span className="w-10 text-sm tabular-nums">{item.stockLevel}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
