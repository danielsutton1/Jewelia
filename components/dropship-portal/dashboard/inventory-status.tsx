"use client"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function InventoryStatus() {
  // Mock data for inventory status
  const inventoryData = {
    totalProducts: 1284,
    inStock: 1102,
    lowStock: 98,
    outOfStock: 84,
    stockPercentage: 86,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Inventory Status</h3>
          <p className="text-sm text-muted-foreground">Current stock levels across all products</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {inventoryData.stockPercentage}% In Stock
        </Badge>
      </div>

      <Progress value={inventoryData.stockPercentage} className="h-2" />

      <div className="grid grid-cols-3 gap-4 pt-2">
        <div className="rounded-lg border p-3">
          <div className="text-xs font-medium text-muted-foreground">In Stock</div>
          <div className="mt-1 flex items-center gap-1">
            <div className="text-xl font-bold">{inventoryData.inStock}</div>
            <div className="text-xs text-muted-foreground">items</div>
          </div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs font-medium text-muted-foreground">Low Stock</div>
          <div className="mt-1 flex items-center gap-1">
            <div className="text-xl font-bold text-amber-600">{inventoryData.lowStock}</div>
            <div className="text-xs text-muted-foreground">items</div>
          </div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs font-medium text-muted-foreground">Out of Stock</div>
          <div className="mt-1 flex items-center gap-1">
            <div className="text-xl font-bold text-red-600">{inventoryData.outOfStock}</div>
            <div className="text-xs text-muted-foreground">items</div>
          </div>
        </div>
      </div>
    </div>
  )
}
