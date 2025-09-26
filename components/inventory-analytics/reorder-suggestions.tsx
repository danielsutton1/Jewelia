"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

const reorderItems = [
  {
    id: "SKU301",
    name: "Diamond Stud Earrings",
    category: "Earrings",
    current: 3,
    min: 5,
    optimal: 10,
    priority: "high",
  },
  {
    id: "SKU302",
    name: "Gold Chain Necklace",
    category: "Necklaces",
    current: 2,
    min: 5,
    optimal: 8,
    priority: "high",
  },
  {
    id: "SKU303",
    name: "Silver Hoop Earrings",
    category: "Earrings",
    current: 4,
    min: 5,
    optimal: 12,
    priority: "medium",
  },
  { id: "SKU304", name: "Tennis Bracelet", category: "Bracelets", current: 1, min: 3, optimal: 6, priority: "high" },
  {
    id: "SKU305",
    name: "Engagement Ring Setting",
    category: "Rings",
    current: 2,
    min: 4,
    optimal: 8,
    priority: "medium",
  },
]

export function ReorderSuggestions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reorder Suggestions</CardTitle>
        <CardDescription>Items that need to be reordered based on minimum stock levels</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Current</TableHead>
              <TableHead>Min</TableHead>
              <TableHead>Optimal</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reorderItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.current}</TableCell>
                <TableCell>{item.min}</TableCell>
                <TableCell>{item.optimal}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      item.priority === "high"
                        ? "bg-destructive"
                        : item.priority === "medium"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }
                  >
                    {item.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Order
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
