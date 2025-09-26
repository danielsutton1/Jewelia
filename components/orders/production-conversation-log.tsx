"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  User, 
  FileText, 
  Download,
  Send,
  Paperclip,
  MoreHorizontal,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Calendar,
  Hash,
  Star,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  type ProductionConversationLog, 
  type StageConversation, 
  type Message, 
  type ProductionStage,
  PRODUCTION_STAGES,
  type ConversationSearchResult 
} from "@/types/production"

interface ProductionConversationLogProps {
  orderId: string
  className?: string
}

export function ProductionConversationLog({ orderId, className }: ProductionConversationLogProps) {
  const [conversationLog, setConversationLog] = useState<ProductionConversationLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeStage, setActiveStage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ConversationSearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [filters, setFilters] = useState({
    stages: [] as ProductionStage[],
    senders: [] as string[],
    hasAttachments: false,
    unreadOnly: false
  })
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversation log
  useEffect(() => {
    fetchConversationLog()
  }, [orderId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversationLog])

  const fetchConversationLog = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}/conversations`)
      if (!response.ok) throw new Error('Failed to fetch conversation log')
      
      const data = await response.json()
      setConversationLog(data)
      
      // Set active stage to the current active stage
      const activeStageData = data.conversations.find((s: StageConversation) => s.isActive)
      if (activeStageData) {
        setActiveStage(activeStageData.id)
        setExpandedStages(new Set([activeStageData.id]))
      }
    } catch (error) {
      console.error('Error fetching conversation log:', error)
      toast({
        title: "Error",
        description: "Failed to load conversation log",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      const params = new URLSearchParams({
        action: 'search',
        keywords: searchQuery,
        ...(filters.stages.length > 0 && { stages: filters.stages.join(',') }),
        ...(filters.senders.length > 0 && { senders: filters.senders.join(',') }),
        ...(filters.hasAttachments && { hasAttachments: 'true' }),
        ...(filters.unreadOnly && { unreadOnly: 'true' })
      })

      const response = await fetch(`/api/orders/${orderId}/conversations?${params}`)
      if (!response.ok) throw new Error('Search failed')
      
      const data = await response.json()
      setSearchResults(data.results)
      setShowSearchResults(true)
    } catch (error) {
      console.error('Search error:', error)
      toast({
        title: "Search Error",
        description: "Failed to perform search",
        variant: "destructive"
      })
    }
  }

  const handleSendMessage = async (stageId: string) => {
    if (!newMessage.trim()) return

    try {
      setSending(true)
      const response = await fetch(`/api/orders/${orderId}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addMessage',
          stageId,
          message: {
            text: newMessage,
            sender: 'staff',
            senderName: 'Current User', // In real app, get from auth
            senderId: 'current-user',
            messageType: 'text'
          }
        })
      })

      if (!response.ok) throw new Error('Failed to send message')
      
      const data = await response.json()
      setConversationLog(data.log)
      setNewMessage("")
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully"
      })
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    } finally {
      setSending(false)
    }
  }

  const toggleStageExpansion = (stageId: string) => {
    const newExpanded = new Set(expandedStages)
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId)
    } else {
      newExpanded.add(stageId)
    }
    setExpandedStages(newExpanded)
  }

  const getStageConfig = (stage: ProductionStage) => {
    return PRODUCTION_STAGES[stage]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'active': return <Play className="h-4 w-4 text-blue-500" />
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />
      case 'pending': return <Clock className="h-4 w-4 text-gray-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!conversationLog) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No conversation log found for this order.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Header with Search and Filters */}
      <Card className="mb-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle className="text-lg">Production Conversations</CardTitle>
              <Badge variant="outline">{conversationLog.totalMessages} messages</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex gap-2">
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <Label className="text-sm font-medium">Stages</Label>
                <div className="space-y-2 mt-2">
                  {Object.keys(PRODUCTION_STAGES).map((stage) => (
                    <div key={stage} className="flex items-center space-x-2">
                      <Checkbox
                        id={`stage-${stage}`}
                        checked={filters.stages.includes(stage as ProductionStage)}
                        onCheckedChange={(checked) => {
                          setFilters(prev => ({
                            ...prev,
                            stages: checked 
                              ? [...prev.stages, stage as ProductionStage]
                              : prev.stages.filter(s => s !== stage)
                          }))
                        }}
                      />
                      <Label htmlFor={`stage-${stage}`} className="text-sm">
                        {PRODUCTION_STAGES[stage as ProductionStage].label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Senders</Label>
                <div className="space-y-2 mt-2">
                  {['assignee', 'staff', 'customer', 'system'].map((sender) => (
                    <div key={sender} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sender-${sender}`}
                        checked={filters.senders.includes(sender)}
                        onCheckedChange={(checked) => {
                          setFilters(prev => ({
                            ...prev,
                            senders: checked 
                              ? [...prev.senders, sender]
                              : prev.senders.filter(s => s !== sender)
                          }))
                        }}
                      />
                      <Label htmlFor={`sender-${sender}`} className="text-sm capitalize">
                        {sender}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasAttachments"
                    checked={filters.hasAttachments}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, hasAttachments: !!checked }))
                    }
                  />
                  <Label htmlFor="hasAttachments" className="text-sm">
                    Has Attachments
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="unreadOnly"
                    checked={filters.unreadOnly}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, unreadOnly: !!checked }))
                    }
                  />
                  <Label htmlFor="unreadOnly" className="text-sm">
                    Unread Only
                  </Label>
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({
                    stages: [],
                    senders: [],
                    hasAttachments: false,
                    unreadOnly: false
                  })}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Search Results */}
      {showSearchResults && searchResults.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                Search Results ({searchResults.length})
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearchResults(false)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchResults.map((result) => (
                <div key={result.messageId} className="p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {getStageConfig(result.stage).label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {result.assigneeName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(result.timestamp), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm" dangerouslySetInnerHTML={{ __html: result.highlight }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stage Conversations */}
      <div className="space-y-4">
        {conversationLog.conversations.map((stage) => {
          const stageConfig = getStageConfig(stage.stage)
          const isExpanded = expandedStages.has(stage.id)
          const unreadCount = stage.messages.filter(m => !m.isRead).length

          return (
            <Card key={stage.id} className={`${stage.isActive ? 'ring-2 ring-primary/20' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: stageConfig.color }}
                    >
                      {stageConfig.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{stageConfig.label}</h3>
                        {getStatusIcon(stage.stageStatus)}
                        {stage.isActive && (
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        )}
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {unreadCount} unread
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {stage.assigneeName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(stage.startDate), "MMM d, yyyy")}
                        </span>
                        {stage.timeSpent && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(stage.timeSpent)}
                          </span>
                        )}
                        {stage.qualityScore && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {stage.qualityScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStageExpansion(stage.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Stage Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          Export Messages
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download Attachments
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Mark All as Read
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {/* Messages */}
                    <ScrollArea className="h-64">
                      <div className="space-y-3 pr-4">
                        {stage.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${message.sender === 'staff' ? 'justify-end' : 'justify-start'}`}
                          >
                            {message.sender !== 'staff' && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={stage.assigneeAvatar} />
                                <AvatarFallback>
                                  {message.senderName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div className={`max-w-[70%] ${message.sender === 'staff' ? 'order-first' : ''}`}>
                              <div className={`rounded-lg p-3 ${
                                message.sender === 'staff' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : message.sender === 'system'
                                  ? 'bg-muted text-muted-foreground'
                                  : 'bg-muted'
                              }`}>
                                <p className="text-sm">{message.text}</p>
                                
                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {message.attachments.map((attachment) => (
                                      <div key={attachment.id} className="flex items-center gap-2 text-xs">
                                        <Paperclip className="h-3 w-3" />
                                        <span>{attachment.name}</span>
                                        <span className="text-muted-foreground">
                                          ({(attachment.size / 1024).toFixed(1)} KB)
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>{message.senderName}</span>
                                <span>•</span>
                                <span>{format(new Date(message.timestamp), "h:mm a")}</span>
                                {!message.isRead && message.sender !== 'staff' && (
                                  <>
                                    <span>•</span>
                                    <span className="text-blue-500">Unread</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {message.sender === 'staff' && (
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>U</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* New Message Input */}
                    <div className="flex gap-2 border-t mt-1">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[60px] resize-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage(stage.id)
                          }
                        }}
                      />
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleSendMessage(stage.id)}
                          disabled={!newMessage.trim() || sending}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
} 
 