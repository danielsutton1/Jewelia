"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { BarChart, CalendarIcon, Download, FileText, Printer, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function AuditReports() {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [searchQuery, setSearchQuery] = useState("")
  const [reportType, setReportType] = useState("all")

  // Mock reports data
  const mockReports = {
    auditSummaries: [
      {
        id: "AUD-2023-04",
        name: "Display Cases Audit",
        date: "2023-04-28",
        locations: ["Display Case A", "Display Case B", "Display Case C"],
        itemsScanned: 134,
        discrepancies: 8,
        valueImpact: -1299.99,
      },
      {
        id: "AUD-2023-03",
        name: "Workshop Inventory Check",
        date: "2023-03-15",
        locations: ["Work Bench 1", "Work Bench 2", "Storage Cabinet"],
        itemsScanned: 56,
        discrepancies: 5,
        valueImpact: 499.99,
      },
      {
        id: "AUD-2023-02",
        name: "Vault Monthly Verification",
        date: "2023-02-01",
        locations: ["Safe 1", "Safe 2"],
        itemsScanned: 87,
        discrepancies: 3,
        valueImpact: -4999.98,
      },
    ],
    missingItems: [
      {
        auditId: "AUD-2023-04",
        auditName: "Display Cases Audit",
        date: "2023-04-28",
        sku: "JR-001",
        name: "Diamond Ring",
        location: "Display Case A",
        expected: 3,
        actual: 2,
        value: 1299.99,
      },
      {
        auditId: "AUD-2023-02",
        auditName: "Vault Monthly Verification",
        date: "2023-02-01",
        sku: "JP-005",
        name: "Diamond Pendant",
        location: "Safe 1",
        expected: 2,
        actual: 0,
        value: 4999.98,
      },
    ],
    extraItems: [
      {
        auditId: "AUD-2023-04",
        auditName: "Display Cases Audit",
        date: "2023-04-28",
        sku: "JE-003",
        name: "Pearl Earrings",
        location: "Display Case B",
        expected: 5,
        actual: 6,
        value: 499.99,
      },
      {
        auditId: "AUD-2023-03",
        auditName: "Workshop Inventory Check",
        date: "2023-03-15",
        sku: "JB-004",
        name: "Sapphire Bracelet",
        location: "Work Bench 1",
        expected: 1,
        actual: 2,
        value: 1899.99,
      },
    ],
    locationMismatches: [
      {
        auditId: "AUD-2023-04",
        auditName: "Display Cases Audit",
        date: "2023-04-28",
        sku: "JN-002",
        name: "Gold Necklace",
        expectedLocation: "Display Case A",
        actualLocation: "Display Case C",
      },
    ],
    valueVariances: [
      {
        auditId: "AUD-2023-04",
        auditName: "Display Cases Audit",
        date: "2023-04-28",
        category: "Rings",
        expectedValue: 12999.9,
        actualValue: 11699.91,
        difference: -1299.99,
      },
      {
        auditId: "AUD-2023-02",
        auditName: "Vault Monthly Verification",
        date: "2023-02-01",
        category: "Pendants",
        expectedValue: 9999.96,
        actualValue: 4999.98,
        difference: -4999.98,
      },
      {
        auditId: "AUD-2023-03",
        auditName: "Workshop Inventory Check",
        date: "2023-03-15",
        category: "Earrings",
        expectedValue: 2499.95,
        actualValue: 2999.94,
        difference: 499.99,
      },
      {
        auditId: "AUD-2023-03",
        auditName: "Workshop Inventory Check",
        date: "2023-03-15",
        category: "Bracelets",
        expectedValue: 1899.99,
        actualValue: 3799.98,
        difference: 1899.99,
      },
    ],
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Audit Reports</h2>
        <Button>
          <BarChart className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Filter reports by date range, type, and search terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="missing">Missing Items</SelectItem>
                  <SelectItem value="extra">Extra Items</SelectItem>
                  <SelectItem value="location">Location Mismatches</SelectItem>
                  <SelectItem value="value">Value Variances</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search reports..." className="pl-8" value={searchQuery} onChange={handleSearch} />
              </div>
            </div>
          </div>
        </CardContent>
        <div className="border-t pt-6">
          <Button variant="outline" className="ml-auto mr-2">
            Reset Filters
          </Button>
          <Button>Apply Filters</Button>
        </div>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="summary">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">Audit Summary</TabsTrigger>
          <TabsTrigger value="missing">Missing Items</TabsTrigger>
          <TabsTrigger value="extra">Extra Items</TabsTrigger>
          <TabsTrigger value="location">Location Mismatches</TabsTrigger>
          <TabsTrigger value="value">Value Variances</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Summary Reports</CardTitle>
              <CardDescription>Overview of completed audits</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Audit ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Locations</TableHead>
                      <TableHead className="text-right">Items Scanned</TableHead>
                      <TableHead className="text-right">Discrepancies</TableHead>
                      <TableHead className="text-right">Value Impact</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockReports.auditSummaries.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.id}</TableCell>
                        <TableCell>{report.name}</TableCell>
                        <TableCell>{report.date}</TableCell>
                        <TableCell>{report.locations.length} locations</TableCell>
                        <TableCell className="text-right">{report.itemsScanned}</TableCell>
                        <TableCell className="text-right">{report.discrepancies}</TableCell>
                        <TableCell
                          className={`text-right ${report.valueImpact < 0 ? "text-red-500" : "text-green-500"}`}
                        >
                          {report.valueImpact > 0 ? "+" : ""}$
                          {report.valueImpact.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
            <div className="border-t pt-6">
              <Button variant="outline" className="ml-auto mr-2">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="missing" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Missing Items Reports</CardTitle>
              <CardDescription>Items with fewer quantities than expected</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Audit</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Expected</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead className="text-right">Value Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockReports.missingItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.auditId}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell className="text-right">{item.expected}</TableCell>
                        <TableCell className="text-right">{item.actual}</TableCell>
                        <TableCell className="text-right text-red-500">
                          -$
                          {item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
            <div className="border-t pt-6">
              <Button variant="outline" className="ml-auto mr-2">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="extra" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Extra Items Reports</CardTitle>
              <CardDescription>Items with more quantities than expected</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Audit</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Expected</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead className="text-right">Value Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockReports.extraItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.auditId}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell className="text-right">{item.expected}</TableCell>
                        <TableCell className="text-right">{item.actual}</TableCell>
                        <TableCell className="text-right text-green-500">
                          +$
                          {item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
            <div className="border-t pt-6">
              <Button variant="outline" className="ml-auto mr-2">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Mismatches Reports</CardTitle>
              <CardDescription>Items found in different locations than expected</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Audit</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Expected Location</TableHead>
                      <TableHead>Actual Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockReports.locationMismatches.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.auditId}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.expectedLocation}</TableCell>
                        <TableCell>{item.actualLocation}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
            <div className="border-t pt-6">
              <Button variant="outline" className="ml-auto mr-2">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="value" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Value Variances Reports</CardTitle>
              <CardDescription>Value differences by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Audit</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Expected Value</TableHead>
                      <TableHead className="text-right">Actual Value</TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockReports.valueVariances.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.auditId}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">
                          $
                          {item.expectedValue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          $
                          {item.actualValue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className={`text-right ${item.difference < 0 ? "text-red-500" : "text-green-500"}`}>
                          {item.difference > 0 ? "+" : ""}$
                          {item.difference.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
            <div className="border-t pt-6">
              <Button variant="outline" className="ml-auto mr-2">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
