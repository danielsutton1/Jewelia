"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

export function SalesPerformance() {
  // This would be fetched from your API in a real application
  const salesData = {
    monthlySales: 3,
    totalSales: 12,
    averageDaysToSell: 28,
    percentChange: 25,
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Sales</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{salesData.monthlySales}</div>
        <div className="text-xs text-muted-foreground">Items sold this month</div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Total: </span>
            <span className="font-medium">{salesData.totalSales}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Avg Days: </span>
            <span className="font-medium">{salesData.averageDaysToSell}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Change: </span>
            <span className="font-medium text-green-600">+{salesData.percentChange}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
