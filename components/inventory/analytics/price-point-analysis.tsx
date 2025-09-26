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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Sample data
const priceRangeDistribution = [
  { range: "Under $100", count: 45, value: 3150 },
  { range: "$100-$499", count: 120, value: 32400 },
  { range: "$500-$999", count: 85, value: 63750 },
  { range: "$1,000-$2,499", count: 65, value: 97500 },
  { range: "$2,500-$4,999", count: 40, value: 140000 },
  { range: "$5,000-$9,999", count: 25, value: 175000 },
  { range: "$10,000+", count: 15, value: 225000 },
]

const pricePointPerformance = [
  { range: "Under $100", turnover: 5.8, profit: 25 },
  { range: "$100-$499", turnover: 4.9, profit: 30 },
  { range: "$500-$999", turnover: 4.2, profit: 35 },
  { range: "$1,000-$2,499", turnover: 3.5, profit: 38 },
  { range: "$2,500-$4,999", turnover: 2.8, profit: 42 },
  { range: "$5,000-$9,999", turnover: 2.1, profit: 45 },
  { range: "$10,000+", turnover: 1.5, profit: 50 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"]

const bestSellingPricePoints = [
  { id: "PP001", name: "$99 Silver Earrings", range: "Under $100", sales: 42, profit: 25 },
  { id: "PP002", name: "$299 Gold Chains", range: "$100-$499", sales: 38, profit: 30 },
  { id: "PP003", name: "$799 Pearl Sets", range: "$500-$999", sales: 35, profit: 35 },
  { id: "PP004", name: "$1,999 Diamond Pendants", range: "$1,000-$2,499", sales: 28, profit: 38 },
  { id: "PP005", name: "$3,999 Engagement Rings", range: "$2,500-$4,999", sales: 22, profit: 42 },
]

export function PricePointAnalysis() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Price Range</CardTitle>
            <CardDescription>Distribution of items across price points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceRangeDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, "Item Count"]} />
                  <Legend />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Number of Items" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Value by Price Range</CardTitle>
            <CardDescription>Total value distribution across price points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priceRangeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="range"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {priceRangeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Inventory Value"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price Point Performance</CardTitle>
          <CardDescription>Turnover rate and profit margin by price range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pricePointPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="turnover"
                  stroke="hsl(var(--primary))"
                  activeDot={{ r: 8 }}
                  name="Turnover Rate (x)"
                />
                <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit Margin (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Best Selling Price Points</CardTitle>
          <CardDescription>Top performing specific price points</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Price Point</TableHead>
                <TableHead>Price Range</TableHead>
                <TableHead>Sales (units)</TableHead>
                <TableHead>Profit Margin</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bestSellingPricePoints.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.range}</TableCell>
                  <TableCell>{item.sales}</TableCell>
                  <TableCell>{item.profit}%</TableCell>
                  <TableCell>
                    {item.sales >= 35 ? (
                      <Badge className="bg-emerald-500">High Volume</Badge>
                    ) : item.sales >= 25 ? (
                      <Badge className="bg-amber-500">Medium Volume</Badge>
                    ) : (
                      <Badge>Standard Volume</Badge>
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
