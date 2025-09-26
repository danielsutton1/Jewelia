'use client'

import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Check, CheckCheck, Clock, AlertCircle, X } from 'lucide-react'
import { ReadReceipt } from '@/lib/services/RealtimeMessagingService'

// =====================================================
// READ RECEIPT COMPONENTS
// =====================================================

export interface MessageStatus {
  id: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  sentAt: string
  deliveredAt?: string
  readAt?: string
  recipients: Array<{
    id: string
    name: string
    avatar_url?: string
    status: 'sent' | 'delivered' | 'read' | 'failed'
    timestamp: string
  }>
}

interface ReadReceiptsProps {
  messageId: string
  threadId: string
  currentUserId: string
  participants: Array<{
    id: string
    name: string
    avatar_url?: string
  }>
  className?: string
  showDetailed?: boolean
}

export function ReadReceipts({ 
  messageId, 
  threadId, 
  currentUserId, 
  participants, 
  className = '',
  showDetailed = false 
}: ReadReceiptsProps) {
  const [messageStatus, setMessageStatus] = useState<MessageStatus | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Import the realtime service dynamically to avoid SSR issues
    const initializeReadReceipts = async () => {
      try {
        const { realtimeMessaging } = await import('@/lib/services/RealtimeMessagingService')
        
        // Listen for read receipt events
        realtimeMessaging.on('read_receipt', (receipt: ReadReceipt) => {
          if (receipt.messageId === messageId) {
            updateMessageStatus(receipt)
          }
        })

        // Listen for message updates
        realtimeMessaging.on('message', (event: any) => {
          if (event.type === 'update' && event.update.id === messageId) {
            updateMessageStatusFromUpdate(event.update)
          }
        })

        // Cleanup function
        return () => {
          realtimeMessaging.off('read_receipt', () => {})
          realtimeMessaging.off('message', () => {})
        }
      } catch (error) {
        console.error('Failed to initialize read receipts:', error)
      }
    }

    initializeReadReceipts()
  }, [messageId])

  const updateMessageStatus = (receipt: ReadReceipt) => {
    setMessageStatus((prev: any) => {
      if (!prev) return null
      
      const updatedRecipients = prev.recipients.map((recipient: any) => 
        recipient.id === receipt.userId 
          ? { ...recipient, status: 'read', timestamp: receipt.readAt }
          : recipient
      )

      return {
        ...prev,
        recipients: updatedRecipients,
        status: updatedRecipients.every((r: any) => r.status === 'read') ? 'read' : 'delivered'
      }
    })
  }

  const updateMessageStatusFromUpdate = (update: any) => {
    setMessageStatus(prev => {
      if (!prev) return null
      
      return {
        ...prev,
        status: update.status,
        readReceipts: update.readReceipts
      }
    })
  }

  const getOverallStatus = () => {
    if (!messageStatus) return 'sent'
    
    const allRead = messageStatus.recipients.every(r => r.status === 'read')
    const allDelivered = messageStatus.recipients.every(r => r.status === 'delivered' || r.status === 'read')
    
    if (allRead) return 'read'
    if (allDelivered) return 'delivered'
    return 'sent'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'read':
        return 'Read'
      case 'delivered':
        return 'Delivered'
      case 'sent':
        return 'Sent'
      case 'failed':
        return 'Failed to send'
      default:
        return 'Sending...'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read':
        return 'text-blue-500'
      case 'delivered':
        return 'text-gray-500'
      case 'sent':
        return 'text-gray-400'
      case 'failed':
        return 'text-red-500'
      default:
        return 'text-gray-400'
    }
  }

  if (!messageStatus && !showDetailed) {
    // Show simple status indicator
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {getStatusIcon(getOverallStatus())}
        <span className={cn("text-xs", getStatusColor(getOverallStatus()))}>
          {getStatusText(getOverallStatus())}
        </span>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Status icon */}
      <div className="flex items-center gap-1">
        {getStatusIcon(getOverallStatus())}
        <span className={cn("text-xs", getStatusColor(getOverallStatus()))}>
          {getStatusText(getOverallStatus())}
        </span>
      </div>

      {/* Recipient avatars */}
      {showDetailed && (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            {participants
              .filter(p => p.id !== currentUserId)
              .slice(0, 3)
              .map((participant, index) => (
                <TooltipProvider key={participant.id}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Avatar className="w-5 h-5 border border-background">
                        <AvatarImage src={participant.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {participant.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center">
                        <p className="font-medium">{participant.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {messageStatus?.recipients.find(r => r.id === participant.id)?.status || 'sent'}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            {participants.filter(p => p.id !== currentUserId).length > 3 && (
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center border border-background">
                <span className="text-xs">+{participants.filter(p => p.id !== currentUserId).length - 3}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expand button for detailed view */}
      {showDetailed && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isExpanded ? 'Hide details' : 'Show details'}
        </button>
      )}

      {/* Detailed status view */}
      {isExpanded && showDetailed && messageStatus && (
        <div className="absolute bottom-full right-0 mb-2 p-3 bg-popover border rounded-lg shadow-lg min-w-[200px]">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Message Status</h4>
            {messageStatus.recipients
              .filter(r => r.id !== currentUserId)
              .map(recipient => (
                <div key={recipient.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-4 h-4">
                      <AvatarImage src={participants.find(p => p.id === recipient.id)?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {participants.find(p => p.id === recipient.id)?.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{participants.find(p => p.id === recipient.id)?.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(recipient.status)}
                    <Badge variant="outline" className="text-xs">
                      {recipient.status}
                    </Badge>
                  </div>
                </div>
              ))}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Sent: {new Date(messageStatus.sentAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// =====================================================
// SIMPLE READ RECEIPT INDICATOR
// =====================================================

interface SimpleReadReceiptProps {
  status: 'sent' | 'delivered' | 'read' | 'failed'
  className?: string
}

export function SimpleReadReceipt({ status, className = '' }: SimpleReadReceiptProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  return (
    <div className={cn("flex items-center", className)}>
      {getStatusIcon(status)}
    </div>
  )
}

// =====================================================
// READ RECEIPT BADGE
// =====================================================

interface ReadReceiptBadgeProps {
  status: 'sent' | 'delivered' | 'read' | 'failed'
  count?: number
  className?: string
}

export function ReadReceiptBadge({ status, count, className = '' }: ReadReceiptBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'sent':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />
      case 'failed':
        return <X className="h-3 w-3 text-red-500" />
      default:
        return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  return (
    <Badge 
      variant="outline" 
      className={cn("text-xs", getStatusColor(status), className)}
    >
      {getStatusIcon(status)}
      {count && <span className="ml-1">{count}</span>}
    </Badge>
  )
}

// =====================================================
// READ RECEIPT TIMELINE
// =====================================================

interface ReadReceiptTimelineProps {
  messageId: string
  className?: string
}

export function ReadReceiptTimeline({ messageId, className = '' }: ReadReceiptTimelineProps) {
  const [timeline, setTimeline] = useState<Array<{
    timestamp: string
    event: string
    userId: string
    userName: string
  }>>([])

  useEffect(() => {
    // Fetch timeline data for the message
    const fetchTimeline = async () => {
      try {
        const response = await fetch(`/api/messaging/${messageId}/timeline`)
        if (response.ok) {
          const data = await response.json()
          setTimeline(data.timeline || [])
        }
      } catch (error) {
        console.error('Failed to fetch message timeline:', error)
      }
    }

    fetchTimeline()
  }, [messageId])

  if (timeline.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-sm font-medium">Message Timeline</h4>
      <div className="space-y-1">
        {timeline.map((event, index) => (
          <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-muted-foreground rounded-full" />
            <span>{event.event}</span>
            <span>by {event.userName}</span>
            <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
