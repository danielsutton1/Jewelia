"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface SalesReportProps {
  dateRange: {
    from: Date
    to: Date
  }
}

export function SalesReport({ dateRange }: SalesReportProps) {
  // This would be fetched from your API in a real application
  const salesData = [
    { month: "Jan", sales: 2, value: 3800 },
    { month: "Feb", sales: 1, value: 2200 },
    { month: "Mar", sales: 3, value: 5400 },
    { month: "Apr", sales: 2, value: 3600 },
    { month: "May", sales: 4, value: 7200 },
    { month: "Jun", sales: 3, value: 5800 },
  ]

  const recentSales = [
    {
      id: "SALE-2024-001",
      date: "May 2, 2024",
      item: "Diamond Tennis Bracelet",
      itemId: "ITEM-1001",
      price: 3500,
      commission: 1050,
      settlement: "May 15, 2024",
    },
    {
      id: "SALE-2024-002",
      date: "Apr 18, 2024",
      item: "Sapphire Pendant Necklace",
      itemId: "ITEM-1002",
      price: 2800,
      commission: 700,
      settlement: "May 15, 2024",
    },
    {
      id: "SALE-2024-003",
      date: "Apr 5, 2024",
      item: "Pearl Earrings",
      itemId: "ITEM-1004",
      price: 1200,
      commission: 480,
      settlement: "Apr 15, 2024",
    },
    {
      id: "SALE-2023-012",
      date: "Dec 15, 2023",
      item: "Emerald Ring",
      itemId: "ITEM-1005",
      price: 3800,
      commission: 950,
      settlement: "Jan 15, 2024",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Items sold in the last 12 months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,750</div>
            <p className="text-xs text-muted-foreground">Total value of sold items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$17,325</div>
            <p className="text-xs text-muted-foreground">After commission (30% avg.)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
          <CardDescription>Monthly sales over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                sales: {
                  label: "Items Sold",
                  color: "hsl(var(--chart-1))",
                },
                value: {
                  label: "Sales Value ($)",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="sales" stroke="var(--color-sales)" name="Items Sold" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    name="Sales Value ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Your most recent sales transactions</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sale ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Sale Price</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Your Earnings</TableHead>
                <TableHead>Settlement Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.id}</TableCell>
                  <TableCell>{sale.date}</TableCell>
                  <TableCell>
                    <div>{sale.item}</div>
                    <div className="text-xs text-muted-foreground">{sale.itemId}</div>
                  </TableCell>
                  <TableCell>${sale.price.toLocaleString()}</TableCell>
                  <TableCell>${sale.commission.toLocaleString()}</TableCell>
                  <TableCell>${(sale.price - sale.commission).toLocaleString()}</TableCell>
                  <TableCell>{sale.settlement}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Details
                    </Button>
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
