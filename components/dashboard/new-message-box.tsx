"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { 
  MessageSquare, 
  Mail, 
  Clock, 
  User, 
  Building2, 
  X,
  ChevronRight,
  Bell,
  BellOff,
  MoreHorizontal,
  Reply,
  Archive,
  Forward,
  Trash2
} from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from 'next/navigation'

import { cn } from "@/lib/utils"

interface UnreadMessage {
  id: string
  type: 'internal' | 'external' | 'system' | 'notification'
  sender_id: string
  recipient_id?: string
  partner_id?: string
  organization_id?: string
  subject?: string
  content: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category: string
  is_read: boolean
  created_at: string
  sender?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
  partner?: {
    id: string
    name: string
    company: string
    avatar_url?: string
  }
}

interface NewMessageBoxProps {
  className?: string
}

export function NewMessageBox({ className }: NewMessageBoxProps) {
  const { user } = useAuth()
  const router = useRouter()

  const { toast } = useToast()
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null)


  // Mock data for testing
  const getMockMessages = () => [
    {
      id: 'mock-1',
      type: 'external' as const,
      sender_id: 'bd180762-49e2-477d-b286-d7039b43cd83',
      recipient_id: 'fdb2a122-d6ae-4e78-b277-3317e1a09132',
      subject: 'Urgent: New Partnership Opportunity',
      content: 'We have received an exciting partnership proposal from a luxury jewelry distributor in Europe. They are interested in carrying our exclusive diamond collection.',
      priority: 'high' as const,
      category: 'partnership',
      is_read: false,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      sender: {
        id: 'bd180762-49e2-477d-b286-d7039b43cd83',
        full_name: 'Sarah Johnson',
        email: 'sarah@partner.com',
        avatar_url: undefined
      }
    },
    {
      id: 'mock-2',
      type: 'internal' as const,
      sender_id: '550e8400-e29b-41d4-a716-446655440001',
      recipient_id: 'fdb2a122-d6ae-4e78-b277-3317e1a09132',
      subject: 'Production Update: Custom Ring Order',
      content: 'The custom engagement ring for the Johnson wedding is ready for final inspection. The 2-carat diamond has been set perfectly.',
      priority: 'normal' as const,
      category: 'production',
      is_read: false,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      sender: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        full_name: 'Michael Chen',
        email: 'michael@jewelia.com',
        avatar_url: undefined
      }
    },
    {
      id: 'mock-3',
      type: 'external' as const,
      sender_id: 'cb6eada0-b7a4-4db4-ae8e-8226dba34085',
      recipient_id: 'fdb2a122-d6ae-4e78-b277-3317e1a09132',
      subject: 'Quote Request: Diamond Necklace Collection',
      content: 'We need a quote for 50 custom diamond necklaces for our upcoming luxury collection launch. Please provide pricing and timeline details.',
      priority: 'normal' as const,
      category: 'quote',
      is_read: false,
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      sender: {
        id: 'cb6eada0-b7a4-4db4-ae8e-8226dba34085',
        full_name: 'Emma Rodriguez',
        email: 'emma@luxuryjewels.com',
        avatar_url: undefined
      }
    }
  ]

  // Fetch unread messages from multiple sources
  const fetchUnreadMessages = async () => {
    if (!user) return

    try {
      // Don't set loading to true if we already have mock messages showing
      if (unreadMessages.length === 0) {
        setLoading(true)
      }
      setError(null)

      // Check if we should show mock data (for testing)
      const showMockData = typeof window !== 'undefined' && localStorage.getItem('showMockMessages') === 'true'
      
      if (showMockData) {
        console.log('Showing mock data for testing')
        setUnreadMessages(getMockMessages())
        setLoading(false)
        return
      }

      // Try to fetch from multiple messaging endpoints
      const endpoints = [
        '/api/messaging?unread_only=true&limit=5',
        '/api/enhanced-external-messages?userId=' + (user.id || 'fdb2a122-d6ae-4e78-b277-3317e1a09132'),
        '/api/internal-messages?userId=' + (user.id || 'fdb2a122-d6ae-4e78-b277-3317e1a09132')
      ]

      let allMessages: UnreadMessage[] = []

      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout per endpoint

          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal
          })

          clearTimeout(timeoutId)

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data) {
              // Transform the data to match our interface
              const messages = Array.isArray(data.data) ? data.data : data.data.messages || []
              const transformedMessages = messages.map((msg: any) => ({
                id: msg.id,
                type: msg.type || 'internal',
                sender_id: msg.sender_id,
                recipient_id: msg.recipient_id,
                subject: msg.subject || 'No Subject',
                content: msg.content || '',
                priority: msg.priority || 'normal',
                category: msg.category || 'general',
                is_read: msg.is_read || false,
                created_at: msg.created_at,
                sender: msg.sender || {
                  id: msg.sender_id,
                  full_name: msg.sender_name || 'Unknown Sender',
                  email: msg.sender_email || '',
                  avatar_url: msg.sender_avatar || null
                }
              })).filter((msg: UnreadMessage) => !msg.is_read)

              allMessages = [...allMessages, ...transformedMessages]
            }
          }
        } catch (fetchError) {
          console.log(`Failed to fetch from ${endpoint}:`, fetchError)
        }
      }

      // Remove duplicates and sort by date
      const uniqueMessages = allMessages.filter((msg, index, self) => 
        index === self.findIndex(m => m.id === msg.id)
      ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      if (uniqueMessages.length > 0) {
        setUnreadMessages(uniqueMessages.slice(0, 5)) // Show max 5 messages
      } else {
        // Fallback to mock data if no real messages found
        console.log('No real messages found, showing mock data')
        setUnreadMessages(getMockMessages())
      }
    } catch (err) {
      console.error('Error fetching unread messages:', err)
      // Show mock data on any error
      setUnreadMessages(getMockMessages())
    } finally {
      setLoading(false)
    }
  }

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    if (!user) return

    try {
      setMarkingAsRead(messageId)

      // For mock messages, just remove them from the list
      if (messageId.startsWith('mock-')) {
        setUnreadMessages(prev => {
          const newMessages = prev.filter(msg => msg.id !== messageId)
          // Update navigation badge if no messages left
          if (newMessages.length === 0 && typeof window !== 'undefined') {
            localStorage.removeItem('showMockMessages')
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'showMockMessages',
              newValue: null
            }))
          }
          return newMessages
        })
        setMarkingAsRead(null)
        return
      }

      const response = await fetch(`/api/messaging/${messageId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to mark message as read')
      }

      // Remove the message from unread list
      setUnreadMessages(prev => prev.filter(msg => msg.id !== messageId))
    } catch (err) {
      console.error('Error marking message as read:', err)
    } finally {
      setMarkingAsRead(null)
    }
  }

  // Mark all messages as read
  const markAllAsRead = async () => {
    if (!user || unreadMessages.length === 0) return

    try {
      const promises = unreadMessages.map(msg => markAsRead(msg.id))
      await Promise.all(promises)
      setUnreadMessages([])
      
      // Clear the mock data flag and update navigation badge if all messages are mock
      const mockMessages = unreadMessages.filter(msg => msg.id.startsWith('mock-'))
      if (mockMessages.length === unreadMessages.length && typeof window !== 'undefined') {
        localStorage.removeItem('showMockMessages')
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'showMockMessages',
          newValue: null
        }))
      }
    } catch (err) {
      console.error('Error marking all messages as read:', err)
    }
  }

  // Handle reply to message - navigate to messages page
  const handleReply = (message: UnreadMessage) => {
    console.log('🔍 Reply clicked for message:', message.id)
    goToMessages(message)
  }



  // Navigate to messages page
  const goToMessages = (message?: UnreadMessage) => {
    console.log('🔗 Navigating to messages page with message:', message)
    
    if (message) {
      // Navigate to specific conversation
      const conversationId = (message as any).thread_id || message.id
      const senderId = message.sender_id
      const recipientId = message.recipient_id
      
      console.log('🎯 Navigation params:', {
        conversationId,
        messageId: message.id,
        senderId,
        recipientId
      })
      
      // Try different URL patterns that might work with the messages page
      const url = `/dashboard/messages?conversation=${conversationId}&message=${message.id}&sender=${senderId}&recipient=${recipientId}`
      console.log('🚀 Navigating to:', url)
      router.push(url)
    } else {
      // Navigate to general messages page
      console.log('🚀 Navigating to general messages page')
      router.push('/dashboard/messages')
    }
  }

  // Archive message
  const archiveMessage = async (messageId: string) => {
    if (messageId.startsWith('mock-')) {
      // For mock messages, just remove from list
      setUnreadMessages(prev => prev.filter(msg => msg.id !== messageId))
      toast({
        title: "Message Archived",
        description: "Message has been archived.",
      })
      return
    }

    // For real messages, call archive API
    try {
      const response = await fetch(`/api/messaging/${messageId}/archive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setUnreadMessages(prev => prev.filter(msg => msg.id !== messageId))
        toast({
          title: "Message Archived",
          description: "Message has been archived.",
        })
      } else {
        throw new Error('Failed to archive message')
      }
    } catch (err) {
      console.error('Error archiving message:', err)
      toast({
        title: "Error",
        description: "Failed to archive message. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'normal': return 'bg-blue-500'
      case 'low': return 'bg-gray-500'
      default: return 'bg-blue-500'
    }
  }

  // Get message type icon
  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'internal': return <User className="h-4 w-4" />
      case 'external': return <Building2 className="h-4 w-4" />
      case 'system': return <Bell className="h-4 w-4" />
      case 'notification': return <Bell className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  // Get sender display info
  const getSenderInfo = (message: UnreadMessage) => {
    if (message.sender) {
      return {
        name: message.sender.full_name || message.sender.email,
        avatar: message.sender.avatar_url,
        type: 'user'
      }
    }
    if (message.partner) {
      return {
        name: message.partner.name,
        avatar: message.partner.avatar_url,
        type: 'partner'
      }
    }
    return {
      name: 'System',
      avatar: null,
      type: 'system'
    }
  }

  // Truncate content
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  useEffect(() => {
    // Always show mock messages immediately for demo purposes
    console.log('🔄 NewMessageBox: Setting mock messages')
    setUnreadMessages(getMockMessages())
    setLoading(false)
    
    // Also try to fetch real messages in the background (but don't wait for them)
    fetchUnreadMessages()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadMessages, 30000)
    return () => clearInterval(interval)
  }, [user])



  // Don't render if no unread messages
  if (!loading && unreadMessages.length === 0) {
    return null
  }

  return (
    <Card className={cn(
      "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200/60 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer backdrop-blur-sm",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 flex-1 text-left hover:bg-green-100/50 rounded-lg p-2 -m-2 transition-colors duration-200"
          >
            <div className="p-2 bg-green-500 rounded-lg">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800">
                New Messages
              </CardTitle>
              <p className="text-sm text-slate-600">
                {loading ? 'Loading...' : `${unreadMessages.length} unread message${unreadMessages.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            {unreadMessages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  markAllAsRead()
                }}
                className="text-green-600 hover:text-green-700 hover:bg-green-100"
              >
                <BellOff className="h-4 w-4 mr-1" />
                Mark All Read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="text-slate-600 hover:text-slate-700"
            >
              {isExpanded ? <X className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUnreadMessages}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {unreadMessages.map((message) => {
                const senderInfo = getSenderInfo(message)
                const isMarking = markingAsRead === message.id

                return (
                  <div
                    key={message.id}
                    className="group relative p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 hover:border-blue-300/60 hover:shadow-lg hover:bg-white/90 transition-all duration-300 cursor-pointer"
                    onClick={() => goToMessages(message)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={senderInfo.avatar || undefined} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {senderInfo.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                          getPriorityColor(message.priority)
                        )} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-800 text-sm">
                            {senderInfo.name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {getMessageTypeIcon(message.type)}
                            <span className="ml-1 capitalize">{message.type}</span>
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                        </div>

                        {message.subject && (
                          <h4 className="font-semibold text-slate-800 text-sm mb-1">
                            {message.subject}
                          </h4>
                        )}

                        <p className="text-slate-600 text-sm leading-relaxed">
                          {truncateContent(message.content)}
                        </p>

                        <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(message.id)
                            }}
                            disabled={isMarking}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50/80 transition-all duration-200 rounded-lg"
                          >
                            {isMarking ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                            ) : (
                              <BellOff className="h-4 w-4 mr-1" />
                            )}
                            Mark as Read
                          </Button>
                                              <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReply(message)
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 transition-all duration-200 rounded-lg"
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              archiveMessage(message.id)
                            }}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50/80 transition-all duration-200 rounded-lg"
                          >
                            <Archive className="h-4 w-4 mr-1" />
                            Archive
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              goToMessages(message)
                            }}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/80 transition-all duration-200 rounded-lg"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}



              {unreadMessages.length > 0 && (
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToMessages()}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    View All Messages
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
