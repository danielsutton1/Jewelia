import { PushNotificationService, NotificationOptions, NotificationSettings } from '@/lib/services/PushNotificationService'

// Mock logger
jest.mock('@/lib/services/LoggingService', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock service worker
const serviceWorkerMock = {
  register: jest.fn().mockResolvedValue({
    addEventListener: jest.fn(),
    installing: null,
    controller: null
  })
}
Object.defineProperty(navigator, 'serviceWorker', {
  value: serviceWorkerMock,
  writable: true
})

// Mock Notification API globally
const mockNotification = {
  addEventListener: jest.fn(),
  close: jest.fn()
}

Object.defineProperty(window, 'Notification', {
  value: jest.fn(() => mockNotification),
  writable: true
})

// Mock Notification.permission
Object.defineProperty(window.Notification, 'permission', {
  value: 'default',
  writable: true
})

// Mock Notification.requestPermission
Object.defineProperty(window.Notification, 'requestPermission', {
  value: jest.fn().mockImplementation(() => {
    // Check current permission state and return accordingly
    const currentPermission = window.Notification.permission
    if (currentPermission === 'denied') {
      return Promise.resolve('denied')
    } else {
      // Update the permission property when called
      Object.defineProperty(window.Notification, 'permission', {
        value: 'granted',
        writable: true
      })
      return Promise.resolve('granted')
    }
  }),
  writable: true
})

describe('PushNotificationService', () => {
  let service: PushNotificationService

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset permission state
    Object.defineProperty(window.Notification, 'permission', {
      value: 'default',
      writable: true
    })
    
    // Create service after mocks are set up
    service = new PushNotificationService()
  })

  afterEach(async () => {
    if (service) {
      await service.cleanup()
    }
  })

  describe('Initialization', () => {
    it('should initialize with correct default settings', () => {
      const settings = service.getSettings()
      
      expect(settings.enabled).toBe(true)
      expect(settings.sound).toBe(true)
      expect(settings.vibration).toBe(true)
      expect(settings.showPreview).toBe(true)
      expect(settings.quietHours.enabled).toBe(false)
      expect(settings.categories.messages).toBe(true)
    })

    it('should load saved settings from localStorage', () => {
      const savedSettings = {
        enabled: false,
        sound: false,
        quietHours: { enabled: true, start: '23:00', end: '07:00' }
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings))
      
      const newService = new PushNotificationService()
      const settings = newService.getSettings()
      
      expect(settings.enabled).toBe(false)
      expect(settings.sound).toBe(false)
      expect(settings.quietHours.enabled).toBe(true)
    })

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      // Should not throw error
      expect(() => new PushNotificationService()).not.toThrow()
    })
  })

  describe('Browser Support Detection', () => {
    it('should detect supported browsers correctly', () => {
      expect(service.isSupported()).toBe(true)
    })

    it('should detect unsupported browsers', () => {
      // Remove Notification API
      delete (window as any).Notification
      
      const newService = new PushNotificationService()
      expect(newService.isPermissionGranted()).toBe(false)
    })
  })

  describe('Permission Management', () => {
    it('should request permission successfully', async () => {
      const result = await service.requestPermission()
      expect(result).toBe(true)
    })

    it('should return true if permission already granted', async () => {
      Object.defineProperty(window.Notification, 'permission', {
        value: 'granted',
        writable: true
      })
      
      const result = await service.requestPermission()
      expect(result).toBe(true)
    })

    it('should return false if permission denied', async () => {
      Object.defineProperty(window.Notification, 'permission', {
        value: 'denied',
        writable: true
      })
      
      const result = await service.requestPermission()
      expect(result).toBe(false)
    })

    it('should handle permission request errors gracefully', async () => {
      Object.defineProperty(window.Notification, 'requestPermission', {
        value: jest.fn().mockRejectedValue(new Error('Permission error')),
        writable: true
      })
      
      const result = await service.requestPermission()
      expect(result).toBe(false)
    })
  })

  describe('Notification Display', () => {
    beforeEach(async () => {
      // Set permission to granted
      Object.defineProperty(window.Notification, 'permission', {
        value: 'granted',
        writable: true
      })
      await service.requestPermission()
    })

    it('should show notification successfully', async () => {
      const options: NotificationOptions = {
        title: 'Test Title',
        body: 'Test Body',
        icon: '/test-icon.png'
      }
      
      await service.showNotification(options)
      
      expect(window.Notification).toHaveBeenCalledWith('Test Title', {
        body: 'Test Body',
        icon: '/test-icon.png',
        badge: '/badge.png',
        tag: undefined,
        data: undefined,
        requireInteraction: false,
        silent: false,
        actions: undefined,
        vibrate: undefined,
        dir: 'auto',
        lang: 'en',
        renotify: false,
        sticky: false
      })
    })

    it('should use default values for missing options', async () => {
      const options: NotificationOptions = {
        title: 'Test Title',
        body: 'Test Body'
      }
      
      await service.showNotification(options)
      
      expect(window.Notification).toHaveBeenCalledWith('Test Title', {
        body: 'Test Body',
        icon: '/favicon.ico',
        badge: '/badge.png',
        tag: undefined,
        data: undefined,
        requireInteraction: false,
        silent: false,
        actions: undefined,
        vibrate: undefined,
        dir: 'auto',
        lang: 'en',
        renotify: false,
        sticky: false
      })
    })

    it('should queue notifications when permission not granted', async () => {
      // Revoke permission
      Object.defineProperty(window.Notification, 'permission', {
        value: 'denied',
        writable: true
      })
      
      const options: NotificationOptions = {
        title: 'Test Title',
        body: 'Test Body'
      }
      
      await service.showNotification(options)
      
      // Should not show notification
      expect(window.Notification).not.toHaveBeenCalled()
    })

    it('should respect quiet hours setting', async () => {
      // Enable quiet hours
      service.updateSettings({
        quietHours: { enabled: true, start: '22:00', end: '08:00' }
      })
      
      // Mock current time to be in quiet hours
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-01T23:00:00Z'))
      
      const options: NotificationOptions = {
        title: 'Test Title',
        body: 'Test Body'
      }
      
      await service.showNotification(options)
      
      // Should not show notification during quiet hours
      expect(window.Notification).not.toHaveBeenCalled()
      
      jest.useRealTimers()
    })

    it('should respect category settings', async () => {
      // Disable message notifications
      service.updateSettings({
        categories: { ...service.getSettings().categories, messages: false }
      })
      
      const options: NotificationOptions = {
        title: 'Test Title',
        body: 'Test Body',
        data: { category: 'messages' }
      }
      
      await service.showNotification(options)
      
      // Should not show notification for disabled category
      expect(window.Notification).not.toHaveBeenCalled()
    })
  })

  describe('Specialized Notifications', () => {
    beforeEach(async () => {
      await service.requestPermission()
    })

    it('should show message notification correctly', async () => {
      await service.showMessageNotification('John Doe', 'Hello there!', 'thread-123')
      
      expect(window.Notification).toHaveBeenCalledWith(
        'New message from John Doe',
        expect.objectContaining({
          body: 'Hello there!',
          tag: 'message-thread-123',
          data: {
            type: 'message',
            threadId: 'thread-123',
            category: 'messages'
          }
        })
      )
    })

    it('should show mention notification correctly', async () => {
      await service.showMentionNotification('Jane Smith', '@you mentioned you', 'thread-456')
      
      expect(window.Notification).toHaveBeenCalledWith(
        'Jane Smith mentioned you',
        expect.objectContaining({
          body: '@you mentioned you',
          tag: 'mention-thread-456',
          data: {
            type: 'mention',
            threadId: 'thread-456',
            category: 'mentions'
          },
          requireInteraction: true
        })
      )
    })

    it('should show call notification correctly', async () => {
      await service.showCallNotification('Bob Wilson', 'voice')
      
      expect(window.Notification).toHaveBeenCalledWith(
        'Incoming voice call',
        expect.objectContaining({
          body: 'Bob Wilson is calling you',
          tag: 'call-Bob Wilson',
          data: {
            type: 'call',
            callerName: 'Bob Wilson',
            callType: 'voice',
            category: 'calls'
          },
          requireInteraction: true,
          actions: [
            { action: 'answer', title: 'Answer', icon: '/icons/answer.png' },
            { action: 'decline', title: 'Decline', icon: '/icons/decline.png' }
          ]
        })
      )
    })

    it('should show system notification correctly', async () => {
      await service.showSystemNotification('Update Available', 'New version ready', 'high')
      
      expect(window.Notification).toHaveBeenCalledWith(
        'Update Available',
        expect.objectContaining({
          body: 'New version ready',
          data: {
            type: 'system',
            priority: 'high',
            category: 'system'
          },
          requireInteraction: true
        })
      )
    })
  })

  describe('Settings Management', () => {
    it('should update settings correctly', () => {
      const newSettings = {
        enabled: false,
        sound: false,
        quietHours: { enabled: true, start: '23:00', end: '07:00' }
      }
      
      service.updateSettings(newSettings)
      const settings = service.getSettings()
      
      expect(settings.enabled).toBe(false)
      expect(settings.sound).toBe(false)
      expect(settings.quietHours.enabled).toBe(true)
      expect(settings.quietHours.start).toBe('23:00')
    })

    it('should save settings to localStorage', () => {
      const newSettings = { enabled: false }
      
      service.updateSettings(newSettings)
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'notificationSettings',
        expect.stringContaining('"enabled":false')
      )
    })

    it('should reset settings to defaults', () => {
      // Change some settings
      service.updateSettings({ enabled: false, sound: false })
      
      // Reset to defaults
      service.resetSettings()
      const settings = service.getSettings()
      
      expect(settings.enabled).toBe(true)
      expect(settings.sound).toBe(true)
    })

    it('should handle localStorage save errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      // Should not throw error
      expect(() => service.updateSettings({ enabled: false })).not.toThrow()
    })
  })

  describe('Notification Queue', () => {
    it('should queue notifications when permission not granted', async () => {
      // Revoke permission
      Object.defineProperty(window.Notification, 'permission', {
        value: 'denied',
        writable: true
      })
      
      const options: NotificationOptions = {
        title: 'Test Title',
        body: 'Test Body'
      }
      
      await service.showNotification(options)
      await service.showNotification({ ...options, title: 'Test Title 2' })
      
      // Should not show any notifications
      expect(window.Notification).not.toHaveBeenCalled()
    })

    it('should process queued notifications when permission granted', async () => {
      // Revoke permission and queue notifications
      Object.defineProperty(window.Notification, 'permission', {
        value: 'denied',
        writable: true
      })
      
      const options: NotificationOptions = {
        title: 'Test Title',
        body: 'Test Body'
      }
      
      await service.showNotification(options)
      
      // Grant permission
      Object.defineProperty(window.Notification, 'permission', {
        value: 'granted',
        writable: true
      })
      
      // Process queue
      await service.showNotification({ ...options, title: 'New Notification' })
      
      // Should show both notifications
      expect(window.Notification).toHaveBeenCalledTimes(2)
    })
  })

  describe('Event Handling', () => {
    beforeEach(async () => {
      await service.requestPermission()
    })

    it('should handle notification click events', async () => {
      const options: NotificationOptions = {
        title: 'Test Title',
        body: 'Test Body',
        data: { url: 'https://example.com' }
      }
      
      await service.showNotification(options)
      
      // Simulate click event
      const clickHandler = mockNotification.addEventListener.mock.calls.find(
        call => call[0] === 'click'
      )?.[1]
      
      if (clickHandler) {
        clickHandler()
      }
      
      expect(mockNotification.close).toHaveBeenCalled()
    })

    it('should handle notification close events', async () => {
      const options: NotificationOptions = {
        title: 'Test Title',
        body: 'Test Body'
      }
      
      await service.showNotification(options)
      
      // Simulate close event
      const closeHandler = mockNotification.addEventListener.mock.calls.find(
        call => call[0] === 'close'
      )?.[1]
      
      if (closeHandler) {
        closeHandler()
      }
      
      // Should not throw error
      expect(closeHandler).toBeDefined()
    })

    it('should handle notification show events', async () => {
      const options: NotificationOptions = {
        title: 'Test Title',
        body: 'Test Body'
      }
      
      await service.showNotification(options)
      
      // Simulate show event
      const showHandler = mockNotification.addEventListener.mock.calls.find(
        call => call[0] === 'show'
      )?.[1]
      
      if (showHandler) {
        showHandler()
      }
      
      // Should not throw error
      expect(showHandler).toBeDefined()
    })

    it('should handle notification error events', async () => {
      const options: NotificationOptions = {
        title: 'Test Title',
        body: 'Test Body'
      }
      
      await service.showNotification(options)
      
      // Simulate error event
      const errorHandler = mockNotification.addEventListener.mock.calls.find(
        call => call[0] === 'error'
      )?.[1]
      
      if (errorHandler) {
        errorHandler(new Error('Test error'))
      }
      
      // Should not throw error
      expect(errorHandler).toBeDefined()
    })
  })

  describe('Service Worker Integration', () => {
    it('should register service worker successfully', async () => {
      expect(serviceWorkerMock.register).toHaveBeenCalledWith('/sw.js')
    })

    it('should handle service worker registration errors gracefully', async () => {
      serviceWorkerMock.register.mockRejectedValue(new Error('Registration failed'))
      
      // Should not throw error
      expect(() => new PushNotificationService()).not.toThrow()
    })
  })

  describe('Cleanup', () => {
    it('should cleanup resources correctly', async () => {
      await service.cleanup()
      
      // Should not throw error
      expect(service.cleanup).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle notification creation errors gracefully', async () => {
      // Mock Notification constructor to throw error
      Object.defineProperty(window, 'Notification', {
        value: jest.fn(() => {
          throw new Error('Notification creation failed')
        }),
        writable: true
      })
      
      const options: NotificationOptions = {
        title: 'Test Title',
        body: 'Test Body'
      }
      
      // Should not throw error
      await expect(service.showNotification(options)).resolves.toBeUndefined()
    })

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      // Should not throw error
      expect(() => service.updateSettings({ enabled: false })).not.toThrow()
    })
  })
})
