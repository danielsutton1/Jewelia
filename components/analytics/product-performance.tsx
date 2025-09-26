"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Sample data
const topProducts = [
  { name: "Diamond Engagement Ring", sales: 42, revenue: 54600, color: "#8884d8" },
  { name: "Gold Chain Necklace", sales: 38, revenue: 22800, color: "#82ca9d" },
  { name: "Silver Hoop Earrings", sales: 35, revenue: 4550, color: "#ffc658" },
  { name: "Pearl Bracelet", sales: 30, revenue: 7500, color: "#ff8042" },
  { name: "Sapphire Pendant", sales: 28, revenue: 9800, color: "#0088fe" },
]

const categoryPerformance = [
  { name: "Rings", value: 35, color: "#0088FE" },
  { name: "Necklaces", value: 25, color: "#00C49F" },
  { name: "Earrings", value: 20, color: "#FFBB28" },
  { name: "Bracelets", value: 15, color: "#FF8042" },
  { name: "Watches", value: 5, color: "#8884d8" },
]

const productTable = [
  {
    id: "PRD-001",
    name: "Diamond Engagement Ring",
    category: "Rings",
    stock: 12,
    price: 1299.99,
    sales: 42,
    revenue: 54599.58,
    trend: "up",
  },
  {
    id: "PRD-002",
    name: "Gold Chain Necklace",
    category: "Necklaces",
    stock: 8,
    price: 599.99,
    sales: 38,
    revenue: 22799.62,
    trend: "up",
  },
  {
    id: "PRD-003",
    name: "Silver Hoop Earrings",
    category: "Earrings",
    stock: 24,
    price: 129.99,
    sales: 35,
    revenue: 4549.65,
    trend: "down",
  },
  {
    id: "PRD-004",
    name: "Pearl Bracelet",
    category: "Bracelets",
    stock: 0,
    price: 249.99,
    sales: 30,
    revenue: 7499.7,
    trend: "up",
  },
  {
    id: "PRD-005",
    name: "Sapphire Pendant",
    category: "Pendants",
    stock: 5,
    price: 349.99,
    sales: 28,
    revenue: 9799.72,
    trend: "down",
  },
]

export function ProductPerformance() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
            <CardDescription>Highest revenue generating products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                  <Legend />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Product category distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Sales Percentage"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Performance Details</CardTitle>
          <CardDescription>Detailed metrics for top-selling products</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productTable.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {product.stock === 0 ? (
                      <Badge variant="outline" className="text-destructive border-destructive">
                        Out of Stock
                      </Badge>
                    ) : product.stock < 10 ? (
                      <Badge className="bg-amber-500">Low Stock</Badge>
                    ) : (
                      <Badge className="bg-emerald-500">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>{product.sales}</TableCell>
                  <TableCell>${product.revenue.toFixed(2)}</TableCell>
                  <TableCell>
                    {product.trend === "up" ? (
                      <Badge className="bg-emerald-500">↑ Up</Badge>
                    ) : (
                      <Badge className="bg-destructive">↓ Down</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
