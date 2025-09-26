"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Truck,
  RotateCcw,
  CheckCircle,
  XCircleIcon,
} from "lucide-react"

// Sample pending requests data
const pendingRequests = [
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
    urgencyLevel: "high",
    status: "pending_approval",
    notes: "Need this for the custom engagement ring project",
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
    urgencyLevel: "medium",
    status: "approved",
    notes: "Main stone for the pendant",
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
    urgencyLevel: "low",
    status: "partially_fulfilled",
    notes: "",
    fulfillmentDetails: {
      fulfilled: 3,
      remaining: 2,
      expectedDate: "2023-05-19",
    },
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
    urgencyLevel: "critical",
    status: "back_ordered",
    notes: "Need these urgently for a rush order",
    fulfillmentDetails: {
      expectedDate: "2023-05-24",
    },
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

// Helper function to get urgency badge
function getUrgencyBadge(level: string) {
  switch (level) {
    case "low":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Low
        </Badge>
      )
    case "medium":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Medium
        </Badge>
      )
    case "high":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          High
        </Badge>
      )
    case "critical":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Critical
        </Badge>
      )
    default:
      return <Badge variant="outline">{level}</Badge>
  }
}

export function PendingRequests() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [denialDialogOpen, setDenialDialogOpen] = useState(false)
  const [fulfillDialogOpen, setFulfillDialogOpen] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Material Requests</CardTitle>
        <CardDescription>Review and manage material requests</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="partial">Partial</TabsTrigger>
            <TabsTrigger value="backorder">Backorder</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Required By</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>{request.workOrderId}</TableCell>
                    <TableCell>{request.materialName}</TableCell>
                    <TableCell>
                      {request.quantity} {request.unit}
                    </TableCell>
                    <TableCell>{request.requiredDate}</TableCell>
                    <TableCell>{getUrgencyBadge(request.urgencyLevel)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(request)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Other tab contents would be similar but filtered */}
          <TabsContent value="pending" className="mt-4">
            {/* Filtered table for pending requests */}
          </TabsContent>
          <TabsContent value="approved" className="mt-4">
            {/* Filtered table for approved requests */}
          </TabsContent>
          <TabsContent value="partial" className="mt-4">
            {/* Filtered table for partially fulfilled requests */}
          </TabsContent>
          <TabsContent value="backorder" className="mt-4">
            {/* Filtered table for backordered requests */}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Request Detail Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Request Details: {selectedRequest.id}</DialogTitle>
              <DialogDescription>{getStatusBadge(selectedRequest.status)}</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Work Order</h3>
                <p className="font-medium">
                  {selectedRequest.workOrderId} - {selectedRequest.workOrderDescription}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Material</h3>
                <p className="font-medium">{selectedRequest.materialName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Quantity</h3>
                <p className="font-medium">
                  {selectedRequest.quantity} {selectedRequest.unit}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Required By</h3>
                <p className="font-medium">{selectedRequest.requiredDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Request Date</h3>
                <p className="font-medium">{selectedRequest.requestDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Urgency</h3>
                <p className="font-medium">{getUrgencyBadge(selectedRequest.urgencyLevel)}</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                <p className="font-medium">{selectedRequest.notes || "No notes provided"}</p>
              </div>

              {/* Fulfillment details if applicable */}
              {selectedRequest.status === "partially_fulfilled" && (
                <div className="col-span-1 md:col-span-2 bg-amber-50 p-3 rounded-md border border-amber-200">
                  <h3 className="text-sm font-medium text-amber-800">Partial Fulfillment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    <div>
                      <p className="text-xs text-amber-700">Fulfilled</p>
                      <p className="font-medium">
                        {selectedRequest.fulfillmentDetails.fulfilled} {selectedRequest.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-amber-700">Remaining</p>
                      <p className="font-medium">
                        {selectedRequest.fulfillmentDetails.remaining} {selectedRequest.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-amber-700">Expected Date</p>
                      <p className="font-medium">{selectedRequest.fulfillmentDetails.expectedDate}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedRequest.status === "back_ordered" && (
                <div className="col-span-1 md:col-span-2 bg-purple-50 p-3 rounded-md border border-purple-200">
                  <h3 className="text-sm font-medium text-purple-800">Back Order Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-xs text-purple-700">Expected Date</p>
                      <p className="font-medium">{selectedRequest.fulfillmentDetails.expectedDate}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {selectedRequest.status === "pending_approval" && (
                <>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                    onClick={() => {
                      setDenialDialogOpen(true)
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Deny
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                    onClick={() => {
                      setApprovalDialogOpen(true)
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </>
              )}

              {selectedRequest.status === "approved" && (
                <Button
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                  onClick={() => {
                    setFulfillDialogOpen(true)
                  }}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Fulfill
                </Button>
              )}

              <Button variant="default" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Material Request</DialogTitle>
            <DialogDescription>Review inventory and approve this material request</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800">Inventory Check</h3>
              <p className="text-sm text-blue-700 mt-1">
                Current stock: <span className="font-medium">25 g</span> of 18K White Gold
              </p>
              <p className="text-sm text-blue-700">
                Requested: <span className="font-medium">15 g</span>
              </p>
              <p className="text-sm text-blue-700">
                Remaining after fulfillment: <span className="font-medium">10 g</span>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Approval Notes</label>
              <Textarea placeholder="Add any notes about this approval" className="mt-1" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                // Handle approval logic
                setApprovalDialogOpen(false)
                setSelectedRequest(null)
              }}
            >
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Denial Dialog */}
      <Dialog open={denialDialogOpen} onOpenChange={setDenialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Material Request</DialogTitle>
            <DialogDescription>Provide a reason for denying this material request</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Denial Reason</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget constraints</SelectItem>
                  <SelectItem value="alternative">Alternative material recommended</SelectItem>
                  <SelectItem value="quantity">Quantity not justified</SelectItem>
                  <SelectItem value="availability">Material not available</SelectItem>
                  <SelectItem value="other">Other (specify in notes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Alternative Suggestion</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Suggest an alternative (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="14k-white">14K White Gold</SelectItem>
                  <SelectItem value="14k-yellow">14K Yellow Gold</SelectItem>
                  <SelectItem value="silver">Sterling Silver</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Denial Notes</label>
              <Textarea placeholder="Provide additional details about the denial" className="mt-1" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDenialDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                // Handle denial logic
                setDenialDialogOpen(false)
                setSelectedRequest(null)
              }}
            >
              Confirm Denial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fulfill Dialog */}
      <Dialog open={fulfillDialogOpen} onOpenChange={setFulfillDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fulfill Material Request</DialogTitle>
            <DialogDescription>Record the fulfillment of this material request</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Fulfillment Type</label>
              <Select defaultValue="full">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Fulfillment</SelectItem>
                  <SelectItem value="partial">Partial Fulfillment</SelectItem>
                  <SelectItem value="backorder">Back Order</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Quantity Fulfilled</label>
              <div className="flex items-center space-x-2 mt-1">
                <Input type="number" defaultValue="15" />
                <span className="text-sm text-muted-foreground">g</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Fulfillment Notes</label>
              <Textarea placeholder="Add any notes about this fulfillment" className="mt-1" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFulfillDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                // Handle fulfillment logic
                setFulfillDialogOpen(false)
                setSelectedRequest(null)
              }}
            >
              Confirm Fulfillment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
