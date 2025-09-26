'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageSquare, 
  Users, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Send, 
  Paperclip,
  Smile,
  Clock,
  Check,
  CheckCheck,
  Star,
  Archive,
  Trash2,
  Filter,
  SortAsc,
  SortDesc,
  Circle,
  Wifi,
  WifiOff
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { MessageComposer } from '@/components/messaging/MessageComposer'
import { TypingIndicator, useTypingIndicator } from '@/components/messaging/TypingIndicator'
import { OnlineStatus, UserStatusIndicator, useOnlineStatus } from '@/components/messaging/OnlineStatus'
import { MessageDeliveryStatus, MessageStatusIndicator, useMessageDeliveryStatus } from '@/components/messaging/MessageDeliveryStatus'
import { cn } from '@/lib/utils'

export default function EnhancedMessagingPage() {
  const [activeTab, setActiveTab] = useState('threads')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Enhanced features hooks
  const { typingUsers, isTyping, startTyping, stopTyping, updateTypingUsers } = useTypingIndicator('test-thread', 'test-user')
  const { onlineUsers, isOnline, updateOnlineUsers, setUserStatus } = useOnlineStatus()
  const { deliveryStatuses, updateDeliveryStatus, getDeliveryStatus, markAsRead } = useMessageDeliveryStatus()

  // Sample data for demonstration
  const sampleOnlineUsers = [
    {
      user_id: '1',
      user_name: 'John Doe',
      status: 'online' as const,
      last_seen: new Date().toISOString(),
      avatar_url: undefined
    },
    {
      user_id: '2',
      user_name: 'Jane Smith',
      status: 'away' as const,
      last_seen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      avatar_url: undefined
    }
  ]

  const sampleTypingUsers = [
    {
      user_id: '1',
      user_name: 'John Doe',
      is_typing: true,
      timestamp: new Date().toISOString()
    }
  ]

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setCurrentUser(data.user)
        } else {
          console.log('Auth response not ok:', response.status)
        }
      } catch (error) {
        console.error('Failed to get current user:', error)
      } finally {
        setLoading(false)
      }
    }

    getCurrentUser()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600 h-8 w-8 mx-auto"></div>
          <p className="mt-4 text-emerald-700 font-medium">Loading enhanced messaging...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Messaging</h1>
          <p className="text-gray-600 mt-1">Real-time communication with typing indicators, online status, and delivery confirmation</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-green-500" />
            Real-time Connected
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Online Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Online Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OnlineStatus users={sampleOnlineUsers} />
            </CardContent>
          </Card>

          {/* Typing Indicators */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Typing Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TypingIndicator 
                threadId="demo-thread"
                currentUserId="current-user"
                participants={[
                  { id: "user-1", name: "John Doe", avatar_url: "/avatars/john.jpg" },
                  { id: "user-2", name: "Jane Smith", avatar_url: "/avatars/jane.jpg" }
                ]}
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Messaging Area */}
        <div className="lg:col-span-3">
          <Card className="h-[600px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Enhanced Messaging Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full flex flex-col">
              {/* Message Area */}
              <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto">
                <div className="space-y-4">
                  {/* Sample Messages */}
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm text-gray-900">Hello! This is a sample message to demonstrate the enhanced messaging features.</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">John Doe</span>
                          <MessageStatusIndicator 
                            messageId="msg-1" 
                            isRead={true} 
                            sentAt={new Date().toISOString()} 
                            readAt={new Date().toISOString()} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 justify-end">
                    <div className="flex-1 max-w-xs">
                      <div className="bg-emerald-500 text-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm">Hi! I can see the enhanced features working. The typing indicators and delivery status are great!</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-75">You</span>
                          <MessageStatusIndicator 
                            messageId="msg-2" 
                            isRead={false} 
                            sentAt={new Date().toISOString()} 
                          />
                        </div>
                      </div>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Typing Indicator Demo */}
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                                             <div className="bg-gray-100 rounded-lg p-3">
                         <TypingIndicator 
                           threadId="demo-thread"
                           currentUserId="current-user"
                           participants={[
                             { id: "user-1", name: "John Doe", avatar_url: "/avatars/john.jpg" },
                             { id: "user-2", name: "Jane Smith", avatar_url: "/avatars/jane.jpg" }
                           ]}
                         />
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Composer */}
              <div className="border-t pt-4">
                <MessageComposer 
                  threadId="demo-thread"
                  onSendMessage={async (content: string) => {
                    console.log('Message sent:', content)
                    // Simulate delivery status updates
                    setTimeout(() => {
                      updateDeliveryStatus({
                        message_id: 'demo-msg-1',
                        status: 'delivered',
                        timestamp: new Date().toISOString(),
                        recipient_id: 'demo-recipient'
                      })
                    }, 1000)
                  }}
                  onTyping={(isTyping) => {
                    if (isTyping) {
                      startTyping()
                    } else {
                      stopTyping()
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-500" />
              Typing Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Real-time typing indicators show when users are composing messages with animated dots and user avatars.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-green-500" />
              Online Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Live online/offline status with last seen timestamps and status indicators (online, away, busy).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCheck className="h-5 w-5 text-blue-500" />
              Delivery Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Multi-stage message delivery tracking: sent → delivered → read with timestamps and visual indicators.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 