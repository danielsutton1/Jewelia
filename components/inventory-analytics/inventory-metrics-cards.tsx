"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, DollarSign, Package, PercentIcon, AlertTriangle, TrendingDown } from "lucide-react"

export function InventoryMetricsCards() {
  return (
    <div className="w-full overflow-x-auto md:overflow-visible">
      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 min-w-[800px] md:min-w-0 flex-nowrap">
        <Card className="flex-shrink-0 w-80 md:w-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium inventory-metrics-title">Total Inventory Value</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold inventory-metrics-number">$1,245,890</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 flex items-center">
                <ArrowUp className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
                +5.2%
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card className="flex-shrink-0 w-80 md:w-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium inventory-metrics-title">Turnover Ratio</CardTitle>
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold inventory-metrics-number">3.7x</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 flex items-center">
                <ArrowUp className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
                +0.3x
              </span>{" "}
              from last quarter
            </p>
          </CardContent>
        </Card>

        <Card className="flex-shrink-0 w-80 md:w-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium inventory-metrics-title">Carrying Costs</CardTitle>
            <PercentIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold inventory-metrics-number">$24,918</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive flex items-center">
                <ArrowUp className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
                +2.1%
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card className="flex-shrink-0 w-80 md:w-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium inventory-metrics-title">Stockout Incidents</CardTitle>
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold inventory-metrics-number">12</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 flex items-center">
                <ArrowDown className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
                -3
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card className="flex-shrink-0 w-80 md:w-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium inventory-metrics-title">Excess Inventory</CardTitle>
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold inventory-metrics-number">$87,450</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 flex items-center">
                <ArrowDown className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
                -8.3%
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
