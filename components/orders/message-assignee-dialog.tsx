"use client"

import { useState, useEffect, useRef, Fragment } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Sparkles, MessageSquare, Clock, AlertCircle, CheckCircle, Send, Paperclip, Users, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Message {
  id: string
  text: string
  sender: "assignee" | "staff"
  senderName: string
  timestamp: Date
  attachments?: Array<{
    name: string
    size: number
    type: string
  }>
}

interface MessageAssigneeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  assigneeName: string
  assignee: string
}

export function MessageAssigneeDialog({ open, onOpenChange, orderId, assigneeName }: MessageAssigneeDialogProps) {
  const [message, setMessage] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState({
    orderUpdate: "",
    qualityCheck: "",
    issueReport: "",
    general: ""
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Mock order data - in real app, this would come from props or API
  const orderData = {
    id: orderId,
    assigneeName: assigneeName,
    customerName: "Sarah Johnson",
    totalAmount: 2500,
    status: "In Production",
    dueDate: "2024-01-15",
    items: ["Diamond Ring", "Engagement Setting"],
    priority: "High"
  }

  // Mock message history - in real app, this would come from API
  const mockMessages: Message[] = [
    {
      id: "1",
      text: "Hi Mike, I've assigned order #ORD-001 to you. Customer Sarah Johnson, diamond ring with engagement setting. Due January 15th.",
      sender: "staff",
      senderName: "Production Manager",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    },
    {
      id: "2",
      text: "Got it! I'll start on the ring setting first. Do you have the diamond specifications?",
      sender: "assignee",
      senderName: assigneeName,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000) // 30 minutes later
    },
    {
      id: "3",
      text: "Here are the diamond specs. 1.5 carat, VS1 clarity, F color. I've attached the detailed specifications.",
      sender: "staff",
      senderName: "Production Manager",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      attachments: [{ name: "diamond_specs.pdf", size: 1048576, type: "application/pdf" }]
    },
    {
      id: "4",
      text: "Perfect! I can see the specs. I'll begin the setting work today. Should be ready for quality check by Wednesday.",
      sender: "assignee",
      senderName: assigneeName,
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
    },
    {
      id: "5",
      text: "Great progress! The customer called asking about the status. Can you send me a photo when the setting is complete?",
      sender: "staff",
      senderName: "Production Manager",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    },
    {
      id: "6",
      text: "Setting is complete! I've attached photos. Ready for quality inspection.",
      sender: "assignee",
      senderName: assigneeName,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      id: "7",
      text: "Excellent work! The setting looks perfect. I've forwarded the photos to the customer. They're very pleased!",
      sender: "staff",
      senderName: "Production Manager",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000) // 2 hours later
    },
    {
      id: "8",
      text: "Thanks! I'm starting the final polishing now. Should be ready for pickup by Friday.",
      sender: "assignee",
      senderName: assigneeName,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    }
  ]

  // Load message history when dialog opens
  useEffect(() => {
    if (open) {
      setMessages(mockMessages)
      generateSuggestions()
    }
  }, [open])

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Generate real-time suggestions based on order context
  const generateSuggestions = async (userInput: string = "") => {
    setIsGenerating(true)
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const newSuggestions = {
      orderUpdate: `Hi ${orderData.assigneeName}, order ${orderData.id} for ${orderData.customerName} needs attention. Status: ${orderData.status}, due ${orderData.dueDate}.`,
      qualityCheck: `Hi ${orderData.assigneeName}, please review order ${orderData.id} quality standards. Customer ${orderData.customerName} expects perfection.`,
      issueReport: `Hi ${orderData.assigneeName}, there's an issue with order ${orderData.id}. ${orderData.customerName}'s ${orderData.items[0]} needs immediate attention.`,
      general: `Hi ${orderData.assigneeName}, checking in on order ${orderData.id} for ${orderData.customerName}. Let me know if you need anything.`
    }

    setSuggestions(newSuggestions)
    setIsGenerating(false)
  }

  const handleSendMessage = async () => {
    if (!message.trim() && files.length === 0) {
      toast({
        title: "Message Required",
        description: "Please enter a message or attach files before sending.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    // Add new message to chat
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "staff",
      senderName: "You",
      timestamp: new Date(),
      attachments: files.length > 0 ? files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      })) : undefined
    }
    
    setMessages(prev => [...prev, newMessage])
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast({
      title: "Message Sent",
      description: `Message sent to ${assigneeName} successfully.`,
    })
    
    setMessage("")
    setFiles([])
    setLoading(false)
  }

  const insertSuggestion = (suggestion: string) => {
    setMessage(suggestion)
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "orderUpdate":
        return <Clock className="h-4 w-4" />
      case "qualityCheck":
        return <CheckCircle className="h-4 w-4" />
      case "issueReport":
        return <AlertCircle className="h-4 w-4" />
      case "general":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "Yesterday"
    if (diffDays > 1) return date.toLocaleDateString()
    return "Today"
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Chat with {assigneeName}
          </DialogTitle>
          <DialogDescription>
            Order #{orderId} • {orderData.status} • Due: {orderData.dueDate} • Priority: {orderData.priority}
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[600px]">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((msg, index) => {
                  const isStaff = msg.sender === "staff"
                  const showDate = index === 0 || 
                    formatDate(msg.timestamp) !== formatDate(messages[index - 1].timestamp)
                  
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="text-center my-4">
                          <Badge variant="secondary" className="text-xs">
                            {formatDate(msg.timestamp)}
                          </Badge>
                        </div>
                      )}
                      
                      <div className={`flex gap-3 ${isStaff ? 'justify-end' : 'justify-start'}`}>
                        {!isStaff && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-purple-100 text-purple-600">
                              {assigneeName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`max-w-[70%] ${isStaff ? 'order-first' : ''}`}>
                          <div className={`rounded-lg px-4 py-2 ${
                            isStaff 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{msg.text}</p>
                            
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {msg.attachments.map((file, fileIndex) => (
                                  <div key={fileIndex} className="flex items-center gap-2 text-xs opacity-80">
                                    <Paperclip className="h-3 w-3" />
                                    <span>{file.name}</span>
                                    <span>({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className={`text-xs text-gray-500 mt-1 ${
                            isStaff ? 'text-right' : 'text-left'
                          }`}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                        
                        {isStaff && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-green-100 text-green-600">
                              You
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="min-h-[60px] max-h-[120px] resize-none"
                  />
                </div>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={loading || (!message.trim() && files.length === 0)}
                  size="icon"
                  className="h-[60px] w-[60px]"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {files.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <FileUpload
                    files={files}
                    onFilesChange={setFiles}
                    maxFiles={3}
                    maxSize={5}
                    className="text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* AI Suggestions Sidebar */}
          <div className="w-80 border-l p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <h3 className="font-semibold text-sm">AI Suggestions</h3>
              {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            
            <div className="space-y-2">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" 
                    onClick={() => insertSuggestion(suggestions.orderUpdate)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center gap-2">
                    {getSuggestionIcon("orderUpdate")}
                    Order Update
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {suggestions.orderUpdate || "Generating..."}
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" 
                    onClick={() => insertSuggestion(suggestions.qualityCheck)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center gap-2">
                    {getSuggestionIcon("qualityCheck")}
                    Quality Check
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {suggestions.qualityCheck || "Generating..."}
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" 
                    onClick={() => insertSuggestion(suggestions.issueReport)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center gap-2">
                    {getSuggestionIcon("issueReport")}
                    Issue Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {suggestions.issueReport || "Generating..."}
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" 
                    onClick={() => insertSuggestion(suggestions.general)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center gap-2">
                    {getSuggestionIcon("general")}
                    General Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {suggestions.general || "Generating..."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Order Info */}
            <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
              <p><strong>Order:</strong> {orderId}</p>
              <p><strong>Assignee:</strong> {assigneeName}</p>
              <p><strong>Customer:</strong> {orderData.customerName}</p>
              <p><strong>Status:</strong> {orderData.status}</p>
              <p><strong>Priority:</strong> {orderData.priority}</p>
              <p><strong>Due:</strong> {orderData.dueDate}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
 