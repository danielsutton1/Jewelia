"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag } from "lucide-react"

export function InventorySummary() {
  // This would be fetched from your API in a real application
  const inventoryData = {
    totalItems: 32,
    activeItems: 28,
    soldItems: 4,
    returningItems: 2,
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Inventory</CardTitle>
        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{inventoryData.totalItems}</div>
        <div className="text-xs text-muted-foreground">Total items on consignment</div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Active: </span>
            <span className="font-medium">{inventoryData.activeItems}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Sold: </span>
            <span className="font-medium">{inventoryData.soldItems}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Returning: </span>
            <span className="font-medium">{inventoryData.returningItems}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
