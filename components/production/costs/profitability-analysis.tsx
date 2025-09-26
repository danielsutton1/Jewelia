"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { mockWorkOrderCosts, mockProfitabilityData } from "./mock-data"

export function ProfitabilityAnalysis({ filters }: { filters: any }) {
  // In a real app, you would fetch this data based on the filters
  const profitabilityData = mockProfitabilityData
  const workOrderData = mockWorkOrderCosts

  // Calculate profitability metrics for each work order
  const workOrderProfitability = workOrderData
    .map((workOrder) => {
      const totalCost = workOrder.costs.reduce((sum, cost) => sum + cost.actualCost, 0)
      const revenue = workOrder.revenue || 0
      const profit = revenue - totalCost
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0

      return {
        ...workOrder,
        totalCost,
        revenue,
        profit,
        margin,
      }
    })
    .sort((a, b) => b.margin - a.margin) // Sort by margin (highest first)

  // Generate recommendations based on profitability data
  const recommendations = [
    {
      id: 1,
      title: "Optimize material usage for high-end rings",
      description:
        "High-end ring production shows 15% higher material costs than industry benchmarks. Consider reviewing material specifications and sourcing alternatives.",
      impact: "high",
      category: "materials",
    },
    {
      id: 2,
      title: "Review labor allocation for custom pieces",
      description:
        "Custom jewelry pieces have 23% higher labor costs but only 10% higher revenue. Consider standardizing some aspects of custom work.",
      impact: "medium",
      category: "labor",
    },
    {
      id: 3,
      title: "Reduce machine setup time for small batch production",
      description:
        "Small batches (1-3 items) have disproportionately high machine setup costs. Group similar items to reduce setup frequency.",
      impact: "medium",
      category: "machine",
    },
    {
      id: 4,
      title: "Renegotiate outsourced polishing services",
      description:
        "Current outsourced polishing costs are 18% above market rates. Consider renegotiating contracts or bringing this process in-house.",
      impact: "high",
      category: "outsourced",
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profitability Overview</CardTitle>
          <CardDescription>Analysis of profitability metrics across product categories and work orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium text-muted-foreground">Overall Gross Margin</div>
                <div className="text-2xl font-bold">{profitabilityData.overallMargin.toFixed(1)}%</div>
                <div className="mt-2 flex items-center text-xs">
                  <span className={profitabilityData.marginTrend > 0 ? "text-green-500" : "text-red-500"}>
                    {profitabilityData.marginTrend > 0 ? (
                      <TrendingUp className="mr-1 inline h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-1 inline h-3 w-3" />
                    )}
                    {profitabilityData.marginTrend > 0 ? "+" : ""}
                    {profitabilityData.marginTrend.toFixed(1)}%
                  </span>
                  <span className="ml-1 text-muted-foreground">vs. previous period</span>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium text-muted-foreground">Target Margin</div>
                <div className="text-2xl font-bold">{profitabilityData.targetMargin.toFixed(1)}%</div>
                <div className="mt-2 flex items-center text-xs">
                  <span
                    className={
                      profitabilityData.overallMargin >= profitabilityData.targetMargin
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {profitabilityData.overallMargin >= profitabilityData.targetMargin ? (
                      <span>Target achieved</span>
                    ) : (
                      <span>
                        {(profitabilityData.targetMargin - profitabilityData.overallMargin).toFixed(1)}% below target
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium text-muted-foreground">Most Profitable Category</div>
                <div className="text-2xl font-bold">{profitabilityData.mostProfitableCategory.name}</div>
                <div className="mt-2 flex items-center text-xs">
                  <span className="text-green-500">
                    {profitabilityData.mostProfitableCategory.margin.toFixed(1)}% margin
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Margin by Product Category</h3>
              <div className="space-y-4">
                {profitabilityData.categoryMargins.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ${category.revenue.toLocaleString()} revenue
                        </span>
                      </div>
                      <span className="font-medium">{category.margin.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={category.margin}
                        className="h-2"
                        indicatorClassName={
                          category.margin >= profitabilityData.targetMargin
                            ? "bg-green-500"
                            : category.margin >= profitabilityData.targetMargin * 0.8
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }
                      />
                      <div className="w-12 text-xs text-muted-foreground">
                        Target: {profitabilityData.targetMargin}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="workorders">
        <TabsList>
          <TabsTrigger value="workorders">Work Order Profitability</TabsTrigger>
          <TabsTrigger value="trends">Profitability Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="workorders">
          <Card>
            <CardHeader>
              <CardTitle>Work Order Profitability</CardTitle>
              <CardDescription>Detailed profitability analysis for individual work orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrderProfitability.map((workOrder) => (
                    <TableRow key={workOrder.id}>
                      <TableCell className="font-medium">{workOrder.id}</TableCell>
                      <TableCell>{workOrder.description}</TableCell>
                      <TableCell className="text-right">${workOrder.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${workOrder.totalCost.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={workOrder.profit >= 0 ? "text-green-500" : "text-red-500"}>
                          ${workOrder.profit.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">{workOrder.margin.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            workOrder.margin >= profitabilityData.targetMargin
                              ? "success"
                              : workOrder.margin >= profitabilityData.targetMargin * 0.8
                                ? "warning"
                                : "destructive"
                          }
                        >
                          {workOrder.margin >= profitabilityData.targetMargin
                            ? "Above Target"
                            : workOrder.margin >= profitabilityData.targetMargin * 0.8
                              ? "Near Target"
                              : "Below Target"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Profitability Trends</CardTitle>
              <CardDescription>Analysis of profitability trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-4 text-lg font-medium">Margin Trend Analysis</h3>
                  <div className="h-[300px] w-full bg-muted/30 flex items-center justify-center">
                    <p className="text-muted-foreground">Margin trend chart would be displayed here</p>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    Chart showing margin trends over the selected time period, broken down by product category.
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Key Observations</h3>
                  <div className="space-y-2">
                    {profitabilityData.trends.map((trend, index) => (
                      <div key={index} className="flex items-start gap-2 rounded-lg border p-3">
                        {trend.direction === "up" ? (
                          <TrendingUp className="mt-0.5 h-5 w-5 text-green-500" />
                        ) : (
                          <TrendingDown className="mt-0.5 h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{trend.title}</p>
                          <p className="text-sm text-muted-foreground">{trend.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Attention Required</AlertTitle>
                  <AlertDescription>
                    Custom jewelry margins have declined by 5.2% over the past quarter. Consider reviewing pricing
                    strategy and production costs.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Cost Optimization Recommendations</CardTitle>
              <CardDescription>
                Actionable recommendations to improve profitability based on cost analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((recommendation) => (
                  <div key={recommendation.id} className="rounded-lg border p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb
                        className={`mt-0.5 h-5 w-5 ${
                          recommendation.impact === "high"
                            ? "text-amber-500"
                            : recommendation.impact === "medium"
                              ? "text-blue-500"
                              : "text-green-500"
                        }`}
                      />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{recommendation.title}</h3>
                          <Badge
                            variant={
                              recommendation.impact === "high"
                                ? "destructive"
                                : recommendation.impact === "medium"
                                  ? "warning"
                                  : "outline"
                            }
                          >
                            {recommendation.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                        <div className="pt-1">
                          <Badge variant="outline">{recommendation.category}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-dashed p-4">
                <div className="text-center">
                  <h3 className="font-medium">Potential Savings</h3>
                  <p className="mt-1 text-3xl font-bold text-green-500">$24,850</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Estimated annual savings if all recommendations are implemented
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
