import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/services/LoggingService'

// =====================================================
// REAL-TIME MESSAGING SERVICE
// =====================================================

export interface TypingEvent {
  userId: string
  threadId: string
  isTyping: boolean
  timestamp: string
}

export interface ReadReceipt {
  messageId: string
  userId: string
  readAt: string
  threadId: string
}

export interface MessageUpdate {
  id: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  updatedAt: string
  readReceipts?: ReadReceipt[]
}

export interface ThreadUpdate {
  id: string
  lastMessageAt: string
  unreadCount: number
  lastMessage?: {
    id: string
    content: string
    senderId: string
    timestamp: string
  }
}

export interface RealtimeEvent {
  type: 'message' | 'typing' | 'read_receipt' | 'thread_update' | 'presence'
  data: any
  timestamp: string
}

export interface PresenceUpdate {
  userId: string
  status: 'online' | 'offline' | 'away'
  lastSeen: string
  threadId?: string
}

export class RealtimeMessagingService {
  private supabase: any
  private channels: Map<string, any> = new Map()
  private subscriptions: Map<string, any> = new Map()
  private eventListeners: Map<string, Set<Function>> = new Map()
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 1000
  private isConnected: boolean = false
  private heartbeatInterval: NodeJS.Timeout | null = null
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    this.supabase = null
    this.initializeService()
  }

  // =====================================================
  // INITIALIZATION
  // =====================================================

  isSupported(): boolean {
    return typeof window !== 'undefined' && 
           typeof navigator !== 'undefined' && 
           'serviceWorker' in navigator &&
           'Notification' in window
  }

  private async initializeService() {
    try {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      this.setupHeartbeat()
      this.setupReconnection()
    } catch (error) {
      logger.error('Failed to initialize realtime messaging service', error)
    }
  }

  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.sendHeartbeat()
      }
    }, 30000) // 30 seconds
  }

  private setupReconnection() {
    // Listen for connection state changes
    this.supabase?.realtime.on('disconnected', () => {
      this.isConnected = false
      this.handleDisconnection()
    })

    this.supabase?.realtime.on('connected', () => {
      this.isConnected = true
      this.reconnectAttempts = 0
      this.resubscribeToChannels()
    })
  }

  // =====================================================
  // CONNECTION MANAGEMENT
  // =====================================================

  async connect(userId: string): Promise<void> {
    try {
      if (this.isConnected) {
        logger.info('Already connected to realtime service')
        return
      }

      // Connect to Supabase realtime
      await this.supabase.realtime.connect()
      this.isConnected = true
      this.reconnectAttempts = 0

      // Subscribe to user's presence channel
      await this.subscribeToPresence(userId)

      logger.info('Connected to realtime messaging service', { userId })
    } catch (error) {
      logger.error('Failed to connect to realtime service', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    try {
      // Clear all subscriptions
      this.subscriptions.forEach(subscription => {
        subscription.unsubscribe()
      })
      this.subscriptions.clear()

      // Clear all channels
      this.channels.forEach(channel => {
        channel.unsubscribe()
      })
      this.channels.clear()

      // Disconnect from Supabase realtime
      await this.supabase.realtime.disconnect()
      this.isConnected = false

      // Clear heartbeat
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval)
        this.heartbeatInterval = null
      }

      logger.info('Disconnected from realtime messaging service')
    } catch (error) {
      logger.error('Failed to disconnect from realtime service', error)
    }
  }

  private async handleDisconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      logger.info(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)
      
      setTimeout(async () => {
        try {
          await this.supabase.realtime.connect()
        } catch (error) {
          logger.error('Reconnection failed', error)
        }
      }, delay)
    } else {
      logger.error('Max reconnection attempts reached')
    }
  }

  private async resubscribeToChannels() {
    // Resubscribe to all previously active channels
    for (const [channelName, channel] of this.channels) {
      try {
        // Recreate the channel subscription
        const threadId = channelName.replace('thread:', '')
        await this.subscribeToThread(threadId, 'current-user') // We'll need to get the actual user ID
      } catch (error) {
        logger.error(`Failed to resubscribe to channel: ${channelName}`, error)
      }
    }
  }

  private sendHeartbeat() {
    // Send heartbeat to keep connection alive
    try {
      this.supabase.realtime.send({
        type: 'heartbeat',
        payload: { timestamp: new Date().toISOString() }
      })
    } catch (error) {
      logger.error('Failed to send heartbeat', error)
    }
  }

  // =====================================================
  // CHANNEL SUBSCRIPTIONS
  // =====================================================

  async subscribeToThread(threadId: string, userId: string): Promise<void> {
    try {
      const channelName = `thread:${threadId}`
      
      if (this.channels.has(channelName)) {
        logger.info(`Already subscribed to thread: ${threadId}`)
        return
      }

      const channel = this.supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`
        }, (payload: any) => {
          this.handleMessageChange(payload, threadId)
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'message_read_receipts',
          filter: `thread_id=eq.${threadId}`
        }, (payload: any) => {
          this.handleReadReceiptChange(payload, threadId)
        })
        .on('broadcast', { event: 'typing' }, (payload: any) => {
          this.handleTypingEvent(payload, threadId)
        })
        .on('presence', { event: 'sync' }, () => {
          this.handlePresenceSync(threadId)
        })
        .on('presence', { event: 'join' }, (key: string, newPresence: any) => {
          this.handlePresenceJoin(key, newPresence, threadId)
        })
        .on('presence', { event: 'leave' }, (key: string, leftPresence: any) => {
          this.handlePresenceLeave(key, leftPresence, threadId)
        })

      await channel.subscribe()
      this.channels.set(channelName, channel)

      // Track user presence in this thread
      await this.trackPresence(threadId, userId, 'online')

      logger.info(`Subscribed to thread: ${threadId}`)
    } catch (error) {
      logger.error(`Failed to subscribe to thread: ${threadId}`, error)
      throw error
    }
  }

  async unsubscribeFromThread(threadId: string, userId: string): Promise<void> {
    try {
      const channelName = `thread:${threadId}`
      const channel = this.channels.get(channelName)

      if (channel) {
        // Remove user presence from this thread
        await this.removePresence(threadId, userId)
        
        // Unsubscribe from channel
        await channel.unsubscribe()
        this.channels.delete(channelName)
        
        logger.info(`Unsubscribed from thread: ${threadId}`)
      }
    } catch (error) {
      logger.error(`Failed to unsubscribe from thread: ${threadId}`, error)
    }
  }

  private async subscribeToPresence(userId: string): Promise<void> {
    try {
      const channelName = `presence:${userId}`
      
      const channel = this.supabase
        .channel(channelName)
        .on('presence', { event: 'sync' }, () => {
          this.handleGlobalPresenceSync(userId)
        })

      await channel.subscribe()
      this.channels.set(channelName, channel)
      
      logger.info(`Subscribed to presence for user: ${userId}`)
    } catch (error) {
      logger.error(`Failed to subscribe to presence for user: ${userId}`, error)
    }
  }

  // =====================================================
  // TYPING INDICATORS
  // =====================================================

  async sendTypingIndicator(threadId: string, userId: string, isTyping: boolean): Promise<void> {
    try {
      const channelName = `thread:${threadId}`
      const channel = this.channels.get(channelName)

      if (channel) {
        // Clear existing typing timeout
        const timeoutKey = `${threadId}:${userId}`
        if (this.typingTimeouts.has(timeoutKey)) {
          clearTimeout(this.typingTimeouts.get(timeoutKey)!)
        }

        // Send typing indicator
        await channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            userId,
            threadId,
            isTyping,
            timestamp: new Date().toISOString()
          }
        })

        // Auto-clear typing indicator after 5 seconds
        if (isTyping) {
          const timeout = setTimeout(() => {
            this.sendTypingIndicator(threadId, userId, false)
          }, 5000)
          this.typingTimeouts.set(timeoutKey, timeout)
        } else {
          this.typingTimeouts.delete(timeoutKey)
        }

        logger.debug(`Sent typing indicator: ${isTyping}`, { threadId, userId })
      }
    } catch (error) {
      logger.error('Failed to send typing indicator', error)
    }
  }

  private handleTypingEvent(payload: any, threadId: string): void {
    try {
      const typingEvent: TypingEvent = {
        userId: payload.userId,
        threadId: payload.threadId,
        isTyping: payload.isTyping,
        timestamp: payload.timestamp
      }

      // Emit typing event to listeners
      this.emitEvent('typing', typingEvent)
    } catch (error) {
      logger.error('Failed to handle typing event', error)
    }
  }

  // =====================================================
  // READ RECEIPTS
  // =====================================================

  async markMessageAsRead(messageId: string, userId: string, threadId: string): Promise<void> {
    try {
      // Update database
      const { error } = await this.supabase
        .from('message_read_receipts')
        .upsert({
          message_id: messageId,
          user_id: userId,
          thread_id: threadId,
          read_at: new Date().toISOString()
        })

      if (error) {
        throw error
      }

      // Update message status
      await this.supabase
        .from('messages')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', messageId)

      // Send read receipt to other participants
      await this.broadcastReadReceipt(messageId, userId, threadId)

      logger.info(`Marked message as read: ${messageId}`, { userId, threadId })
    } catch (error) {
      logger.error('Failed to mark message as read', error)
      throw error
    }
  }

  private async broadcastReadReceipt(messageId: string, userId: string, threadId: string): Promise<void> {
    try {
      const channelName = `thread:${threadId}`
      const channel = this.channels.get(channelName)

      if (channel) {
        await channel.send({
          type: 'broadcast',
          event: 'read_receipt',
          payload: {
            messageId,
            userId,
            threadId,
            readAt: new Date().toISOString()
          }
        })
      }
    } catch (error) {
      logger.error('Failed to broadcast read receipt', error)
    }
  }

  private handleReadReceiptChange(payload: any, threadId: string): void {
    try {
      const readReceipt: ReadReceipt = {
        messageId: payload.new?.message_id || payload.old?.message_id,
        userId: payload.new?.user_id || payload.old?.user_id,
        readAt: payload.new?.read_at || payload.old?.read_at,
        threadId
      }

      // Emit read receipt event to listeners
      this.emitEvent('read_receipt', readReceipt)
    } catch (error) {
      logger.error('Failed to handle read receipt change', error)
    }
  }

  // =====================================================
  // PRESENCE TRACKING
  // =====================================================

  private async trackPresence(threadId: string, userId: string, status: 'online' | 'offline' | 'away'): Promise<void> {
    try {
      const channelName = `thread:${threadId}`
      const channel = this.channels.get(channelName)

      if (channel) {
        await channel.track({
          userId,
          status,
          threadId,
          lastSeen: new Date().toISOString()
        })
      }
    } catch (error) {
      logger.error('Failed to track presence', error)
    }
  }

  private async removePresence(threadId: string, userId: string): Promise<void> {
    try {
      const channelName = `thread:${threadId}`
      const channel = this.channels.get(channelName)

      if (channel) {
        await channel.untrack()
      }
    } catch (error) {
      logger.error('Failed to remove presence', error)
    }
  }

  private handlePresenceSync(threadId: string): void {
    try {
      const channel = this.channels.get(`thread:${threadId}`)
      if (channel) {
        const presence = channel.presenceState()
        this.emitEvent('presence', { threadId, presence })
      }
    } catch (error) {
      logger.error('Failed to handle presence sync', error)
    }
  }

  private handlePresenceJoin(key: string, newPresence: any, threadId: string): void {
    try {
      const presenceUpdate: PresenceUpdate = {
        userId: newPresence.userId,
        status: 'online',
        lastSeen: new Date().toISOString(),
        threadId
      }

      this.emitEvent('presence', presenceUpdate)
    } catch (error) {
      logger.error('Failed to handle presence join', error)
    }
  }

  private handlePresenceLeave(key: string, leftPresence: any, threadId: string): void {
    try {
      const presenceUpdate: PresenceUpdate = {
        userId: leftPresence.userId,
        status: 'offline',
        lastSeen: new Date().toISOString(),
        threadId
      }

      this.emitEvent('presence', presenceUpdate)
    } catch (error) {
      logger.error('Failed to handle presence leave', error)
    }
  }

  private handleGlobalPresenceSync(userId: string): void {
    try {
      // Handle global presence updates
      this.emitEvent('presence', { userId, type: 'global_sync' })
    } catch (error) {
      logger.error('Failed to handle global presence sync', error)
    }
  }

  // =====================================================
  // MESSAGE HANDLING
  // =====================================================

  private handleMessageChange(payload: any, threadId: string): void {
    try {
      if (payload.eventType === 'INSERT') {
        // New message
        this.emitEvent('message', {
          type: 'new',
          message: payload.new,
          threadId
        })
      } else if (payload.eventType === 'UPDATE') {
        // Message update
        const messageUpdate: MessageUpdate = {
          id: payload.new.id,
          status: payload.new.status,
          updatedAt: payload.new.updated_at,
          readReceipts: payload.new.read_receipts
        }

        this.emitEvent('message', {
          type: 'update',
          update: messageUpdate,
          threadId
        })
      } else if (payload.eventType === 'DELETE') {
        // Message deleted
        this.emitEvent('message', {
          type: 'delete',
          messageId: payload.old.id,
          threadId
        })
      }
    } catch (error) {
      logger.error('Failed to handle message change', error)
    }
  }

  // =====================================================
  // EVENT SYSTEM
  // =====================================================

  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          logger.error(`Error in event listener for ${event}`, error)
        }
      })
    }
  }

  // =====================================================
  // PUSH NOTIFICATIONS
  // =====================================================

  async requestNotificationPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        logger.warn('Notifications not supported in this browser')
        return false
      }

      if (Notification.permission === 'granted') {
        return true
      }

      if (Notification.permission === 'denied') {
        logger.warn('Notification permission denied')
        return false
      }

      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      logger.error('Failed to request notification permission', error)
      return false
    }
  }

  async sendPushNotification(title: string, options: NotificationOptions): Promise<void> {
    try {
      if (Notification.permission === 'granted') {
        new Notification(title, options)
      }
    } catch (error) {
      logger.error('Failed to send push notification', error)
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  isConnectedToThread(threadId: string): boolean {
    return this.channels.has(`thread:${threadId}`)
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }

  getActiveChannels(): string[] {
    return Array.from(this.channels.keys())
  }

  async cleanup(): Promise<void> {
    await this.disconnect()
    this.eventListeners.clear()
    this.typingTimeouts.clear()
  }
}

// =====================================================
// GLOBAL INSTANCE
// =====================================================

export const realtimeMessaging = new RealtimeMessagingService()

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

export const subscribeToThread = (threadId: string, userId: string) =>
  realtimeMessaging.subscribeToThread(threadId, userId)

export const unsubscribeFromThread = (threadId: string, userId: string) =>
  realtimeMessaging.unsubscribeFromThread(threadId, userId)

export const sendTypingIndicator = (threadId: string, userId: string, isTyping: boolean) =>
  realtimeMessaging.sendTypingIndicator(threadId, userId, isTyping)

export const markMessageAsRead = (messageId: string, userId: string, threadId: string) =>
  realtimeMessaging.markMessageAsRead(messageId, userId, threadId)

export const requestNotificationPermission = () =>
  realtimeMessaging.requestNotificationPermission()

export const sendPushNotification = (title: string, options: NotificationOptions) =>
  realtimeMessaging.sendPushNotification(title, options) 