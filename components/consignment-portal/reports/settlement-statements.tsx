"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye } from "lucide-react"
import Link from "next/link"

interface SettlementStatementsProps {
  dateRange: {
    from: Date
    to: Date
  }
}

export function SettlementStatements({ dateRange }: SettlementStatementsProps) {
  // This would be fetched from your API in a real application
  const settlements = [
    {
      id: "SET-2024-004",
      date: "Apr 15, 2024",
      items: 3,
      salesTotal: 7300,
      commission: 2190,
      payout: 5110,
      status: "completed",
    },
    {
      id: "SET-2024-003",
      date: "Mar 15, 2024",
      items: 2,
      salesTotal: 5200,
      commission: 1560,
      payout: 3640,
      status: "completed",
    },
    {
      id: "SET-2024-002",
      date: "Feb 15, 2024",
      items: 1,
      salesTotal: 2200,
      commission: 660,
      payout: 1540,
      status: "completed",
    },
    {
      id: "SET-2024-001",
      date: "Jan 15, 2024",
      items: 2,
      salesTotal: 6500,
      commission: 1950,
      payout: 4550,
      status: "completed",
    },
    {
      id: "SET-2023-012",
      date: "Dec 15, 2023",
      items: 1,
      salesTotal: 3800,
      commission: 950,
      payout: 2850,
      status: "completed",
    },
  ]

  const upcomingSettlements = [
    {
      id: "SET-2024-005",
      date: "May 15, 2024",
      items: 3,
      salesTotal: 7500,
      commission: 2250,
      payout: 5250,
      status: "scheduled",
    },
    {
      id: "SET-2024-006",
      date: "Jun 15, 2024",
      items: 1,
      salesTotal: 1200,
      commission: 480,
      payout: 720,
      status: "pending",
    },
  ]

  const getStatusBadge = (status: any) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "scheduled":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Scheduled
          </Badge>
        )
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Settlements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">All-time settlement count</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$17,690</div>
            <p className="text-xs text-muted-foreground">All-time settlement payouts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5,970</div>
            <p className="text-xs text-muted-foreground">Pending settlement amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Settlement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">May 15</div>
            <p className="text-xs text-muted-foreground">$5,250 for 3 items</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Upcoming Settlements</CardTitle>
            <CardDescription>Scheduled and pending settlements</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Settlement ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Sales Total</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Your Payout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingSettlements.map((settlement) => (
                <TableRow key={settlement.id}>
                  <TableCell className="font-medium">{settlement.id}</TableCell>
                  <TableCell>{settlement.date}</TableCell>
                  <TableCell>{settlement.items}</TableCell>
                  <TableCell>${settlement.salesTotal.toLocaleString()}</TableCell>
                  <TableCell>${settlement.commission.toLocaleString()}</TableCell>
                  <TableCell>${settlement.payout.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(settlement.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/consignment-portal/settlements/${settlement.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Settlement History</CardTitle>
            <CardDescription>Past settlement statements</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Settlement ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Sales Total</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Your Payout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlements.map((settlement) => (
                <TableRow key={settlement.id}>
                  <TableCell className="font-medium">{settlement.id}</TableCell>
                  <TableCell>{settlement.date}</TableCell>
                  <TableCell>{settlement.items}</TableCell>
                  <TableCell>${settlement.salesTotal.toLocaleString()}</TableCell>
                  <TableCell>${settlement.commission.toLocaleString()}</TableCell>
                  <TableCell>${settlement.payout.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(settlement.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/consignment-portal/settlements/${settlement.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
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
