"use client"

import * as React from "react"
import { format, subDays, addDays, startOfWeek, endOfWeek } from "date-fns"
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Edit,
  FileText,
  MoreHorizontal,
  Send,
  Trash,
  CheckCircle,
  AlertCircle,
  Download,
  Filter,
  Search,
  Plus,
  Eye,
  Copy,
  Share2,
  BarChart3,
  Target,
  TrendingUp,
  Users
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

// Enhanced mock data for time entries
const generateMockTimeEntries = (date: Date) => {
  const dateStr = format(date, "yyyy-MM-dd")

  return [
    {
      id: `entry-${dateStr}-1`,
      workOrderId: "WO-1234",
      workOrderDescription: "Diamond Engagement Ring",
      stage: "Stone Setting",
      timeSpent: 7200, // 2 hours in seconds
      breakTime: 900, // 15 minutes in seconds
      notes: "Set the center stone and half of the pavé diamonds. Customer requested extra attention to detail.",
      timestamp: `${dateStr}T09:30:00.000Z`,
      status: "approved",
      approvedBy: "Sarah Johnson",
      approvedAt: `${dateStr}T17:00:00.000Z`,
      efficiency: 95,
      quality: "excellent"
    },
    {
      id: `entry-${dateStr}-2`,
      workOrderId: "WO-1234",
      workOrderDescription: "Diamond Engagement Ring",
      stage: "Stone Setting",
      timeSpent: 5400, // 1.5 hours in seconds
      breakTime: 600, // 10 minutes in seconds
      notes: "Completed setting all pavé diamonds. Final inspection passed.",
      timestamp: `${dateStr}T13:00:00.000Z`,
      status: "pending",
      efficiency: 92,
      quality: "good"
    },
    {
      id: `entry-${dateStr}-3`,
      workOrderId: "WO-1235",
      workOrderDescription: "Gold Wedding Band",
      stage: "Polishing",
      timeSpent: 3600, // 1 hour in seconds
      breakTime: 0,
      notes: "Initial polishing completed. Ready for final inspection.",
      timestamp: `${dateStr}T15:00:00.000Z`,
      status: "pending",
      efficiency: 88,
      quality: "good"
    },
    {
      id: `entry-${dateStr}-4`,
      workOrderId: "WO-1236",
      workOrderDescription: "Pearl Necklace",
      stage: "Design/CAD",
      timeSpent: 4500, // 1.25 hours in seconds
      breakTime: 300, // 5 minutes in seconds
      notes: "Created initial design concept. Customer approved direction.",
      timestamp: `${dateStr}T16:30:00.000Z`,
      status: "draft",
      efficiency: 85,
      quality: "pending"
    },
  ]
}

// Mock data for approval workflow
const approvalWorkflow = {
  levels: [
    { id: 1, name: "Self Review", status: "completed", approver: "You", completedAt: "2023-06-15T16:00:00Z" },
    { id: 2, name: "Supervisor Review", status: "pending", approver: "Michael Chen", dueDate: "2023-06-16T17:00:00Z" },
    { id: 3, name: "Manager Approval", status: "pending", approver: "Lisa Wong", dueDate: "2023-06-17T17:00:00Z" }
  ],
  currentLevel: 2,
  totalLevels: 3
}

export function DailyTimesheet() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [timeEntries, setTimeEntries] = React.useState<any[]>([])
  const [editingEntry, setEditingEntry] = React.useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = React.useState(false)
  const [isAddEntryDialogOpen, setIsAddEntryDialogOpen] = React.useState(false)
  const [submissionNotes, setSubmissionNotes] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [workOrderFilter, setWorkOrderFilter] = React.useState("all")
  const [showApprovalWorkflow, setShowApprovalWorkflow] = React.useState(false)

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  // Format time as decimal hours
  const formatHours = (seconds: number) => {
    return (seconds / 3600).toFixed(2)
  }

  // Load time entries for the selected date
  React.useEffect(() => {
    // In a real app, you would fetch this from your API
    setTimeEntries(generateMockTimeEntries(selectedDate))
  }, [selectedDate])

  // Filter entries based on search and filters
  const filteredEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.workOrderDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.stage.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.notes.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter
    const matchesWorkOrder = workOrderFilter === "all" || entry.workOrderId === workOrderFilter
    
    return matchesSearch && matchesStatus && matchesWorkOrder
  })

  // Calculate totals
  const totalTimeSpent = filteredEntries.reduce((total, entry) => total + entry.timeSpent, 0)
  const totalBreakTime = filteredEntries.reduce((total, entry) => total + entry.breakTime, 0)
  const totalProductiveTime = totalTimeSpent - totalBreakTime
  const averageEfficiency = filteredEntries.length > 0 
    ? Math.round(filteredEntries.reduce((sum, entry) => sum + entry.efficiency, 0) / filteredEntries.length)
    : 0

  // Group entries by work order
  const entriesByWorkOrder = filteredEntries.reduce((groups: any, entry) => {
    const key = entry.workOrderId
    if (!groups[key]) {
      groups[key] = {
        workOrderId: entry.workOrderId,
        workOrderDescription: entry.workOrderDescription,
        entries: [],
        totalTime: 0,
        totalBreakTime: 0,
        averageEfficiency: 0
      }
    }
    groups[key].entries.push(entry)
    groups[key].totalTime += entry.timeSpent
    groups[key].totalBreakTime += entry.breakTime
    return groups
  }, {})

  // Calculate average efficiency for each work order
  Object.keys(entriesByWorkOrder).forEach(key => {
    const group = entriesByWorkOrder[key]
    group.averageEfficiency = Math.round(
      group.entries.reduce((sum: number, entry: any) => sum + entry.efficiency, 0) / group.entries.length
    )
  })

  // Navigate to previous/next day
  const goToPreviousDay = () => setSelectedDate(subDays(selectedDate, 1))
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1))

  // Handle editing an entry
  const handleEditEntry = (entry: any) => {
    setEditingEntry({
      ...entry,
      timeSpentHours: Math.floor(entry.timeSpent / 3600),
      timeSpentMinutes: Math.floor((entry.timeSpent % 3600) / 60),
      breakTimeMinutes: Math.floor(entry.breakTime / 60),
    })
    setIsEditDialogOpen(true)
  }

  // Handle deleting an entry
  const handleDeleteEntry = (entryId: string) => {
    // In a real app, you would call your API to delete the entry
    setTimeEntries(timeEntries.filter((entry) => entry.id !== entryId))
    toast({
      title: "Entry Deleted",
      description: "Time entry has been removed from your timesheet."
    })
  }

  // Handle saving an edited entry
  const handleSaveEditedEntry = () => {
    if (!editingEntry) return

    const updatedTimeSpent = editingEntry.timeSpentHours * 3600 + editingEntry.timeSpentMinutes * 60
    const updatedBreakTime = editingEntry.breakTimeMinutes * 60

    const updatedEntry = {
      ...editingEntry,
      timeSpent: updatedTimeSpent,
      breakTime: updatedBreakTime,
    }

    // Remove the temporary fields
    delete updatedEntry.timeSpentHours
    delete updatedEntry.timeSpentMinutes
    delete updatedEntry.breakTimeMinutes

    // In a real app, you would call your API to update the entry
    setTimeEntries(timeEntries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)))

    setIsEditDialogOpen(false)
    setEditingEntry(null)
    
    toast({
      title: "Entry Updated",
      description: "Time entry has been updated successfully."
    })
  }

  // Handle adding a new entry
  const handleAddEntry = (newEntry: any) => {
    const entryWithId = {
      ...newEntry,
      id: `entry-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: "draft",
      efficiency: 85,
      quality: "pending"
    }
    
    setTimeEntries(prev => [...prev, entryWithId])
    setIsAddEntryDialogOpen(false)
    
    toast({
      title: "Entry Added",
      description: "New time entry has been added to your timesheet."
    })
  }

  // Handle submitting timesheet for approval
  const handleSubmitTimesheet = () => {
    // In a real app, you would call your API to submit the timesheet
    console.log("Submitting timesheet for", format(selectedDate, "yyyy-MM-dd"))
    console.log("Notes:", submissionNotes)

    // Update all entries to "submitted" status
    setTimeEntries(
      timeEntries.map((entry) => ({
        ...entry,
        status: entry.status === "pending" ? "submitted" : entry.status,
      })),
    )

    setIsSubmitDialogOpen(false)
    setSubmissionNotes("")
    
    toast({
      title: "Timesheet Submitted",
      description: "Your timesheet has been submitted for approval."
    })
  }

  // Handle exporting timesheet
  const handleExport = (format: string) => {
    toast({
      title: "Export Started",
      description: `Preparing ${format.toUpperCase()} export of your timesheet...`
    })
    // In a real app, this would generate and download the file
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get quality badge
  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case "excellent":
        return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
      case "good":
        return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
      case "fair":
        return <Badge className="bg-amber-100 text-amber-800">Fair</Badge>
      case "pending":
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
      default:
        return <Badge variant="outline">{quality}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Daily Timesheet</h2>
          <p className="text-muted-foreground">
            Track and manage your daily time entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowApprovalWorkflow(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Approval Status
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                <FileText className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setIsAddEntryDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Date Navigation and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="min-w-[200px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="icon" onClick={goToNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  className="pl-8 w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={workOrderFilter} onValueChange={setWorkOrderFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Work Orders</SelectItem>
                  <SelectItem value="WO-1234">WO-1234</SelectItem>
                  <SelectItem value="WO-1235">WO-1235</SelectItem>
                  <SelectItem value="WO-1236">WO-1236</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{formatHours(totalTimeSpent)}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={(totalTimeSpent / (8 * 3600)) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {((totalTimeSpent / (8 * 3600)) * 100).toFixed(1)}% of daily goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Productive Time</p>
                <p className="text-2xl font-bold">{formatHours(totalProductiveTime)}h</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatHours(totalBreakTime)}h break time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Efficiency</p>
                <p className="text-2xl font-bold">{averageEfficiency}%</p>
              </div>
              <Target className="h-8 w-8 text-amber-500" />
            </div>
            <Progress value={averageEfficiency} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Average across all entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entries</p>
                <p className="text-2xl font-bold">{filteredEntries.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Pending: {filteredEntries.filter(e => e.status === "pending").length}</span>
                <span>Approved: {filteredEntries.filter(e => e.status === "approved").length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Time Entries</CardTitle>
              <CardDescription>
                {filteredEntries.length} entries for {format(selectedDate, "MMMM d, yyyy")}
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsSubmitDialogOpen(true)}
              disabled={filteredEntries.filter(e => e.status === "pending").length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit for Approval
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {Object.keys(entriesByWorkOrder).map((workOrderId) => {
                const group = entriesByWorkOrder[workOrderId]
                return (
                  <div key={workOrderId} className="space-y-3">
                    {/* Work Order Header */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div>
                        <h3 className="font-medium">{group.workOrderId} - {group.workOrderDescription}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatHours(group.totalTime)}h total • {formatHours(group.totalBreakTime)}h breaks • {group.averageEfficiency}% efficiency
                        </p>
                      </div>
                      <Progress value={group.averageEfficiency} className="w-20" />
                    </div>

                    {/* Entries for this work order */}
                    {group.entries.map((entry: any) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{entry.stage}</span>
                            {getStatusBadge(entry.status)}
                            {getQualityBadge(entry.quality)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{entry.notes}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{format(new Date(entry.timestamp), "h:mm a")}</span>
                            <span>{formatHours(entry.timeSpent)}h work</span>
                            <span>{formatHours(entry.breakTime)}h break</span>
                            <span>{entry.efficiency}% efficiency</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditEntry(entry)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteEntry(entry.id)}>
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Entry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
            <DialogDescription>
              Update the details of your time entry
            </DialogDescription>
          </DialogHeader>
          {editingEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Work Hours</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Hours"
                      value={editingEntry.timeSpentHours}
                      onChange={(e) => setEditingEntry({
                        ...editingEntry,
                        timeSpentHours: parseInt(e.target.value) || 0
                      })}
                    />
                    <Input
                      type="number"
                      placeholder="Minutes"
                      value={editingEntry.timeSpentMinutes}
                      onChange={(e) => setEditingEntry({
                        ...editingEntry,
                        timeSpentMinutes: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Break Time (minutes)</Label>
                  <Input
                    type="number"
                    value={editingEntry.breakTimeMinutes}
                    onChange={(e) => setEditingEntry({
                      ...editingEntry,
                      breakTimeMinutes: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={editingEntry.notes}
                  onChange={(e) => setEditingEntry({
                    ...editingEntry,
                    notes: e.target.value
                  })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditedEntry}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Timesheet Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Timesheet for Approval</DialogTitle>
            <DialogDescription>
              Submit your timesheet for {format(selectedDate, "MMMM d, yyyy")} for review and approval
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted">
              <h4 className="font-medium mb-2">Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Hours:</span>
                  <span>{formatHours(totalTimeSpent)}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Productive Time:</span>
                  <span>{formatHours(totalProductiveTime)}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Break Time:</span>
                  <span>{formatHours(totalBreakTime)}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Efficiency:</span>
                  <span>{averageEfficiency}%</span>
                </div>
              </div>
            </div>
            <div>
              <Label>Additional Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes for your supervisor..."
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitTimesheet}>
              Submit for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Workflow Dialog */}
      <Dialog open={showApprovalWorkflow} onOpenChange={setShowApprovalWorkflow}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Approval Workflow</DialogTitle>
            <DialogDescription>
              Track the approval status of your timesheet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {approvalWorkflow.levels.map((level, index) => (
              <div key={level.id} className="flex items-center gap-4 p-3 rounded-lg border">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{level.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {level.approver} • {level.status === "completed" ? "Completed" : "Pending"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {level.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : level.status === "pending" && index + 1 === approvalWorkflow.currentLevel ? (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowApprovalWorkflow(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
