'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatDistanceToNow } from 'date-fns'

interface DeliveryStatus {
  message_id: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: string
  recipient_id: string
  read_at?: string
}

interface MessageDeliveryStatusProps {
  status: DeliveryStatus
  className?: string
  showTimestamp?: boolean
}

export function MessageDeliveryStatus({ status, className, showTimestamp = true }: MessageDeliveryStatusProps) {
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    const updateTimeAgo = () => {
      const timestamp = status.read_at || status.timestamp
      setTimeAgo(formatDistanceToNow(new Date(timestamp), { addSuffix: true }))
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [status.read_at, status.timestamp])

  const getStatusIcon = () => {
    switch (status.status) {
      case 'sent':
        return <Check className="w-4 h-4 text-muted-foreground" />
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-blue-500" />
      case 'read':
        return <CheckCheck className="w-4 h-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusText = () => {
    switch (status.status) {
      case 'sent':
        return 'Sent'
      case 'delivered':
        return 'Delivered'
      case 'read':
        return 'Read'
      case 'failed':
        return 'Failed to send'
      default:
        return 'Sending...'
    }
  }

  const getStatusColor = () => {
    switch (status.status) {
      case 'sent':
        return 'text-muted-foreground'
      case 'delivered':
        return 'text-blue-500'
      case 'read':
        return 'text-green-500'
      case 'failed':
        return 'text-red-500'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1", className)}>
            {getStatusIcon()}
            {showTimestamp && (
              <span className={cn("text-xs", getStatusColor())}>
                {timeAgo}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">{getStatusText()}</p>
            {status.read_at && (
              <p className="text-xs text-muted-foreground">
                Read {formatDistanceToNow(new Date(status.read_at), { addSuffix: true })}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {new Date(status.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Message status indicator for message list
interface MessageStatusIndicatorProps {
  messageId: string
  isRead: boolean
  sentAt: string
  readAt?: string
  className?: string
}

export function MessageStatusIndicator({ messageId, isRead, sentAt, readAt, className }: MessageStatusIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    const updateTimeAgo = () => {
      const timestamp = readAt || sentAt
      setTimeAgo(formatDistanceToNow(new Date(timestamp), { addSuffix: true }))
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [readAt, sentAt])

  return (
    <div className={cn("flex items-center gap-1 text-xs text-muted-foreground", className)}>
      {isRead ? (
        <CheckCheck className="w-3 h-3 text-green-500" />
      ) : (
        <Check className="w-3 h-3" />
      )}
      <span>{timeAgo}</span>
    </div>
  )
}

// Batch delivery status for multiple messages
interface BatchDeliveryStatusProps {
  messages: Array<{
    id: string
    status: 'sent' | 'delivered' | 'read' | 'failed'
    timestamp: string
    read_at?: string
  }>
  className?: string
}

export function BatchDeliveryStatus({ messages, className }: BatchDeliveryStatusProps) {
  const allRead = messages.every(msg => msg.status === 'read')
  const allDelivered = messages.every(msg => msg.status === 'delivered' || msg.status === 'read')
  const hasFailed = messages.some(msg => msg.status === 'failed')
  const latestTimestamp = Math.max(...messages.map(msg => new Date(msg.timestamp).getTime()))

  const getStatusIcon = () => {
    if (hasFailed) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    } else if (allRead) {
      return <CheckCheck className="w-4 h-4 text-green-500" />
    } else if (allDelivered) {
      return <CheckCheck className="w-4 h-4 text-blue-500" />
    } else {
      return <Check className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusText = () => {
    if (hasFailed) {
      return 'Some messages failed to send'
    } else if (allRead) {
      return 'All messages read'
    } else if (allDelivered) {
      return 'All messages delivered'
    } else {
      return 'Messages sent'
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1", className)}>
            {getStatusIcon()}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(latestTimestamp), { addSuffix: true })}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">{getStatusText()}</p>
            <p className="text-xs text-muted-foreground">
              {messages.length} message{messages.length > 1 ? 's' : ''}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Hook for managing message delivery status
export function useMessageDeliveryStatus() {
  const [deliveryStatuses, setDeliveryStatuses] = useState<Map<string, DeliveryStatus>>(new Map())

  const updateDeliveryStatus = (status: DeliveryStatus) => {
    setDeliveryStatuses(prev => new Map(prev).set(status.message_id, status))
  }

  const getDeliveryStatus = (messageId: string): DeliveryStatus | undefined => {
    return deliveryStatuses.get(messageId)
  }

  const markAsRead = (messageId: string, readAt: string) => {
    const currentStatus = deliveryStatuses.get(messageId)
    if (currentStatus) {
      updateDeliveryStatus({
        ...currentStatus,
        status: 'read',
        read_at: readAt
      })
    }
  }

  return {
    deliveryStatuses,
    updateDeliveryStatus,
    getDeliveryStatus,
    markAsRead
  }
} 