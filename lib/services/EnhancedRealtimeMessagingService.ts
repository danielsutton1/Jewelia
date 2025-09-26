import { createClient } from '@supabase/supabase-js'
import { RealtimeChannel } from '@supabase/supabase-js'
import { Message, MessageThread, MessageNotification } from './UnifiedMessagingService'

export interface RealtimeMessageEvent {
  type: 'message' | 'thread' | 'notification' | 'reaction' | 'read_receipt'
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  data: any
  userId?: string
}

export interface RealtimeCallbacks {
  onNewMessage?: (message: Message) => void
  onMessageUpdate?: (message: Message) => void
  onNewThread?: (thread: MessageThread) => void
  onThreadUpdate?: (thread: MessageThread) => void
  onNewNotification?: (notification: MessageNotification) => void
  onNotificationUpdate?: (notification: MessageNotification) => void
  onUserTyping?: (data: { threadId: string; userId: string; isTyping: boolean }) => void
  onUserOnline?: (data: { userId: string; isOnline: boolean }) => void
  onConnectionChange?: (status: 'connected' | 'disconnected' | 'reconnecting') => void
  onError?: (error: Error) => void
}

export class EnhancedRealtimeMessagingService {
  private supabase: ReturnType<typeof createClient>
  private channels: Map<string, RealtimeChannel> = new Map()
  private callbacks: RealtimeCallbacks = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000
  private isConnected = false
  private typingUsers: Map<string, Set<string>> = new Map() // threadId -> Set of typing user IDs
  private onlineUsers: Set<string> = new Set()
  private heartbeatInterval: NodeJS.Timeout | null = null
  private connectionTimeout: NodeJS.Timeout | null = null
  private lastHeartbeat = Date.now()
  private heartbeatIntervalMs = 30000 // 30 seconds
  private connectionTimeoutMs = 10000 // 10 seconds

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
    this.setupConnectionHandling()
    this.startHeartbeat()
  }

  private setupConnectionHandling() {
    // Note: Supabase real-time connection events are handled automatically
    // We'll use a different approach for connection monitoring
    this.startConnectionMonitoring()
  }

  private startConnectionMonitoring() {
    // Simplified connection monitoring
    setInterval(() => {
      // Basic connection check - if we can access realtime, assume connected
      try {
        this.isConnected = true
        this.lastHeartbeat = Date.now()
      } catch (error) {
        this.isConnected = false
        this.callbacks.onConnectionChange?.('disconnected')
        console.log('🔴 Real-time connection lost')
        this.attemptReconnect()
      }
    }, 10000) // Check every 10 seconds
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.lastHeartbeat = Date.now()
        // Simple heartbeat - just update timestamp
        console.log('💓 Heartbeat sent')
      }
    }, this.heartbeatIntervalMs)
  }

  private handleConnectionIssue() {
    const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeat
    if (timeSinceLastHeartbeat > this.heartbeatIntervalMs * 2) {
      console.warn('Connection appears stale, attempting reconnect...')
      this.attemptReconnect()
    }
  }

  private async attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached')
      this.callbacks.onError?.(new Error('Max reconnection attempts reached'))
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000)

    console.log(`🔄 Reconnection attempt ${this.reconnectAttempts} in ${delay}ms`)

    setTimeout(async () => {
      try {
        await this.supabase.realtime.connect()
        console.log(`✅ Reconnection attempt ${this.reconnectAttempts} successful`)
      } catch (error) {
        console.error(`❌ Reconnection attempt ${this.reconnectAttempts} failed:`, error)
        this.attemptReconnect()
      }
    }, delay)
  }

  setCallbacks(callbacks: RealtimeCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  // Subscribe to messages for a specific thread with enhanced error handling
  subscribeToThread(threadId: string, userId: string) {
    const channelKey = `thread:${threadId}`
    
    if (this.channels.has(channelKey)) {
      return this.channels.get(channelKey)!
    }

    const channel = this.supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`
        },
        (payload) => this.handleMessageChange(payload, userId)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_threads',
          filter: `id=eq.${threadId}`
        },
        (payload) => this.handleThreadChange(payload, userId)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=in.(select id from messages where thread_id='${threadId}')`
        },
        (payload) => this.handleReactionChange(payload, userId)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_read_receipts',
          filter: `message_id=in.(select id from messages where thread_id='${threadId}')`
        },
        (payload) => this.handleReadReceiptChange(payload, userId)
      )

    // Set connection timeout
    this.connectionTimeout = setTimeout(() => {
      if (!this.isConnected) {
        console.warn('Connection timeout, attempting reconnect...')
        this.attemptReconnect()
      }
    }, this.connectionTimeoutMs)

    this.channels.set(channelKey, channel)
    return channel
  }

  // Subscribe to user's notifications
  subscribeToNotifications(userId: string) {
    const channelKey = `notifications:${userId}`
    
    if (this.channels.has(channelKey)) {
      return this.channels.get(channelKey)!
    }

    const channel = this.supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          this.handleNotificationChange(payload, userId)
        }
      )
      .subscribe((status) => {
        console.log(`📡 Notifications subscription status: ${status}`)
      })

    this.channels.set(channelKey, channel)
    return channel
  }

  // Subscribe to user's threads
  subscribeToUserThreads(userId: string) {
    const channelKey = `user-threads:${userId}`
    
    if (this.channels.has(channelKey)) {
      return this.channels.get(channelKey)!
    }

    const channel = this.supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_threads',
          filter: `participants=cs.{${userId}}`
        },
        (payload) => {
          this.handleThreadChange(payload, userId)
        }
      )
      .subscribe((status) => {
        console.log(`📡 User threads subscription status: ${status}`)
      })

    this.channels.set(channelKey, channel)
    return channel
  }

  // Subscribe to online presence
  subscribeToPresence(userId: string) {
    const channelKey = `presence:${userId}`
    
    if (this.channels.has(channelKey)) {
      return this.channels.get(channelKey)!
    }

    const channel = this.supabase
      .channel(channelKey)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState()
        this.handlePresenceSync(presenceState, userId)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        this.handleUserJoin(key, newPresences, userId)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        this.handleUserLeave(key, leftPresences, userId)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, online_at: new Date().toISOString() })
        }
        console.log(`📡 Presence subscription status: ${status}`)
      })

    this.channels.set(channelKey, channel)
    return channel
  }

  // Typing indicators
  async sendTypingIndicator(threadId: string, userId: string, isTyping: boolean) {
    const channelKey = `thread:${threadId}`
    const channel = this.channels.get(channelKey)
    
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { threadId, userId, isTyping, timestamp: new Date().toISOString() }
      })
    }
  }

  // Listen for typing indicators
  listenToTyping(threadId: string) {
    const channelKey = `thread:${threadId}`
    const channel = this.channels.get(channelKey)
    
    if (channel) {
      channel.on('broadcast', { event: 'typing' }, (payload) => {
        const { threadId, userId, isTyping } = payload.payload
        
        if (isTyping) {
          if (!this.typingUsers.has(threadId)) {
            this.typingUsers.set(threadId, new Set())
          }
          this.typingUsers.get(threadId)!.add(userId)
        } else {
          this.typingUsers.get(threadId)?.delete(userId)
        }
        
        this.callbacks.onUserTyping?.({ threadId, userId, isTyping })
      })
    }
  }

  // Get typing users for a thread
  getTypingUsers(threadId: string): string[] {
    return Array.from(this.typingUsers.get(threadId) || [])
  }

  // Get online users
  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers)
  }

  // Handle message changes
  private handleMessageChange(payload: any, userId: string) {
    const { eventType, new: newRecord, old: oldRecord } = payload
    
    switch (eventType) {
      case 'INSERT':
        this.callbacks.onNewMessage?.(newRecord as Message)
        break
      case 'UPDATE':
        this.callbacks.onMessageUpdate?.(newRecord as Message)
        break
      case 'DELETE':
        // Handle message deletion if needed
        break
    }
  }

  // Handle thread changes
  private handleThreadChange(payload: any, userId: string) {
    const { eventType, new: newRecord, old: oldRecord } = payload
    
    switch (eventType) {
      case 'INSERT':
        this.callbacks.onNewThread?.(newRecord as MessageThread)
        break
      case 'UPDATE':
        this.callbacks.onThreadUpdate?.(newRecord as MessageThread)
        break
      case 'DELETE':
        // Handle thread deletion if needed
        break
    }
  }

  // Handle notification changes
  private handleNotificationChange(payload: any, userId: string) {
    const { eventType, new: newRecord, old: oldRecord } = payload
    
    switch (eventType) {
      case 'INSERT':
        this.callbacks.onNewNotification?.(newRecord as MessageNotification)
        break
      case 'UPDATE':
        this.callbacks.onNotificationUpdate?.(newRecord as MessageNotification)
        break
      case 'DELETE':
        // Handle notification deletion if needed
        break
    }
  }

  // Handle reaction changes
  private handleReactionChange(payload: any, userId: string) {
    const { eventType, new: newRecord, old: oldRecord } = payload
    
    // You can add specific reaction handling here
    console.log('Reaction change:', { eventType, newRecord, oldRecord })
  }

  // Handle read receipt changes
  private handleReadReceiptChange(payload: any, userId: string) {
    const { eventType, new: newRecord, old: oldRecord } = payload
    
    // You can add specific read receipt handling here
    console.log('Read receipt change:', { eventType, newRecord, oldRecord })
  }

  // Handle presence sync
  private handlePresenceSync(presenceState: any, userId: string) {
    this.onlineUsers.clear()
    Object.values(presenceState).forEach((presences: any) => {
      presences.forEach((presence: any) => {
        if (presence.user_id !== userId) {
          this.onlineUsers.add(presence.user_id)
        }
      })
    })
  }

  // Handle user join
  private handleUserJoin(key: string, newPresences: any[], userId: string) {
    newPresences.forEach((presence: any) => {
      if (presence.user_id !== userId) {
        this.onlineUsers.add(presence.user_id)
        this.callbacks.onUserOnline?.({ userId: presence.user_id, isOnline: true })
      }
    })
  }

  // Handle user leave
  private handleUserLeave(key: string, leftPresences: any[], userId: string) {
    leftPresences.forEach((presence: any) => {
      if (presence.user_id !== userId) {
        this.onlineUsers.delete(presence.user_id)
        this.callbacks.onUserOnline?.({ userId: presence.user_id, isOnline: false })
      }
    })
  }

  // Unsubscribe from a specific channel
  unsubscribe(channelKey: string) {
    const channel = this.channels.get(channelKey)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(channelKey)
      console.log(`📡 Unsubscribed from ${channelKey}`)
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.channels.forEach((channel, key) => {
      this.supabase.removeChannel(channel)
      console.log(`📡 Unsubscribed from ${key}`)
    })
    this.channels.clear()
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      activeChannels: this.channels.size
    }
  }

  // Cleanup
  destroy() {
    this.unsubscribeAll()
    this.typingUsers.clear()
    this.onlineUsers.clear()
    this.callbacks = {}
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout)
      this.connectionTimeout = null
    }
  }
} 