"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Sample data
const categoryMatrix = [
  { name: "Rings", turnover: 4.2, profit: 35, inventory: 125000 },
  { name: "Necklaces", turnover: 3.8, profit: 32, inventory: 98000 },
  { name: "Earrings", turnover: 5.1, profit: 40, inventory: 76000 },
  { name: "Bracelets", turnover: 3.2, profit: 28, inventory: 62000 },
  { name: "Watches", turnover: 2.1, profit: 45, inventory: 145000 },
  { name: "Pendants", turnover: 4.5, profit: 38, inventory: 55000 },
  { name: "Anklets", turnover: 2.8, profit: 25, inventory: 28000 },
  { name: "Cufflinks", turnover: 1.5, profit: 30, inventory: 32000 },
]

const categoryTrends = [
  { name: "Rings", current: 125000, previous: 115000, change: 8.7 },
  { name: "Necklaces", current: 98000, previous: 92000, change: 6.5 },
  { name: "Earrings", current: 76000, previous: 65000, change: 16.9 },
  { name: "Bracelets", current: 62000, previous: 58000, change: 6.9 },
  { name: "Watches", current: 145000, previous: 155000, change: -6.5 },
  { name: "Pendants", current: 55000, previous: 48000, change: 14.6 },
  { name: "Anklets", current: 28000, previous: 25000, change: 12.0 },
  { name: "Cufflinks", current: 32000, previous: 35000, change: -8.6 },
]

const subcategoryPerformance = [
  { name: "Diamond Rings", category: "Rings", turnover: 5.2, profit: 42, inventory: 85000 },
  { name: "Wedding Bands", category: "Rings", turnover: 3.8, profit: 28, inventory: 40000 },
  { name: "Gold Chains", category: "Necklaces", turnover: 4.5, profit: 35, inventory: 55000 },
  { name: "Pendants", category: "Necklaces", turnover: 3.2, profit: 30, inventory: 43000 },
  { name: "Stud Earrings", category: "Earrings", turnover: 6.1, profit: 45, inventory: 38000 },
  { name: "Hoop Earrings", category: "Earrings", turnover: 4.2, profit: 35, inventory: 28000 },
  { name: "Tennis Bracelets", category: "Bracelets", turnover: 3.8, profit: 32, inventory: 45000 },
  { name: "Charm Bracelets", category: "Bracelets", turnover: 2.5, profit: 25, inventory: 17000 },
]

export function CategoryPerformance() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Category Performance Matrix</CardTitle>
          <CardDescription>Turnover rate vs. profit margin by category (bubble size = inventory value)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="turnover"
                  name="Turnover Rate"
                  unit="x"
                  domain={[0, 6]}
                  label={{ value: "Turnover Rate (x)", position: "bottom", offset: 0 }}
                />
                <YAxis
                  type="number"
                  dataKey="profit"
                  name="Profit Margin"
                  unit="%"
                  domain={[0, 50]}
                  label={{ value: "Profit Margin (%)", angle: -90, position: "insideLeft" }}
                />
                <ZAxis type="number" dataKey="inventory" range={[100, 1000]} name="Inventory Value" unit="$" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value, name, props) => {
                    if (name === "Inventory Value") return [`$${value.toLocaleString()}`, name]
                    if (name === "Turnover Rate") return [`${value}x`, name]
                    return [`${value}%`, name]
                  }}
                />
                <Legend />
                <Scatter name="Categories" data={categoryMatrix} fill="hsl(var(--primary))" shape="circle" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Value Trends</CardTitle>
          <CardDescription>Current vs. previous quarter inventory value by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Inventory Value"]} />
                <Legend />
                <Bar dataKey="current" name="Current Quarter" fill="hsl(var(--primary))" />
                <Bar dataKey="previous" name="Previous Quarter" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subcategory Performance</CardTitle>
          <CardDescription>Detailed performance metrics for subcategories</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subcategory</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Turnover</TableHead>
                <TableHead>Profit Margin</TableHead>
                <TableHead>Inventory Value</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcategoryPerformance.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.turnover}x</TableCell>
                  <TableCell>{item.profit}%</TableCell>
                  <TableCell>${item.inventory.toLocaleString()}</TableCell>
                  <TableCell>
                    {item.turnover >= 4.0 && item.profit >= 35 ? (
                      <Badge className="bg-emerald-500">High Performer</Badge>
                    ) : item.turnover <= 2.5 || item.profit <= 25 ? (
                      <Badge className="bg-destructive">Underperforming</Badge>
                    ) : (
                      <Badge className="bg-amber-500">Average</Badge>
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
