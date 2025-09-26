import { logger } from '@/lib/services/LoggingService'

// =====================================================
// PUSH NOTIFICATION SERVICE
// =====================================================

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  requireInteraction?: boolean
  silent?: boolean
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  vibrate?: number[]
  sound?: string
  dir?: 'auto' | 'ltr' | 'rtl'
  lang?: string
  renotify?: boolean
  sticky?: boolean
}

export interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

export interface NotificationSettings {
  enabled: boolean
  sound: boolean
  vibration: boolean
  showPreview: boolean
  quietHours: {
    enabled: boolean
    start: string // HH:mm format
    end: string // HH:mm format
  }
  categories: {
    messages: boolean
    mentions: boolean
    calls: boolean
    system: boolean
  }
}

export class PushNotificationService {
  private _isSupported: boolean = false
  private permission: NotificationPermission
  private settings: NotificationSettings
  private notificationQueue: Array<{ options: NotificationOptions; timestamp: number }> = []
  private isProcessingQueue: boolean = false
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null

  constructor() {
    this._isSupported = this.checkSupport()
    this.permission = this.getPermissionStatus()
    this.settings = this.getDefaultSettings()
    this.loadSettings()
    // Initialize service worker asynchronously
    this.initializeServiceWorker().catch(error => {
      logger.error('Failed to initialize service worker:', error)
    })
  }

  // =====================================================
  // INITIALIZATION
  // =====================================================

  private checkSupport(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator
  }

  private getPermissionStatus(): NotificationPermission {
    if (!this._isSupported) {
      return { granted: false, denied: false, default: false }
    }

    switch (window.Notification.permission) {
      case 'granted':
        return { granted: true, denied: false, default: false }
      case 'denied':
        return { granted: false, denied: true, default: false }
      default:
        return { granted: false, denied: false, default: true }
    }
  }

  private getDefaultSettings(): NotificationSettings {
    return {
      enabled: true,
      sound: true,
      vibration: true,
      showPreview: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      categories: {
        messages: true,
        mentions: true,
        calls: true,
        system: true
      }
    }
  }

  private loadSettings(): void {
    try {
      const savedSettings = localStorage.getItem('notificationSettings')
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) }
      }
    } catch (error) {
      logger.error('Failed to load notification settings', error)
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(this.settings))
    } catch (error) {
      logger.error('Failed to save notification settings', error)
    }
  }

  private async initializeServiceWorker(): Promise<void> {
    if (!this._isSupported) return

    try {
      // Register service worker for push notifications
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js')
      
      // Listen for service worker updates
      this.serviceWorkerRegistration.addEventListener('updatefound', () => {
        const newWorker = this.serviceWorkerRegistration!.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              this.showUpdateNotification()
            }
          })
        }
      })

      logger.info('Service worker registered for push notifications')
    } catch (error) {
      logger.error('Failed to register service worker', error)
    }
  }

  // =====================================================
  // PERMISSION MANAGEMENT
  // =====================================================

  async requestPermission(): Promise<boolean> {
    if (!this._isSupported) {
      logger.warn('Push notifications not supported in this browser')
      return false
    }

    if (this.permission.granted) {
      return true
    }

    if (this.permission.denied) {
      logger.warn('Notification permission denied by user')
      return false
    }

    try {
      const permission = await window.Notification.requestPermission()
      this.permission = this.getPermissionStatus()
      
      if (this.permission.granted) {
        logger.info('Notification permission granted')
        this.subscribeToPushNotifications()
        return true
      } else {
        logger.warn('Notification permission denied')
        return false
      }
    } catch (error) {
      logger.error('Failed to request notification permission', error)
      return false
    }
  }

  private async subscribeToPushNotifications(): Promise<void> {
    if (!this.serviceWorkerRegistration || !this.permission.granted) return

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
      })

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)
      
      logger.info('Subscribed to push notifications')
    } catch (error) {
      logger.error('Failed to subscribe to push notifications', error)
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: 'current-user-id' // Get from auth context
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send subscription to server')
      }
    } catch (error) {
      logger.error('Failed to send subscription to server', error)
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // =====================================================
  // NOTIFICATION DISPLAY
  // =====================================================

  async showNotification(options: NotificationOptions): Promise<void> {
    // Check current permission status, not cached
    const currentPermission = this.getPermissionStatus()
    if (!this._isSupported || !currentPermission.granted) {
      // Queue notification for later
      this.queueNotification(options)
      return
    }

    if (!this.shouldShowNotification(options)) {
      return
    }

    try {
      // Create and show notification
      const notification = new window.Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/badge.png',
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        dir: options.dir || 'auto',
        lang: options.lang || 'en',
      })

      // Handle notification events
      this.setupNotificationEventHandlers(notification)

      // Log notification
      logger.info('Notification displayed', { title: options.title, body: options.body })

      // Process queued notifications
      this.processNotificationQueue()
    } catch (error) {
      logger.error('Failed to show notification', error)
      // Queue notification for later
      this.queueNotification(options)
    }
  }

  private shouldShowNotification(options: NotificationOptions): boolean {
    if (!this.settings.enabled) return false

    // Check quiet hours
    if (this.settings.quietHours.enabled && this.isInQuietHours()) {
      return false
    }

    // Check category settings
    if (options.data?.category) {
      const category = options.data.category as keyof typeof this.settings.categories
      if (!this.settings.categories[category]) {
        return false
      }
    }

    return true
  }

  private isInQuietHours(): boolean {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [startHour, startMinute] = this.settings.quietHours.start.split(':').map(Number)
    const [endHour, endMinute] = this.settings.quietHours.end.split(':').map(Number)
    
    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime
    }
  }

  private setupNotificationEventHandlers(notification: Notification): void {
    notification.addEventListener('click', (event) => {
      this.handleNotificationClick(notification, event)
    })

    notification.addEventListener('close', () => {
      this.handleNotificationClose(notification)
    })

    notification.addEventListener('show', () => {
      this.handleNotificationShow(notification)
    })

    notification.addEventListener('error', (event) => {
      this.handleNotificationError(notification, event)
    })
  }

  private handleNotificationClick(notification: Notification, event: Event): void {
    // Handle notification click
    if (notification.data?.url) {
      window.open(notification.data.url, '_blank')
    }
    
    // Focus window if it exists
    if (window.focus) {
      window.focus()
    }
    
    notification.close()
    
    logger.info('Notification clicked', { title: notification.title })
  }

  private handleNotificationClose(notification: Notification): void {
    logger.info('Notification closed', { title: notification.title })
  }

  private handleNotificationShow(notification: Notification): void {
    logger.info('Notification shown', { title: notification.title })
  }

  private handleNotificationError(notification: Notification, event: Event): void {
    logger.error('Notification error', { title: notification.title, error: event })
  }

  // =====================================================
  // NOTIFICATION QUEUE
  // =====================================================

  private queueNotification(options: NotificationOptions): void {
    this.notificationQueue.push({
      options,
      timestamp: Date.now()
    })

    // Process queue after a delay
    if (!this.isProcessingQueue) {
      setTimeout(() => this.processNotificationQueue(), 1000)
    }
  }

  private async processNotificationQueue(): Promise<void> {
    if (this.isProcessingQueue || this.notificationQueue.length === 0) return

    this.isProcessingQueue = true

    while (this.notificationQueue.length > 0) {
      const queuedNotification = this.notificationQueue.shift()
      if (queuedNotification) {
        try {
          await this.showNotification(queuedNotification.options)
        } catch (error) {
          logger.error('Failed to process queued notification', error)
        }
      }
    }

    this.isProcessingQueue = false
  }

  // =====================================================
  // SPECIALIZED NOTIFICATIONS
  // =====================================================

  async showMessageNotification(senderName: string, message: string, threadId: string): Promise<void> {
    await this.showNotification({
      title: `New message from ${senderName}`,
      body: this.settings.showPreview ? message : 'You have a new message',
      icon: '/icons/message.png',
      tag: `message-${threadId}`,
      data: {
        type: 'message',
        threadId,
        category: 'messages'
      },
      requireInteraction: false,
      silent: false
    })
  }

  async showMentionNotification(mentionerName: string, message: string, threadId: string): Promise<void> {
    await this.showNotification({
      title: `${mentionerName} mentioned you`,
      body: this.settings.showPreview ? message : 'You were mentioned in a conversation',
      icon: '/icons/mention.png',
      tag: `mention-${threadId}`,
      data: {
        type: 'mention',
        threadId,
        category: 'mentions'
      },
      requireInteraction: true,
      silent: false
    })
  }

  async showCallNotification(callerName: string, callType: 'voice' | 'video'): Promise<void> {
    await this.showNotification({
      title: `Incoming ${callType} call`,
      body: `${callerName} is calling you`,
      icon: `/icons/${callType}-call.png`,
      tag: `call-${callerName}`,
      data: {
        type: 'call',
        callerName,
        callType,
        category: 'calls'
      },
      requireInteraction: true,
      silent: false,
      actions: [
        {
          action: 'answer',
          title: 'Answer',
          icon: '/icons/answer.png'
        },
        {
          action: 'decline',
          title: 'Decline',
          icon: '/icons/decline.png'
        }
      ]
    })
  }

  async showSystemNotification(title: string, message: string, priority: 'low' | 'normal' | 'high' = 'normal'): Promise<void> {
    await this.showNotification({
      title,
      body: message,
      icon: '/icons/system.png',
      tag: `system-${Date.now()}`,
      data: {
        type: 'system',
        priority,
        category: 'system'
      },
      requireInteraction: priority === 'high',
      silent: priority === 'low'
    })
  }

  // =====================================================
  // SETTINGS MANAGEMENT
  // =====================================================

  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
    logger.info('Notification settings updated', newSettings)
  }

  getSettings(): NotificationSettings {
    return { ...this.settings }
  }

  resetSettings(): void {
    this.settings = this.getDefaultSettings()
    this.saveSettings()
    logger.info('Notification settings reset to defaults')
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  isPermissionGranted(): boolean {
    return this.permission.granted
  }

  isPermissionDenied(): boolean {
    return this.permission.denied
  }

  isPermissionDefault(): boolean {
    return this.permission.default
  }

  isSupported(): boolean {
    return this._isSupported
  }

  getPermissionStatusPublic(): NotificationPermission {
    return { ...this.permission }
  }

  private showUpdateNotification(): void {
    this.showNotification({
      title: 'App Update Available',
      body: 'A new version is available. Click to update.',
      icon: '/icons/update.png',
      tag: 'app-update',
      data: {
        type: 'update',
        category: 'system'
      },
      requireInteraction: true,
      actions: [
        {
          action: 'update',
          title: 'Update Now',
          icon: '/icons/update.png'
        }
      ]
    })
  }

  // =====================================================
  // CLEANUP
  // =====================================================

  async cleanup(): Promise<void> {
    // Clear notification queue
    this.notificationQueue = []
    this.isProcessingQueue = false

    // Close all open notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      // Note: There's no direct API to close all notifications
      // They will close automatically or when clicked
    }

    logger.info('Push notification service cleaned up')
  }
}

// =====================================================
// GLOBAL INSTANCE
// =====================================================

export const pushNotifications = new PushNotificationService()

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

export const showNotification = (options: NotificationOptions) =>
  pushNotifications.showNotification(options)

export const showMessageNotification = (senderName: string, message: string, threadId: string) =>
  pushNotifications.showMessageNotification(senderName, message, threadId)

export const showMentionNotification = (mentionerName: string, message: string, threadId: string) =>
  pushNotifications.showMentionNotification(mentionerName, message, threadId)

export const showCallNotification = (callerName: string, callType: 'voice' | 'video') =>
  pushNotifications.showCallNotification(callerName, callType)

export const showSystemNotification = (title: string, message: string, priority?: 'low' | 'normal' | 'high') =>
  pushNotifications.showSystemNotification(title, message, priority)

export const requestNotificationPermission = () =>
  pushNotifications.requestPermission()

export const updateNotificationSettings = (settings: Partial<NotificationSettings>) =>
  pushNotifications.updateSettings(settings)

export const getNotificationSettings = () =>
  pushNotifications.getSettings()
