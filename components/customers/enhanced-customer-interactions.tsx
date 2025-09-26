"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  User, 
  Send, 
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock3,
  Zap,
  Target,
  Heart,
  Award,
  Crown,
  Building,
  MapPin,
  Tag,
  Bell,
  Settings,
  Download,
  Archive,
  Reply,
  Forward,
  Bookmark,
  Share2
} from "lucide-react"
import { toast } from "sonner"

interface CustomerInteraction {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  type: 'email' | 'phone' | 'appointment' | 'inquiry' | 'purchase' | 'review' | 'complaint'
  subject: string
  content: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  createdAt: string
  updatedAt: string
  scheduledFor?: string
  tags: string[]
  notes?: string
  attachments?: string[]
  followUpRequired: boolean
  followUpDate?: string
}

interface Customer {
  id: string
  full_name: string
  email: string
  phone?: string
  company?: string
  status: 'vip' | 'regular' | 'new' | 'at_risk'
}

export function EnhancedCustomerInteractions() {
  const [interactions, setInteractions] = useState<CustomerInteraction[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInteraction, setSelectedInteraction] = useState<CustomerInteraction | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [showNewInteraction, setShowNewInteraction] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch customers
      const customersResponse = await fetch('/api/customers?limit=1000')
      const customersData = await customersResponse.json()
      const customersList = customersData.data || []
      setCustomers(customersList)
      
      // Generate mock interactions based on customers
      const mockInteractions: CustomerInteraction[] = customersList.slice(0, 20).map((customer: Customer, index: number) => {
        const types: CustomerInteraction['type'][] = ['email', 'phone', 'appointment', 'inquiry', 'purchase', 'review', 'complaint']
        const priorities: CustomerInteraction['priority'][] = ['low', 'medium', 'high', 'urgent']
        const statuses: CustomerInteraction['status'][] = ['pending', 'in_progress', 'completed']
        
        const type = types[Math.floor(Math.random() * types.length)]
        const priority = priorities[Math.floor(Math.random() * priorities.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        
        const subjects = {
          email: ['Product Inquiry', 'Order Update', 'Appointment Confirmation', 'Special Offer'],
          phone: ['Follow-up Call', 'Order Status', 'Appointment Scheduling', 'Customer Support'],
          appointment: ['Jewelry Consultation', 'Ring Sizing', 'Design Review', 'Purchase Discussion'],
          inquiry: ['Product Information', 'Pricing Request', 'Availability Check', 'Custom Design'],
          purchase: ['Order Confirmation', 'Payment Processing', 'Shipping Update', 'Delivery Confirmation'],
          review: ['Service Feedback', 'Product Review', 'Experience Rating', 'Recommendation Request'],
          complaint: ['Product Issue', 'Service Complaint', 'Quality Concern', 'Delivery Problem']
        }
        
        const contents = {
          email: 'Thank you for your interest in our premium jewelry collection. We would be delighted to assist you with your inquiry.',
          phone: 'Called to follow up on recent purchase and ensure customer satisfaction.',
          appointment: 'Scheduled consultation to discuss custom jewelry design and preferences.',
          inquiry: 'Customer inquired about specific product availability and pricing options.',
          purchase: 'Order processed successfully. Customer made purchase of premium jewelry items.',
          review: 'Customer provided positive feedback about service quality and product satisfaction.',
          complaint: 'Customer reported an issue with their recent purchase. Investigation and resolution in progress.'
        }
        
        return {
          id: `interaction-${index}`,
          customerId: customer.id,
          customerName: customer.full_name || customer.email,
          customerEmail: customer.email,
          type,
          subject: subjects[type][Math.floor(Math.random() * subjects[type].length)],
          content: contents[type],
          status,
          priority,
          assignedTo: 'Sales Team',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          scheduledFor: type === 'appointment' ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          tags: ['jewelry', 'premium', 'consultation'],
          notes: 'Customer shows high interest in premium jewelry collection.',
          attachments: [],
          followUpRequired: Math.random() > 0.5,
          followUpDate: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
        }
      })
      
      setInteractions(mockInteractions)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load customer interactions')
    } finally {
      setLoading(false)
    }
  }

  const getInteractionIcon = (type: string) => {
    const icons = {
      email: Mail,
      phone: Phone,
      appointment: Calendar,
      inquiry: MessageSquare,
      purchase: CheckCircle,
      review: Star,
      complaint: AlertTriangle
    }
    const Icon = icons[type as keyof typeof icons] || MessageSquare
    return <Icon className="h-4 w-4" />
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock3,
      in_progress: Clock,
      completed: CheckCircle,
      cancelled: AlertTriangle
    }
    const Icon = icons[status as keyof typeof icons] || Clock3
    return <Icon className="h-4 w-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleStatusChange = (interactionId: string, newStatus: CustomerInteraction['status']) => {
    setInteractions(prev => prev.map(interaction => 
      interaction.id === interactionId 
        ? { ...interaction, status: newStatus, updatedAt: new Date().toISOString() }
        : interaction
    ))
    toast.success('Interaction status updated successfully!')
  }

  const handlePriorityChange = (interactionId: string, newPriority: CustomerInteraction['priority']) => {
    setInteractions(prev => prev.map(interaction => 
      interaction.id === interactionId 
        ? { ...interaction, priority: newPriority, updatedAt: new Date().toISOString() }
        : interaction
    ))
    toast.success('Interaction priority updated successfully!')
  }

  const handleFollowUp = (interaction: CustomerInteraction) => {
    setInteractions(prev => prev.map(i => 
      i.id === interaction.id 
        ? { ...i, followUpRequired: false, followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }
        : i
    ))
    toast.success('Follow-up scheduled successfully!')
  }

  const filteredInteractions = interactions.filter(interaction => {
    const matchesSearch = interaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interaction.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || interaction.type === filterType
    const matchesStatus = filterStatus === 'all' || interaction.status === filterStatus
    const matchesPriority = filterPriority === 'all' || interaction.priority === filterPriority
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority
  })

  const getTabInteractions = (tab: string) => {
    switch (tab) {
      case 'pending':
        return filteredInteractions.filter(i => i.status === 'pending')
      case 'urgent':
        return filteredInteractions.filter(i => i.priority === 'urgent')
      case 'followup':
        return filteredInteractions.filter(i => i.followUpRequired)
      default:
        return filteredInteractions
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading customer interactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Customer Interactions</h2>
          <p className="text-muted-foreground">
            Manage all customer communications and engagement activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowNewInteraction(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Interaction
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search interactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
            <SelectItem value="appointment">Appointment</SelectItem>
            <SelectItem value="inquiry">Inquiry</SelectItem>
            <SelectItem value="purchase">Purchase</SelectItem>
            <SelectItem value="review">Review</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({filteredInteractions.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({filteredInteractions.filter(i => i.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="urgent">Urgent ({filteredInteractions.filter(i => i.priority === 'urgent').length})</TabsTrigger>
          <TabsTrigger value="followup">Follow-up ({filteredInteractions.filter(i => i.followUpRequired).length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="space-y-4">
            {getTabInteractions(activeTab).map((interaction) => (
              <Card key={interaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white">
                        {getInteractionIcon(interaction.type)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{interaction.subject}</h4>
                          {interaction.followUpRequired && (
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              <Bell className="h-3 w-3 mr-1" />
                              Follow-up
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{interaction.content}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {interaction.customerName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(interaction.createdAt)}
                          </span>
                          {interaction.scheduledFor && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(interaction.scheduledFor)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(interaction.priority)}>
                        {interaction.priority}
                      </Badge>
                      <Badge className={getStatusColor(interaction.status)}>
                        {getStatusIcon(interaction.status)}
                        <span className="ml-1">{interaction.status.replace('_', ' ')}</span>
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInteraction(interaction)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {interaction.followUpRequired && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFollowUp(interaction)}
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Interaction Details Modal */}
      {selectedInteraction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Interaction Details</h3>
              <Button variant="outline" onClick={() => setSelectedInteraction(null)}>
                ×
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white">
                  {getInteractionIcon(selectedInteraction.type)}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">{selectedInteraction.subject}</h4>
                  <p className="text-muted-foreground">{selectedInteraction.customerName} • {selectedInteraction.customerEmail}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(selectedInteraction.priority)}>
                    {selectedInteraction.priority}
                  </Badge>
                  <Badge className={getStatusColor(selectedInteraction.status)}>
                    {selectedInteraction.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div>
                <h5 className="font-medium mb-2">Content</h5>
                <div className="p-4 bg-muted rounded-lg">
                  {selectedInteraction.content}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Created</h5>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedInteraction.createdAt)}</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Updated</h5>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedInteraction.updatedAt)}</p>
                </div>
                {selectedInteraction.scheduledFor && (
                  <div>
                    <h5 className="font-medium mb-2">Scheduled For</h5>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedInteraction.scheduledFor)}</p>
                  </div>
                )}
                {selectedInteraction.followUpDate && (
                  <div>
                    <h5 className="font-medium mb-2">Follow-up Date</h5>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedInteraction.followUpDate)}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Select 
                  value={selectedInteraction.status} 
                  onValueChange={(value) => handleStatusChange(selectedInteraction.id, value as CustomerInteraction['status'])}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={selectedInteraction.priority} 
                  onValueChange={(value) => handlePriorityChange(selectedInteraction.id, value as CustomerInteraction['priority'])}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                
                <Button variant="outline">
                  <Forward className="h-4 w-4 mr-2" />
                  Forward
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 