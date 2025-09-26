"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Search, Filter, Download, MoreHorizontal, Package, Eye, Edit, FileText, MessageSquare, Calendar, User, Clock, AlertTriangle, CheckCircle, XCircle, Grid3X3, List, ArrowRight, Printer, Users, ArrowLeft, ChevronUp, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface PackingItem {
  id: string
  name: string
  customer: string
  dueDate: string
  status: "in-progress" | "review" | "approved" | "revise"
  priority: "low" | "medium" | "high" | "urgent"
  assignee: string
  notes?: string
  progress: number
  timeRemaining: string
}

const mockPackingData: PackingItem[] = [
  {
    id: 'ORD-1001',
    name: 'Custom Engagement Ring',
    customer: 'Sophia Chen',
    dueDate: 'Jul 25',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Sarah Johnson',
    notes: 'Premium packaging for platinum engagement ring with diamond accents.',
    progress: 75,
    timeRemaining: '2 hours',
  },
  {
    id: 'ORD-1002',
    name: 'Sapphire Pendant',
    customer: 'Ethan Davis',
    dueDate: 'Jul 29',
    status: 'review',
    priority: 'medium',
    assignee: 'David Chen',
    notes: 'Gift packaging for gold pendant with sapphire center stone.',
    progress: 90,
    timeRemaining: '3 days',
  },
  {
    id: 'ORD-1003',
    name: 'Custom Bracelet',
    customer: 'Ava Martinez',
    dueDate: 'Jul 22',
    status: 'approved',
    priority: 'low',
    assignee: 'Emily Rodriguez',
    notes: 'Standard packaging for mixed metal bracelet.',
    progress: 100,
    timeRemaining: 'Completed',
  },
  {
    id: 'ORD-1004',
    name: 'Wedding Band',
    customer: 'Liam Smith',
    dueDate: 'Aug 3',
    status: 'revise',
    priority: 'urgent',
    assignee: 'Michael Kim',
    notes: 'Wedding band packaging needs revision - wrong size box.',
    progress: 60,
    timeRemaining: 'Overdue',
  },
  {
    id: 'ORD-1005',
    name: 'Diamond Earrings',
    customer: 'Emma Wilson',
    dueDate: 'Jul 28',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Lisa Wang',
    notes: 'Luxury packaging for diamond stud earrings.',
    progress: 45,
    timeRemaining: '1 day',
  },
  {
    id: 'ORD-1006',
    name: 'Pearl Necklace',
    customer: 'Noah Johnson',
    dueDate: 'Jul 30',
    status: 'review',
    priority: 'medium',
    assignee: 'James Thompson',
    notes: 'Elegant packaging for freshwater pearl necklace.',
    progress: 85,
    timeRemaining: '4 days',
  },
]

const statusConfig = {
  "in-progress": { 
    label: "In Progress", 
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
    bgColor: "bg-blue-50"
  },
  "review": { 
    label: "Review", 
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: AlertTriangle,
    bgColor: "bg-amber-50"
  },
  "approved": { 
    label: "Approved", 
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle,
    bgColor: "bg-emerald-50"
  },
  "revise": { 
    label: "Revise", 
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    bgColor: "bg-red-50"
  },
}

const priorityConfig = {
  "low": { label: "Low", color: "bg-gray-100 text-gray-800" },
  "medium": { label: "Medium", color: "bg-blue-100 text-blue-800" },
  "high": { label: "High", color: "bg-amber-100 text-amber-800" },
  "urgent": { label: "Urgent", color: "bg-red-100 text-red-800" },
}

export default function PackingKanban() {
  const [items, setItems] = React.useState<PackingItem[]>(mockPackingData)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all")
  const [editingItem, setEditingItem] = React.useState<string | null>(null)
  const [editingStatus, setEditingStatus] = React.useState<string>("")
  const [editingPriority, setEditingPriority] = React.useState<string>("")
  const [viewMode, setViewMode] = React.useState<"list" | "cards">("list")
  const [sortBy, setSortBy] = React.useState("dueDate")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")
  const router = useRouter()
  const [exporting, setExporting] = React.useState(false);
  const [printing, setPrinting] = React.useState(false);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Sorting function
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };
  
  // Sort the filtered data
  const sortedItems = [...filteredItems].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case "id":
        aValue = a.id;
        bValue = b.id;
        break;
      case "name":
        aValue = a.name;
        bValue = b.name;
        break;
      case "customer":
        aValue = a.customer;
        bValue = b.customer;
        break;
      case "dueDate":
        aValue = a.dueDate;
        bValue = b.dueDate;
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      case "priority":
        aValue = a.priority;
        bValue = b.priority;
        break;
      case "assignee":
        aValue = a.assignee;
        bValue = b.assignee;
        break;
      case "progress":
        aValue = a.progress;
        bValue = b.progress;
        break;
      case "timeRemaining":
        aValue = a.timeRemaining;
        bValue = b.timeRemaining;
        break;
      default:
        aValue = a[sortBy as keyof typeof a];
        bValue = b[sortBy as keyof typeof b];
    }
    
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const groupedItems = React.useMemo(() => {
    const groups = {
      "in-progress": filteredItems.filter(item => item.status === "in-progress"),
      "review": filteredItems.filter(item => item.status === "review"),
      "approved": filteredItems.filter(item => item.status === "approved"),
      "revise": filteredItems.filter(item => item.status === "revise"),
    }
    return groups
  }, [filteredItems])

  const handleStatusChange = (itemId: string, newStatus: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: newStatus as PackingItem["status"] } : item
    ))
    setEditingItem(null)
  }

  const handlePriorityChange = (itemId: string, newPriority: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, priority: newPriority as PackingItem["priority"] } : item
    ))
    setEditingItem(null)
  }

  const startEditing = (itemId: string, field: "status" | "priority") => {
    const item = items.find(i => i.id === itemId)
    if (item) {
      setEditingItem(itemId)
      if (field === "status") {
        setEditingStatus(item.status)
      } else {
        setEditingPriority(item.priority)
      }
    }
  }

  const exportToCSV = () => {
    const headers = ["Order ID", "Item Name", "Customer", "Due Date", "Status", "Priority", "Assignee", "Notes"]
    const csvContent = [
      headers.join(","),
      ...items.map(item => [
        item.id,
        `"${item.name}"`,
        `"${item.customer}"`,
        item.dueDate,
        item.status,
        item.priority,
        `"${item.assignee}"`,
        `"${item.notes || ""}"`
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "packing-kanban.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getTimeRemainingColor = (timeRemaining: string) => {
    if (timeRemaining === 'Overdue') return 'text-red-600 font-semibold'
    if (timeRemaining === 'Completed') return 'text-emerald-600 font-semibold'
    if (timeRemaining.includes('hours') || timeRemaining.includes('day')) return 'text-amber-600 font-semibold'
    return 'text-gray-600'
  }

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon
    return <Icon className="h-4 w-4" />
  }

  function handleExport(type: 'csv' | 'pdf') {
    setExporting(true);
    exportToCSV();
    setTimeout(() => setExporting(false), 1000);
  }

  function handlePrint() {
    setPrinting(true);
    window.print();
    setTimeout(() => setPrinting(false), 1000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Premium Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0 pt-10 pb-4">
        <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-emerald-200/50 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent tracking-tight">Pack & Ship</h1>
              <p className="text-md text-emerald-600 font-medium">Manage and track all packing orders</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 min-w-[160px]">
            <Button className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:from-emerald-700 hover:to-green-700 hover:shadow-xl transition-all duration-300 flex items-center gap-2 w-full">
              <Plus className="w-5 h-5" /> Add Order
            </Button>
            <div className="flex gap-2 mt-1">
              <Link href="/dashboard/orders">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full" title="Back to Orders">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard/logistics/kanban/pickup">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full" title="Next: Pickup">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="relative z-10 max-w-7xl mx-auto mb-8 flex justify-center">
        <div className="flex justify-center gap-4 flex-wrap px-4 md:px-0">
          <Card className={`w-52 flex flex-col items-center justify-center p-4 cursor-pointer border-2 shadow-xl rounded-2xl bg-emerald-100 transition-all duration-300 ${statusFilter === 'in-progress' ? 'border-emerald-600 ring-2 ring-emerald-200 scale-105' : 'border-transparent hover:border-emerald-200 hover:scale-105'}`}
            onClick={() => setStatusFilter(statusFilter === 'in-progress' ? 'all' : 'in-progress')}>
            <CardContent className="flex flex-col items-center justify-center p-0">
              <Clock className="w-7 h-7 mb-2 text-emerald-600" />
              <div className="text-2xl font-extrabold text-emerald-900">{groupedItems["in-progress"].length}</div>
              <div className="text-xs font-medium mt-1 text-emerald-700">In Progress</div>
            </CardContent>
          </Card>
          <Card className={`w-52 flex flex-col items-center justify-center p-4 cursor-pointer border-2 shadow-xl rounded-2xl bg-amber-100 transition-all duration-300 ${statusFilter === 'review' ? 'border-amber-600 ring-2 ring-amber-200 scale-105' : 'border-transparent hover:border-amber-200 hover:scale-105'}`}
            onClick={() => setStatusFilter(statusFilter === 'review' ? 'all' : 'review')}>
            <CardContent className="flex flex-col items-center justify-center p-0">
              <AlertTriangle className="w-7 h-7 mb-2 text-amber-600" />
              <div className="text-2xl font-extrabold text-amber-900">{groupedItems["review"].length}</div>
              <div className="text-xs font-medium mt-1 text-amber-700">Needs Review</div>
            </CardContent>
          </Card>
          <Card className={`w-52 flex flex-col items-center justify-center p-4 cursor-pointer border-2 shadow-xl rounded-2xl bg-red-100 transition-all duration-300 ${statusFilter === 'revise' ? 'border-red-600 ring-2 ring-red-200 scale-105' : 'border-transparent hover:border-red-200 hover:scale-105'}`}
            onClick={() => setStatusFilter(statusFilter === 'revise' ? 'all' : 'revise')}>
            <CardContent className="flex flex-col items-center justify-center p-0">
              <XCircle className="w-7 h-7 mb-2 text-red-600" />
              <div className="text-2xl font-extrabold text-red-900">{groupedItems["revise"].length}</div>
              <div className="text-xs font-medium mt-1 text-red-700">Needs Revision</div>
            </CardContent>
          </Card>
          <Card className={`w-52 flex flex-col items-center justify-center p-4 cursor-pointer border-2 shadow-xl rounded-2xl bg-green-100 transition-all duration-300 ${statusFilter === 'approved' ? 'border-green-600 ring-2 ring-green-200 scale-105' : 'border-transparent hover:border-green-200 hover:scale-105'}`}
            onClick={() => setStatusFilter(statusFilter === 'approved' ? 'all' : 'approved')}>
            <CardContent className="flex flex-col items-center justify-center p-0">
              <CheckCircle className="w-7 h-7 mb-2 text-green-600" />
              <div className="text-2xl font-extrabold text-green-900">{groupedItems["approved"].length}</div>
              <div className="text-xs font-medium mt-1 text-green-700">Approved</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="relative z-10 max-w-7xl mx-auto mb-8 px-4 md:px-0">
        <Card className="p-6 shadow-xl rounded-2xl bg-white/80 border-emerald-100 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Input
              placeholder="Search by order, item, or customer..."
              className="w-full md:w-56 bg-white/70 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <select
              className="border rounded-xl px-2 py-1 text-sm bg-white/70 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Needs Review</option>
              <option value="revise">Needs Revision</option>
              <option value="approved">Approved</option>
            </select>
            <select
              className="border rounded-xl px-2 py-1 text-sm bg-white/70 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="bg-white border-gray-200 hover:bg-gray-100 hover:border-gray-300 rounded-xl">
                  <Download className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl bg-white/95 border-emerald-200">
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4" /> Export
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={handlePrint}>
                  <Printer className="h-4 w-4" /> Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </div>

      {/* Table */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0 mb-12">
        <Card className="shadow-2xl rounded-2xl bg-white/80 border-emerald-100">
          <CardContent className="p-0">
            <div className="rounded-2xl overflow-hidden luxury-table-wrapper">
              <table className="w-full bg-white/60 luxury-table">
                <thead className="sticky top-0 z-20 shadow-md bg-gradient-to-r from-emerald-50 to-green-50">
                  <tr>
                    <th 
                      className="px-4 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("id")}
                    >
                      <div className="flex items-center justify-between">
                        Order ID
                        <div className="flex flex-col">
                          {sortBy === "id" && (
                            <>
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-emerald-600" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center justify-between">
                        Item
                        <div className="flex flex-col">
                          {sortBy === "name" && (
                            <>
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-emerald-600" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("customer")}
                    >
                      <div className="flex items-center justify-between">
                        Customer
                        <div className="flex flex-col">
                          {sortBy === "customer" && (
                            <>
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-emerald-600" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("dueDate")}
                    >
                      <div className="flex items-center justify-between">
                        Due Date
                        <div className="flex flex-col">
                          {sortBy === "dueDate" && (
                            <>
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-emerald-600" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center justify-between">
                        Status
                        <div className="flex flex-col">
                          {sortBy === "status" && (
                            <>
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-emerald-600" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("priority")}
                    >
                      <div className="flex items-center justify-between">
                        Priority
                        <div className="flex flex-col">
                          {sortBy === "priority" && (
                            <>
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-emerald-600" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("assignee")}
                    >
                      <div className="flex items-center justify-between">
                        Assignee
                        <div className="flex flex-col">
                          {sortBy === "assignee" && (
                            <>
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-emerald-600" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("progress")}
                    >
                      <div className="flex items-center justify-between">
                        Progress
                        <div className="flex flex-col">
                          {sortBy === "progress" && (
                            <>
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-emerald-600" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-emerald-100 transition-colors"
                      onClick={() => handleSort("timeRemaining")}
                    >
                      <div className="flex items-center justify-between">
                        Time Remaining
                        <div className="flex flex-col">
                          {sortBy === "timeRemaining" && (
                            <>
                              {sortOrder === "asc" ? (
                                <ChevronUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-emerald-600" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-8 text-emerald-400">No packing orders found.</td>
                    </tr>
                  ) : (
                    sortedItems.map(item => (
                      <tr key={item.id} className="border-b border-emerald-100 hover:bg-emerald-50/60 transition luxury-row">
                        <td className="px-4 py-3 font-semibold text-emerald-900 whitespace-nowrap">{item.id}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{item.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{item.customer}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{item.dueDate}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge className={`${statusConfig[item.status].color} px-2 py-1 rounded-xl text-xs font-semibold flex items-center gap-1`}>
                            {getStatusIcon(item.status)} {statusConfig[item.status].label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge className={`${priorityConfig[item.priority].color} px-2 py-1 rounded-xl text-xs font-semibold`}>
                            {priorityConfig[item.priority].label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{item.assignee}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Progress value={item.progress} className="h-2 rounded-full bg-emerald-100" />
                          <span className="text-xs text-emerald-700 font-semibold ml-2">{item.progress}%</span>
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap ${getTimeRemainingColor(item.timeRemaining)}`}>{item.timeRemaining}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="default" className="text-xs bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-2 rounded-xl shadow-md">
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl bg-white/95 border-emerald-200">
                                <div className="px-2 py-1.5 text-sm font-semibold text-emerald-700 border-b">Required Actions</div>
                                <DropdownMenuItem onClick={() => alert('Mark as Packed')}>Mark as Packed</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => alert('Print Packing Slip')}><Printer className="w-4 h-4 mr-2" /> Print Packing Slip</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline" className="text-xs px-2 rounded-xl border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 shadow-md">
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl bg-white/95 border-emerald-200">
                                <DropdownMenuItem onClick={() => alert('View Details')}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => alert('Edit')}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => alert('Contact Assignee')}><Users className="w-4 h-4 mr-2" /> Contact Assignee</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 