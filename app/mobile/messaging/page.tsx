'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, 
  Users, 
  Bell, 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical,
  ArrowLeft,
  Phone,
  Video,
  Info
} from 'lucide-react'
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging'
import { MessageComposer } from '@/components/messaging/MessageComposer'
import { FileUpload } from '@/components/messaging/FileUpload'

interface Message {
  id: string
  content: string
  sender_id: string
  sender?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
  created_at: string
  is_read: boolean
  attachments?: Array<{
    id: string
    file_name: string
    file_url: string
    file_type: string
  }>
}

interface Thread {
  id: string
  subject: string
  type: 'internal' | 'external' | 'system' | 'notification'
  last_message: {
    content: string
    created_at: string
    sender_name: string
  } | null
  unread_count: number
  participants_details?: Array<{
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }>
}

export default function MobileMessagingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('chats')
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Real-time messaging hook
  const {
    isConnected,
    connectionStatus,
    typingUsers,
    onlineUsers,
    error: realtimeError,
    sendTypingIndicator,
    subscribeToThread,
    unsubscribeFromThread
  } = useRealtimeMessaging({
    userId: currentUserId,
    threadId: selectedThread?.id,
    onNewMessage: (message) => {
      if (selectedThread && message.thread_id === selectedThread.id) {
        setMessages(prev => [...prev, message])
      }
      setThreads(prev => prev.map(thread => 
        thread.id === message.thread_id 
          ? { ...thread, last_message: { content: message.content, created_at: message.created_at, sender_name: message.sender?.full_name || 'Unknown' } }
          : thread
      ))
    },
    onThreadUpdate: (thread) => {
      setThreads(prev => prev.map(t => t.id === thread.id ? thread : t))
    },
    onNewNotification: (notification) => {
      console.log('New notification:', notification)
    }
  })

  // Fetch current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const user = await response.json()
          setCurrentUserId(user.id)
        }
      } catch (error) {
        console.error('Error fetching current user:', error)
      }
    }
    fetchCurrentUser()
  }, [])

  // Fetch threads
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/messaging/threads')
        if (response.ok) {
          const data = await response.json()
          setThreads(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching threads:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (currentUserId) {
      fetchThreads()
    }
  }, [currentUserId])

  // Fetch thread messages
  const fetchThreadMessages = async (threadId: string) => {
    try {
      const response = await fetch(`/api/messaging?thread_id=${threadId}&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.data || [])
        
        // Subscribe to real-time updates for this thread
        subscribeToThread(threadId)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // Handle thread selection
  const handleThreadSelect = (thread: Thread) => {
    setSelectedThread(thread)
    fetchThreadMessages(thread.id)
  }

  // Handle sending message
  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!selectedThread || !content.trim()) return

    try {
      const messageData = {
        type: selectedThread.type,
        content: content.trim(),
        thread_id: selectedThread.id,
        priority: 'normal' as const,
        category: 'general',
        tags: [],
        metadata: {},
        content_type: 'text' as const
      }

      const response = await fetch('/api/messaging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      })

      if (response.ok) {
        const newMessage = await response.json()
        setMessages(prev => [...prev, newMessage.data])
        
        // Update thread's last message
        setThreads(prev => prev.map(thread => 
          thread.id === selectedThread.id 
            ? { 
                ...thread, 
                last_message: { 
                  content: content.trim(), 
                  created_at: new Date().toISOString(), 
                  sender_name: 'You' 
                },
                unread_count: 0
              }
            : thread
        ))
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Handle typing indicator
  const handleTyping = (isTyping: boolean) => {
    if (selectedThread) {
      sendTypingIndicator(isTyping)
    }
  }

  // Filter threads based on search
  const filteredThreads = threads.filter(thread =>
    thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.last_message?.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup real-time subscription when leaving thread
  useEffect(() => {
    return () => {
      if (selectedThread) {
        unsubscribeFromThread(selectedThread.id)
      }
    }
  }, [selectedThread, unsubscribeFromThread])

  if (selectedThread) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedThread(null)}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="font-semibold text-gray-900">{selectedThread.subject}</h2>
              <p className="text-sm text-gray-500">
                {selectedThread.participants_details?.length || 0} participants
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender_id === currentUserId
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  {message.sender_id !== currentUserId && (
                    <p className="text-xs text-gray-500 mb-1">
                      {message.sender?.full_name}
                    </p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center gap-2">
                          <Paperclip className="h-3 w-3" />
                          <a
                            href={attachment.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs underline"
                          >
                            {attachment.file_name}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Composer */}
        <div className="p-4 bg-white border-t border-gray-200">
                  <MessageComposer
          threadId={selectedThread.id}
          onSendMessage={handleSendMessage}
        />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="calls">Calls</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chats" className="flex-1">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No messages yet</p>
                </div>
              ) : (
                filteredThreads.map((thread) => (
                  <Card
                    key={thread.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleThreadSelect(thread)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder-avatar.jpg" />
                          <AvatarFallback>
                            {thread.subject.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {thread.subject}
                            </h3>
                            {thread.unread_count > 0 && (
                              <Badge variant="destructive" className="ml-2">
                                {thread.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {thread.last_message?.content || 'No messages yet'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {thread.last_message?.created_at
                              ? new Date(thread.last_message.created_at).toLocaleDateString()
                              : ''}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="calls" className="flex-1">
          <div className="p-4 text-center">
            <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Call history will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="flex-1">
          <div className="p-4 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Notifications will appear here</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Connection Status */}
      {!isConnected && (
        <div className="p-2 bg-yellow-100 text-yellow-800 text-xs text-center">
          Connecting to real-time service...
        </div>
      )}
    </div>
  )
} 