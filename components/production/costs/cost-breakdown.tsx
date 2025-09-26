"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockCostData, mockWorkOrderCosts } from "./mock-data"

export function CostBreakdown({ filters }: { filters: any }) {
  const [view, setView] = useState("category")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // In a real app, you would fetch this data based on the filters
  const categoryData = mockCostData.costCategories
  const workOrderData = mockWorkOrderCosts

  // Filter work orders by selected category if needed
  const filteredWorkOrders =
    selectedCategory === "all"
      ? workOrderData
      : workOrderData.map((wo) => ({
          ...wo,
          costs: wo.costs.filter((cost) => cost.categoryId === selectedCategory),
        }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={view} onValueChange={setView} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="workorder">By Work Order</TabsTrigger>
          </TabsList>
        </Tabs>

        {view === "workorder" && (
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryData.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* By Category View */}
      {view === "category" && (
        <div className="grid gap-6 md:grid-cols-2">
          {categoryData.map((category) => {
            const variance = category.actualCost - category.estimatedCost
            const variancePercent = (variance / category.estimatedCost) * 100

            return (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>Detailed breakdown of {category.name.toLowerCase()} costs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border p-3">
                        <div className="text-sm text-muted-foreground">Estimated</div>
                        <div className="text-2xl font-bold">${category.estimatedCost.toLocaleString()}</div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="text-sm text-muted-foreground">Actual</div>
                        <div className="text-2xl font-bold">${category.actualCost.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="text-sm text-muted-foreground">Variance</div>
                      <div className={`text-2xl font-bold ${variance > 0 ? "text-red-500" : "text-green-500"}`}>
                        {variance > 0 ? "+" : ""}${variance.toLocaleString()} ({variancePercent.toFixed(1)}%)
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subcategory</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">% of Category</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {category.subcategories.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell>{sub.name}</TableCell>
                            <TableCell className="text-right">${sub.cost.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              {((sub.cost / category.actualCost) * 100).toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* By Work Order View */}
      {view === "workorder" && (
        <Card>
          <CardHeader>
            <CardTitle>Work Order Cost Breakdown</CardTitle>
            <CardDescription>
              Detailed cost breakdown by work order
              {selectedCategory !== "all" && ` for ${categoryData.find((c) => c.id === selectedCategory)?.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Description</TableHead>
                  {selectedCategory === "all" && <TableHead>Category</TableHead>}
                  <TableHead className="text-right">Estimated</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkOrders.flatMap((workOrder) =>
                  workOrder.costs.map((cost) => {
                    const variance = cost.actualCost - cost.estimatedCost
                    const variancePercent = (variance / cost.estimatedCost) * 100

                    return (
                      <TableRow key={`${workOrder.id}-${cost.categoryId}`}>
                        <TableCell className="font-medium">{workOrder.id}</TableCell>
                        <TableCell>{workOrder.description}</TableCell>
                        {selectedCategory === "all" && (
                          <TableCell>{categoryData.find((c) => c.id === cost.categoryId)?.name}</TableCell>
                        )}
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
                  }),
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
