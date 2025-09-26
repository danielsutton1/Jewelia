"use client"

import type React from "react"

import { useState } from "react"
import {
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Printer,
  XCircle,
  CheckCircle,
  Clock,
  ArrowUpDown,
  Download,
  Trash,
  Mail,
  MessageSquare,
  Tag,
  RefreshCw,
  Archive,
  BarChart,
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { OrderQuickActions } from "./order-quick-actions"

// Sample order data
const orders = [
  {
    id: "ORD-12345",
    customer: {
      name: "Olivia Martin",
      email: "olivia.martin@email.com",
      avatar: "/diverse-group-avatars.png",
      initials: "OM",
    },
    date: "2023-05-15",
    dueDate: "2023-05-22",
    status: "Ready",
    items: [
      { name: "Diamond Pendant", type: "Necklace", price: 1299.99 },
      { name: "Gold Chain", type: "Necklace", price: 599.99 },
    ],
    total: 1899.98,
    paymentStatus: "Paid",
    progress: 90,
    assignedTo: "Sarah Johnson",
    priority: "High",
    notes: "Customer requested gift wrapping",
  },
  {
    id: "ORD-12346",
    customer: {
      name: "Jackson Lee",
      email: "jackson.lee@email.com",
      avatar: "/diverse-group-avatars.png",
      initials: "JL",
    },
    date: "2023-05-14",
    dueDate: "2023-05-28",
    status: "Processing",
    items: [{ name: "Sapphire Ring", type: "Ring", price: 2499.99 }],
    total: 2499.99,
    paymentStatus: "Partial",
    progress: 50,
    assignedTo: "Michael Chen",
    priority: "Medium",
    notes: "Special order - needs sizing",
  },
  {
    id: "ORD-12347",
    customer: {
      name: "Isabella Nguyen",
      email: "isabella.nguyen@email.com",
      avatar: "/diverse-group-avatars.png",
      initials: "IN",
    },
    date: "2023-05-14",
    dueDate: "2023-05-21",
    status: "Pending",
    items: [
      { name: "Pearl Earrings", type: "Earrings", price: 899.99 },
      { name: "Pearl Bracelet", type: "Bracelet", price: 799.99 },
    ],
    total: 1699.98,
    paymentStatus: "Pending",
    progress: 10,
    assignedTo: "David Wilson",
    priority: "Low",
    notes: "",
  },
  {
    id: "ORD-12348",
    customer: {
      name: "William Kim",
      email: "will@email.com",
      avatar: "/diverse-group-avatars.png",
      initials: "WK",
    },
    date: "2023-05-13",
    dueDate: "2023-05-20",
    status: "Completed",
    items: [
      { name: "Diamond Engagement Ring", type: "Ring", price: 5999.99 },
      { name: "Wedding Band", type: "Ring", price: 1299.99 },
    ],
    total: 7299.98,
    paymentStatus: "Paid",
    progress: 100,
    assignedTo: "Sarah Johnson",
    priority: "High",
    notes: "Anniversary gift",
  },
  {
    id: "ORD-12349",
    customer: {
      name: "Sofia Davis",
      email: "sofia.davis@email.com",
      avatar: "/diverse-group-avatars.png",
      initials: "SD",
    },
    date: "2023-05-13",
    dueDate: "2023-05-27",
    status: "Cancelled",
    items: [
      { name: "Silver Necklace", type: "Necklace", price: 399.99 },
      { name: "Silver Bracelet", type: "Bracelet", price: 299.99 },
    ],
    total: 699.98,
    paymentStatus: "Refunded",
    progress: 0,
    assignedTo: "Michael Chen",
    priority: "Medium",
    notes: "Customer changed mind",
  },
  {
    id: "ORD-12350",
    customer: {
      name: "Ethan Johnson",
      email: "ethan.johnson@email.com",
      avatar: "/diverse-group-avatars.png",
      initials: "EJ",
    },
    date: "2023-05-12",
    dueDate: "2023-05-19",
    status: "Completed",
    items: [{ name: "Luxury Watch", type: "Watch", price: 12999.99 }],
    total: 12999.99,
    paymentStatus: "Paid",
    progress: 100,
    assignedTo: "David Wilson",
    priority: "High",
    notes: "",
  },
  {
    id: "ORD-12351",
    customer: {
      name: "Ava Williams",
      email: "ava.williams@email.com",
      avatar: "/diverse-group-avatars.png",
      initials: "AW",
    },
    date: "2023-05-12",
    dueDate: "2023-05-26",
    status: "Processing",
    items: [
      { name: "Emerald Earrings", type: "Earrings", price: 1899.99 },
      { name: "Emerald Necklace", type: "Necklace", price: 2499.99 },
    ],
    total: 4399.98,
    paymentStatus: "Paid",
    progress: 60,
    assignedTo: "Sarah Johnson",
    priority: "Medium",
    notes: "Custom design",
  },
  {
    id: "ORD-12352",
    customer: {
      name: "Noah Brown",
      email: "noah.brown@email.com",
      avatar: "/diverse-group-avatars.png",
      initials: "NB",
    },
    date: "2023-05-11",
    dueDate: "2023-05-18",
    status: "Ready",
    items: [{ name: "Diamond Tennis Bracelet", type: "Bracelet", price: 8999.99 }],
    total: 8999.99,
    paymentStatus: "Paid",
    progress: 90,
    assignedTo: "Michael Chen",
    priority: "High",
    notes: "Anniversary gift - needs special packaging",
  },
]

// Item types for filter
const itemTypes = ["All Types", "Ring", "Necklace", "Bracelet", "Earrings", "Watch", "Other"]

// Staff members for assigned to filter
const staffMembers = ["All Staff", "Sarah Johnson", "Michael Chen", "David Wilson", "Emma Rodriguez", "James Smith"]

export function OrderManagementDashboard() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"card" | "table">("card")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [itemTypeFilter, setItemTypeFilter] = useState<string>("All Types")
  const [assignedToFilter, setAssignedToFilter] = useState<string>("All Staff")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState<boolean>(false)
  const [minValue, setMinValue] = useState<string>("")
  const [maxValue, setMaxValue] = useState<string>("")

  // Filter orders based on selected filters
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (statusFilter !== "All" && order.status !== statusFilter) {
      return false
    }

    // Item type filter
    if (itemTypeFilter !== "All Types" && !order.items.some((item) => item.type === itemTypeFilter)) {
      return false
    }

    // Assigned to filter
    if (assignedToFilter !== "All Staff" && order.assignedTo !== assignedToFilter) {
      return false
    }

    // Search query (customer name or order ID)
    if (
      searchQuery &&
      !order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !order.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Value range filter
    const minValueNum = minValue ? Number.parseFloat(minValue) : 0
    const maxValueNum = maxValue ? Number.parseFloat(maxValue) : Number.POSITIVE_INFINITY
    if (order.total < minValueNum || order.total > maxValueNum) {
      return false
    }

    return true
  })

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(filteredOrders.map((order) => order.id))
    }
  }

  const handleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId))
    } else {
      setSelectedOrders([...selectedOrders, orderId])
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-emerald-500">Completed</Badge>
      case "Processing":
        return <Badge className="bg-blue-500">Processing</Badge>
      case "Pending":
        return <Badge className="bg-amber-500">Pending</Badge>
      case "Ready":
        return <Badge className="bg-purple-500">Ready</Badge>
      case "Cancelled":
        return (
          <Badge variant="outline" className="text-destructive border-destructive">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <div className="flex items-center gap-1 text-emerald-500">
            <CheckCircle className="h-3.5 w-3.5" />
            <span className="text-xs">Paid</span>
          </div>
        )
      case "Partial":
        return (
          <div className="flex items-center gap-1 text-blue-500">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs">Partial</span>
          </div>
        )
      case "Pending":
        return (
          <div className="flex items-center gap-1 text-amber-500">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs">Pending</span>
          </div>
        )
      case "Refunded":
        return (
          <div className="flex items-center gap-1 text-destructive">
            <XCircle className="h-3.5 w-3.5" />
            <span className="text-xs">Refunded</span>
          </div>
        )
      default:
        return <span className="text-xs text-muted-foreground">{status}</span>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            High
          </Badge>
        )
      case "Medium":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Medium
          </Badge>
        )
      case "Low":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Low
          </Badge>
        )
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and controls */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Input
              placeholder="Search orders or customers..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline">Search</Button>
            <Popover open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="ml-2">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Advanced Filters</h4>
                    <p className="text-sm text-muted-foreground">Refine your order search with additional filters.</p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="date-range" className="text-right">
                        Date Range
                      </Label>
                      <div className="col-span-2">
                        <DatePickerWithRange className="w-full" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="min-value" className="text-right">
                        Min Value
                      </Label>
                      <div className="col-span-2">
                        <Input
                          id="min-value"
                          placeholder="0.00"
                          value={minValue}
                          onChange={(e) => setMinValue(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="max-value" className="text-right">
                        Max Value
                      </Label>
                      <div className="col-span-2">
                        <Input
                          id="max-value"
                          placeholder="0.00"
                          value={maxValue}
                          onChange={(e) => setMaxValue(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="priority" className="text-right">
                        Priority
                      </Label>
                      <div className="col-span-2">
                        <Select defaultValue="all">
                          <SelectTrigger id="priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="payment" className="text-right">
                        Payment Status
                      </Label>
                      <div className="col-span-2">
                        <Select defaultValue="all">
                          <SelectTrigger id="payment">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="partial">Partial</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => setIsAdvancedFiltersOpen(false)}>Apply Filters</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              Reports
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="status-filter" className="whitespace-nowrap">
              Status:
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="item-type-filter" className="whitespace-nowrap">
              Item Type:
            </Label>
            <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
              <SelectTrigger id="item-type-filter" className="w-[140px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {itemTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="assigned-to-filter" className="whitespace-nowrap">
              Assigned To:
            </Label>
            <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
              <SelectTrigger id="assigned-to-filter" className="w-[160px]">
                <SelectValue placeholder="Filter by staff" />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map((staff) => (
                  <SelectItem key={staff} value={staff}>
                    {staff}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Label htmlFor="view-mode" className="whitespace-nowrap">
              View:
            </Label>
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "card" | "table")}
              className="w-[180px]"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="card">Card View</TabsTrigger>
                <TabsTrigger value="table">Table View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Bulk operations toolbar */}
      {selectedOrders.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-2">
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm font-medium">{selectedOrders.length} orders selected</span>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Print Selected</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Email Selected</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Message Selected</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Tag className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tag Selected</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Archive Selected</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Selected</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="outline" size="sm" onClick={() => setSelectedOrders([])}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Card View */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={() => handleSelectOrder(order.id)}
                      aria-label={`Select order ${order.id}`}
                    />
                    <div>
                      <h3 className="font-semibold">{order.id}</h3>
                      <p className="text-xs text-muted-foreground">{format(new Date(order.date), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit order
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Printer className="mr-2 h-4 w-4" />
                          Print invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Email customer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="mb-2 flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={order.customer.avatar || "/placeholder.svg"} alt={order.customer.name} />
                    <AvatarFallback>{order.customer.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{order.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                  </div>
                </div>

                <Collapsible className="mb-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </p>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-0 h-6">
                        <span className="text-xs text-muted-foreground">Details</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <div className="mt-2 space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{item.name}</span>
                          <span>${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">${order.total.toFixed(2)}</span>
                </div>

                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm">Payment:</span>
                  <span>{getPaymentStatusBadge(order.paymentStatus)}</span>
                </div>

                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm">Due Date:</span>
                  <span className="text-sm">{format(new Date(order.dueDate), "MMM d, yyyy")}</span>
                </div>

                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm">Assigned To:</span>
                  <span className="text-sm">{order.assignedTo}</span>
                </div>

                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm">Priority:</span>
                  <span>{getPriorityBadge(order.priority)}</span>
                </div>

                {order.notes && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">Notes:</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                )}

                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-medium">{order.progress}%</span>
                  </div>
                  <Progress value={order.progress} className="h-2" />
                </div>
              </CardContent>
              <div className="flex justify-between p-4 pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all orders"
                  />
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="flex items-center gap-1 px-0 font-medium">
                    Order
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>
                  <Button variant="ghost" className="flex items-center gap-1 px-0 font-medium">
                    Date
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="flex items-center gap-1 px-0 font-medium">
                    Due Date
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <Button variant="ghost" className="flex items-center gap-1 px-0 font-medium">
                    Total
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={() => handleSelectOrder(order.id)}
                      aria-label={`Select order ${order.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={order.customer.avatar || "/placeholder.svg"} alt={order.customer.name} />
                        <AvatarFallback>{order.customer.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(order.date), "MMM d, yyyy")}</TableCell>
                  <TableCell>{format(new Date(order.dueDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                  <TableCell>
                    <div className="flex w-[100px] items-center">
                      <Progress value={order.progress} className="h-2 w-full" />
                      <span className="ml-2 text-xs">{order.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{order.assignedTo}</TableCell>
                  <TableCell className="text-right">
                    <OrderQuickActions 
                      orderId={order.id} 
                      variant="dropdown" 
                      currentStatus={order.status}
                      customerName={order.customer.name}
                      assigneeName={order.assignedTo}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

// Label component for the filters
function Label({
  htmlFor,
  className,
  children,
}: {
  htmlFor: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    >
      {children}
    </label>
  )
}
