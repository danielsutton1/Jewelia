import { createClient } from '@supabase/supabase-js'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'message' | 'mention' | 'system' | 'alert'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'unread' | 'read' | 'archived'
  related_id?: string // ID of related message, order, etc.
  related_type?: 'message' | 'order' | 'design' | 'customer'
  created_at: string
  read_at?: string
  metadata?: Record<string, any>
}

export interface NotificationFilters {
  status?: 'unread' | 'read' | 'archived'
  type?: 'message' | 'mention' | 'system' | 'alert'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  limit?: number
}

export class NotificationService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  private notificationChannel: RealtimeChannel | null = null
  private listeners: Map<string, (notification: Notification) => void> = new Map()

  constructor() {
    this.initializeRealtime()
  }

  private async initializeRealtime() {
    try {
      // Subscribe to notification changes
      this.notificationChannel = this.supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications'
          },
          (payload) => {
            const notification = payload.new as Notification
            this.handleNewNotification(notification)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications'
          },
          (payload) => {
            const notification = payload.new as Notification
            this.handleNotificationUpdate(notification)
          }
        )
        .subscribe()

      console.log('✅ NotificationService: Real-time notifications initialized')
    } catch (error) {
      console.error('❌ NotificationService: Failed to initialize real-time:', error)
    }
  }

  private handleNewNotification(notification: Notification) {
    console.log('🔔 New notification received:', notification)
    
    // Notify all listeners
    this.listeners.forEach((listener) => {
      try {
        listener(notification)
      } catch (error) {
        console.error('Error in notification listener:', error)
      }
    })

    // Show browser notification if permission granted
    this.showBrowserNotification(notification)
  }

  private handleNotificationUpdate(notification: Notification) {
    console.log('🔄 Notification updated:', notification)
    
    // Notify listeners about updates
    this.listeners.forEach((listener) => {
      try {
        listener(notification)
      } catch (error) {
        console.error('Error in notification update listener:', error)
      }
    })
  }

  private async showBrowserNotification(notification: Notification) {
    if (!('Notification' in window)) {
      console.log('Browser notifications not supported')
      return
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent'
      })
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        this.showBrowserNotification(notification)
      }
    }
  }

  // Subscribe to notifications
  subscribe(userId: string, callback: (notification: Notification) => void): string {
    const listenerId = `listener_${Date.now()}_${Math.random()}`
    this.listeners.set(listenerId, callback)
    
    console.log(`✅ NotificationService: Listener ${listenerId} subscribed for user ${userId}`)
    return listenerId
  }

  // Unsubscribe from notifications
  unsubscribe(listenerId: string): boolean {
    const removed = this.listeners.delete(listenerId)
    if (removed) {
      console.log(`✅ NotificationService: Listener ${listenerId} unsubscribed`)
    }
    return removed
  }

  // Get user notifications
  async getUserNotifications(userId: string, filters: NotificationFilters = {}): Promise<Notification[]> {
    try {
      let query = this.supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.type) {
        query = query.eq('type', filters.type)
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user notifications:', error)
      return []
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'unread')

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }

  // Create a new notification
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'message',
    priority: Notification['priority'] = 'normal',
    relatedId?: string,
    relatedType?: string,
    metadata?: Record<string, any>
  ): Promise<Notification | null> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          priority,
          status: 'unread',
          related_id: relatedId,
          related_type: relatedType,
          metadata
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating notification:', error)
      return null
    }
  }

  // Get unread count for a user
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'unread')

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }

  // Cleanup method
  destroy() {
    if (this.notificationChannel) {
      this.supabase.removeChannel(this.notificationChannel)
      this.notificationChannel = null
    }
    this.listeners.clear()
    console.log('✅ NotificationService: Destroyed')
  }
}

// Export singleton instance
export const notificationService = new NotificationService()
