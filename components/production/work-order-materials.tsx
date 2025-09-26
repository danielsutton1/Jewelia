"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface WorkOrderMaterialsProps {
  workOrder: any // Using any for brevity, should be properly typed in a real application
}

export function WorkOrderMaterials({ workOrder }: WorkOrderMaterialsProps) {
  // Calculate total costs
  const estimatedMetalCost = workOrder.materialsUsed.metal.estimated.cost
  const actualMetalCost = workOrder.materialsUsed.metal.actual.cost

  const estimatedStoneCost = workOrder.materialsUsed.stones.reduce(
    (total: number, stone: any) => total + stone.estimated.cost,
    0,
  )
  const actualStoneCost = workOrder.materialsUsed.stones.reduce(
    (total: number, stone: any) => total + stone.actual.cost,
    0,
  )

  const additionalMaterialsCost = workOrder.materialsUsed.additionalMaterials.reduce(
    (total: number, material: any) => total + material.cost,
    0,
  )

  const estimatedLaborCost = workOrder.materialsUsed.laborHours.estimated * workOrder.materialsUsed.laborHours.rate
  const actualLaborCost = workOrder.materialsUsed.laborHours.actual * workOrder.materialsUsed.laborHours.rate

  const totalEstimatedCost = estimatedMetalCost + estimatedStoneCost + additionalMaterialsCost + estimatedLaborCost
  const totalActualCost = actualMetalCost + actualStoneCost + additionalMaterialsCost + actualLaborCost

  // Calculate variance
  const calculateVariance = (actual: number, estimated: number) => {
    const variance = actual - estimated
    const percentage = estimated > 0 ? (variance / estimated) * 100 : 0
    return {
      value: variance,
      percentage: percentage,
      isPositive: variance >= 0,
    }
  }

  const metalVariance = calculateVariance(
    workOrder.materialsUsed.metal.actual.weight,
    workOrder.materialsUsed.metal.estimated.weight,
  )
  const metalCostVariance = calculateVariance(actualMetalCost, estimatedMetalCost)
  const stoneCostVariance = calculateVariance(actualStoneCost, estimatedStoneCost)
  const laborHoursVariance = calculateVariance(
    workOrder.materialsUsed.laborHours.actual,
    workOrder.materialsUsed.laborHours.estimated,
  )
  const laborCostVariance = calculateVariance(actualLaborCost, estimatedLaborCost)
  const totalCostVariance = calculateVariance(totalActualCost, totalEstimatedCost)

  return (
    <div className="space-y-6">
      {/* Metal Used */}
      <Card>
        <CardHeader>
          <CardTitle>Metal Used</CardTitle>
          <CardDescription>Comparison of estimated vs. actual metal usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Metal Type</h3>
                <p className="font-medium">{workOrder.metal.type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Purity</h3>
                <p className="font-medium">{workOrder.metal.purity}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Finish</h3>
                <p className="font-medium">{workOrder.metal.finish}</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Estimated</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Weight (g)</TableCell>
                  <TableCell>{workOrder.materialsUsed.metal.estimated.weight}g</TableCell>
                  <TableCell>{workOrder.materialsUsed.metal.actual.weight}g</TableCell>
                  <TableCell>
                    <Badge variant={metalVariance.isPositive ? "destructive" : "success"}>
                      {metalVariance.value > 0 ? "+" : ""}
                      {metalVariance.value.toFixed(1)}g ({metalVariance.percentage.toFixed(1)}%)
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Cost</TableCell>
                  <TableCell>${workOrder.materialsUsed.metal.estimated.cost}</TableCell>
                  <TableCell>${workOrder.materialsUsed.metal.actual.cost}</TableCell>
                  <TableCell>
                    <Badge variant={metalCostVariance.isPositive ? "destructive" : "success"}>
                      {metalCostVariance.value > 0 ? "+" : ""}${metalCostVariance.value} (
                      {metalCostVariance.percentage.toFixed(1)}%)
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stones Used */}
      <Card>
        <CardHeader>
          <CardTitle>Stones Used</CardTitle>
          <CardDescription>Comparison of estimated vs. actual stone usage</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stone ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Est. Quantity</TableHead>
                <TableHead>Act. Quantity</TableHead>
                <TableHead>Est. Cost</TableHead>
                <TableHead>Act. Cost</TableHead>
                <TableHead>Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrder.materialsUsed.stones.map((stone: any) => {
                const quantityVariance = stone.actual.quantity - stone.estimated.quantity
                const costVariance = stone.actual.cost - stone.estimated.cost
                const costVariancePercentage =
                  stone.estimated.cost > 0 ? (costVariance / stone.estimated.cost) * 100 : 0

                return (
                  <TableRow key={stone.id}>
                    <TableCell className="font-medium">{stone.id}</TableCell>
                    <TableCell>{workOrder.stones.find((s: any) => s.id === stone.id)?.type || "Unknown"}</TableCell>
                    <TableCell>{stone.estimated.quantity}</TableCell>
                    <TableCell>{stone.actual.quantity}</TableCell>
                    <TableCell>${stone.estimated.cost}</TableCell>
                    <TableCell>${stone.actual.cost}</TableCell>
                    <TableCell>
                      <Badge variant={costVariance > 0 ? "destructive" : "success"}>
                        {costVariance > 0 ? "+" : ""}${costVariance} ({costVariancePercentage.toFixed(1)}%)
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={4} className="font-medium">
                  Total Stone Cost
                </TableCell>
                <TableCell className="font-medium">${estimatedStoneCost}</TableCell>
                <TableCell className="font-medium">${actualStoneCost}</TableCell>
                <TableCell>
                  <Badge variant={stoneCostVariance.isPositive ? "destructive" : "success"}>
                    {stoneCostVariance.value > 0 ? "+" : ""}${stoneCostVariance.value} (
                    {stoneCostVariance.percentage.toFixed(1)}%)
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Additional Materials */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Materials</CardTitle>
          <CardDescription>Other materials used in production</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrder.materialsUsed.additionalMaterials.map((material: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{material.name}</TableCell>
                  <TableCell>${material.cost}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">Total Additional Materials</TableCell>
                <TableCell className="font-medium">${additionalMaterialsCost}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Labor Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Labor Hours</CardTitle>
          <CardDescription>Time spent on production</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Estimated</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Hours</TableCell>
                <TableCell>{workOrder.materialsUsed.laborHours.estimated} hrs</TableCell>
                <TableCell>{workOrder.materialsUsed.laborHours.actual} hrs</TableCell>
                <TableCell>
                  <Badge variant={laborHoursVariance.isPositive ? "destructive" : "success"}>
                    {laborHoursVariance.value > 0 ? "+" : ""}
                    {laborHoursVariance.value.toFixed(1)} hrs ({laborHoursVariance.percentage.toFixed(1)}%)
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Rate</TableCell>
                <TableCell>${workOrder.materialsUsed.laborHours.rate}/hr</TableCell>
                <TableCell>${workOrder.materialsUsed.laborHours.rate}/hr</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Labor Cost</TableCell>
                <TableCell>${estimatedLaborCost}</TableCell>
                <TableCell>${actualLaborCost}</TableCell>
                <TableCell>
                  <Badge variant={laborCostVariance.isPositive ? "destructive" : "success"}>
                    {laborCostVariance.value > 0 ? "+" : ""}${laborCostVariance.value.toFixed(2)} (
                    {laborCostVariance.percentage.toFixed(1)}%)
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cost Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Summary</CardTitle>
          <CardDescription>Overall cost breakdown and comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Estimated</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Metal</TableCell>
                  <TableCell>${estimatedMetalCost}</TableCell>
                  <TableCell>${actualMetalCost}</TableCell>
                  <TableCell>
                    <Badge variant={metalCostVariance.isPositive ? "destructive" : "success"}>
                      {metalCostVariance.value > 0 ? "+" : ""}${metalCostVariance.value}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Stones</TableCell>
                  <TableCell>${estimatedStoneCost}</TableCell>
                  <TableCell>${actualStoneCost}</TableCell>
                  <TableCell>
                    <Badge variant={stoneCostVariance.isPositive ? "destructive" : "success"}>
                      {stoneCostVariance.value > 0 ? "+" : ""}${stoneCostVariance.value}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Additional Materials</TableCell>
                  <TableCell>${additionalMaterialsCost}</TableCell>
                  <TableCell>${additionalMaterialsCost}</TableCell>
                  <TableCell>
                    <Badge variant="outline">$0</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Labor</TableCell>
                  <TableCell>${estimatedLaborCost}</TableCell>
                  <TableCell>${actualLaborCost}</TableCell>
                  <TableCell>
                    <Badge variant={laborCostVariance.isPositive ? "destructive" : "success"}>
                      {laborCostVariance.value > 0 ? "+" : ""}${laborCostVariance.value.toFixed(2)}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="bg-muted/50">
                  <TableCell className="font-medium">Total Cost</TableCell>
                  <TableCell className="font-medium">${totalEstimatedCost}</TableCell>
                  <TableCell className="font-medium">${totalActualCost}</TableCell>
                  <TableCell>
                    <Badge variant={totalCostVariance.isPositive ? "destructive" : "success"}>
                      {totalCostVariance.value > 0 ? "+" : ""}${totalCostVariance.value.toFixed(2)} (
                      {totalCostVariance.percentage.toFixed(1)}%)
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Cost Breakdown</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Metal (${actualMetalCost})</span>
                    <span>{((actualMetalCost / totalActualCost) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(actualMetalCost / totalActualCost) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Stones (${actualStoneCost})</span>
                    <span>{((actualStoneCost / totalActualCost) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(actualStoneCost / totalActualCost) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Additional Materials (${additionalMaterialsCost})</span>
                    <span>{((additionalMaterialsCost / totalActualCost) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(additionalMaterialsCost / totalActualCost) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Labor (${actualLaborCost.toFixed(2)})</span>
                    <span>{((actualLaborCost / totalActualCost) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(actualLaborCost / totalActualCost) * 100} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
