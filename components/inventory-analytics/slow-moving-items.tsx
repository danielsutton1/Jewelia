"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const slowMovingItems = [
  { id: "SKU201", name: "Pearl Stud Earrings", category: "Earrings", turnover: 0.8, days: 180, value: 899 },
  { id: "SKU202", name: "Men's Signet Ring", category: "Rings", turnover: 0.7, days: 165, value: 1299 },
  { id: "SKU203", name: "Silver Charm Bracelet", category: "Bracelets", turnover: 0.9, days: 155, value: 599 },
  { id: "SKU204", name: "Onyx Cufflinks", category: "Accessories", turnover: 0.6, days: 190, value: 499 },
  { id: "SKU205", name: "Rose Gold Anklet", category: "Anklets", turnover: 0.5, days: 210, value: 399 },
]

export function SlowMovingItems() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Slow-Moving Items</CardTitle>
        <CardDescription>Products with turnover rate below 1.0</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Turnover</TableHead>
              <TableHead>Age (days)</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slowMovingItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-amber-500 border-amber-500">
                    {item.turnover}x
                  </Badge>
                </TableCell>
                <TableCell>{item.days}</TableCell>
                <TableCell>${item.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
