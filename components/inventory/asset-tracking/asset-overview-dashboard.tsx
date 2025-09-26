"use client"

import {
  DollarSign,
  Package,
  CheckCircle,
  Truck,
  Hammer,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Asset } from "@/types/inventory"

// NOTE: In a real app, you would pass the asset data as props
// For this component, we will use the mock data to calculate the overview.

interface AssetOverviewDashboardProps {
  assets: Asset[]
}

const formatValue = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function AssetOverviewDashboard({
  assets,
}: AssetOverviewDashboardProps) {
  const totalAssets = assets.length
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0)

  const checkedOutCount = assets.filter(
    (asset) => asset.status === "with_partner" || !!asset.checkedOutBy
  ).length
  
  const inProductionCount = assets.filter(
    (asset) => asset.status === "in_production" || asset.status === "repair"
  ).length
  
  const availableCount = assets.filter(
    (asset) => asset.status === "available"
  ).length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAssets}</div>
          <p className="text-xs text-muted-foreground">
            {formatValue(totalValue)} total value
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Checked Out</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{checkedOutCount}</div>
          <p className="text-xs text-muted-foreground">
            Items with partners or employees
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Production</CardTitle>
          <Hammer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inProductionCount}</div>
          <p className="text-xs text-muted-foreground">
            Being worked on or repaired
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{availableCount}</div>
          <p className="text-xs text-muted-foreground">
            Ready to sell
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 
 