"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Clock, AlertTriangle, DollarSign, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function ConsignmentOverview() {
  // This would be fetched from your API in a real application
  const stats = {
    activeConsignors: 24,
    activeItems: 187,
    pendingSettlements: 12,
    upcomingReturns: 8,
    totalConsignmentValue: 142750,
    averageCommissionRate: 35,
    averageDaysToSell: 45,
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Consignors</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeConsignors}</div>
            <p className="text-xs text-muted-foreground">Partners with active consignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consigned Items</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2H2v10h10V2Z" />
              <path d="M22 12h-4v4h-4v4H2v2h16v-6h4V12Z" />
              <path d="M22 2v8h-8V2h8Z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeItems}</div>
            <p className="text-xs text-muted-foreground">Items currently on consignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Settlements</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSettlements}</div>
            <p className="text-xs text-muted-foreground">Settlements awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Returns</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingReturns}</div>
            <p className="text-xs text-muted-foreground">Items due for return in 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Consignment Performance</CardTitle>
            <CardDescription>Overview of consignment sales and settlements</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="mx-auto h-12 w-12 mb-2" />
              <p>Performance chart would appear here</p>
              <p className="text-sm">Showing sales, settlements, and returns over time</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Important consignment notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Overdue Returns</AlertTitle>
              <AlertDescription>3 items are past their return deadline</AlertDescription>
            </Alert>

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Upcoming Settlements</AlertTitle>
              <AlertDescription>5 settlements due in the next 7 days</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" asChild>
          <Link href="/dashboard/consignment/items/add">Add Consigned Item</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/consignment/consignors/add">Add Consignor</Link>
        </Button>
      </div>
    </div>
  )
}
