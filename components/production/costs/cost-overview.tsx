"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowUpRight, ArrowDownRight, AlertTriangle, DollarSign, TrendingUp, Percent } from "lucide-react"
import { mockCostData } from "./mock-data"

export function CostOverview({ filters }: { filters: any }) {
  // In a real app, you would fetch this data based on the filters
  const data = mockCostData

  // Calculate summary metrics
  const totalActualCost = data.costCategories.reduce((sum, category) => sum + category.actualCost, 0)
  const totalEstimatedCost = data.costCategories.reduce((sum, category) => sum + category.estimatedCost, 0)
  const costVariance = totalActualCost - totalEstimatedCost
  const costVariancePercent = (costVariance / totalEstimatedCost) * 100

  const totalRevenue = data.profitability.revenue
  const grossProfit = totalRevenue - totalActualCost
  const grossMargin = (grossProfit / totalRevenue) * 100

  const previousPeriodCost = data.trends.previousPeriodCost
  const costTrend = ((totalActualCost - previousPeriodCost) / previousPeriodCost) * 100

  // Find significant variances
  const significantVariances = data.costCategories
    .filter((category) => {
      const variance = category.actualCost - category.estimatedCost
      const variancePercent = (variance / category.estimatedCost) * 100
      return Math.abs(variancePercent) > 10 // Consider >10% variance as significant
    })
    .sort((a, b) => {
      const varianceA = Math.abs((a.actualCost - a.estimatedCost) / a.estimatedCost)
      const varianceB = Math.abs((b.actualCost - b.estimatedCost) / b.estimatedCost)
      return varianceB - varianceA
    })

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Production Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalActualCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={costVariance > 0 ? "text-red-500" : "text-green-500"}>
                {costVariance > 0 ? (
                  <ArrowUpRight className="mr-1 inline h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-1 inline h-3 w-3" />
                )}
                {Math.abs(costVariancePercent).toFixed(1)}%
              </span>{" "}
              vs. estimated (${totalEstimatedCost.toLocaleString()})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${grossProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From ${totalRevenue.toLocaleString()} in revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grossMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Target: {data.profitability.targetMargin}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={costTrend > 0 ? "text-red-500" : "text-green-500"}>
                {costTrend > 0 ? "+" : ""}
                {costTrend.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Compared to previous period</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
          <CardDescription>Breakdown of costs by category for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="actual">
            <TabsList className="mb-4">
              <TabsTrigger value="actual">Actual Costs</TabsTrigger>
              <TabsTrigger value="estimated">Estimated Costs</TabsTrigger>
              <TabsTrigger value="variance">Variance</TabsTrigger>
            </TabsList>

            <TabsContent value="actual">
              <div className="space-y-4">
                {data.costCategories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">${category.actualCost.toLocaleString()}</span>
                      </div>
                      <span className="text-sm">{((category.actualCost / totalActualCost) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(category.actualCost / totalActualCost) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="estimated">
              <div className="space-y-4">
                {data.costCategories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ${category.estimatedCost.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-sm">
                        {((category.estimatedCost / totalEstimatedCost) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={(category.estimatedCost / totalEstimatedCost) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="variance">
              <div className="space-y-4">
                {data.costCategories.map((category) => {
                  const variance = category.actualCost - category.estimatedCost
                  const variancePercent = (variance / category.estimatedCost) * 100
                  return (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{category.name}</span>
                          <span className={variance > 0 ? "text-red-500" : "text-green-500"}>
                            {variance > 0 ? "+" : ""}${variance.toLocaleString()}
                          </span>
                        </div>
                        <span className={variance > 0 ? "text-red-500" : "text-green-500"}>
                          {variancePercent > 0 ? "+" : ""}
                          {variancePercent.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={50 + variancePercent / 2}
                        className={`h-2 ${variance > 0 ? "bg-red-100" : "bg-green-100"}`}
                      />
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Variance Alerts */}
      {significantVariances.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Cost Variance Alerts</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {significantVariances.map((category) => {
                const variance = category.actualCost - category.estimatedCost
                const variancePercent = (variance / category.estimatedCost) * 100
                return (
                  <div key={category.id} className="flex items-center justify-between rounded-md bg-destructive/10 p-2">
                    <span>{category.name}</span>
                    <Badge variant={variance > 0 ? "destructive" : "outline"}>
                      {variance > 0 ? "+" : ""}
                      {variancePercent.toFixed(1)}% (${variance.toLocaleString()})
                    </Badge>
                  </div>
                )
              })}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
