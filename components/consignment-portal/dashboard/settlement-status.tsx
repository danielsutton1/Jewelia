"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from "lucide-react"

export function SettlementStatus() {
  // This would be fetched from your API in a real application
  const settlementData = {
    pendingAmount: 2850,
    pendingCount: 3,
    lastSettlement: "Apr 15, 2024",
    nextSettlement: "May 15, 2024",
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Settlements</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${settlementData.pendingAmount}</div>
        <div className="text-xs text-muted-foreground">Pending settlement amount</div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Items: </span>
            <span className="font-medium">{settlementData.pendingCount}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Last: </span>
            <span className="font-medium">{settlementData.lastSettlement}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Next: </span>
            <span className="font-medium">{settlementData.nextSettlement}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
