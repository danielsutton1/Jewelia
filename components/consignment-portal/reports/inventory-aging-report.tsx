"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface InventoryAgingReportProps {
  dateRange: {
    from: Date
    to: Date
  }
}

export function InventoryAgingReport({ dateRange }: InventoryAgingReportProps) {
  // This would be fetched from your API in a real application
  const agingData = [
    { range: "0-30 days", count: 5, value: 8500 },
    { range: "31-60 days", count: 8, value: 14200 },
    { range: "61-90 days", count: 6, value: 10800 },
    { range: "91-180 days", count: 7, value: 12500 },
    { range: "181+ days", count: 2, value: 4500 },
  ]

  const inventoryItems = [
    {
      id: "ITEM-1001",
      name: "Diamond Tennis Bracelet",
      dateReceived: "2023-09-15",
      endDate: "2024-09-15",
      daysInInventory: 230,
      daysRemaining: 120,
      status: "active",
      price: 3500,
      category: "Bracelets",
    },
    {
      id: "ITEM-1002",
      name: "Sapphire Pendant Necklace",
      dateReceived: "2023-10-02",
      endDate: "2024-10-02",
      daysInInventory: 213,
      daysRemaining: 137,
      status: "active",
      price: 2800,
      category: "Necklaces",
    },
    {
      id: "ITEM-1003",
      name: "Vintage Gold Watch",
      dateReceived: "2023-11-10",
      endDate: "2024-05-10",
      daysInInventory: 174,
      daysRemaining: -7,
      status: "expired",
      price: 4200,
      category: "Watches",
    },
    {
      id: "ITEM-1004",
      name: "Pearl Earrings",
      dateReceived: "2023-12-05",
      endDate: "2024-12-05",
      daysInInventory: 149,
      daysRemaining: 201,
      status: "active",
      price: 1200,
      category: "Earrings",
    },
    {
      id: "ITEM-1006",
      name: "Ruby Stud Earrings",
      dateReceived: "2024-01-15",
      endDate: "2025-01-15",
      daysInInventory: 108,
      daysRemaining: 242,
      status: "active",
      price: 1800,
      category: "Earrings",
    },
  ]

  const getStatusBadge = (status: any, daysRemaining: any) => {
    switch (status) {
      case "expired":
        return <Badge variant="destructive">Expired</Badge>
      case "active":
        return daysRemaining <= 30 ? (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Ending Soon
          </Badge>
        ) : (
          <Badge variant="outline">Active</Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Items currently on consignment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87 days</div>
            <p className="text-xs text-muted-foreground">Average time in inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oldest Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">230 days</div>
            <p className="text-xs text-muted-foreground">Diamond Tennis Bracelet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Items expiring in 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Aging Distribution</CardTitle>
          <CardDescription>Items by time in inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                count: {
                  label: "Number of Items",
                  color: "hsl(var(--chart-1))",
                },
                value: {
                  label: "Total Value ($)",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="var(--color-count)" name="Number of Items" />
                  <Bar yAxisId="right" dataKey="value" fill="var(--color-value)" name="Total Value ($)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Aging Details</CardTitle>
          <CardDescription>Detailed view of your inventory aging</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item ID</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Days in Inventory</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.daysInInventory} days</TableCell>
                  <TableCell>${item.price.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(item.status, item.daysRemaining)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={((item.daysRemaining <= 0 ? 0 : item.daysRemaining) / 365) * 100}
                        className="h-2"
                      />
                      <span className="text-xs">
                        {item.daysRemaining > 0 ? `${item.daysRemaining} days` : "Expired"}
                      </span>
                    </div>
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
