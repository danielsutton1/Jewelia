"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const abcDistribution = [
  { name: "A Items (70% of value)", value: 70, count: 52, items: 20 },
  { name: "B Items (20% of value)", value: 20, count: 78, items: 30 },
  { name: "C Items (10% of value)", value: 10, count: 130, items: 50 },
]

const COLORS = ["#10b981", "#f59e0b", "#3b82f6"]

const abcCategoryData = [
  { name: "Rings", a: 45, b: 30, c: 25 },
  { name: "Necklaces", a: 55, b: 25, c: 20 },
  { name: "Earrings", a: 40, b: 35, c: 25 },
  { name: "Bracelets", a: 35, b: 40, c: 25 },
  { name: "Watches", a: 60, b: 25, c: 15 },
]

const topAItems = [
  { id: "SKU401", name: "2ct Diamond Engagement Ring", category: "Rings", value: 8500, contribution: 5.2 },
  { id: "SKU402", name: "Sapphire and Diamond Necklace", category: "Necklaces", value: 6200, contribution: 3.8 },
  { id: "SKU403", name: "Luxury Swiss Watch", category: "Watches", value: 12500, contribution: 7.6 },
  { id: "SKU404", name: "Emerald Tennis Bracelet", category: "Bracelets", value: 5800, contribution: 3.5 },
  { id: "SKU405", name: "Diamond Stud Earrings", category: "Earrings", value: 4200, contribution: 2.6 },
]

export function AbcAnalysis() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ABC Inventory Analysis</CardTitle>
          <CardDescription>
            Pareto-based classification of inventory (A: high value, B: medium value, C: low value)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={abcDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {abcDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Percentage of Value"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={abcDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="value" name="Value %" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="items" name="Item %" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ABC Analysis by Category</CardTitle>
          <CardDescription>Distribution of A, B, and C items across product categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={abcCategoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="a" name="A Items" stackId="a" fill={COLORS[0]} />
                <Bar dataKey="b" name="B Items" stackId="a" fill={COLORS[1]} />
                <Bar dataKey="c" name="C Items" stackId="a" fill={COLORS[2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top A-Class Items</CardTitle>
          <CardDescription>Highest value items that contribute most to inventory value</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table">
            <TabsList className="mb-4">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="chart">Chart View</TabsTrigger>
            </TabsList>
            <TabsContent value="table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Contribution</TableHead>
                    <TableHead>Class</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topAItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>${item.value.toLocaleString()}</TableCell>
                      <TableCell>{item.contribution}%</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500">A</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="chart">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topAItems} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip formatter={(value) => [`${value}%`, "Contribution"]} />
                    <Legend />
                    <Bar dataKey="contribution" name="Value Contribution %" fill={COLORS[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
