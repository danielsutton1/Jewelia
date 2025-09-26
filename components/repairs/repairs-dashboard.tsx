"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  Eye,
  MoreHorizontal,
  FileDown,
  Printer,
  Trash2,
  Edit,
  SlidersHorizontal,
  Calendar as CalendarIcon,
} from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Mock data - in a real app, this would come from an API
const mockRepairs = [
  {
    id: "REP-001",
    customer: { name: "John Doe", email: "john.d@example.com" },
    description: "Ring resizing - size 7 to 8",
    status: "In Progress",
    priority: "Medium",
    receivedDate: "2023-10-01",
    dueDate: "2023-10-10",
    assignedTo: "Sarah",
    price: 75.0,
    lastUpdated: "2023-10-03",
  },
  {
    id: "REP-002",
    customer: { name: "Jane Smith", email: "jane.s@example.com" },
    description: "Watch battery replacement",
    status: "Completed",
    priority: "Low",
    receivedDate: "2023-10-02",
    dueDate: "2023-10-04",
    assignedTo: "Mike",
    price: 25.0,
    lastUpdated: "2023-10-02",
  },
  {
    id: "REP-003",
    customer: { name: "Peter Jones", email: "peter.j@example.com" },
    description: "Broken chain solder",
    status: "Received",
    priority: "High",
    receivedDate: "2023-10-03",
    dueDate: "2023-10-07",
    assignedTo: "Pending",
    price: 50.0,
    lastUpdated: "2023-10-03",
  },
  {
    id: "REP-004",
    customer: { name: "Emily White", email: "emily.w@example.com" },
    description: "Diamond setting check and tighten",
    status: "Awaiting Parts",
    priority: "Urgent",
    receivedDate: "2023-09-28",
    dueDate: "2023-10-15",
    assignedTo: "Sarah",
    price: 120.0,
    lastUpdated: "2023-10-01",
  },
]

const statusOptions = ["Received", "In Progress", "Awaiting Parts", "Completed", "Ready for Pickup", "Delivered", "Cancelled"]
const priorityOptions = ["Low", "Medium", "High", "Urgent"]
const assignees = ["Sarah", "Mike", "Admin", "Pending"]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Received":
      return "bg-gray-200 text-gray-800"
    case "In Progress":
      return "bg-blue-200 text-blue-800"
    case "Awaiting Parts":
      return "bg-yellow-200 text-yellow-800"
    case "Completed":
      return "bg-green-200 text-green-800"
    case "Ready for Pickup":
      return "bg-purple-200 text-purple-800"
    case "Delivered":
        return "bg-zinc-300 text-zinc-900"
    case "Cancelled":
      return "bg-red-200 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function RepairsDashboard() {
  const router = useRouter()
  const [repairs, setRepairs] = useState(mockRepairs)
  const [filteredRepairs, setFilteredRepairs] = useState(mockRepairs)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  useEffect(() => {
    let result = repairs
    if (search) {
      result = result.filter(r =>
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (statusFilter !== "all") {
      result = result.filter(r => r.status === statusFilter)
    }
    if (priorityFilter !== "all") {
      result = result.filter(r => r.priority === priorityFilter)
    }
    if (assigneeFilter !== "all") {
      result = result.filter(r => r.assignedTo === assigneeFilter)
    }
    if (dateRange?.from && dateRange?.to) {
      result = result.filter(r => {
        const receivedDate = new Date(r.receivedDate)
        return receivedDate >= dateRange.from! && receivedDate <= dateRange.to!
      })
    }
    setFilteredRepairs(result)
  }, [search, statusFilter, priorityFilter, assigneeFilter, dateRange, repairs])

  // Action Handlers
  const handleExport = () => {
    toast({ title: "Exporting Repairs", description: "CSV export is being generated..." })
    // In a real app, this would trigger a CSV download
  }

  const handlePrintLabel = (repairId: string) => {
    toast({ title: `Printing Label for ${repairId}`, description: "This would open a print dialog." })
  }
  
  const handleDelete = (repairId: string) => {
    if (confirm("Are you sure you want to delete this repair? This action cannot be undone.")) {
      setRepairs(prev => prev.filter(r => r.id !== repairId))
      toast({ title: "Repair Deleted", description: `Repair ${repairId} has been deleted.` })
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Enhanced Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 min-h-[44px] min-w-[44px] text-sm sm:text-base"
          >
            <FileDown className="mr-1 sm:mr-2 h-4 w-4" /> 
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Enhanced Filters Bar */}
      <div className="relative">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl"></div>
        <div className="relative p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-wrap sm:flex-row items-start sm:items-center gap-2 sm:gap-3 lg:gap-4">
            <div className="relative flex-1 min-w-[200px] sm:min-w-[250px] w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by ID, customer, description..."
                className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300 text-sm sm:text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[200px] lg:w-[240px] justify-start text-left font-normal bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 min-h-[44px] text-sm sm:text-base",
                    !dateRange && "text-slate-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px] bg-white/80 backdrop-blur-sm border-slate-200 min-h-[44px] text-sm sm:text-base">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px] bg-white/80 backdrop-blur-sm border-slate-200 min-h-[44px] text-sm sm:text-base">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                <SelectItem value="all">All Priorities</SelectItem>
                {priorityOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px] bg-white/80 backdrop-blur-sm border-slate-200 min-h-[44px] text-sm sm:text-base">
                <SelectValue placeholder="Filter by assignee" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                <SelectItem value="all">All Assignees</SelectItem>
                {assignees.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Enhanced Repairs Table */}
      <div className="relative">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl overflow-hidden"></div>
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">ID</TableHead>
                <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Customer</TableHead>
                <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Description</TableHead>
                <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Status</TableHead>
                <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Priority</TableHead>
                <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Dates</TableHead>
                <TableHead className="font-semibold text-slate-700 text-xs sm:text-sm">Assigned To</TableHead>
                <TableHead className="text-right font-semibold text-slate-700 text-xs sm:text-sm">Price</TableHead>
                <TableHead className="text-right font-semibold text-slate-700 text-xs sm:text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRepairs.length > 0 ? (
                filteredRepairs.map((repair) => (
                  <TableRow key={repair.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-slate-800 text-xs sm:text-sm">{repair.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800 text-xs sm:text-sm">{repair.customer.name}</div>
                      <div className="text-xs text-slate-500">{repair.customer.email}</div>
                    </TableCell>
                    <TableCell className="max-w-[200px] sm:max-w-[300px] truncate text-slate-700 text-xs sm:text-sm">{repair.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-transparent font-medium text-xs sm:text-sm", getStatusBadge(repair.status))}>
                        {repair.status}
                      </Badge>
                    </TableCell>
                     <TableCell>
                      <Badge variant={repair.priority === "Urgent" || repair.priority === "High" ? "destructive" : "secondary"} className="font-medium text-xs sm:text-sm">
                        {repair.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-800 text-xs sm:text-sm">Received: {format(new Date(repair.receivedDate), "MM/dd/yy")}</div>
                      <div className="text-xs text-slate-500">Due: {format(new Date(repair.dueDate), "MM/dd/yy")}</div>
                    </TableCell>
                    <TableCell className="text-slate-700 text-xs sm:text-sm">{repair.assignedTo}</TableCell>
                    <TableCell className="text-right font-semibold text-slate-800 text-xs sm:text-sm">${repair.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-slate-100 min-h-[44px] min-w-[44px]">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl border-white/20 shadow-xl">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/repairs/${repair.id}`)} className="hover:bg-slate-50">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/repairs/${repair.id}/edit`)} className="hover:bg-slate-50">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrintLabel(repair.id)} className="hover:bg-slate-50">
                            <Printer className="mr-2 h-4 w-4" /> Print Label
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(repair.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center h-24 text-slate-500 text-sm sm:text-base">
                    No repairs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
} 
 