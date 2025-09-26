"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Search, PenToolIcon as Tool } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data for maintenance history
const maintenanceHistoryData = [
  {
    id: "MH001",
    equipmentId: "EQ001",
    equipmentName: "Laser Welder",
    maintenanceType: "Preventive",
    technician: "John Smith",
    date: "2023-04-15",
    duration: "2.5 hours",
    cost: "$350",
    issues: "Calibration drift, lens cleaning",
    resolution: "Recalibrated system, replaced lens protector",
    notes: "Recommended quarterly calibration check",
    status: "completed",
  },
  {
    id: "MH002",
    equipmentId: "EQ002",
    equipmentName: "Rolling Mill",
    maintenanceType: "Repair",
    technician: "Maria Rodriguez",
    date: "2023-05-22",
    duration: "4 hours",
    cost: "$620",
    issues: "Motor overheating, unusual noise",
    resolution: "Replaced motor bearings, lubricated gears",
    notes: "Monitor for similar issues in next 30 days",
    status: "completed",
  },
  {
    id: "MH003",
    equipmentId: "EQ003",
    equipmentName: "Ultrasonic Cleaner",
    maintenanceType: "Preventive",
    technician: "David Chen",
    date: "2023-06-10",
    duration: "1 hour",
    cost: "$150",
    issues: "Routine inspection",
    resolution: "Replaced heating element, updated firmware",
    notes: "Operating at optimal efficiency",
    status: "completed",
  },
  {
    id: "MH004",
    equipmentId: "EQ001",
    equipmentName: "Laser Welder",
    maintenanceType: "Emergency",
    technician: "John Smith",
    date: "2023-07-03",
    duration: "3 hours",
    cost: "$780",
    issues: "Power supply failure",
    resolution: "Replaced power supply unit",
    notes: "Recommended surge protector installation",
    status: "completed",
  },
  {
    id: "MH005",
    equipmentId: "EQ004",
    equipmentName: "Casting Machine",
    maintenanceType: "Scheduled",
    technician: "Sarah Johnson",
    date: "2023-07-15",
    duration: "5 hours",
    cost: "$950",
    issues: "Vacuum pump efficiency decreased",
    resolution: "Rebuilt vacuum pump, replaced seals",
    notes: "Schedule follow-up in 3 months",
    status: "in-progress",
  },
  {
    id: "MH006",
    equipmentId: "EQ005",
    equipmentName: "Polishing Machine",
    maintenanceType: "Preventive",
    technician: "Robert Williams",
    date: "2023-08-02",
    duration: "2 hours",
    cost: "$280",
    issues: "Belt wear, dust buildup",
    resolution: "Replaced belt, cleaned dust collection system",
    notes: "Recommended weekly cleaning of dust filters",
    status: "scheduled",
  },
]

export function MaintenanceHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  // Filter the maintenance history based on search term and filters
  const filteredHistory = maintenanceHistoryData.filter((item) => {
    const matchesSearch =
      item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.issues.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || item.maintenanceType === filterType
    const matchesStatus = filterStatus === "all" || item.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  // Function to get the appropriate badge color based on maintenance type
  const getMaintenanceTypeBadge = (type: string) => {
    switch (type) {
      case "Preventive":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Preventive
          </Badge>
        )
      case "Repair":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Repair
          </Badge>
        )
      case "Emergency":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Emergency
          </Badge>
        )
      case "Scheduled":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Scheduled
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  // Function to get the appropriate badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
      case "scheduled":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Scheduled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance History</CardTitle>
        <CardDescription>View and filter equipment maintenance records</CardDescription>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by equipment, technician, or issue..."
              className="w-full sm:w-[300px] pl-8 rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Preventive">Preventive</SelectItem>
                <SelectItem value="Repair">Repair</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden lg:table-cell">Duration</TableHead>
                <TableHead className="hidden lg:table-cell">Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.equipmentName}</TableCell>
                    <TableCell>{getMaintenanceTypeBadge(record.maintenanceType)}</TableCell>
                    <TableCell>{record.technician}</TableCell>
                    <TableCell className="hidden md:table-cell">{record.date}</TableCell>
                    <TableCell className="hidden lg:table-cell">{record.duration}</TableCell>
                    <TableCell className="hidden lg:table-cell">{record.cost}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" title="Actions">
                            <span className="sr-only">Open actions</span>
                            <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="4" cy="10" r="1.5" fill="currentColor"/><circle cx="10" cy="10" r="1.5" fill="currentColor"/><circle cx="16" cy="10" r="1.5" fill="currentColor"/></svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => alert('View details clicked')}>
                            <FileText className="h-4 w-4 mr-2" /> View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => alert('Schedule follow-up clicked')}>
                            <Tool className="h-4 w-4 mr-2" /> Schedule follow-up
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No maintenance records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
