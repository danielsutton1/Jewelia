'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatDistanceToNow } from 'date-fns'

interface OnlineUser {
  user_id: string
  user_name: string
  status: 'online' | 'offline' | 'away' | 'busy'
  last_seen: string
  avatar_url?: string
}

interface OnlineStatusProps {
  users: OnlineUser[]
  showCount?: boolean
  className?: string
}

export function OnlineStatus({ users, showCount = true, className }: OnlineStatusProps) {
  const onlineUsers = users.filter(user => user.status === 'online')
  const awayUsers = users.filter(user => user.status === 'away')
  const busyUsers = users.filter(user => user.status === 'busy')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'busy':
        return 'bg-red-500'
      case 'offline':
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'away':
        return 'Away'
      case 'busy':
        return 'Busy'
      case 'offline':
        return 'Offline'
      default:
        return 'Unknown'
    }
  }

  const getLastSeenText = (lastSeen: string) => {
    const date = new Date(lastSeen)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return 'Just now'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} day${days > 1 ? 's' : ''} ago`
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showCount && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>{onlineUsers.length} online</span>
          {(awayUsers.length > 0 || busyUsers.length > 0) && (
            <span className="text-xs">
              ({awayUsers.length} away, {busyUsers.length} busy)
            </span>
          )}
        </div>
      )}

      {/* Online users avatars */}
      <div className="flex -space-x-2">
        {onlineUsers.slice(0, 5).map((user) => (
          <TooltipProvider key={user.user_id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="w-8 h-8 border-2 border-background">
                    <AvatarImage src={user.avatar_url} alt={user.user_name} />
                    <AvatarFallback className="text-xs">
                      {user.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
                    getStatusColor(user.status)
                  )} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">{user.user_name}</p>
                  <p className="text-xs text-muted-foreground">{getStatusText(user.status)}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {onlineUsers.length > 5 && (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
            +{onlineUsers.length - 5}
          </div>
        )}
      </div>
    </div>
  )
}

// Individual user status indicator
interface UserStatusIndicatorProps {
  user: OnlineUser
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

export function UserStatusIndicator({ user, size = 'md', showName = false, className }: UserStatusIndicatorProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'busy':
        return 'bg-red-500'
      case 'offline':
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'away':
        return 'Away'
      case 'busy':
        return 'Busy'
      case 'offline':
        return 'Offline'
      default:
        return 'Unknown'
    }
  }

  const getAvatarSize = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6'
      case 'md':
        return 'w-8 h-8'
      case 'lg':
        return 'w-12 h-12'
      default:
        return 'w-8 h-8'
    }
  }

  const getStatusDotSize = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2'
      case 'md':
        return 'w-3 h-3'
      case 'lg':
        return 'w-4 h-4'
      default:
        return 'w-3 h-3'
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Avatar className={cn("border-2 border-background", getAvatarSize())}>
          <AvatarImage src={user.avatar_url} alt={user.user_name} />
          <AvatarFallback className="text-xs">
            {user.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className={cn(
          "absolute -bottom-1 -right-1 rounded-full border-2 border-background",
          getStatusColor(user.status),
          getStatusDotSize()
        )} />
      </div>
      {showName && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{user.user_name}</span>
          <span className="text-xs text-muted-foreground">{getStatusText(user.status)}</span>
        </div>
      )}
    </div>
  )
}

// Hook for managing online status
export function useOnlineStatus() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [isOnline, setIsOnline] = useState(false)

  const updateOnlineUsers = (users: OnlineUser[]) => {
    setOnlineUsers(users)
  }

  const setUserStatus = (status: 'online' | 'offline' | 'away' | 'busy') => {
    setIsOnline(status === 'online')
    // This would be implemented with your real-time service
  }

  useEffect(() => {
    // Set initial online status
    setUserStatus('online')

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setUserStatus('away')
      } else {
        setUserStatus('online')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      setUserStatus('offline')
    }
  }, [])

  return {
    onlineUsers,
    isOnline,
    updateOnlineUsers,
    setUserStatus
  }
} 