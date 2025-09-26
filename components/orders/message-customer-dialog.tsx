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
import { Loader2, Sparkles, MessageSquare, Clock, AlertCircle, CheckCircle, Send, Paperclip, User, Bot } from "lucide-react"
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
  sender: "customer" | "staff"
  senderName: string
  timestamp: Date
  attachments?: Array<{
    name: string
    size: number
    type: string
  }>
}

interface MessageCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  customerName: string
}

export function MessageCustomerDialog({ open, onOpenChange, orderId, customerName }: MessageCustomerDialogProps) {
  const [message, setMessage] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState({
    orderUpdate: "",
    paymentReminder: "",
    completion: "",
    general: ""
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Mock order data - in real app, this would come from props or API
  const orderData = {
    id: orderId,
    customerName: customerName,
    totalAmount: 2500,
    paidAmount: 1500,
    status: "In Production",
    dueDate: "2024-01-15",
    items: ["Diamond Ring", "Engagement Setting"]
  }

  // Mock message history - in real app, this would come from API
  const mockMessages: Message[] = [
    {
      id: "1",
      text: "Hi! I'm interested in your diamond ring collection. Can you tell me more about the engagement rings?",
      sender: "customer",
      senderName: customerName,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    },
    {
      id: "2",
      text: "Of course! We have a beautiful selection of engagement rings. What's your budget range?",
      sender: "staff",
      senderName: "Sales Team",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000) // 5 minutes later
    },
    {
      id: "3",
      text: "I'm looking for something around $2,500. Do you have anything in that range?",
      sender: "customer",
      senderName: customerName,
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
    },
    {
      id: "4",
      text: "Perfect! I've attached our catalog with rings in your price range. Let me know which ones catch your eye!",
      sender: "staff",
      senderName: "Sales Team",
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
      attachments: [{ name: "engagement_rings_catalog.pdf", size: 2048576, type: "application/pdf" }]
    },
    {
      id: "5",
      text: "I love the classic solitaire! Can we proceed with that one?",
      sender: "customer",
      senderName: customerName,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    },
    {
      id: "6",
      text: "Excellent choice! I've created order #ORD-001 for your solitaire ring. Total: $2,500. When would you like to schedule the consultation?",
      sender: "staff",
      senderName: "Sales Team",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000)
    },
    {
      id: "7",
      text: "How's my ring coming along? I'm getting excited!",
      sender: "customer",
      senderName: customerName,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      id: "8",
      text: "Great news! Your ring is currently in production and on track for completion by January 15th. I'll send you photos once it's ready!",
      sender: "staff",
      senderName: "Production Team",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000)
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
      orderUpdate: `Hi ${orderData.customerName}, your ${orderData.items[0]} is currently in ${orderData.status.toLowerCase()}. We're on track for your ${orderData.dueDate} deadline.`,
      paymentReminder: `Hi ${orderData.customerName}, just a friendly reminder that your remaining balance of $${orderData.totalAmount - orderData.paidAmount} is due by ${orderData.dueDate}.`,
      completion: `Hi ${orderData.customerName}, great news! Your ${orderData.items.join(" and ")} is ready for pickup. We'll contact you to arrange delivery.`,
      general: `Hi ${orderData.customerName}, thank you for choosing us for your ${orderData.items.join(" and ")}. We're here if you need anything.`
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
      description: `Message sent to ${customerName} successfully.`,
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
      case "paymentReminder":
        return <AlertCircle className="h-4 w-4" />
      case "completion":
        return <CheckCircle className="h-4 w-4" />
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
            <MessageSquare className="h-5 w-5" />
            Chat with {customerName}
          </DialogTitle>
          <DialogDescription>
            Order #{orderId} • {orderData.status} • Due: {orderData.dueDate}
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
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {customerName.split(' ').map(n => n[0]).join('')}
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
                    onClick={() => insertSuggestion(suggestions.paymentReminder)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center gap-2">
                    {getSuggestionIcon("paymentReminder")}
                    Payment Reminder
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {suggestions.paymentReminder || "Generating..."}
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" 
                    onClick={() => insertSuggestion(suggestions.completion)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center gap-2">
                    {getSuggestionIcon("completion")}
                    Completion Notice
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {suggestions.completion || "Generating..."}
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
              <p><strong>Status:</strong> {orderData.status}</p>
              <p><strong>Balance:</strong> ${orderData.totalAmount - orderData.paidAmount}</p>
              <p><strong>Due:</strong> {orderData.dueDate}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
 