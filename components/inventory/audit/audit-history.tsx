"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, Download, Eye, FileText, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function AuditHistory() {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Mock audit history data
  const mockAudits = [
    {
      id: "AUD-2023-05",
      name: "Main Showroom Quarterly Audit",
      startDate: "2023-05-15",
      completionDate: "2023-05-21",
      status: "In Progress",
      locations: ["Main Showroom", "Display Case A", "Display Case B", "Display Case C"],
      assignedUsers: ["John Doe", "Jane Smith"],
      itemsScanned: 87,
      totalItems: 134,
      discrepancies: 12,
      valueImpact: -1299.99,
    },
    {
      id: "AUD-2023-04",
      name: "Display Cases Audit",
      startDate: "2023-04-22",
      completionDate: "2023-04-28",
      status: "Completed",
      locations: ["Display Case A", "Display Case B", "Display Case C"],
      assignedUsers: ["John Doe", "Jane Smith"],
      itemsScanned: 134,
      totalItems: 134,
      discrepancies: 8,
      valueImpact: -1299.99,
    },
    {
      id: "AUD-2023-03",
      name: "Workshop Inventory Check",
      startDate: "2023-03-10",
      completionDate: "2023-03-15",
      status: "Completed",
      locations: ["Workshop", "Work Bench 1", "Work Bench 2", "Storage Cabinet"],
      assignedUsers: ["Alice Johnson"],
      itemsScanned: 56,
      totalItems: 56,
      discrepancies: 5,
      valueImpact: 499.99,
    },
    {
      id: "AUD-2023-02",
      name: "Vault Monthly Verification",
      startDate: "2023-02-01",
      completionDate: "2023-02-03",
      status: "Completed",
      locations: ["Vault", "Safe 1", "Safe 2"],
      assignedUsers: ["John Doe"],
      itemsScanned: 87,
      totalItems: 87,
      discrepancies: 3,
      valueImpact: -4999.98,
    },
    {
      id: "AUD-2023-01",
      name: "Annual Inventory Audit",
      startDate: "2023-01-05",
      completionDate: "2023-01-12",
      status: "Completed",
      locations: ["Main Showroom", "Vault", "Workshop", "Back Office"],
      assignedUsers: ["John Doe", "Jane Smith", "Alice Johnson", "Bob Wilson"],
      itemsScanned: 312,
      totalItems: 312,
      discrepancies: 24,
      valueImpact: -8799.97,
    },
  ]

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Filter audits based on search, date range, and status
  const filteredAudits = mockAudits.filter((audit) => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        audit.id.toLowerCase().includes(query) ||
        audit.name.toLowerCase().includes(query) ||
        audit.locations.some((loc) => loc.toLowerCase().includes(query))
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "completed" && audit.status !== "Completed") return false
      if (statusFilter === "in-progress" && audit.status !== "In Progress") return false
    }

    // Apply date filters (simplified for demo)
    // In a real app, you would parse the dates and do proper comparison

    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Audit History</h2>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export History
        </Button>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search audits..." className="pl-8" value={searchQuery} onChange={handleSearch} />
            </div>

            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Start Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "End Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit History Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Audit ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Completion Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Locations</TableHead>
            <TableHead className="text-right">Items</TableHead>
            <TableHead className="text-right">Discrepancies</TableHead>
            <TableHead className="text-right">Value Impact</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAudits.map((audit) => (
            <TableRow key={audit.id}>
              <TableCell className="font-medium">{audit.id}</TableCell>
              <TableCell>{audit.name}</TableCell>
              <TableCell>{audit.startDate}</TableCell>
              <TableCell>{audit.completionDate}</TableCell>
              <TableCell>
                {audit.status === "Completed" ? (
                  <Badge className="bg-green-500">Completed</Badge>
                ) : (
                  <Badge className="bg-amber-500">In Progress</Badge>
                )}
              </TableCell>
              <TableCell>{audit.locations.length} locations</TableCell>
              <TableCell className="text-right">
                {audit.itemsScanned} / {audit.totalItems}
              </TableCell>
              <TableCell className="text-right">{audit.discrepancies}</TableCell>
              <TableCell className={`text-right ${audit.valueImpact < 0 ? "text-red-500" : "text-green-500"}`}>
                {audit.valueImpact > 0 ? "+" : ""}$
                {audit.valueImpact.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
