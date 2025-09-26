'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Mic, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  ArrowLeft,
  Phone,
  Video,
  Search,
  Filter,
  Archive,
  Trash2,
  Pin,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react'
import { MessageComposer } from '../messaging/MessageComposer'
import { MessageReactions } from '../messaging/MessageReactions'
import { VoiceMessage } from '../messaging/VoiceMessage'
import { cn } from '@/lib/utils'

interface MobileMessage {
  id: string
  content: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: string
  isRead: boolean
  isOwn: boolean
  reactions: any[]
  attachments?: any[]
  voiceMessage?: string
}

interface MobileMessagingInterfaceProps {
  threadId: string
  messages: MobileMessage[]
  onSendMessage: (content: string, attachments?: File[], uploadedFiles?: any[], voiceMessage?: Blob) => Promise<void>
  onBack: () => void
  threadInfo: {
    name: string
    avatar?: string
    isOnline: boolean
    lastSeen?: string
  }
}

export function MobileMessagingInterface({
  threadId,
  messages,
  onSendMessage,
  onBack,
  threadInfo
}: MobileMessagingInterfaceProps) {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [swipeStart, setSwipeStart] = useState<number | null>(null)
  const [swipeDistance, setSwipeDistance] = useState(0)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Touch gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setSwipeStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (swipeStart !== null) {
      const currentX = e.touches[0].clientX
      const distance = currentX - swipeStart
      setSwipeDistance(distance)
    }
  }

  const handleTouchEnd = () => {
    if (swipeDistance > 100) {
      // Swipe right - go back
      onBack()
    }
    setSwipeStart(null)
    setSwipeDistance(0)
  }

  const handleReaction = (messageId: string, emoji: string) => {
    // Handle message reaction
    console.log('React to message:', messageId, emoji)
  }

  const handleReply = (messageId: string) => {
    // Handle message reply
    console.log('Reply to message:', messageId)
  }

  const handleVoiceMessage = (audioBlob: Blob) => {
    onSendMessage('', [], [], audioBlob)
    setShowVoiceRecorder(false)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div 
      className="flex flex-col h-screen bg-gray-50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                {threadInfo.avatar ? (
                  <img 
                    src={threadInfo.avatar} 
                    alt={threadInfo.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {threadInfo.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {threadInfo.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">{threadInfo.name}</h3>
              <p className="text-xs text-gray-500">
                {threadInfo.isOnline ? 'Online' : threadInfo.lastSeen ? `Last seen ${threadInfo.lastSeen}` : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="p-2"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <Phone className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <Video className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOptions(!showOptions)}
            className="p-2"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Options Menu */}
      {showOptions && (
        <div className="bg-white border-b p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <Search className="h-4 w-4 mr-2" />
            Search Messages
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Filter className="h-4 w-4 mr-2" />
            Filter Messages
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Pin className="h-4 w-4 mr-2" />
            Pin Messages
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Archive className="h-4 w-4 mr-2" />
            Archive Chat
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Chat
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.isOwn ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-2",
              message.isOwn 
                ? "bg-blue-500 text-white rounded-br-md" 
                : "bg-white text-gray-900 rounded-bl-md shadow-sm"
            )}>
              {/* Message Content */}
              <div className="text-sm">
                {message.content}
              </div>
              
              {/* Voice Message */}
              {message.voiceMessage && (
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0",
                      message.isOwn ? "text-blue-100" : "text-gray-600"
                    )}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div className="bg-current h-1 rounded-full w-1/3" />
                  </div>
                  <span className="text-xs opacity-70">0:15</span>
                </div>
              )}
              
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-2 p-2 bg-black/10 rounded">
                      <Paperclip className="h-3 w-3" />
                      <span className="text-xs truncate">{attachment.name}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Message Info */}
              <div className={cn(
                "flex items-center justify-between mt-1 text-xs",
                message.isOwn ? "text-blue-100" : "text-gray-500"
              )}>
                <span>{formatTime(message.timestamp)}</span>
                {message.isOwn && (
                  <div className="flex items-center gap-1">
                    {message.isRead ? (
                      <div className="flex">
                        <div className="w-2 h-2 bg-current rounded-full" />
                        <div className="w-2 h-2 bg-current rounded-full -ml-1" />
                      </div>
                    ) : (
                      <div className="w-2 h-2 bg-current rounded-full" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {message.reactions.map((reaction) => (
                    <Badge
                      key={reaction.emoji}
                      variant="secondary"
                      className="text-xs px-2 py-1"
                    >
                      {reaction.emoji} {reaction.count}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2 shadow-sm">
              <div className="flex items-center gap-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-xs text-gray-500 ml-2">Typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Message Recorder */}
      {showVoiceRecorder && (
        <div className="p-4 bg-white border-t">
          <VoiceMessage
            onSend={handleVoiceMessage}
            onCancel={() => setShowVoiceRecorder(false)}
          />
        </div>
      )}

      {/* Message Composer */}
      {!showVoiceRecorder && (
        <div className="p-4 bg-white border-t">
          <MessageComposer
            threadId={threadId}
            onSendMessage={onSendMessage}
            onTyping={setIsTyping}
            showVoiceMessage={true}
            showReactions={true}
            showEditMode={true}
            placeholder="Type a message..."
          />
        </div>
      )}
    </div>
  )
} 