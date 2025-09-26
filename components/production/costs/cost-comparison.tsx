"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { mockCostData, mockWorkOrderCosts } from "./mock-data"

export function CostComparison({ filters }: { filters: any }) {
  // In a real app, you would fetch this data based on the filters
  const categoryData = mockCostData.costCategories
  const workOrderData = mockWorkOrderCosts

  // Calculate totals
  const totalEstimated = categoryData.reduce((sum, category) => sum + category.estimatedCost, 0)
  const totalActual = categoryData.reduce((sum, category) => sum + category.actualCost, 0)
  const totalVariance = totalActual - totalEstimated
  const totalVariancePercent = (totalVariance / totalEstimated) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Actual vs. Estimated Costs</CardTitle>
          <CardDescription>Comparison of actual costs against estimated costs across all categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Summary */}
            <div className="rounded-lg border p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Estimated</div>
                  <div className="text-2xl font-bold">${totalEstimated.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Actual</div>
                  <div className="text-2xl font-bold">${totalActual.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Variance</div>
                  <div className={`text-2xl font-bold ${totalVariance > 0 ? "text-red-500" : "text-green-500"}`}>
                    {totalVariance > 0 ? "+" : ""}${totalVariance.toLocaleString()} ({totalVariancePercent.toFixed(1)}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Estimated</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Variance ($)</TableHead>
                  <TableHead className="text-right">Variance (%)</TableHead>
                  <TableHead>Comparison</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryData.map((category) => {
                  const variance = category.actualCost - category.estimatedCost
                  const variancePercent = (variance / category.estimatedCost) * 100

                  return (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-right">${category.estimatedCost.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${category.actualCost.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={variance > 0 ? "text-red-500" : "text-green-500"}>
                          {variance > 0 ? "+" : ""}${variance.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={variance > 0 ? "destructive" : "success"}>
                          {variance > 0 ? "+" : ""}
                          {variancePercent.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="w-[200px]">
                        <div className="flex items-center gap-2">
                          <div className="w-full">
                            <Progress
                              value={(category.actualCost / category.estimatedCost) * 100}
                              className={`h-2 ${variance > 0 ? "bg-red-100" : "bg-green-100"}`}
                              indicatorClassName={variance > 0 ? "bg-red-500" : "bg-green-500"}
                            />
                          </div>
                          <div className="w-8 text-xs">
                            {((category.actualCost / category.estimatedCost) * 100).toFixed(0)}%
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Cost Variance by Work Order</CardTitle>
              <CardDescription>Overview of cost variances across different work orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Estimated</TableHead>
                    <TableHead className="text-right">Actual</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrderData.map((workOrder) => {
                    const totalEstimated = workOrder.costs.reduce((sum, cost) => sum + cost.estimatedCost, 0)
                    const totalActual = workOrder.costs.reduce((sum, cost) => sum + cost.actualCost, 0)
                    const variance = totalActual - totalEstimated
                    const variancePercent = (variance / totalEstimated) * 100

                    return (
                      <TableRow key={workOrder.id}>
                        <TableCell className="font-medium">{workOrder.id}</TableCell>
                        <TableCell>{workOrder.description}</TableCell>
                        <TableCell className="text-right">${totalEstimated.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${totalActual.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <span className={variance > 0 ? "text-red-500" : "text-green-500"}>
                            {variance > 0 ? "+" : ""}${variance.toLocaleString()} ({variancePercent.toFixed(1)}%)
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              Math.abs(variancePercent) < 5
                                ? "success"
                                : Math.abs(variancePercent) < 10
                                  ? "warning"
                                  : "destructive"
                            }
                          >
                            {Math.abs(variancePercent) < 5
                              ? "On Budget"
                              : Math.abs(variancePercent) < 10
                                ? "Attention"
                                : "Critical"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Cost Comparison</CardTitle>
              <CardDescription>
                Detailed breakdown of estimated vs. actual costs by category and work order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {workOrderData.map((workOrder) => (
                  <div key={workOrder.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">{workOrder.id}</h3>
                        <p className="text-sm text-muted-foreground">{workOrder.description}</p>
                      </div>
                      <Badge variant={workOrder.status === "completed" ? "outline" : "secondary"}>
                        {workOrder.status}
                      </Badge>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Estimated</TableHead>
                          <TableHead className="text-right">Actual</TableHead>
                          <TableHead className="text-right">Variance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {workOrder.costs.map((cost) => {
                          const category = categoryData.find((c) => c.id === cost.categoryId)
                          const variance = cost.actualCost - cost.estimatedCost
                          const variancePercent = (variance / cost.estimatedCost) * 100

                          return (
                            <TableRow key={cost.categoryId}>
                              <TableCell>{category?.name}</TableCell>
                              <TableCell className="text-right">${cost.estimatedCost.toLocaleString()}</TableCell>
                              <TableCell className="text-right">${cost.actualCost.toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant={variance > 0 ? "destructive" : "success"}>
                                  {variance > 0 ? "+" : ""}
                                  {variancePercent.toFixed(1)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                        {/* Total row */}
                        <TableRow className="bg-muted/50">
                          <TableCell className="font-medium">Total</TableCell>
                          <TableCell className="text-right font-medium">
                            ${workOrder.costs.reduce((sum, cost) => sum + cost.estimatedCost, 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${workOrder.costs.reduce((sum, cost) => sum + cost.actualCost, 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {(() => {
                              const totalEstimated = workOrder.costs.reduce((sum, cost) => sum + cost.estimatedCost, 0)
                              const totalActual = workOrder.costs.reduce((sum, cost) => sum + cost.actualCost, 0)
                              const variance = totalActual - totalEstimated
                              const variancePercent = (variance / totalEstimated) * 100

                              return (
                                <Badge variant={variance > 0 ? "destructive" : "success"}>
                                  {variance > 0 ? "+" : ""}
                                  {variancePercent.toFixed(1)}%
                                </Badge>
                              )
                            })()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
