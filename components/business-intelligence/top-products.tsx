"use client"

import type { DateRange } from "react-day-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"

interface TopProductsProps {
  dateRange: DateRange
}

export function TopProducts({ dateRange }: TopProductsProps) {
  // In a real app, this data would come from an API call based on the date range
  const products = [
    {
      id: "PRD-001",
      name: "Diamond Engagement Ring",
      revenue: 32500,
      units: 25,
      stock: "In Stock",
    },
    {
      id: "PRD-002",
      name: "Gold Chain Necklace",
      revenue: 28900,
      units: 42,
      stock: "Low Stock",
    },
    {
      id: "PRD-003",
      name: "Sapphire Pendant",
      revenue: 24600,
      units: 30,
      stock: "In Stock",
    },
    {
      id: "PRD-004",
      name: "Pearl Earrings Set",
      revenue: 18700,
      units: 38,
      stock: "In Stock",
    },
    {
      id: "PRD-005",
      name: "Platinum Wedding Band",
      revenue: 15200,
      units: 18,
      stock: "Out of Stock",
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Products with highest revenue in selected period</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          View All <ArrowUpRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Units</TableHead>
              <TableHead>Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-right">${product.revenue.toLocaleString()}</TableCell>
                <TableCell className="text-right">{product.units}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.stock === "In Stock"
                        ? "outline"
                        : product.stock === "Low Stock"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {product.stock}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
