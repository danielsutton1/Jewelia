"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Percent } from "lucide-react"

export function CommissionSummary() {
  // This would be fetched from your API in a real application
  const commissionData = {
    totalEarned: 8750,
    yearToDate: 3250,
    lastMonth: 1200,
    averageRate: 30,
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Commission</CardTitle>
        <Percent className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${commissionData.yearToDate}</div>
        <div className="text-xs text-muted-foreground">Year-to-date earnings</div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Total: </span>
            <span className="font-medium">${commissionData.totalEarned}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Last Month: </span>
            <span className="font-medium">${commissionData.lastMonth}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Avg Rate: </span>
            <span className="font-medium">{commissionData.averageRate}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
