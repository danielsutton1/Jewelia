"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare, 
  ShoppingBag, 
  Star, 
  Clock, 
  User, 
  Edit, 
  Trash2, 
  Filter,
  Search,
  Download,
  Eye,
  Tag,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { format, formatDistanceToNow } from "date-fns"

// Types for activity logging
interface ActivityLog {
  id: string
  customerId: string
  type: 'call' | 'email' | 'appointment' | 'inquiry' | 'purchase' | 'follow_up' | 'complaint' | 'referral'
  title: string
  description: string
  outcome: 'positive' | 'neutral' | 'negative' | 'pending'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: string
  createdAt: Date
  scheduledFor?: Date
  completedAt?: Date
  tags: string[]
  attachments: string[]
  relatedItems?: {
    type: 'ring' | 'necklace' | 'earrings' | 'bracelet' | 'watch' | 'other'
    name: string
    price?: number
    description?: string
  }[]
  followUpDate?: Date
  notes: string
}

interface CustomerActivityLogProps {
  customerId?: string
  customerName?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// Mock data for activity logs
const mockActivityLogs: ActivityLog[] = [
  {
    id: "1",
    customerId: "1",
    type: "call",
    title: "Follow-up call about engagement ring",
    description: "Called customer to follow up on engagement ring inquiry. They're interested in a 2-carat diamond ring with platinum setting.",
    outcome: "positive",
    priority: "high",
    assignedTo: "Sarah Johnson",
    createdAt: new Date("2024-01-15T10:30:00"),
    tags: ["engagement", "diamond", "follow-up"],
    attachments: [],
    relatedItems: [
      {
        type: "ring",
        name: "2-Carat Diamond Engagement Ring",
        price: 15000,
        description: "Platinum setting with VS1 clarity"
      }
    ],
    followUpDate: new Date("2024-01-22T14:00:00"),
    notes: "Customer mentioned budget is flexible. Showed interest in viewing similar rings in person."
  },
  {
    id: "2",
    customerId: "1",
    type: "appointment",
    title: "In-store consultation",
    description: "Scheduled appointment for customer to view engagement rings and discuss options.",
    outcome: "pending",
    priority: "high",
    assignedTo: "Sarah Johnson",
    createdAt: new Date("2024-01-16T09:00:00"),
    scheduledFor: new Date("2024-01-22T14:00:00"),
    tags: ["appointment", "consultation", "engagement"],
    attachments: [],
    relatedItems: [],
    notes: "Customer prefers afternoon appointments. Will prepare 3-4 ring options to show."
  },
  {
    id: "3",
    customerId: "1",
    type: "email",
    title: "Ring specifications sent",
    description: "Sent detailed specifications and pricing for the 2-carat diamond ring options.",
    outcome: "neutral",
    priority: "medium",
    assignedTo: "Sarah Johnson",
    createdAt: new Date("2024-01-17T16:45:00"),
    tags: ["email", "specifications", "pricing"],
    attachments: ["ring-specs.pdf", "pricing-sheet.pdf"],
    relatedItems: [
      {
        type: "ring",
        name: "2-Carat Diamond Engagement Ring",
        price: 15000,
        description: "Platinum setting with VS1 clarity"
      }
    ],
    notes: "Customer acknowledged receipt. Will follow up in 2 days."
  }
]

export function CustomerActivityLog({ customerId, customerName, open, onOpenChange }: CustomerActivityLogProps) {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs)
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)
  const [internalAddDialogOpen, setInternalAddDialogOpen] = useState(false)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Form state for new activity
  const [newActivity, setNewActivity] = useState({
    type: "call" as ActivityLog['type'],
    title: "",
    description: "",
    outcome: "neutral" as ActivityLog['outcome'],
    priority: "medium" as ActivityLog['priority'],
    assignedTo: "Sarah Johnson",
    scheduledFor: "",
    tags: [] as string[],
    relatedItems: [] as ActivityLog['relatedItems'],
    followUpDate: "",
    notes: ""
  })

  // Use controlled or internal state for dialog open
  const isAddDialogOpen = open !== undefined ? open : internalAddDialogOpen
  const setIsAddDialogOpen = onOpenChange !== undefined ? onOpenChange : setInternalAddDialogOpen

  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'appointment': return <Calendar className="h-4 w-4" />
      case 'inquiry': return <MessageSquare className="h-4 w-4" />
      case 'purchase': return <ShoppingBag className="h-4 w-4" />
      case 'follow_up': return <Clock3 className="h-4 w-4" />
      case 'complaint': return <AlertCircle className="h-4 w-4" />
      case 'referral': return <User className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getOutcomeColor = (outcome: ActivityLog['outcome']) => {
    switch (outcome) {
      case 'positive': return 'bg-green-100 text-green-800'
      case 'negative': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: ActivityLog['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.title.toLowerCase().includes(search.toLowerCase()) ||
                         log.description.toLowerCase().includes(search.toLowerCase()) ||
                         log.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    
    if (filter === "all") return matchesSearch
    if (filter === log.type) return matchesSearch
    if (filter === log.outcome) return matchesSearch
    if (filter === log.priority) return matchesSearch
    
    return matchesSearch
  })

  const handleAddActivity = () => {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      customerId: customerId || "1",
      type: newActivity.type,
      title: newActivity.title,
      description: newActivity.description,
      outcome: newActivity.outcome,
      priority: newActivity.priority,
      assignedTo: newActivity.assignedTo,
      createdAt: new Date(),
      scheduledFor: newActivity.scheduledFor ? new Date(newActivity.scheduledFor) : undefined,
      tags: newActivity.tags,
      attachments: [],
      relatedItems: newActivity.relatedItems,
      followUpDate: newActivity.followUpDate ? new Date(newActivity.followUpDate) : undefined,
      notes: newActivity.notes
    }

    setActivityLogs([newLog, ...activityLogs])
    setIsAddDialogOpen(false)
    setNewActivity({
      type: "call",
      title: "",
      description: "",
      outcome: "neutral",
      priority: "medium",
      assignedTo: "Sarah Johnson",
      scheduledFor: "",
      tags: [],
      relatedItems: [],
      followUpDate: "",
      notes: ""
    })
    toast({
      title: "Activity logged successfully",
      description: "The customer activity has been recorded.",
    })
  }

  const handleDeleteActivity = (id: string) => {
    setActivityLogs(activityLogs.filter(log => log.id !== id))
    toast({
      title: "Activity deleted",
      description: "The activity log has been removed.",
    })
  }

  const upcomingActivities = activityLogs.filter(log => 
    log.scheduledFor && log.scheduledFor > new Date()
  ).sort((a, b) => a.scheduledFor!.getTime() - b.scheduledFor!.getTime())

  const pendingFollowUps = activityLogs.filter(log => 
    log.followUpDate && log.followUpDate > new Date()
  ).sort((a, b) => a.followUpDate!.getTime() - b.followUpDate!.getTime())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Activity Log</h2>
          <p className="text-muted-foreground">
            Track all customer interactions and activities for {customerName || "this customer"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Log Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log New Activity</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Activity Type</label>
                    <Select value={newActivity.type} onValueChange={(value: ActivityLog['type']) => 
                      setNewActivity({...newActivity, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="appointment">Appointment</SelectItem>
                        <SelectItem value="inquiry">Inquiry</SelectItem>
                        <SelectItem value="purchase">Purchase</SelectItem>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={newActivity.priority} onValueChange={(value: ActivityLog['priority']) => 
                      setNewActivity({...newActivity, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input 
                    placeholder="Brief description of the activity"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea 
                    placeholder="Detailed description of the interaction"
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Outcome</label>
                    <Select value={newActivity.outcome} onValueChange={(value: ActivityLog['outcome']) => 
                      setNewActivity({...newActivity, outcome: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Assigned To</label>
                    <Select value={newActivity.assignedTo} onValueChange={(value) => 
                      setNewActivity({...newActivity, assignedTo: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                        <SelectItem value="Mike Chen">Mike Chen</SelectItem>
                        <SelectItem value="Emma Davis">Emma Davis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Scheduled For (Optional)</label>
                    <Input 
                      type="datetime-local"
                      value={newActivity.scheduledFor}
                      onChange={(e) => setNewActivity({...newActivity, scheduledFor: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Follow-up Date (Optional)</label>
                    <Input 
                      type="datetime-local"
                      value={newActivity.followUpDate}
                      onChange={(e) => setNewActivity({...newActivity, followUpDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea 
                    placeholder="Additional notes or observations"
                    value={newActivity.notes}
                    onChange={(e) => setNewActivity({...newActivity, notes: e.target.value})}
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddActivity}>
                  Log Activity
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityLogs.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingActivities.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
            <Clock3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingFollowUps.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityLogs.filter(log => log.priority === 'high' || log.priority === 'urgent').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="follow-ups">Follow-ups</TabsTrigger>
          <TabsTrigger value="high-priority">High Priority</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input 
                placeholder="Search activities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="call">Phone Calls</SelectItem>
                <SelectItem value="email">Emails</SelectItem>
                <SelectItem value="appointment">Appointments</SelectItem>
                <SelectItem value="inquiry">Inquiries</SelectItem>
                <SelectItem value="purchase">Purchases</SelectItem>
                <SelectItem value="follow_up">Follow-ups</SelectItem>
                <SelectItem value="complaint">Complaints</SelectItem>
                <SelectItem value="referral">Referrals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity List */}
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        {getActivityIcon(log.type)}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{log.title}</h3>
                          <Badge variant="outline" className={getOutcomeColor(log.outcome)}>
                            {log.outcome}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(log.priority)}>
                            {log.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{log.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.assignedTo}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                          </span>
                          {log.scheduledFor && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Scheduled: {format(log.scheduledFor, 'MMM dd, yyyy HH:mm')}
                            </span>
                          )}
                        </div>
                        
                        {log.tags.length > 0 && (
                          <div className="flex gap-1">
                            {log.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {log.relatedItems && log.relatedItems.length > 0 && (
                          <div className="flex gap-2">
                            {log.relatedItems.map((item, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {item.name} {item.price && `($${item.price.toLocaleString()})`}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteActivity(log.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="space-y-4">
            {upcomingActivities.map((log) => (
              <Card key={log.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{log.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Scheduled for {format(log.scheduledFor!, 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="follow-ups" className="space-y-4">
          <div className="space-y-4">
            {pendingFollowUps.map((log) => (
              <Card key={log.id} className="border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
                        <Clock3 className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{log.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Follow-up due {format(log.followUpDate!, 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Mark Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="high-priority" className="space-y-4">
          <div className="space-y-4">
            {activityLogs
              .filter(log => log.priority === 'high' || log.priority === 'urgent')
              .map((log) => (
                <Card key={log.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{log.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Priority: {log.priority} • {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Take Action
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 