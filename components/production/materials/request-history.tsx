"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Search,
  Calendar,
  Filter,
  CheckCircle,
  XCircleIcon,
  RotateCcw,
} from "lucide-react"

// Sample history data
const requestHistory = [
  {
    id: "REQ-2023-001",
    workOrderId: "WO-2023-1001",
    workOrderDescription: "Diamond Engagement Ring",
    materialType: "metal",
    materialName: "18K White Gold",
    quantity: 15,
    unit: "g",
    requiredDate: "2023-05-20",
    requestDate: "2023-05-10",
    fulfillmentDate: "2023-05-15",
    urgencyLevel: "high",
    status: "fulfilled",
    requestedBy: "John Smith",
    approvedBy: "Maria Garcia",
    fulfilledBy: "David Chen",
  },
  {
    id: "REQ-2023-002",
    workOrderId: "WO-2023-1002",
    workOrderDescription: "Sapphire Pendant",
    materialType: "stones",
    materialName: "Sapphire Oval 1ct",
    quantity: 1,
    unit: "pcs",
    requiredDate: "2023-05-25",
    requestDate: "2023-05-12",
    fulfillmentDate: null,
    urgencyLevel: "medium",
    status: "denied",
    requestedBy: "Sarah Johnson",
    approvedBy: null,
    deniedBy: "Maria Garcia",
    denialReason: "Alternative material recommended",
  },
  {
    id: "REQ-2023-003",
    workOrderId: "WO-2023-1003",
    workOrderDescription: "Gold Chain Bracelet",
    materialType: "findings",
    materialName: "Lobster Clasp 14K",
    quantity: 5,
    unit: "pcs",
    requiredDate: "2023-05-18",
    requestDate: "2023-05-09",
    fulfillmentDate: "2023-05-16",
    urgencyLevel: "low",
    status: "fulfilled",
    requestedBy: "Michael Brown",
    approvedBy: "Maria Garcia",
    fulfilledBy: "David Chen",
  },
  {
    id: "REQ-2023-004",
    workOrderId: "WO-2023-1004",
    workOrderDescription: "Pearl Earrings",
    materialType: "findings",
    materialName: "Earring Posts Silver",
    quantity: 10,
    unit: "pairs",
    requiredDate: "2023-05-22",
    requestDate: "2023-05-14",
    fulfillmentDate: null,
    urgencyLevel: "critical",
    status: "denied",
    requestedBy: "Emily Davis",
    approvedBy: null,
    deniedBy: "Maria Garcia",
    denialReason: "Budget constraints",
  },
]

// Helper function to get status badge
function getStatusBadge(status: string) {
  switch (status) {
    case "pending_approval":
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> Pending Approval
        </Badge>
      )
    case "approved":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Approved
        </Badge>
      )
    case "partially_fulfilled":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Partially Fulfilled
        </Badge>
      )
    case "back_ordered":
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
          <RotateCcw className="h-3 w-3" /> Back Ordered
        </Badge>
      )
    case "fulfilled":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Fulfilled
        </Badge>
      )
    case "denied":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <XCircleIcon className="h-3 w-3" /> Denied
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function RequestHistory() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request History</CardTitle>
        <CardDescription>View past material requests and their outcomes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search requests..." className="pl-8 rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600" />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-1">
              <Calendar className="h-4 w-4" />
              Date Range
            </Button>
            <Button variant="outline" className="gap-1">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Work Order</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Request Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requestHistory.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.id}</TableCell>
                <TableCell>{request.workOrderId}</TableCell>
                <TableCell>{request.materialName}</TableCell>
                <TableCell>
                  {request.quantity} {request.unit}
                </TableCell>
                <TableCell>{request.requestDate}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell>{request.requestedBy}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(request)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
