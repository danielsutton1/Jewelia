import { useEffect, useRef, useState, useCallback } from 'react'
import { EnhancedRealtimeMessagingService, RealtimeCallbacks } from '@/lib/services/EnhancedRealtimeMessagingService'
import { Message, MessageThread, MessageNotification } from '@/lib/services/UnifiedMessagingService'

interface UseRealtimeMessagingOptions {
  userId?: string
  threadId?: string
  autoConnect?: boolean
  onNewMessage?: (message: Message) => void
  onMessageUpdate?: (message: Message) => void
  onNewThread?: (thread: MessageThread) => void
  onThreadUpdate?: (thread: MessageThread) => void
  onNewNotification?: (notification: MessageNotification) => void
  onNotificationUpdate?: (notification: MessageNotification) => void
  onUserTyping?: (data: { threadId: string; userId: string; isTyping: boolean }) => void
  onUserOnline?: (data: { userId: string; isOnline: boolean }) => void
  onConnectionChange?: (status: 'connected' | 'disconnected' | 'reconnecting') => void
}

interface RealtimeMessagingState {
  isConnected: boolean
  isConnecting: boolean
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting'
  typingUsers: string[]
  onlineUsers: string[]
  error: string | null
}

export function useRealtimeMessaging(options: UseRealtimeMessagingOptions = {}) {
  const {
    userId,
    threadId,
    autoConnect = true,
    onNewMessage,
    onMessageUpdate,
    onNewThread,
    onThreadUpdate,
    onNewNotification,
    onNotificationUpdate,
    onUserTyping,
    onUserOnline,
    onConnectionChange
  } = options

  const serviceRef = useRef<EnhancedRealtimeMessagingService | null>(null)
  const [state, setState] = useState<RealtimeMessagingState>({
    isConnected: false,
    isConnecting: false,
    connectionStatus: 'disconnected',
    typingUsers: [],
    onlineUsers: [],
    error: null
  })

  // Initialize the real-time service
  const initializeService = useCallback(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setState(prev => ({ ...prev, error: 'Missing Supabase configuration' }))
      return null
    }

    const service = new EnhancedRealtimeMessagingService(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Set up callbacks
    const callbacks: RealtimeCallbacks = {
      onNewMessage,
      onMessageUpdate,
      onNewThread,
      onThreadUpdate,
      onNewNotification,
      onNotificationUpdate,
      onUserTyping: (data) => {
        onUserTyping?.(data)
        // Update typing users state
        setState(prev => ({
          ...prev,
          typingUsers: service.getTypingUsers(data.threadId)
        }))
      },
      onUserOnline: (data) => {
        onUserOnline?.(data)
        // Update online users state
        setState(prev => ({
          ...prev,
          onlineUsers: service.getOnlineUsers()
        }))
      },
      onConnectionChange: (status) => {
        onConnectionChange?.(status)
        setState(prev => ({
          ...prev,
          connectionStatus: status,
          isConnected: status === 'connected',
          isConnecting: status === 'reconnecting'
        }))
      }
    }

    service.setCallbacks(callbacks)
    return service
  }, [onNewMessage, onMessageUpdate, onNewThread, onThreadUpdate, onNewNotification, onNotificationUpdate, onUserTyping, onUserOnline, onConnectionChange])

  // Connect to real-time services
  const connect = useCallback(async () => {
    if (!userId) {
      setState(prev => ({ ...prev, error: 'User ID is required' }))
      return
    }

    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }))

      const service = initializeService()
      if (!service) return

      serviceRef.current = service

      // Subscribe to user's threads
      service.subscribeToUserThreads(userId)

      // Subscribe to notifications
      service.subscribeToNotifications(userId)

      // Subscribe to presence
      service.subscribeToPresence(userId)

      // Subscribe to specific thread if provided
      if (threadId) {
        service.subscribeToThread(threadId, userId)
        service.listenToTyping(threadId)
      }

      setState(prev => ({
        ...prev,
        isConnecting: false,
        typingUsers: service.getTypingUsers(threadId || ''),
        onlineUsers: service.getOnlineUsers()
      }))

    } catch (error) {
      console.error('Failed to connect to real-time messaging:', error)
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect'
      }))
    }
  }, [userId, threadId, initializeService])

  // Disconnect from real-time services
  const disconnect = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.unsubscribeAll()
      serviceRef.current.destroy()
      serviceRef.current = null
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      connectionStatus: 'disconnected',
      typingUsers: [],
      onlineUsers: []
    }))
  }, [])

  // Subscribe to a specific thread
  const subscribeToThread = useCallback((newThreadId: string) => {
    if (!serviceRef.current || !userId) return

    serviceRef.current.subscribeToThread(newThreadId, userId)
    serviceRef.current.listenToTyping(newThreadId)

    setState(prev => ({
      ...prev,
      typingUsers: serviceRef.current!.getTypingUsers(newThreadId)
    }))
  }, [userId])

  // Unsubscribe from a specific thread
  const unsubscribeFromThread = useCallback((threadId: string) => {
    if (!serviceRef.current) return

    serviceRef.current.unsubscribe(`thread:${threadId}`)
  }, [])

  // Send typing indicator
  const sendTypingIndicator = useCallback(async (isTyping: boolean) => {
    if (!serviceRef.current || !userId || !threadId) return

    await serviceRef.current.sendTypingIndicator(threadId, userId, isTyping)
  }, [userId, threadId])

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    return serviceRef.current?.getConnectionStatus() || {
      isConnected: false,
      reconnectAttempts: 0,
      activeChannels: 0
    }
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && userId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, userId, connect, disconnect])

  // Re-subscribe when threadId changes
  useEffect(() => {
    if (serviceRef.current && userId && threadId) {
      // Unsubscribe from previous thread
      if (threadId) {
        serviceRef.current.subscribeToThread(threadId, userId)
        serviceRef.current.listenToTyping(threadId)
      }

      setState(prev => ({
        ...prev,
        typingUsers: serviceRef.current!.getTypingUsers(threadId)
      }))
    }
  }, [threadId, userId])

  return {
    // State
    ...state,
    
    // Actions
    connect,
    disconnect,
    subscribeToThread,
    unsubscribeFromThread,
    sendTypingIndicator,
    getConnectionStatus,
    
    // Service reference (for advanced usage)
    service: serviceRef.current
  }
} 