"use client"

import { useState } from "react"
import { 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare, 
  ShoppingBag, 
  Clock3,
  AlertCircle,
  User,
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Tag,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  MapPin,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns"

interface CustomerInteraction {
  id: string
  customerId: string
  customerName: string
  type: 'call' | 'email' | 'appointment' | 'inquiry' | 'purchase' | 'follow_up' | 'complaint' | 'referral' | 'visit' | 'quote'
  title: string
  description: string
  outcome: 'positive' | 'neutral' | 'negative' | 'pending'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: string
  assignedToAvatar?: string
  createdAt: Date
  scheduledFor?: Date
  completedAt?: Date
  duration?: number // in minutes
  location?: string
  tags: string[]
  attachments: string[]
  relatedItems?: {
    type: 'ring' | 'necklace' | 'earrings' | 'bracelet' | 'watch' | 'other'
    name: string
    price?: number
    description?: string
    sku?: string
  }[]
  followUpDate?: Date
  notes: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  value?: number // monetary value of interaction
}

interface CustomerInteractionHistoryProps {
  customerId?: string
  customerName?: string
}

// Mock data for customer interactions
const mockInteractions: CustomerInteraction[] = [
  {
    id: "1",
    customerId: "1",
    customerName: "Sarah Johnson",
    type: "call",
    title: "Follow-up call about engagement ring",
    description: "Called customer to follow up on engagement ring inquiry. They're interested in a 2-carat diamond ring with platinum setting. Customer mentioned budget is flexible and showed interest in viewing similar rings in person.",
    outcome: "positive",
    priority: "high",
    assignedTo: "Sarah Johnson",
    assignedToAvatar: "/avatars/sarah.jpg",
    createdAt: new Date("2024-01-15T10:30:00"),
    duration: 15,
    tags: ["engagement", "diamond", "follow-up", "high-value"],
    attachments: [],
    relatedItems: [
      {
        type: "ring",
        name: "2-Carat Diamond Engagement Ring",
        price: 15000,
        description: "Platinum setting with VS1 clarity",
        sku: "RING-2CT-DIAMOND-001"
      }
    ],
    followUpDate: new Date("2024-01-22T14:00:00"),
    notes: "Customer mentioned budget is flexible. Showed interest in viewing similar rings in person. Prefers afternoon appointments.",
    sentiment: "positive",
    value: 15000
  },
  {
    id: "2",
    customerId: "1",
    customerName: "Sarah Johnson",
    type: "appointment",
    title: "In-store consultation",
    description: "Scheduled appointment for customer to view engagement rings and discuss options. Customer arrived on time and spent 45 minutes viewing various ring styles.",
    outcome: "positive",
    priority: "high",
    assignedTo: "Sarah Johnson",
    assignedToAvatar: "/avatars/sarah.jpg",
    createdAt: new Date("2024-01-16T09:00:00"),
    scheduledFor: new Date("2024-01-22T14:00:00"),
    completedAt: new Date("2024-01-22T14:45:00"),
    duration: 45,
    location: "Main Showroom",
    tags: ["appointment", "consultation", "engagement", "in-store"],
    attachments: ["consultation-notes.pdf"],
    relatedItems: [
      {
        type: "ring",
        name: "2-Carat Diamond Engagement Ring",
        price: 15000,
        description: "Platinum setting with VS1 clarity",
        sku: "RING-2CT-DIAMOND-001"
      },
      {
        type: "ring",
        name: "1.5-Carat Diamond Ring",
        price: 12000,
        description: "White gold setting with VS2 clarity",
        sku: "RING-1.5CT-DIAMOND-002"
      }
    ],
    notes: "Customer prefers afternoon appointments. Will prepare 3-4 ring options to show. Showed strong interest in the 2-carat option.",
    sentiment: "positive",
    value: 15000
  },
  {
    id: "3",
    customerId: "1",
    customerName: "Sarah Johnson",
    type: "email",
    title: "Ring specifications sent",
    description: "Sent detailed specifications and pricing for the 2-carat diamond ring options. Included GIA certificate and warranty information.",
    outcome: "neutral",
    priority: "medium",
    assignedTo: "Sarah Johnson",
    assignedToAvatar: "/avatars/sarah.jpg",
    createdAt: new Date("2024-01-17T16:45:00"),
    tags: ["email", "specifications", "pricing", "documentation"],
    attachments: ["ring-specs.pdf", "pricing-sheet.pdf", "gia-certificate.pdf"],
    relatedItems: [
      {
        type: "ring",
        name: "2-Carat Diamond Engagement Ring",
        price: 15000,
        description: "Platinum setting with VS1 clarity",
        sku: "RING-2CT-DIAMOND-001"
      }
    ],
    notes: "Customer acknowledged receipt. Will follow up in 2 days to answer any questions.",
    sentiment: "neutral"
  },
  {
    id: "4",
    customerId: "1",
    customerName: "Sarah Johnson",
    type: "purchase",
    title: "Engagement ring purchase completed",
    description: "Customer finalized purchase of the 2-carat diamond engagement ring. Payment processed successfully. Ring will be ready for pickup in 3 business days.",
    outcome: "positive",
    priority: "high",
    assignedTo: "Sarah Johnson",
    assignedToAvatar: "/avatars/sarah.jpg",
    createdAt: new Date("2024-01-20T11:30:00"),
    duration: 30,
    location: "Main Showroom",
    tags: ["purchase", "engagement", "high-value", "completed"],
    attachments: ["sales-receipt.pdf", "warranty-card.pdf"],
    relatedItems: [
      {
        type: "ring",
        name: "2-Carat Diamond Engagement Ring",
        price: 15000,
        description: "Platinum setting with VS1 clarity",
        sku: "RING-2CT-DIAMOND-001"
      }
    ],
    notes: "Customer was very satisfied with the purchase. Mentioned they will return for wedding bands. Excellent customer experience.",
    sentiment: "positive",
    value: 15000
  },
  {
    id: "5",
    customerId: "1",
    customerName: "Sarah Johnson",
    type: "follow_up",
    title: "Post-purchase follow-up call",
    description: "Called customer to ensure they're satisfied with their purchase and to remind them about the pickup date.",
    outcome: "positive",
    priority: "medium",
    assignedTo: "Sarah Johnson",
    assignedToAvatar: "/avatars/sarah.jpg",
    createdAt: new Date("2024-01-23T14:00:00"),
    duration: 8,
    tags: ["follow-up", "post-purchase", "satisfaction"],
    attachments: [],
    relatedItems: [],
    notes: "Customer is very happy with their purchase. Confirmed pickup for tomorrow. Mentioned interest in wedding bands.",
    sentiment: "positive"
  }
]

export function CustomerInteractionHistory({ customerId, customerName }: CustomerInteractionHistoryProps) {
  const [interactions, setInteractions] = useState<CustomerInteraction[]>(mockInteractions)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [selectedInteraction, setSelectedInteraction] = useState<CustomerInteraction | null>(null)
  const [viewMode, setViewMode] = useState<"timeline" | "list">("timeline")

  const getInteractionIcon = (type: CustomerInteraction['type']) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'appointment': return <Calendar className="h-4 w-4" />
      case 'inquiry': return <MessageSquare className="h-4 w-4" />
      case 'purchase': return <ShoppingBag className="h-4 w-4" />
      case 'follow_up': return <Clock3 className="h-4 w-4" />
      case 'complaint': return <AlertCircle className="h-4 w-4" />
      case 'referral': return <User className="h-4 w-4" />
      case 'visit': return <MapPin className="h-4 w-4" />
      case 'quote': return <FileText className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getOutcomeColor = (outcome: CustomerInteraction['outcome']) => {
    switch (outcome) {
      case 'positive': return 'bg-green-100 text-green-800'
      case 'negative': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: CustomerInteraction['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const getSentimentIcon = (sentiment?: CustomerInteraction['sentiment']) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'negative': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredInteractions = interactions.filter(interaction => {
    const matchesSearch = interaction.title.toLowerCase().includes(search.toLowerCase()) ||
                         interaction.description.toLowerCase().includes(search.toLowerCase()) ||
                         interaction.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    
    if (filter === "all") return matchesSearch
    if (filter === interaction.type) return matchesSearch
    if (filter === interaction.outcome) return matchesSearch
    if (filter === interaction.priority) return matchesSearch
    
    return matchesSearch
  })

  const groupedInteractions = filteredInteractions.reduce((groups, interaction) => {
    const date = format(interaction.createdAt, 'yyyy-MM-dd')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(interaction)
    return groups
  }, {} as Record<string, CustomerInteraction[]>)

  const formatDate = (date: Date) => {
    if (isToday(date)) return "Today"
    if (isYesterday(date)) return "Yesterday"
    return format(date, 'MMM dd, yyyy')
  }

  const totalValue = interactions
    .filter(i => i.value)
    .reduce((sum, i) => sum + (i.value || 0), 0)

  const averageSentiment = interactions
    .filter(i => i.sentiment)
    .reduce((sum, i) => {
      if (i.sentiment === 'positive') return sum + 1
      if (i.sentiment === 'negative') return sum - 1
      return sum
    }, 0) / interactions.filter(i => i.sentiment).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interaction History</h2>
          <p className="text-muted-foreground">
            Complete timeline of interactions with {customerName || "this customer"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "timeline" ? "list" : "timeline")}>
            {viewMode === "timeline" ? "List View" : "Timeline View"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interactions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sentiment</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageSentiment > 0 ? "Positive" : averageSentiment < 0 ? "Negative" : "Neutral"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Interaction</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDistanceToNow(interactions[0]?.createdAt || new Date(), { addSuffix: true })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search interactions..."
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
            <SelectItem value="all">All Interactions</SelectItem>
            <SelectItem value="call">Phone Calls</SelectItem>
            <SelectItem value="email">Emails</SelectItem>
            <SelectItem value="appointment">Appointments</SelectItem>
            <SelectItem value="inquiry">Inquiries</SelectItem>
            <SelectItem value="purchase">Purchases</SelectItem>
            <SelectItem value="follow_up">Follow-ups</SelectItem>
            <SelectItem value="complaint">Complaints</SelectItem>
            <SelectItem value="referral">Referrals</SelectItem>
            <SelectItem value="visit">Visits</SelectItem>
            <SelectItem value="quote">Quotes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <div className="space-y-8">
          {Object.entries(groupedInteractions)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, dayInteractions]) => (
              <div key={date} className="space-y-4">
                <h3 className="text-lg font-semibold text-muted-foreground">
                  {formatDate(new Date(date))}
                </h3>
                <div className="space-y-4">
                  {dayInteractions.map((interaction) => (
                    <Card key={interaction.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Timeline connector */}
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                              {getInteractionIcon(interaction.type)}
                            </div>
                            <div className="w-0.5 h-full bg-border mt-2"></div>
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{interaction.title}</h4>
                                  <Badge variant="outline" className={getOutcomeColor(interaction.outcome)}>
                                    {interaction.outcome}
                                  </Badge>
                                  <Badge variant="outline" className={getPriorityColor(interaction.priority)}>
                                    {interaction.priority}
                                  </Badge>
                                  {interaction.sentiment && getSentimentIcon(interaction.sentiment)}
                                </div>
                                <p className="text-sm text-muted-foreground">{interaction.description}</p>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{format(interaction.createdAt, 'HH:mm')}</span>
                                {interaction.duration && (
                                  <span>• {interaction.duration} min</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {interaction.assignedTo}
                              </span>
                              {interaction.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {interaction.location}
                                </span>
                              )}
                              {interaction.value && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  ${interaction.value.toLocaleString()}
                                </span>
                              )}
                            </div>
                            
                            {interaction.tags.length > 0 && (
                              <div className="flex gap-1">
                                {interaction.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {interaction.relatedItems && interaction.relatedItems.length > 0 && (
                              <div className="flex gap-2">
                                {interaction.relatedItems.map((item, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    {item.name} {item.price && `($${item.price.toLocaleString()})`}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {interaction.notes && (
                              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                <strong>Notes:</strong> {interaction.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredInteractions.map((interaction) => (
            <Card key={interaction.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      {getInteractionIcon(interaction.type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{interaction.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(interaction.createdAt, 'MMM dd, yyyy HH:mm')} • {interaction.assignedTo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getOutcomeColor(interaction.outcome)}>
                      {interaction.outcome}
                    </Badge>
                    {interaction.value && (
                      <span className="text-sm font-medium">
                        ${interaction.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 
 