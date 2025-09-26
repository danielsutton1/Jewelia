"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Edit,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  SplitSquareHorizontal,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

// Sample batches for demonstration
const batches = [
  {
    id: "B-1001",
    name: "Gold Earrings Batch",
    priority: "high",
    stage: "Casting",
    progress: 35,
    itemCount: 8,
    material: "14K White Gold",
    process: "Casting",
    createdAt: "2023-06-15",
    dueDate: "2023-07-20",
    status: "in-progress",
  },
  {
    id: "B-1002",
    name: "Diamond Pendants",
    priority: "medium",
    stage: "Stone Setting",
    progress: 60,
    itemCount: 5,
    material: "18K Yellow Gold",
    process: "Stone Setting",
    createdAt: "2023-06-18",
    dueDate: "2023-07-25",
    status: "in-progress",
  },
  {
    id: "B-1003",
    name: "Silver Bracelets",
    priority: "low",
    stage: "Polishing",
    progress: 80,
    itemCount: 12,
    material: "Sterling Silver",
    process: "Polishing",
    createdAt: "2023-06-20",
    dueDate: "2023-07-30",
    status: "in-progress",
  },
  {
    id: "B-1004",
    name: "Platinum Rings",
    priority: "high",
    stage: "Quality Control",
    progress: 90,
    itemCount: 6,
    material: "Platinum",
    process: "Quality Control",
    createdAt: "2023-06-10",
    dueDate: "2023-07-15",
    status: "in-progress",
  },
  {
    id: "B-1005",
    name: "Ruby Earrings",
    priority: "medium",
    stage: "Complete",
    progress: 100,
    itemCount: 4,
    material: "14K Rose Gold",
    process: "Complete",
    createdAt: "2023-06-05",
    dueDate: "2023-07-10",
    status: "completed",
  },
]

// Sample work orders in a batch
const batchWorkOrders = [
  {
    id: "WO-1001",
    customer: "Emma Thompson",
    item: "Diamond Stud Earrings",
    material: "14K White Gold",
    stage: "Casting",
    progress: 35,
    dueDate: "2023-07-15",
  },
  {
    id: "WO-1002",
    customer: "Michael Chen",
    item: "Diamond Stud Earrings",
    material: "14K White Gold",
    stage: "Casting",
    progress: 35,
    dueDate: "2023-07-18",
  },
  {
    id: "WO-1003",
    customer: "Sophia Rodriguez",
    item: "Diamond Hoop Earrings",
    material: "14K White Gold",
    stage: "Casting",
    progress: 35,
    dueDate: "2023-07-20",
  },
  {
    id: "WO-1004",
    customer: "James Wilson",
    item: "Pearl Stud Earrings",
    material: "14K White Gold",
    stage: "Casting",
    progress: 35,
    dueDate: "2023-07-22",
  },
  {
    id: "WO-1005",
    customer: "Olivia Martinez",
    item: "Diamond Cluster Earrings",
    material: "14K White Gold",
    stage: "Casting",
    progress: 35,
    dueDate: "2023-07-25",
  },
]

// Sample quality checks for a batch
const qualityChecks = [
  {
    id: "QC-1001",
    name: "Casting Quality",
    status: "passed",
    checkedBy: "David Wilson",
    checkedAt: "2023-06-20",
    notes: "All items passed casting quality check",
  },
  {
    id: "QC-1002",
    name: "Dimensions Check",
    status: "pending",
    checkedBy: null,
    checkedAt: null,
    notes: null,
  },
  {
    id: "QC-1003",
    name: "Surface Finish",
    status: "pending",
    checkedBy: null,
    checkedAt: null,
    notes: null,
  },
]

// Sample stage transitions for a batch
const stageTransitions = [
  {
    from: "Design",
    to: "Casting",
    date: "2023-06-18",
    by: "Sarah Johnson",
    notes: "All designs approved, moving to casting",
  },
]

// Sample materials used for a batch
const materialsUsed = [
  {
    id: "M-1001",
    name: "14K White Gold",
    quantity: "45g",
    allocated: "50g",
    remaining: "5g",
  },
  {
    id: "M-1002",
    name: "Casting Investment",
    quantity: "500g",
    allocated: "500g",
    remaining: "0g",
  },
]

export function BatchTracking() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
  const [stageFilter, setStageFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)
  const [showSplitDialog, setShowSplitDialog] = useState(false)
  const [showMoveStageDialog, setShowMoveStageDialog] = useState(false)
  const [selectedWorkOrders, setSelectedWorkOrders] = useState<string[]>([])

  // Filter batches based on search query and filters
  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      searchQuery === "" ||
      batch.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.material.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPriority = priorityFilter === null || batch.priority === priorityFilter
    const matchesStage = stageFilter === null || batch.stage === stageFilter
    const matchesStatus = statusFilter === null || batch.status === statusFilter

    return matchesSearch && matchesPriority && matchesStage && matchesStatus
  })

  // Get the selected batch details
  const batchDetails = batches.find((batch) => batch.id === selectedBatch)

  // Toggle work order selection for splitting
  const toggleWorkOrder = (id: string) => {
    setSelectedWorkOrders((prev) => (prev.includes(id) ? prev.filter((orderId) => orderId !== id) : [...prev, id]))
  }

  // Split the batch
  const splitBatch = () => {
    // In a real app, you would send this data to your backend
    console.log("Splitting batch:", selectedBatch, "with work orders:", selectedWorkOrders)
    setShowSplitDialog(false)
    setSelectedWorkOrders([])
  }

  // Move batch to next stage
  const moveBatchToNextStage = () => {
    // In a real app, you would send this data to your backend
    console.log("Moving batch to next stage:", selectedBatch)
    setShowMoveStageDialog(false)
  }

  return (
    <div className="space-y-6">
      {selectedBatch ? (
        <div className="space-y-6">
          {/* Batch details header */}
          <div className="flex items-start justify-between">
            <div>
              <Button variant="ghost" className="mb-2 -ml-2" onClick={() => setSelectedBatch(null)}>
                <ChevronDown className="mr-2 h-4 w-4" />
                Back to Batches
              </Button>
              <h2 className="text-2xl font-bold">{batchDetails?.name}</h2>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    batchDetails?.priority === "high"
                      ? "border-red-200 bg-red-100 text-red-800"
                      : batchDetails?.priority === "medium"
                        ? "border-amber-200 bg-amber-100 text-amber-800"
                        : "border-green-200 bg-green-100 text-green-800",
                  )}
                >
                  {(batchDetails?.priority ? batchDetails.priority.charAt(0).toUpperCase() + batchDetails.priority.slice(1) : "") + " Priority"}
                </Badge>
                <Badge variant="outline" className="border-blue-200 bg-blue-100 text-blue-800">
                  {batchDetails?.stage || ""}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {(batchDetails?.itemCount ?? "")} items • Created {batchDetails?.createdAt ?? ""} • Due {batchDetails?.dueDate ?? ""}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={showMoveStageDialog} onOpenChange={setShowMoveStageDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Move to Next Stage
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Move Batch to Next Stage</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to move this batch from {batchDetails?.stage} to the next stage?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="stage-notes">Stage Transition Notes</Label>
                      <Input id="stage-notes" placeholder="Enter notes about this stage transition..." />
                    </div>
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                      <div className="flex items-start">
                        <AlertCircle className="mr-2 mt-0.5 h-4 w-4 text-amber-600" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium">Quality Check Required</p>
                          <p>
                            Before moving to the next stage, ensure all quality checks for the current stage are
                            completed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowMoveStageDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={moveBatchToNextStage}>Confirm Move</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showSplitDialog} onOpenChange={setShowSplitDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <SplitSquareHorizontal className="mr-2 h-4 w-4" />
                    Split Batch
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Split Batch</DialogTitle>
                    <DialogDescription>
                      Select work orders to move to a new batch. The remaining work orders will stay in the current
                      batch.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="rounded-md border">
                      <div className="grid grid-cols-12 gap-2 border-b bg-muted/50 p-2 text-sm font-medium">
                        <div className="col-span-1"></div>
                        <div className="col-span-2">ID</div>
                        <div className="col-span-3">Customer</div>
                        <div className="col-span-3">Item</div>
                        <div className="col-span-3">Due Date</div>
                      </div>
                      <ScrollArea className="h-[300px]">
                        {batchWorkOrders.map((order) => (
                          <div
                            key={order.id}
                            className={cn(
                              "grid grid-cols-12 gap-2 border-b p-2 text-sm",
                              selectedWorkOrders.includes(order.id) ? "bg-muted/50" : "",
                            )}
                          >
                            <div className="col-span-1 flex items-center">
                              <Checkbox
                                checked={selectedWorkOrders.includes(order.id)}
                                onCheckedChange={() => toggleWorkOrder(order.id)}
                              />
                            </div>
                            <div className="col-span-2 flex items-center font-medium">{order.id}</div>
                            <div className="col-span-3 flex items-center">{order.customer}</div>
                            <div className="col-span-3 flex items-center">{order.item}</div>
                            <div className="col-span-3 flex items-center">{order.dueDate}</div>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-batch-name">New Batch Name</Label>
                      <Input id="new-batch-name" placeholder="Enter name for the new batch..." />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {selectedWorkOrders.length} of {batchWorkOrders.length} work orders selected
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {batchWorkOrders.length - selectedWorkOrders.length} work orders will remain in current batch
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSplitDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={splitBatch} disabled={selectedWorkOrders.length === 0}>
                      Split Batch
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Batch Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Batch
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Clock className="mr-2 h-4 w-4" />
                    Update Timeline
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <X className="mr-2 h-4 w-4" />
                    Cancel Batch
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Batch progress */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Batch Progress</CardTitle>
              <CardDescription>Current progress through production stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{batchDetails?.progress ?? 0}% Complete</span>
                  <span className="text-sm text-muted-foreground">
                    Stage: {batchDetails?.stage ?? ""} ({batchDetails?.progress ?? 0}%)
                  </span>
                </div>
                <Progress value={batchDetails?.progress ?? 0} className="h-2" />

                <div className="mt-4 grid grid-cols-5 gap-2 text-center">
                  <div
                    className={cn(
                      "rounded-md border p-2",
                      batchDetails?.stage === "Design" || (batchDetails?.progress ?? 0) >= 20
                        ? "border-green-200 bg-green-50"
                        : "border-muted bg-muted/20",
                    )}
                  >
                    <div className="text-xs font-medium text-muted-foreground">Design</div>
                    {batchDetails?.stage === "Design" || (batchDetails?.progress ?? 0) >= 20 ? (
                      <Check className="mx-auto mt-1 h-4 w-4 text-green-600" />
                    ) : (
                      <div className="mt-1 h-4"></div>
                    )}
                  </div>
                  <div
                    className={cn(
                      "rounded-md border p-2",
                      batchDetails?.stage === "Casting" || (batchDetails?.progress ?? 0) >= 40
                        ? "border-green-200 bg-green-50"
                        : "border-muted bg-muted/20",
                    )}
                  >
                    <div className="text-xs font-medium text-muted-foreground">Casting</div>
                    {batchDetails?.stage === "Casting" || (batchDetails?.progress ?? 0) >= 40 ? (
                      <Check className="mx-auto mt-1 h-4 w-4 text-green-600" />
                    ) : (
                      <div className="mt-1 h-4"></div>
                    )}
                  </div>
                  <div
                    className={cn(
                      "rounded-md border p-2",
                      batchDetails?.stage === "Stone Setting" || (batchDetails?.progress ?? 0) >= 60
                        ? "border-green-200 bg-green-50"
                        : "border-muted bg-muted/20",
                    )}
                  >
                    <div className="text-xs font-medium text-muted-foreground">Stone Setting</div>
                    {batchDetails?.stage === "Stone Setting" || (batchDetails?.progress ?? 0) >= 60 ? (
                      <Check className="mx-auto mt-1 h-4 w-4 text-green-600" />
                    ) : (
                      <div className="mt-1 h-4"></div>
                    )}
                  </div>
                  <div
                    className={cn(
                      "rounded-md border p-2",
                      batchDetails?.stage === "Polishing" || (batchDetails?.progress ?? 0) >= 80
                        ? "border-green-200 bg-green-50"
                        : "border-muted bg-muted/20",
                    )}
                  >
                    <div className="text-xs font-medium text-muted-foreground">Polishing</div>
                    {batchDetails?.stage === "Polishing" || (batchDetails?.progress ?? 0) >= 80 ? (
                      <Check className="mx-auto mt-1 h-4 w-4 text-green-600" />
                    ) : (
                      <div className="mt-1 h-4"></div>
                    )}
                  </div>
                  <div
                    className={cn(
                      "rounded-md border p-2",
                      batchDetails?.stage === "Quality Control" || (batchDetails?.progress ?? 0) >= 100
                        ? "border-green-200 bg-green-50"
                        : "border-muted bg-muted/20",
                    )}
                  >
                    <div className="text-xs font-medium text-muted-foreground">Quality Control</div>
                    {batchDetails?.stage === "Quality Control" || (batchDetails?.progress ?? 0) >= 100 ? (
                      <Check className="mx-auto mt-1 h-4 w-4 text-green-600" />
                    ) : (
                      <div className="mt-1 h-4"></div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Batch details tabs */}
          <Tabs defaultValue="items">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="items">Items in Batch</TabsTrigger>
              <TabsTrigger value="quality">Quality Checks</TabsTrigger>
              <TabsTrigger value="stages">Stage Transitions</TabsTrigger>
              <TabsTrigger value="materials">Materials Used</TabsTrigger>
            </TabsList>
            <TabsContent value="items" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Items in Batch</CardTitle>
                  <CardDescription>Work orders included in this batch</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 gap-2 border-b bg-muted/50 p-2 text-sm font-medium">
                      <div className="col-span-2">ID</div>
                      <div className="col-span-3">Customer</div>
                      <div className="col-span-3">Item</div>
                      <div className="col-span-2">Stage</div>
                      <div className="col-span-2">Due Date</div>
                    </div>
                    {batchWorkOrders.map((order) => (
                      <div key={order.id} className="grid grid-cols-12 gap-2 border-b p-2 text-sm">
                        <div className="col-span-2 flex items-center font-medium">{order.id}</div>
                        <div className="col-span-3 flex items-center">{order.customer}</div>
                        <div className="col-span-3 flex items-center">{order.item}</div>
                        <div className="col-span-2 flex items-center">
                          <Badge variant="outline" className="border-blue-200 bg-blue-100 text-blue-800">
                            {order.stage}
                          </Badge>
                        </div>
                        <div className="col-span-2 flex items-center">{order.dueDate}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="quality" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Quality Checks</CardTitle>
                  <CardDescription>Quality control checks for this batch</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 gap-2 border-b bg-muted/50 p-2 text-sm font-medium">
                      <div className="col-span-3">Check Name</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2">Checked By</div>
                      <div className="col-span-2">Date</div>
                      <div className="col-span-3">Notes</div>
                    </div>
                    {qualityChecks.map((check) => (
                      <div key={check.id} className="grid grid-cols-12 gap-2 border-b p-2 text-sm">
                        <div className="col-span-3 flex items-center font-medium">{check.name}</div>
                        <div className="col-span-2 flex items-center">
                          <Badge
                            variant="outline"
                            className={
                              check.status === "passed"
                                ? "border-green-200 bg-green-100 text-green-800"
                                : check.status === "failed"
                                  ? "border-red-200 bg-red-100 text-red-800"
                                  : "border-amber-200 bg-amber-100 text-amber-800"
                            }
                          >
                            {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="col-span-2 flex items-center">
                          {check.checkedBy || <span className="text-muted-foreground">-</span>}
                        </div>
                        <div className="col-span-2 flex items-center">
                          {check.checkedAt || <span className="text-muted-foreground">-</span>}
                        </div>
                        <div className="col-span-3 flex items-center">
                          {check.notes || <span className="text-muted-foreground">-</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Quality Check
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="stages" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Stage Transitions</CardTitle>
                  <CardDescription>History of stage transitions for this batch</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 gap-2 border-b bg-muted/50 p-2 text-sm font-medium">
                      <div className="col-span-2">From Stage</div>
                      <div className="col-span-2">To Stage</div>
                      <div className="col-span-2">Date</div>
                      <div className="col-span-2">By</div>
                      <div className="col-span-4">Notes</div>
                    </div>
                    {stageTransitions.map((transition, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 border-b p-2 text-sm">
                        <div className="col-span-2 flex items-center">{transition.from}</div>
                        <div className="col-span-2 flex items-center font-medium">{transition.to}</div>
                        <div className="col-span-2 flex items-center">{transition.date}</div>
                        <div className="col-span-2 flex items-center">{transition.by}</div>
                        <div className="col-span-4 flex items-center">{transition.notes}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="materials" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Materials Used</CardTitle>
                  <CardDescription>Materials allocated and used for this batch</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 gap-2 border-b bg-muted/50 p-2 text-sm font-medium">
                      <div className="col-span-3">Material</div>
                      <div className="col-span-3">Quantity Used</div>
                      <div className="col-span-3">Allocated</div>
                      <div className="col-span-3">Remaining</div>
                    </div>
                    {materialsUsed.map((material) => (
                      <div key={material.id} className="grid grid-cols-12 gap-2 border-b p-2 text-sm">
                        <div className="col-span-3 flex items-center font-medium">{material.name}</div>
                        <div className="col-span-3 flex items-center">{material.quantity}</div>
                        <div className="col-span-3 flex items-center">{material.allocated}</div>
                        <div className="col-span-3 flex items-center">{material.remaining}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Material
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Batch list */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Batches</CardTitle>
                  <CardDescription>Current production batches and their status</CardDescription>
                </div>
                <Button onClick={() => router.push("/dashboard/production/batches?tab=create-batch")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Batch
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and filters */}
              <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search batches..."
                    className="pl-8 rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium">Filter Batches</h4>
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select
                            value={priorityFilter || ""}
                            onValueChange={(value) => setPriorityFilter(value || null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All priorities" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All priorities</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Stage</Label>
                          <Select value={stageFilter || ""} onValueChange={(value) => setStageFilter(value || null)}>
                            <SelectTrigger>
                              <SelectValue placeholder="All stages" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All stages</SelectItem>
                              <SelectItem value="Design">Design</SelectItem>
                              <SelectItem value="Casting">Casting</SelectItem>
                              <SelectItem value="Stone Setting">Stone Setting</SelectItem>
                              <SelectItem value="Polishing">Polishing</SelectItem>
                              <SelectItem value="Quality Control">Quality Control</SelectItem>
                              <SelectItem value="Complete">Complete</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={statusFilter || "all"}
                            onValueChange={(value) => setStatusFilter(value || null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All statuses</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="on-hold">On Hold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setPriorityFilter(null)
                              setStageFilter(null)
                              setStatusFilter(null)
                            }}
                          >
                            Reset Filters
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Batch list */}
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-2 border-b bg-muted/50 p-2 text-sm font-medium">
                  <div className="col-span-2">Batch ID</div>
                  <div className="col-span-3">Name</div>
                  <div className="col-span-2">Stage</div>
                  <div className="col-span-2">Progress</div>
                  <div className="col-span-1">Items</div>
                  <div className="col-span-2">Actions</div>
                </div>
                {filteredBatches.length === 0 ? (
                  <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
                    No batches match your filters
                  </div>
                ) : (
                  filteredBatches.map((batch) => (
                    <div key={batch.id} className="grid grid-cols-12 gap-2 border-b p-2 text-sm">
                      <div className="col-span-2 flex items-center">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              batch.priority === "high"
                                ? "border-red-200 bg-red-50"
                                : batch.priority === "medium"
                                  ? "border-amber-200 bg-amber-50"
                                  : "border-green-200 bg-green-50",
                              "h-2 w-2 rounded-full p-0",
                            )}
                          />
                          <span className="font-medium">{batch.id}</span>
                        </div>
                      </div>
                      <div className="col-span-3 flex items-center">{batch.name}</div>
                      <div className="col-span-2 flex items-center">
                        <Badge variant="outline" className="border-blue-200 bg-blue-100 text-blue-800">
                          {batch.stage}
                        </Badge>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <div className="w-full">
                          <div className="flex items-center justify-between text-xs">
                            <span>{batch.progress}%</span>
                          </div>
                          <Progress value={batch.progress} className="h-2" />
                        </div>
                      </div>
                      <div className="col-span-1 flex items-center">{batch.itemCount}</div>
                      <div className="col-span-2 flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedBatch(batch.id)}>
                          View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedBatch(batch.id)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Batch</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Cancel Batch</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Batch efficiency metrics */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Setup Time Savings</CardTitle>
                <CardDescription>Time saved through batch processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">24.5 hours</div>
                <p className="text-sm text-muted-foreground">Saved this month through batch processing</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Average setup time saved per batch:</span>
                    <span className="font-medium">2.8 hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Total batches processed:</span>
                    <span className="font-medium">12</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Material Efficiency</CardTitle>
                <CardDescription>Material savings through batch processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">18.2%</div>
                <p className="text-sm text-muted-foreground">Reduction in material waste</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Gold saved:</span>
                    <span className="font-medium">42g</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Casting investment saved:</span>
                    <span className="font-medium">3.2kg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Quality Improvements</CardTitle>
                <CardDescription>Quality metrics for batch processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">92.8%</div>
                <p className="text-sm text-muted-foreground">First-time quality pass rate</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Defect reduction:</span>
                    <span className="font-medium">14.5%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Consistency improvement:</span>
                    <span className="font-medium">22.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
