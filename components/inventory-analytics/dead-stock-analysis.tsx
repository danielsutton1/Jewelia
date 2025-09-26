"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const deadStockItems = [
  { id: "SKU101", name: "Vintage Gold Watch", category: "Watches", days: 365, value: 2499 },
  { id: "SKU102", name: "Emerald Cocktail Ring", category: "Rings", days: 310, value: 1899 },
  { id: "SKU103", name: "Ruby Tennis Bracelet", category: "Bracelets", days: 290, value: 3299 },
  { id: "SKU104", name: "Platinum Wedding Band", category: "Rings", days: 275, value: 1599 },
  { id: "SKU105", name: "Diamond Chandelier Earrings", category: "Earrings", days: 260, value: 2799 },
]

export function DeadStockAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dead Stock Analysis</CardTitle>
        <CardDescription>Items with no movement for 180+ days</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Age (days)</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deadStockItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-destructive border-destructive">
                    {item.days}
                  </Badge>
                </TableCell>
                <TableCell>${item.value.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
