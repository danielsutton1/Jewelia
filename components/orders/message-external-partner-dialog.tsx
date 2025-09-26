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
import { Textarea } from "@/components/ui/textarea"
import { FileUploadTrigger } from "@/components/ui/file-upload-trigger"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Sparkles, MessageSquare, Clock, AlertCircle, CheckCircle, Send, Paperclip, Briefcase } from "lucide-react"
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
  sender: "partner" | "staff"
  senderName: string
  timestamp: Date
  attachments?: Array<{
    name: string
    size: number
    type: string
  }>
}

interface MessageExternalPartnerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  partnerName: string
}

export function MessageExternalPartnerDialog({ open, onOpenChange, orderId, partnerName }: MessageExternalPartnerDialogProps) {
  const [message, setMessage] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState({
    updateRequest: "",
    query: "",
    confirmation: "",
    general: ""
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const orderData = {
    id: orderId,
    partnerName: partnerName,
    component: "Clasp Component",
    status: "In Finishing",
    expectedDelivery: "2 business days",
    priority: "Medium"
  }

  const mockMessages: Message[] = [
    {
      id: "1",
      text: `Hi ${partnerName}, we need an update on the ${orderData.component} for order #${orderData.id}. Can you provide an ETA?`,
      sender: "staff",
      senderName: "You",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: "2",
      text: "Hello. The clasps are in finishing and should be ready to ship in 2 business days. We'll confirm once they're dispatched.",
      sender: "partner",
      senderName: partnerName,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000)
    },
    {
      id: "3",
      text: "Thanks for the update. Please send over the tracking information when available.",
      sender: "staff",
      senderName: "You",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
  ]

  useEffect(() => {
    if (open) {
      setMessages(mockMessages)
      generateSuggestions()
    }
  }, [open])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const generateSuggestions = async (userInput: string = "") => {
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    const newSuggestions = {
      updateRequest: `Hi ${orderData.partnerName}, could we please get an update on the status of the ${orderData.component} for order ${orderData.id}?`,
      query: `Hi ${orderData.partnerName}, we have a question about the specifications for the ${orderData.component}. Can you clarify the required materials?`,
      confirmation: `Hi ${orderData.partnerName}, this is to confirm we've received the ${orderData.component}. Thank you for your prompt service.`,
      general: `Hi ${orderData.partnerName}, checking in on our collaboration for order ${orderData.id}. Let me know if you need anything.`
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
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast({
      title: "Message Sent",
      description: `Message sent to ${partnerName} successfully.`,
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
      case "updateRequest": return <Clock className="h-4 w-4" />
      case "query": return <AlertCircle className="h-4 w-4" />
      case "confirmation": return <CheckCircle className="h-4 w-4" />
      case "general": return <MessageSquare className="h-4 w-4" />
      default: return <Sparkles className="h-4 w-4" />
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
  
  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Chat with {partnerName}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Order: {orderData.id}</span>
              <Badge variant={orderData.status === "In Finishing" ? "default" : "secondary"}>{orderData.status}</Badge>
              <span>Expected Delivery: {orderData.expectedDelivery}</span>
              <span>Priority: {orderData.priority}</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex h-[calc(90vh-125px)]">
          <div className="flex-grow flex flex-col h-full border-r">
            <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.reduce((acc, msg, i) => {
                  const prevMsg = messages[i - 1]
                  const showDate = !prevMsg || formatDate(prevMsg.timestamp) !== formatDate(msg.timestamp)
                  if (showDate) {
                    acc.push(
                      <div key={`date-${i}`} className="text-center text-xs text-muted-foreground py-2 my-2">
                        <Separator />
                        <span className="bg-background px-2 relative -top-2.5">{formatDate(msg.timestamp)}</span>
                      </div>
                    )
                  }
                  acc.push(
                    <div
                      key={msg.id}
                      className={cn(
                        "flex items-end gap-2",
                        msg.sender === "staff" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.sender === "partner" && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {msg.senderName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{msg.senderName}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg px-3 py-2",
                          msg.sender === "staff"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm">{msg.text}</p>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {msg.attachments.map((file, index) => (
                              <div key={index} className="flex items-center gap-2 bg-black/10 rounded p-2 text-primary-foreground/80">
                                <Paperclip className="h-4 w-4" />
                                <span className="text-xs truncate">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-xs mt-1 text-right opacity-70">{formatTime(msg.timestamp)}</p>
                      </div>
                       {msg.sender === "staff" && (
                         <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>You</AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>You</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  )
                  return acc;
                }, [] as React.ReactElement[])}
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-background">
              <div className="relative">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-20"
                  rows={2}
                />
                <div className="absolute top-1/2 right-3 transform -translate-y-1/2 flex items-center gap-2">
                  <FileUploadTrigger 
                    onFilesSelect={handleFilesSelected} 
                    trigger={
                      <Button variant="ghost" size="icon">
                        <Paperclip className="h-5 w-5" />
                      </Button>
                    }
                  />
                  <Button onClick={handleSendMessage} disabled={loading} size="icon">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              {files.length > 0 && (
                <div className="text-xs text-muted-foreground mt-2">
                  Attached: {files.map(f => f.name).join(', ')}
                </div>
              )}
            </div>
          </div>
          <aside className="w-[350px] p-6 bg-background/50 h-full flex flex-col">
            <Card className="flex-grow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ScrollArea className="h-[calc(90vh-320px)]">
                    <div className="space-y-4">
                      {Object.entries(suggestions).map(([key, value]) => (
                        <div key={key}>
                          <div 
                            onClick={() => insertSuggestion(value)}
                            className="p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2 font-semibold text-sm capitalize mb-1">
                              {getSuggestionIcon(key)}
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <p className="text-xs text-muted-foreground">{value}</p>
                          </div>
                          <Separator className="my-3" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}
 