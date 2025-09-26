"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, ArrowUpDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data for issues
const mockIssues = [
  {
    id: "ISS-001",
    partnerName: "Diamond Direct",
    itemType: "Diamond Ring",
    severity: "High",
    status: "Open",
    createdDate: "2023-05-15",
    description: "Stone setting is loose and diamond is at risk of falling out",
  },
  {
    id: "ISS-002",
    partnerName: "Goldsmith Supplies",
    itemType: "Gold Chain",
    severity: "Medium",
    status: "In Progress",
    createdDate: "2023-05-14",
    description: "Clasp mechanism not functioning properly",
  },
  {
    id: "ISS-003",
    partnerName: "Precision Casting",
    itemType: "Silver Bracelet",
    severity: "Low",
    status: "Resolved",
    createdDate: "2023-05-13",
    description: "Minor surface scratches on inner band",
  },
  {
    id: "ISS-004",
    partnerName: "Artisan Engraving",
    itemType: "Engraved Pendant",
    severity: "Medium",
    status: "Open",
    createdDate: "2023-05-12",
    description: "Engraving depth inconsistent across the design",
  },
  {
    id: "ISS-005",
    partnerName: "Master Plating",
    itemType: "Plated Earrings",
    severity: "High",
    status: "In Progress",
    createdDate: "2023-05-11",
    description: "Plating showing signs of peeling at connection points",
  },
]

export function MobileIssueTracking() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")

  const filteredIssues = mockIssues.filter((issue) => {
    const matchesSearch =
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.itemType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || issue.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesSeverity = severityFilter === "all" || issue.severity.toLowerCase() === severityFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesSeverity
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search issues..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("open")}>Open</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("in progress")}>In Progress</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("resolved")}>Resolved</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Severity
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSeverityFilter("all")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSeverityFilter("high")}>High</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSeverityFilter("medium")}>Medium</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSeverityFilter("low")}>Low</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        {filteredIssues.map((issue) => (
          <Card key={issue.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{issue.itemType}</CardTitle>
                <Badge
                  variant={
                    issue.severity === "High" ? "destructive" : issue.severity === "Medium" ? "default" : "outline"
                  }
                >
                  {issue.severity}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{issue.partnerName}</p>
                <Badge
                  variant={
                    issue.status === "Open" ? "outline" : issue.status === "In Progress" ? "default" : "secondary"
                  }
                >
                  {issue.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="mb-2 text-sm">{issue.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{new Date(issue.createdDate).toLocaleDateString()}</span>
                <Button size="sm">View</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
