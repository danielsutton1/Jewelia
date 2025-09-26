"use client"

import type { DateRange } from "react-day-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"

interface TopCustomersProps {
  dateRange: DateRange
}

export function TopCustomers({ dateRange }: TopCustomersProps) {
  // In a real app, this data would come from an API call based on the date range
  const customers = [
    {
      id: "CUST-001",
      name: "Luxury Boutique Inc.",
      revenue: 28500,
      orders: 12,
      status: "Returning",
    },
    {
      id: "CUST-002",
      name: "Elegant Accessories Co.",
      revenue: 22400,
      orders: 8,
      status: "Returning",
    },
    {
      id: "CUST-003",
      name: "Diamond Emporium",
      revenue: 18900,
      orders: 5,
      status: "New",
    },
    {
      id: "CUST-004",
      name: "Golden Treasures Ltd.",
      revenue: 15600,
      orders: 7,
      status: "Returning",
    },
    {
      id: "CUST-005",
      name: "Silver & Stone Gallery",
      revenue: 12800,
      orders: 6,
      status: "New",
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Top Customers</CardTitle>
          <CardDescription>Customers with highest revenue in selected period</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          View All <ArrowUpRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell className="text-right">${customer.revenue.toLocaleString()}</TableCell>
                <TableCell className="text-right">{customer.orders}</TableCell>
                <TableCell>
                  <Badge variant={customer.status === "New" ? "default" : "outline"}>{customer.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
