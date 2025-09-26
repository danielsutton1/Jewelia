'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { TypingEvent } from '@/lib/services/RealtimeMessagingService'

interface TypingIndicatorProps {
  threadId: string
  currentUserId: string
  participants: Array<{
    id: string
    name: string
    avatar_url?: string
  }>
  className?: string
}

export function TypingIndicator({ 
  threadId, 
  currentUserId, 
  participants, 
  className = '' 
}: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [typingAnimations, setTypingAnimations] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    // Import the realtime service dynamically to avoid SSR issues
    const initializeTypingIndicator = async () => {
      try {
        const { realtimeMessaging } = await import('@/lib/services/RealtimeMessagingService')
        
        // Listen for typing events
        realtimeMessaging.on('typing', (event: TypingEvent) => {
          if (event.threadId === threadId && event.userId !== currentUserId) {
            if (event.isTyping) {
              setTypingUsers(prev => new Set(prev).add(event.userId))
              // Start typing animation
              setTypingAnimations(prev => new Map(prev).set(event.userId, Date.now()))
            } else {
              setTypingUsers(prev => {
                const newSet = new Set(prev)
                newSet.delete(event.userId)
                return newSet
              })
              setTypingAnimations(prev => {
                const newMap = new Map(prev)
                newMap.delete(event.userId)
                return newMap
              })
            }
          }
        })

        // Cleanup function
        return () => {
          realtimeMessaging.off('typing', () => {})
        }
      } catch (error) {
        console.error('Failed to initialize typing indicator:', error)
      }
    }

    initializeTypingIndicator()
  }, [threadId, currentUserId])

  if (typingUsers.size === 0) {
    return null
  }

  const typingUserList = Array.from(typingUsers)
  const typingParticipants = participants.filter(p => typingUserList.includes(p.id))

  return (
    <div className={cn("flex items-center gap-2 p-3 text-sm text-muted-foreground", className)}>
      {/* Typing avatars */}
      <div className="flex -space-x-2">
        {typingParticipants.slice(0, 3).map((participant, index) => (
          <Avatar key={participant.id} className="w-6 h-6 border-2 border-background">
            <AvatarImage src={participant.avatar_url} />
            <AvatarFallback className="text-xs">
              {participant.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        {typingParticipants.length > 3 && (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center border-2 border-background">
            <span className="text-xs">+{typingParticipants.length - 3}</span>
          </div>
        )}
      </div>

      {/* Typing text */}
      <div className="flex items-center gap-1">
        <span>
          {typingParticipants.length === 1 
            ? `${typingParticipants[0].name} is typing`
            : `${typingParticipants.length} people are typing`
          }
        </span>
        
        {/* Animated dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse"
              style={{
                animationDelay: `${dot * 0.2}s`,
                animationDuration: '1.4s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Individual typing indicator for a single user
interface SingleTypingIndicatorProps {
  userId: string
  userName: string
  avatarUrl?: string
  className?: string
}

export function SingleTypingIndicator({ 
  userId, 
  userName, 
  avatarUrl, 
  className = '' 
}: SingleTypingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2 p-2", className)}>
      <Avatar className="w-8 h-8">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="text-sm">
          {userName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{userName} is typing</span>
        
        {/* Animated dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse"
              style={{
                animationDelay: `${dot * 0.2}s`,
                animationDuration: '1.4s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Compact typing indicator for inline use
interface CompactTypingIndicatorProps {
  className?: string
}

export function CompactTypingIndicator({ className = '' }: CompactTypingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-1 text-xs text-muted-foreground", className)}>
      <span>typing</span>
      <div className="flex gap-0.5">
        {[0, 1, 2].map((dot) => (
          <div
            key={dot}
            className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"
            style={{
              animationDelay: `${dot * 0.2}s`,
              animationDuration: '1.4s'
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Typing indicator with sound (optional)
interface TypingIndicatorWithSoundProps extends TypingIndicatorProps {
  enableSound?: boolean
}

export function TypingIndicatorWithSound({ 
  enableSound = false, 
  ...props 
}: TypingIndicatorWithSoundProps) {
  const [audio] = useState<HTMLAudioElement | null>(
    typeof window !== 'undefined' && enableSound 
      ? new Audio('/sounds/typing.mp3') // You'll need to add this sound file
      : null
  )

  useEffect(() => {
    if (audio && enableSound) {
      audio.volume = 0.3
    }
  }, [audio, enableSound])

  useEffect(() => {
    if (audio && enableSound) {
      // Play typing sound when typing starts
      const playSound = () => {
        if (audio.paused) {
          audio.currentTime = 0
          audio.play().catch(() => {
            // Ignore audio play errors
          })
        }
      }

      // You can add sound logic here when typing events are received
      return () => {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [audio, enableSound])

  return <TypingIndicator {...props} />
}

// Hook for managing typing indicators
export function useTypingIndicator(threadId: string, userId: string) {
  const [typingUsers, setTypingUsers] = useState<Array<{
    user_id: string
    user_name: string
    is_typing: boolean
    timestamp: string
  }>>([])
  const [isTyping, setIsTyping] = useState(false)

  const startTyping = useCallback(() => {
    setIsTyping(true)
    // In a real implementation, this would emit a typing event
    console.log('Started typing in thread:', threadId)
  }, [threadId])

  const stopTyping = useCallback(() => {
    setIsTyping(false)
    // In a real implementation, this would emit a stop typing event
    console.log('Stopped typing in thread:', threadId)
  }, [threadId])

  const updateTypingUsers = useCallback((users: Array<{
    user_id: string
    user_name: string
    is_typing: boolean
    timestamp: string
  }>) => {
    setTypingUsers(users)
  }, [])

  return {
    typingUsers,
    isTyping,
    startTyping,
    stopTyping,
    updateTypingUsers
  }
} 