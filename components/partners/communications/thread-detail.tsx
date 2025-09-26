"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { createClient } from '@supabase/supabase-js'
import type { CommunicationThread, CommunicationMessage, Attachment } from "@/types/partner-communication"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Send,
  Paperclip,
  FileText,
  Download,
  Tag,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  CheckSquare,
  AlertTriangle,
  LinkIcon,
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { createCommunicationMessage, uploadAttachment, markMessageAsRead } from "@/lib/database"
import { useAuth } from "@/components/providers/auth-provider"
// import { supabase } from "@/lib/supabase"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ThreadDetailProps {
  thread: CommunicationThread
  onThreadUpdate?: () => Promise<void>
}

export default function ThreadDetail({ thread, onThreadUpdate }: ThreadDetailProps) {
  const { user } = useAuth()
  const [newMessage, setNewMessage] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeouts = useRef<{ [userId: string]: NodeJS.Timeout }>({})
  const typingChannelRef = useRef<any>(null)

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [thread.messages])

  // Mark unread messages as read when thread or user changes
  useEffect(() => {
    if (!user || !thread?.messages) return
    const unread = thread.messages.filter(
      (msg) => !msg.isRead && msg.senderId !== user.id
    )
    if (unread.length === 0) return
    unread.forEach((msg) => {
      markMessageAsRead(msg.id)
    })
  }, [thread, user])

  // Supabase Realtime subscription for new messages
  useEffect(() => {
    if (!thread?.id || !onThreadUpdate) return
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const channel = supabase.channel(`messages-thread-${thread.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'communication_messages',
          filter: `thread_id=eq.${thread.id}`,
        },
        async (payload) => {
          await onThreadUpdate()
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [thread?.id, onThreadUpdate])

  // Typing indicator: broadcast when typing
  useEffect(() => {
    if (!thread?.id || !user) return
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Subscribe to typing events
    const channel = supabase.channel(`typing-thread-${thread.id}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, userName } = payload.payload
        if (userId === user.id) return // Ignore own typing
        setTypingUsers((prev) => {
          if (!prev.includes(userName)) return [...prev, userName]
          return prev
        })
        // Remove typing indicator after 2s
        if (typingTimeouts.current[userId]) clearTimeout(typingTimeouts.current[userId])
        typingTimeouts.current[userId] = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((name) => name !== userName))
        }, 2000)
      })
      .subscribe()
    typingChannelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
      Object.values(typingTimeouts.current).forEach(clearTimeout)
      typingTimeouts.current = {}
    }
  }, [thread?.id, user])

  // Send typing event (debounced)
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)
    if (!user || !thread?.id) return
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      supabase.channel(`typing-thread-${thread.id}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: user.id, userName: user.user_metadata?.full_name || user.email || 'Someone' },
      })
    }, 100)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return
    if (!user) return // Don't send if not logged in
    setSending(true)
    try {
      // Send the message to the backend
      const message = await createCommunicationMessage({
        thread_id: thread.id,
        sender_id: user.id,
        content: newMessage,
        timestamp: new Date().toISOString(),
        is_read: false,
      })
      // Upload attachments (if any)
      if (attachments.length > 0) {
        await Promise.all(
          attachments.map((file) => uploadAttachment(file, message.id))
        )
      }
      setNewMessage("")
      setAttachments([])
      if (onThreadUpdate) {
        await onThreadUpdate()
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to send message:", error)
      // Optionally show a toast or error message
    } finally {
      setSending(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files || [])])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "call":
        return <Phone className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      case "task":
        return <CheckSquare className="h-4 w-4" />
      case "issue":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const renderAttachment = (attachment: Attachment) => {
    return (
      <div key={attachment.id} className="flex items-center p-2 rounded bg-muted mb-2">
        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
        <span className="text-sm truncate flex-grow">{attachment.name}</span>
        <span className="text-xs text-muted-foreground mx-2">{(attachment.size / 1024).toFixed(0)} KB</span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const renderMessage = (message: CommunicationMessage & { message_reads?: any[] }, index: number) => {
    const isCurrentUser = message.senderId === user?.id
    const messageDate = parseISO(message.timestamp)
    // Show delivery/read status only for current user's messages
    let status: React.ReactNode = null
    if (isCurrentUser) {
      if (message.isRead) {
        status = <span title="Seen" className="text-xs text-blue-500 ml-2">✓✓</span>
      } else {
        status = <span title="Delivered" className="text-xs text-muted-foreground ml-2">✓</span>
      }
    }
    // Group read receipts: avatars of users who have read this message (for all messages)
    let readAvatars: React.ReactNode = null
    if (message.message_reads && message.message_reads.length > 0) {
      const readers = message.message_reads.filter((mr: any) => mr.user_id !== message.senderId)
      if (readers.length > 0) {
        readAvatars = (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex -space-x-2 ml-2">
                  {readers.slice(0, 3).map((mr: any) => (
                    <Avatar key={mr.user_id} className="h-5 w-5 border-2 border-white">
                      {mr.user?.avatar_url ? (
                        <img src={mr.user.avatar_url} alt={mr.user.full_name || mr.user.email} />
                      ) : (
                        <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-xs font-medium">
                          {mr.user?.full_name?.charAt(0) || mr.user?.email?.charAt(0) || "?"}
                        </div>
                      )}
                    </Avatar>
                  ))}
                  {readers.length > 3 && (
                    <span className="h-5 w-5 rounded-full bg-muted text-xs flex items-center justify-center border-2 border-white">+{readers.length - 3}</span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="p-2 min-w-[180px]">
                <div className="font-semibold mb-1 text-xs">Seen by</div>
                <div className="space-y-1">
                  {readers.map((mr: any) => (
                    <div key={mr.user_id} className="flex items-center space-x-2 text-xs">
                      <Avatar className="h-4 w-4">
                        {mr.user?.avatar_url ? (
                          <img src={mr.user.avatar_url} alt={mr.user.full_name || mr.user.email} />
                        ) : (
                          <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-xs font-medium">
                            {mr.user?.full_name?.charAt(0) || mr.user?.email?.charAt(0) || "?"}
                          </div>
                        )}
                      </Avatar>
                      <span>{mr.user?.full_name || mr.user?.email || "Unknown"}</span>
                      <span className="text-muted-foreground ml-auto">{mr.read_at ? format(parseISO(mr.read_at), "MMM d, h:mm a") : ""}</span>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }
    }
    return (
      <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4`}>
        <div className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-start max-w-[80%]`}>
          <Avatar className="h-8 w-8 mt-1">
            {message.senderAvatar ? (
              <img src={message.senderAvatar || "/placeholder.svg"} alt={message.senderName} />
            ) : (
              <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-sm font-medium">
                {message.senderName.charAt(0)}
              </div>
            )}
          </Avatar>
          <div className={`mx-2 ${isCurrentUser ? "text-right" : "text-left"}`} style={{ minWidth: 0 }}>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium">{message.senderName}</span>
              <span className="text-xs text-muted-foreground">{format(messageDate, "MMM d, h:mm a")}</span>
              {status}
            </div>
            <div
              className={`p-3 rounded-lg relative ${
                isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-1">{message.attachments.map(renderAttachment)}</div>
              )}
              {readAvatars && (
                <div className="absolute -bottom-6 right-0 flex items-center">{readAvatars}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-4">
        <div className="space-y-4">
          {thread.messages.map(renderMessage)}
          <div ref={messagesEndRef} />
          {typingUsers.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2">
              {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
            </div>
          )}
        </div>
      </div>
      <div className="flex-grow p-4">
        <ScrollArea className="flex-grow p-4">
          <div className="space-y-4">
            {thread.messages.map(renderMessage)}
            <div ref={messagesEndRef} />
            {typingUsers.length > 0 && (
              <div className="text-xs text-muted-foreground mt-2">
                {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex items-center space-x-2 mt-4">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={handleTyping}
            className="min-h-[80px] flex-grow"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 p-0"
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}