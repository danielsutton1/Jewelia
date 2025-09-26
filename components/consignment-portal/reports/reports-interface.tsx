"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SalesReport } from "./sales-report"
import { InventoryAgingReport } from "./inventory-aging-report"
import { SettlementStatements } from "./settlement-statements"
import { PerformanceMetrics } from "./performance-metrics"
import { Download, Printer, Share2 } from "lucide-react"

export function ReportsInterface() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  })

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    if (newDateRange) {
      setDateRange(newDateRange)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">View and download reports for your consignment business</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Settings</CardTitle>
          <CardDescription>Customize your report view</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <DateRangePicker dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="rings">Rings</SelectItem>
                <SelectItem value="necklaces">Necklaces</SelectItem>
                <SelectItem value="bracelets">Bracelets</SelectItem>
                <SelectItem value="earrings">Earrings</SelectItem>
                <SelectItem value="watches">Watches</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Aging</TabsTrigger>
          <TabsTrigger value="settlements">Settlement Statements</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        </TabsList>
        {dateRange.from && dateRange.to ? (
          <>
            <TabsContent value="sales" className="space-y-4">
              <SalesReport dateRange={{ from: dateRange.from, to: dateRange.to }} />
            </TabsContent>
            <TabsContent value="inventory" className="space-y-4">
              <InventoryAgingReport dateRange={{ from: dateRange.from, to: dateRange.to }} />
            </TabsContent>
            <TabsContent value="settlements" className="space-y-4">
              <SettlementStatements dateRange={{ from: dateRange.from, to: dateRange.to }} />
            </TabsContent>
            <TabsContent value="performance" className="space-y-4">
              <PerformanceMetrics dateRange={{ from: dateRange.from, to: dateRange.to }} />
            </TabsContent>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Please select a date range to view reports
          </div>
        )}
      </Tabs>
    </div>
  )
}
