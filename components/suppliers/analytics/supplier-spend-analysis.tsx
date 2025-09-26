"use client"
// Updated for build fix
import React from 'react'
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Filter } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for spend analysis
const spendByCategory = [
  { name: "Metal Suppliers", value: 450000, color: "#8884d8" },
  { name: "Stone Suppliers", value: 350000, color: "#83a6ed" },
  { name: "Findings Suppliers", value: 120000, color: "#8dd1e1" },
  { name: "Casting Services", value: 80000, color: "#82ca9d" },
  { name: "Engraving Services", value: 40000, color: "#a4de6c" },
  { name: "Plating Services", value: 30000, color: "#d0ed57" },
  { name: "Contractors", value: 60000, color: "#ffc658" },
  { name: "Shipping Partners", value: 70000, color: "#ff8042" },
]

const COLORS = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c", "#d0ed57", "#ffc658", "#ff8042"]

const spendBySupplier = [
  { name: "GoldCraft Suppliers", value: 250000 },
  { name: "Diamond District Gems", value: 200000 },
  { name: "Precision Casting Co.", value: 80000 },
  { name: "Master Engravers Guild", value: 40000 },
  { name: "Shine Plating Services", value: 30000 },
  { name: "Elite Craftspeople", value: 60000 },
  { name: "Swift Shipping Partners", value: 70000 },
  { name: "Pearl Perfection", value: 150000 },
  { name: "Other Suppliers", value: 120000 },
]

const spendTrend = [
  { month: "Jan", spend: 80000 },
  { month: "Feb", spend: 85000 },
  { month: "Mar", spend: 90000 },
  { month: "Apr", spend: 88000 },
  { month: "May", spend: 92000 },
  { month: "Jun", spend: 98000 },
  { month: "Jul", spend: 100000 },
  { month: "Aug", spend: 105000 },
  { month: "Sep", spend: 110000 },
  { month: "Oct", spend: 115000 },
  { month: "Nov", spend: 120000 },
  { month: "Dec", spend: 125000 },
]

const topSuppliers = [
  {
    id: 1,
    name: "GoldCraft Suppliers",
    category: "Metal Suppliers",
    spend: 250000,
    percentage: 25,
    change: "+5%",
  },
  {
    id: 2,
    name: "Diamond District Gems",
    category: "Stone Suppliers",
    spend: 200000,
    percentage: 20,
    change: "+3%",
  },
  {
    id: 3,
    name: "Pearl Perfection",
    category: "Stone Suppliers",
    spend: 150000,
    percentage: 15,
    change: "+8%",
  },
  {
    id: 4,
    name: "Precision Casting Co.",
    category: "Casting Services",
    spend: 80000,
    percentage: 8,
    change: "-2%",
  },
  {
    id: 5,
    name: "Swift Shipping Partners",
    category: "Shipping Partners",
    spend: 70000,
    percentage: 7,
    change: "+1%",
  },
]

interface SupplierSpendAnalysisProps {
  timeRange: string
  selectedSuppliers: string[]
  selectedCategories: string[]
}

export function SupplierSpendAnalysis({ timeRange, selectedSuppliers, selectedCategories }: SupplierSpendAnalysisProps) {
  const [dateRange, setDateRange] = useState("year")
  const [showFilters, setShowFilters] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supplier Spend Analysis</CardTitle>
          <CardDescription>Spend analysis and cost optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-2xl font-bold">Total Spend: {formatCurrency(1200000)}</div>
            <div className="flex items-center gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
              <Button>
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="metals">Metal Suppliers</SelectItem>
                    <SelectItem value="stones">Stone Suppliers</SelectItem>
                    <SelectItem value="findings">Findings Suppliers</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    <SelectItem value="goldcraft">GoldCraft Suppliers</SelectItem>
                    <SelectItem value="diamond">Diamond District Gems</SelectItem>
                    <SelectItem value="precision">Precision Casting Co.</SelectItem>
                    <SelectItem value="master">Master Engravers Guild</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Spend Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Spend</SelectItem>
                    <SelectItem value="high">High ({'>'}$100k)</SelectItem>
                    <SelectItem value="medium">Medium ($10k-$100k)</SelectItem>
                    <SelectItem value="low">Low ({'<'}$10k)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Spend by Category</CardTitle>
            <CardDescription>Distribution of spend across supplier categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {spendByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spend by Supplier</CardTitle>
            <CardDescription>Top suppliers by spend amount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  value: {
                    label: "Spend Amount",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={spendBySupplier}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-value)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spend Trend</CardTitle>
          <CardDescription>Monthly spend trend over the past year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                spend: {
                  label: "Monthly Spend",
                  color: "hsl(var(--chart-1))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="spend" stroke="var(--color-spend)" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Suppliers by Spend</CardTitle>
          <CardDescription>Detailed breakdown of top suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead className="text-right">% of Total</TableHead>
                  <TableHead className="text-right">YoY Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.category}</TableCell>
                    <TableCell className="text-right">{formatCurrency(supplier.spend)}</TableCell>
                    <TableCell className="text-right">{supplier.percentage}%</TableCell>
                    <TableCell className={`text-right ${supplier.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {supplier.change}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="savings">
        <TabsList className="mb-4">
          <TabsTrigger value="savings">Savings Opportunities</TabsTrigger>
          <TabsTrigger value="contracts">Contract Analysis</TabsTrigger>
          <TabsTrigger value="payment">Payment Terms</TabsTrigger>
          <TabsTrigger value="forecast">Spend Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="savings">
          <Card>
            <CardContent className="p-6">
              <div className="text-lg font-medium mb-4">Savings Opportunities</div>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="text-sm text-green-700">Identified Savings</div>
                    <div className="text-2xl font-bold text-green-800">{formatCurrency(85000)}</div>
                    <div className="text-xs text-green-600">7.1% of total spend</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="text-sm text-blue-700">Implemented Savings</div>
                    <div className="text-2xl font-bold text-blue-800">{formatCurrency(45000)}</div>
                    <div className="text-xs text-blue-600">3.8% of total spend</div>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-md">
                    <div className="text-sm text-amber-700">Pending Savings</div>
                    <div className="text-2xl font-bold text-amber-800">{formatCurrency(40000)}</div>
                    <div className="text-xs text-amber-600">3.3% of total spend</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Top Savings Opportunities</div>
                  <div className="rounded-md border">
                    <div className="p-3 border-b">
                      <div className="font-medium">Volume Discount - GoldCraft Suppliers</div>
                      <div className="text-sm text-muted-foreground">
                        Potential savings of {formatCurrency(25000)} by consolidating orders
                      </div>
                    </div>
                    <div className="p-3 border-b">
                      <div className="font-medium">Alternative Supplier - Findings</div>
                      <div className="text-sm text-muted-foreground">
                        Potential savings of {formatCurrency(18000)} by switching to alternative supplier
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="font-medium">Payment Terms - Diamond District Gems</div>
                      <div className="text-sm text-muted-foreground">
                        Potential savings of {formatCurrency(15000)} by negotiating early payment discount
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardContent className="p-6">
              <div className="text-lg font-medium mb-4">Contract Analysis</div>
              {/* Contract analysis content would go here */}
              <div className="text-muted-foreground">Contract analysis details would be displayed here.</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardContent className="p-6">
              <div className="text-lg font-medium mb-4">Payment Terms Analysis</div>
              {/* Payment terms content would go here */}
              <div className="text-muted-foreground">Payment terms analysis would be displayed here.</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast">
          <Card>
            <CardContent className="p-6">
              <div className="text-lg font-medium mb-4">Spend Forecast</div>
              {/* Spend forecast content would go here */}
              <div className="text-muted-foreground">Spend forecast details would be displayed here.</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SupplierSpendAnalysis;
