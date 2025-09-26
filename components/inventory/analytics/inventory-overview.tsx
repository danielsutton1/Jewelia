"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
import { ArrowDown, ArrowUp, Clock, Package, TrendingDown, TrendingUp } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample data
const turnoverData = [
  { name: "Rings", turnover: 4.2, value: 125000 },
  { name: "Necklaces", turnover: 3.8, value: 98000 },
  { name: "Earrings", turnover: 5.1, value: 76000 },
  { name: "Bracelets", turnover: 3.2, value: 62000 },
  { name: "Watches", turnover: 2.1, value: 145000 },
]

const agingData = [
  { name: "0-30", value: 42 },
  { name: "31-60", value: 28 },
  { name: "61-90", value: 15 },
  { name: "91-180", value: 10 },
  { name: "181+", value: 5 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

const seasonalData = [
  { month: "Jan", sales: 65 },
  { month: "Feb", sales: 59 },
  { month: "Mar", sales: 80 },
  { month: "Apr", sales: 81 },
  { month: "May", sales: 90 },
  { month: "Jun", sales: 125 },
  { month: "Jul", sales: 110 },
  { month: "Aug", sales: 100 },
  { month: "Sep", sales: 85 },
  { month: "Oct", sales: 95 },
  { month: "Nov", sales: 120 },
  { month: "Dec", sales: 150 },
]

const fastMovingItems = [
  { id: "SKU001", name: "Diamond Engagement Ring", category: "Rings", turnover: 8.2, stock: 12 },
  { id: "SKU002", name: "Gold Chain Necklace", category: "Necklaces", turnover: 7.5, stock: 8 },
  { id: "SKU003", name: "Silver Hoop Earrings", category: "Earrings", turnover: 7.2, stock: 15 },
  { id: "SKU004", name: "Pearl Bracelet", category: "Bracelets", turnover: 6.8, stock: 10 },
  { id: "SKU005", name: "Sapphire Pendant", category: "Necklaces", turnover: 6.5, stock: 7 },
]

const deadStockItems = [
  { id: "SKU101", name: "Vintage Gold Watch", category: "Watches", days: 365, value: 2499 },
  { id: "SKU102", name: "Emerald Cocktail Ring", category: "Rings", days: 310, value: 1899 },
  { id: "SKU103", name: "Ruby Tennis Bracelet", category: "Bracelets", days: 290, value: 3299 },
  { id: "SKU104", name: "Platinum Wedding Band", category: "Rings", days: 275, value: 1599 },
  { id: "SKU105", name: "Diamond Chandelier Earrings", category: "Earrings", days: 260, value: 2799 },
]

export function InventoryOverview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Turnover Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.7x</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                +0.5x
              </span>{" "}
              from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dead Stock Value</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$42,850</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                +12.3%
              </span>{" "}
              from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fast Moving Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                +8
              </span>{" "}
              from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Inventory Age</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">62 days</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 flex items-center">
                <ArrowDown className="mr-1 h-3 w-3" />
                -5 days
              </span>{" "}
              from last quarter
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Turnover Rate by Category</CardTitle>
            <CardDescription>Inventory turnover rates across product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={turnoverData} layout="vertical" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip formatter={(value) => [`${value}x`, "Turnover Rate"]} />
                  <Legend />
                  <Bar dataKey="turnover" fill="hsl(var(--primary))" name="Turnover Rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Aging Analysis</CardTitle>
            <CardDescription>Age distribution of current inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={agingData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} days: ${(percent * 100).toFixed(0)}%`}
                  >
                    {agingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seasonal Sales Trends</CardTitle>
          <CardDescription>Monthly sales patterns to identify seasonal trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seasonalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip formatter={(value) => [`${value} units`, "Sales"]} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fast Moving Items</CardTitle>
            <CardDescription>Products with the highest turnover rates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Turnover</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fastMovingItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.turnover}x</TableCell>
                    <TableCell>{item.stock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dead Stock Items</CardTitle>
            <CardDescription>Products with no movement for 180+ days</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Age (days)</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deadStockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
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
      </div>
    </div>
  )
}
