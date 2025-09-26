"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Download, FileText, Printer, BarChart3 } from "lucide-react"
import type { DateRange } from "react-day-picker"

export function ConsignmentReports() {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  })
  
  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    if (newDateRange && newDateRange.from && newDateRange.to) {
      setDateRange({ from: newDateRange.from, to: newDateRange.to });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Consignment Reports</CardTitle>
          <CardDescription>
            Generate and view reports for consignment activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="by-consignor" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="by-consignor">By Consignor</TabsTrigger>
                <TabsTrigger value="settlements">Settlements</TabsTrigger>
                <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-2">
                <DatePickerWithRange
                  dateRange={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                />
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <TabsContent value="by-consignor" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Items by Consignor</h3>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select consignor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Consignors</SelectItem>
                    <SelectItem value="CON-001">Eleanor Rigby</SelectItem>
                    <SelectItem value="CON-002">Jude Fawley</SelectItem>
                    <SelectItem value="CON-003">Lucy Diamond</SelectItem>
                    <SelectItem value="CON-005">Rita Meter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Consignor</TableHead>
                      <TableHead>Active Items</TableHead>
                      <TableHead>Sold Items</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Commission Earned</TableHead>
                      <TableHead>Avg. Days to Sell</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Eleanor Rigby</TableCell>
                      <TableCell>12</TableCell>
                      <TableCell>5</TableCell>
                      <TableCell>$24,500</TableCell>
                      <TableCell>$3,675</TableCell>
                      <TableCell>42</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Lucy Diamond</TableCell>
                      <TableCell>15</TableCell>
                      <TableCell>8</TableCell>
                      <TableCell>$31,200</TableCell>
                      <TableCell>$7,800</TableCell>
                      <TableCell>38</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Jude Fawley</TableCell>
                      <TableCell>8</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>$16,750</TableCell>
                      <TableCell>$5,862</TableCell>
                      <TableCell>51</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Rita Meter</TableCell>
                      <TableCell>5</TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>$9,800</TableCell>
                      <TableCell>$3,920</TableCell>
                      <TableCell>29</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="settlements" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Settlement Calculations</h3>
                <Select defaultValue="pending">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter settlements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Settlements</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Settlement ID</TableHead>
                      <TableHead>Consignor</TableHead>
                      <TableHead>Items Sold</TableHead>
                      <TableHead>Sale Amount</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Payout</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>SET-2024-001</TableCell>
                      <TableCell>Lucy Diamond</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>$8,200</TableCell>
                      <TableCell>$2,050</TableCell>
                      <TableCell>$6,150</TableCell>
                      <TableCell>Pending</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Process
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>SET-2024-002</TableCell>
                      <TableCell>Eleanor Rigby</TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>$5,800</TableCell>
                      <TableCell>$1,740</TableCell>
                      <TableCell>$4,060</TableCell>
                      <TableCell>Completed</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="aging" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Aging Consignments</h3>
                <div className="flex items-center space-x-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="30">30+ Days</SelectItem>
                      <SelectItem value="60">60+ Days</SelectItem>
                      <SelectItem value="90">90+ Days</SelectItem>
                      <SelectItem value="120">120+ Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Card className="border">
                <CardContent className="p-6">
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="mx-auto h-12 w-12 mb-2" />
                      <p>Aging analysis chart would appear here</p>
                      <p className="text-sm">Showing distribution of items by age in inventory</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item ID</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Age</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>1</TableCell>
                      <TableCell>Item 1</TableCell>
                      <TableCell>45 Days</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2</TableCell>
                      <TableCell>Item 2</TableCell>
                      <TableCell>30 Days</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>3</TableCell>
                      <TableCell>Item 3</TableCell>
                      <TableCell>60 Days</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
