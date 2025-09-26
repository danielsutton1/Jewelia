"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function UpcomingSettlements() {
  // This would be fetched from your API in a real application
  const settlements = [
    {
      id: "SET-2024-005",
      date: "May 15, 2024",
      amount: 2850,
      items: 3,
      status: "scheduled",
    },
    {
      id: "SET-2024-006",
      date: "Jun 15, 2024",
      amount: 1200,
      items: 1,
      status: "pending",
    },
  ]

  const getStatusBadge = (status: any) => {
    switch (status) {
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
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Settlements</CardTitle>
        <CardDescription>Scheduled payments for your sold items</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Settlement ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Amount</TableHead>
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
                <TableCell>${settlement.amount}</TableCell>
                <TableCell>{getStatusBadge(settlement.status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/consignment-portal/settlements/${settlement.id}`}>Details</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" asChild>
            <Link href="/consignment-portal/settlements">View All Settlements</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
