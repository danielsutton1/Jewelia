"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Sample materials data
const materialsData = {
  metals: [
    {
      id: "M001",
      name: "14K Yellow Gold",
      stock: 250,
      unit: "g",
      minThreshold: 100,
      reorderPoint: 150,
      status: "good",
    },
    { id: "M002", name: "18K White Gold", stock: 180, unit: "g", minThreshold: 100, reorderPoint: 150, status: "good" },
    {
      id: "M003",
      name: "Sterling Silver",
      stock: 500,
      unit: "g",
      minThreshold: 200,
      reorderPoint: 300,
      status: "good",
    },
    { id: "M004", name: "Platinum", stock: 50, unit: "g", minThreshold: 100, reorderPoint: 75, status: "low" },
  ],
  stones: [
    {
      id: "S001",
      name: "Diamond Round 0.5ct",
      stock: 15,
      unit: "pcs",
      minThreshold: 5,
      reorderPoint: 10,
      status: "good",
    },
    { id: "S002", name: "Sapphire Oval 1ct", stock: 8, unit: "pcs", minThreshold: 5, reorderPoint: 7, status: "good" },
    {
      id: "S003",
      name: "Emerald Square 0.75ct",
      stock: 5,
      unit: "pcs",
      minThreshold: 10,
      reorderPoint: 8,
      status: "low",
    },
    { id: "S004", name: "Ruby Round 0.3ct", stock: 12, unit: "pcs", minThreshold: 5, reorderPoint: 8, status: "good" },
  ],
  findings: [
    {
      id: "F001",
      name: "Lobster Clasp 14K",
      stock: 30,
      unit: "pcs",
      minThreshold: 20,
      reorderPoint: 25,
      status: "good",
    },
    { id: "F002", name: "Jump Rings 18K", stock: 100, unit: "pcs", minThreshold: 50, reorderPoint: 75, status: "good" },
    {
      id: "F003",
      name: "Earring Posts Silver",
      stock: 45,
      unit: "pairs",
      minThreshold: 20,
      reorderPoint: 30,
      status: "good",
    },
    { id: "F004", name: 'Box Chain 18"', stock: 20, unit: "pcs", minThreshold: 50, reorderPoint: 30, status: "low" },
  ],
}

// Helper function to get status badge
function getStockStatusBadge(status: string) {
  switch (status) {
    case "good":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Good
        </Badge>
      )
    case "low":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Low
        </Badge>
      )
    case "critical":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Critical
        </Badge>
      )
    case "out":
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          Out of Stock
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function MaterialsOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Materials Overview</CardTitle>
        <CardDescription>Current inventory status of production materials</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="metals">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metals">Metals</TabsTrigger>
            <TabsTrigger value="stones">Stones</TabsTrigger>
            <TabsTrigger value="findings">Findings</TabsTrigger>
          </TabsList>

          <TabsContent value="metals" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min. Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stock Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialsData.metals.map((material) => {
                  // Calculate percentage of stock
                  const stockPercentage = (material.stock / material.minThreshold) * 100

                  return (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>
                        {material.stock} {material.unit}
                      </TableCell>
                      <TableCell>
                        {material.minThreshold} {material.unit}
                      </TableCell>
                      <TableCell>{getStockStatusBadge(material.status)}</TableCell>
                      <TableCell className="w-[200px]">
                        <Progress
                          value={stockPercentage > 100 ? 100 : stockPercentage}
                          className="h-2"
                          // Color based on status
                          style={
                            {
                              backgroundColor:
                                material.status === "low"
                                  ? "rgba(245, 158, 11, 0.2)"
                                  : material.status === "critical"
                                    ? "rgba(239, 68, 68, 0.2)"
                                    : "rgba(34, 197, 94, 0.2)",
                              "--progress-color":
                                material.status === "low"
                                  ? "rgb(245, 158, 11)"
                                  : material.status === "critical"
                                    ? "rgb(239, 68, 68)"
                                    : "rgb(34, 197, 94)",
                            } as any
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="stones" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min. Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stock Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialsData.stones.map((material) => {
                  // Calculate percentage of stock
                  const stockPercentage = (material.stock / material.minThreshold) * 100

                  return (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>
                        {material.stock} {material.unit}
                      </TableCell>
                      <TableCell>
                        {material.minThreshold} {material.unit}
                      </TableCell>
                      <TableCell>{getStockStatusBadge(material.status)}</TableCell>
                      <TableCell className="w-[200px]">
                        <Progress
                          value={stockPercentage > 100 ? 100 : stockPercentage}
                          className="h-2"
                          // Color based on status
                          style={
                            {
                              backgroundColor:
                                material.status === "low"
                                  ? "rgba(245, 158, 11, 0.2)"
                                  : material.status === "critical"
                                    ? "rgba(239, 68, 68, 0.2)"
                                    : "rgba(34, 197, 94, 0.2)",
                              "--progress-color":
                                material.status === "low"
                                  ? "rgb(245, 158, 11)"
                                  : material.status === "critical"
                                    ? "rgb(239, 68, 68)"
                                    : "rgb(34, 197, 94)",
                            } as any
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="findings" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min. Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stock Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialsData.findings.map((material) => {
                  // Calculate percentage of stock
                  const stockPercentage = (material.stock / material.minThreshold) * 100

                  return (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>
                        {material.stock} {material.unit}
                      </TableCell>
                      <TableCell>
                        {material.minThreshold} {material.unit}
                      </TableCell>
                      <TableCell>{getStockStatusBadge(material.status)}</TableCell>
                      <TableCell className="w-[200px]">
                        <Progress
                          value={stockPercentage > 100 ? 100 : stockPercentage}
                          className="h-2"
                          // Color based on status
                          style={
                            {
                              backgroundColor:
                                material.status === "low"
                                  ? "rgba(245, 158, 11, 0.2)"
                                  : material.status === "critical"
                                    ? "rgba(239, 68, 68, 0.2)"
                                    : "rgba(34, 197, 94, 0.2)",
                              "--progress-color":
                                material.status === "low"
                                  ? "rgb(245, 158, 11)"
                                  : material.status === "critical"
                                    ? "rgb(239, 68, 68)"
                                    : "rgb(34, 197, 94)",
                            } as any
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
