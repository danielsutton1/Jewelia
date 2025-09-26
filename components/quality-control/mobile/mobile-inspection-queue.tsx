"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// Mock data for inspection queue
const mockInspections = [
  {
    id: "INS-001",
    partnerName: "Diamond Direct",
    itemType: "Diamond Ring",
    priority: "High",
    receivedDate: "2023-05-15",
    status: "Pending",
  },
  {
    id: "INS-002",
    partnerName: "Goldsmith Supplies",
    itemType: "Gold Chain",
    priority: "Medium",
    receivedDate: "2023-05-14",
    status: "Pending",
  },
  {
    id: "INS-003",
    partnerName: "Precision Casting",
    itemType: "Silver Bracelet",
    priority: "Low",
    receivedDate: "2023-05-13",
    status: "In Progress",
  },
  {
    id: "INS-004",
    partnerName: "Artisan Engraving",
    itemType: "Engraved Pendant",
    priority: "Medium",
    receivedDate: "2023-05-12",
    status: "In Progress",
  },
  {
    id: "INS-005",
    partnerName: "Master Plating",
    itemType: "Plated Earrings",
    priority: "High",
    receivedDate: "2023-05-11",
    status: "Pending",
  },
]

export function MobileInspectionQueue() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all")

  const filteredInspections = mockInspections.filter((inspection) => {
    const matchesSearch =
      inspection.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.itemType.toLowerCase().includes(searchQuery.toLowerCase())

    if (filter === "all") return matchesSearch
    if (filter === "pending") return matchesSearch && inspection.status === "Pending"
    if (filter === "in-progress") return matchesSearch && inspection.status === "In Progress"
    return matchesSearch
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search inspections..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
          All
        </Button>
        <Button variant={filter === "pending" ? "default" : "outline"} size="sm" onClick={() => setFilter("pending")}>
          Pending
        </Button>
        <Button
          variant={filter === "in-progress" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("in-progress")}
        >
          In Progress
        </Button>
      </div>

      <div className="space-y-3">
        {filteredInspections.map((inspection) => (
          <Card key={inspection.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{inspection.itemType}</CardTitle>
                <Badge
                  variant={
                    inspection.priority === "High"
                      ? "destructive"
                      : inspection.priority === "Medium"
                        ? "default"
                        : "outline"
                  }
                >
                  {inspection.priority}
                </Badge>
              </div>
              <CardDescription>{inspection.partnerName}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">ID: {inspection.id}</span>
                  <span className="text-muted-foreground">
                    Received: {new Date(inspection.receivedDate).toLocaleDateString()}
                  </span>
                </div>
                <Button size="sm">Inspect</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
