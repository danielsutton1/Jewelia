"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare, Clock, User, AlertCircle, Star, Archive, Trash2 } from 'lucide-react'
import { InternalMessage } from '@/lib/services/InternalMessagingService'
import { formatDistanceToNow } from 'date-fns'

interface MessageListProps {
  messages: InternalMessage[]
  onMessageSelect: (message: InternalMessage) => void
  onDeleteMessage: (messageId: string) => void
  onMarkAsRead: (messageId: string) => void
  currentUserId: string
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

const messageTypeIcons = {
  general: MessageSquare,
  urgent: AlertCircle,
  announcement: Star,
  task: Clock,
  support: User
}

export function MessageList({
  messages,
  onMessageSelect,
  onDeleteMessage,
  onMarkAsRead,
  currentUserId
}: MessageListProps) {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)

  const handleMessageClick = (message: InternalMessage) => {
    setSelectedMessageId(message.id)
    onMessageSelect(message)
    
    // Mark as read if unread and recipient is viewing
    if (message.status === 'unread' && message.recipient_id === currentUserId) {
      onMarkAsRead(message.id)
    }
  }

  const getPriorityColor = (priority: string) => {
    return priorityColors[priority as keyof typeof priorityColors] || priorityColors.normal
  }

  const getMessageTypeIcon = (type: string) => {
    const IconComponent = messageTypeIcons[type as keyof typeof messageTypeIcons] || MessageSquare
    return <IconComponent className="w-4 h-4" />
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (messages.length === 0) {
    return (
      <Card className="w-full bg-white shadow-sm border border-gray-100">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 bg-gray-50 rounded-full mb-4">
            <MessageSquare className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-500 text-center max-w-md">
            Start a conversation with your team members or admins. 
            Click "New Message" to begin communicating.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isUnread = message.status === 'unread' && message.recipient_id === currentUserId
        const isSelected = selectedMessageId === message.id
        const isSender = message.sender_id === currentUserId
        
        return (
          <Card
            key={message.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] ${
              isSelected ? 'ring-2 ring-green-500 shadow-lg' : ''
            } ${isUnread ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200 shadow-sm' : 'bg-white border-gray-100'}`}
            onClick={() => handleMessageClick(message)}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="w-12 h-12 shadow-sm">
                  <AvatarImage src={message.sender_name ? undefined : undefined} />
                  <AvatarFallback className={`text-sm font-semibold ${
                    isUnread ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {message.sender_name ? getInitials(message.sender_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`font-semibold ${
                        isUnread ? 'text-gray-900' : 'text-gray-800'
                      }`}>
                        {isSender ? 'You' : message.sender_name || 'Unknown User'}
                      </span>
                      {message.is_admin_message && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                          Admin
                        </Badge>
                      )}
                      {isUnread && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600 font-medium">New</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className={`font-semibold mb-2 ${
                      isUnread ? 'text-gray-900' : 'text-gray-800'
                    }`}>{message.subject}</h4>
                    <p className={`text-sm leading-relaxed ${
                      isUnread ? 'text-gray-700' : 'text-gray-600'
                    } line-clamp-2`}>
                      {message.content}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getPriorityColor(message.priority)} border-0 font-medium`}>
                        {message.priority}
                      </Badge>
                      <Badge variant="outline" className="flex items-center space-x-2 border-gray-200 text-gray-700">
                        {getMessageTypeIcon(message.message_type)}
                        <span className="text-xs font-medium">{message.message_type}</span>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isSender && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteMessage(message.id)
                          }}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full p-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      {isUnread && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onMarkAsRead(message.id)
                          }}
                          className="text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full p-2 transition-colors"
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
