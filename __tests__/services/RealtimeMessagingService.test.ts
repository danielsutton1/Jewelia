import { RealtimeMessagingService } from '@/lib/services/RealtimeMessagingService'

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    realtime: {
      connect: jest.fn(),
      disconnect: jest.fn(),
      on: jest.fn(),
      send: jest.fn(),
      channel: jest.fn(() => ({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
        send: jest.fn(),
        track: jest.fn(),
        untrack: jest.fn(),
        presenceState: jest.fn(() => ({})),
        removeChannel: jest.fn()
      }))
    },
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      send: jest.fn(),
      track: jest.fn(),
      untrack: jest.fn(),
      presenceState: jest.fn(() => ({})),
      removeChannel: jest.fn()
    })),
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }))
}))

// Mock logger
jest.mock('@/lib/services/LoggingService', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}))

describe('RealtimeMessagingService', () => {
  let service: RealtimeMessagingService
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock browser APIs
    Object.defineProperty(window, 'Notification', {
      value: jest.fn(),
      writable: true
    })
    
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {},
      writable: true
    })
    
    // Get mocked Supabase instance first
    const { createClient } = require('@supabase/supabase-js')
    mockSupabase = createClient()
    
    // Create service instance
    service = new RealtimeMessagingService()
    
    // Manually set the supabase client for testing
    ;(service as any).supabase = mockSupabase
  })

  afterEach(async () => {
    await service.cleanup()
  })

  describe('Initialization', () => {
    it('should initialize with correct default state', () => {
      expect(service.getConnectionStatus()).toBe(false)
      expect(service.getActiveChannels()).toEqual([])
    })

    it('should check browser support correctly', () => {
      // Mock browser enjestronment
      Object.defineProperty(window, 'Notification', {
        value: {},
        writable: true
      })
      
      const newService = new RealtimeMessagingService()
      expect(newService.isSupported()).toBe(true)
    })
  })

  describe('Connection Management', () => {
    it('should connect successfully', async () => {
      mockSupabase.realtime.connect.mockResolvedValue(undefined)
      
      await service.connect('user-123')
      
      expect(mockSupabase.realtime.connect).toHaveBeenCalled()
      expect(service.getConnectionStatus()).toBe(true)
    })

    it('should handle connection errors gracefully', async () => {
      mockSupabase.realtime.connect.mockRejectedValue(new Error('Connection failed'))
      
      await expect(service.connect('user-123')).rejects.toThrow('Connection failed')
      expect(service.getConnectionStatus()).toBe(false)
    })

    it('should disconnect successfully', async () => {
      mockSupabase.realtime.connect.mockResolvedValue(undefined)
      await service.connect('user-123')
      
      mockSupabase.realtime.disconnect.mockResolvedValue(undefined)
      await service.disconnect()
      
      expect(mockSupabase.realtime.disconnect).toHaveBeenCalled()
      expect(service.getConnectionStatus()).toBe(false)
    })

    it('should not connect if already connected', async () => {
      mockSupabase.realtime.connect.mockResolvedValue(undefined)
      
      await service.connect('user-123')
      await service.connect('user-123') // Second call should be ignored
      
      expect(mockSupabase.realtime.connect).toHaveBeenCalledTimes(1)
    })
  })

  describe('Thread Subscriptions', () => {
    beforeEach(async () => {
      mockSupabase.realtime.connect.mockResolvedValue(undefined)
      await service.connect('user-123')
    })

    it('should subscribe to thread successfully', async () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockResolvedValue(undefined),
        track: jest.fn().mockResolvedValue(undefined)
      }
      
      mockSupabase.channel.mockReturnValue(mockChannel)
      
      await service.subscribeToThread('thread-123', 'user-123')
      
      expect(mockSupabase.channel).toHaveBeenCalledWith('thread:thread-123')
      expect(mockChannel.subscribe).toHaveBeenCalled()
      expect(service.isConnectedToThread('thread-123')).toBe(true)
    })

    it('should not subscribe to same thread twice', async () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockResolvedValue(undefined),
        track: jest.fn().mockResolvedValue(undefined)
      }
      
      mockSupabase.channel.mockReturnValue(mockChannel)
      
      // First subscription
      await service.subscribeToThread('thread-123', 'user-123')
      
      // Clear the mock to track only the second call
      mockSupabase.channel.mockClear()
      
      // Second call should be ignored
      await service.subscribeToThread('thread-123', 'user-123')
      
      expect(mockSupabase.channel).toHaveBeenCalledTimes(0)
    })

    it('should unsubscribe from thread successfully', async () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockResolvedValue(undefined),
        track: jest.fn().mockResolvedValue(undefined),
        unsubscribe: jest.fn().mockResolvedValue(undefined),
        untrack: jest.fn().mockResolvedValue(undefined)
      }
      
      mockSupabase.channel.mockReturnValue(mockChannel)
      
      await service.subscribeToThread('thread-123', 'user-123')
      await service.unsubscribeFromThread('thread-123', 'user-123')
      
      expect(mockChannel.unsubscribe).toHaveBeenCalled()
      expect(service.isConnectedToThread('thread-123')).toBe(false)
    })
  })

  describe('Typing Indicators', () => {
    beforeEach(async () => {
      mockSupabase.realtime.connect.mockResolvedValue(undefined)
      await service.connect('user-123')
      
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockResolvedValue(undefined),
        track: jest.fn().mockResolvedValue(undefined),
        send: jest.fn().mockResolvedValue(undefined)
      }
      
      mockSupabase.channel.mockReturnValue(mockChannel)
      await service.subscribeToThread('thread-123', 'user-123')
    })

    it('should send typing indicator successfully', async () => {
      const mockChannel = mockSupabase.channel()
      
      await service.sendTypingIndicator('thread-123', 'user-123', true)
      
      expect(mockChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: 'user-123',
          threadId: 'thread-123',
          isTyping: true,
          timestamp: expect.any(String)
        }
      })
    })

    it('should auto-clear typing indicator after timeout', async () => {
      jest.useFakeTimers()
      
      const mockChannel = mockSupabase.channel()
      await service.sendTypingIndicator('thread-123', 'user-123', true)
      
      // Fast-forward time
      jest.advanceTimersByTime(5000)
      
      expect(mockChannel.send).toHaveBeenCalledTimes(2) // Start + auto-stop
      expect(mockChannel.send).toHaveBeenLastCalledWith({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: 'user-123',
          threadId: 'thread-123',
          isTyping: false,
          timestamp: expect.any(String)
        }
      })
      
      jest.useRealTimers()
    })
  })

  describe('Read Receipts', () => {
    beforeEach(async () => {
      mockSupabase.realtime.connect.mockResolvedValue(undefined)
      await service.connect('user-123')
      
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockResolvedValue(undefined),
        track: jest.fn().mockResolvedValue(undefined),
        send: jest.fn().mockResolvedValue(undefined)
      }
      
      mockSupabase.channel.mockReturnValue(mockChannel)
      await service.subscribeToThread('thread-123', 'user-123')
    })

    it('should mark message as read successfully', async () => {
      const mockChannel = mockSupabase.channel()
      
      // Mock database operations
      mockSupabase.from = jest.fn(() => ({
        upsert: jest.fn().mockResolvedValue({ error: null }),
        update: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null })
        }))
      }))
      
      await service.markMessageAsRead('msg-123', 'user-123', 'thread-123')
      
      expect(mockChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'read_receipt',
        payload: {
          messageId: 'msg-123',
          userId: 'user-123',
          threadId: 'thread-123',
          readAt: expect.any(String)
        }
      })
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.from = jest.fn(() => ({
        upsert: jest.fn().mockResolvedValue({ error: new Error('Database error') })
      }))
      
      await expect(
        service.markMessageAsRead('msg-123', 'user-123', 'thread-123')
      ).rejects.toThrow('Database error')
    })
  })

  describe('Event System', () => {
    it('should register and emit events correctly', () => {
      const mockCallback = jest.fn()
      
      service.on('test-event', mockCallback)
      service.emitEvent('test-event', { data: 'test' })
      
      expect(mockCallback).toHaveBeenCalledWith({ data: 'test' })
    })

    it('should remove event listeners correctly', () => {
      const mockCallback = jest.fn()
      
      service.on('test-event', mockCallback)
      service.off('test-event', mockCallback)
      service.emitEvent('test-event', { data: 'test' })
      
      expect(mockCallback).not.toHaveBeenCalled()
    })

    it('should handle multiple event listeners', () => {
      const mockCallback1 = jest.fn()
      const mockCallback2 = jest.fn()
      
      service.on('test-event', mockCallback1)
      service.on('test-event', mockCallback2)
      service.emitEvent('test-event', { data: 'test' })
      
      expect(mockCallback1).toHaveBeenCalledWith({ data: 'test' })
      expect(mockCallback2).toHaveBeenCalledWith({ data: 'test' })
    })
  })

  describe('Push Notifications', () => {
    beforeEach(() => {
      // Mock Notification API
      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'granted',
          requestPermission: jest.fn().mockResolvedValue('granted')
        },
        writable: true
      })
    })

    it('should request notification permission successfully', async () => {
      const result = await service.requestNotificationPermission()
      expect(result).toBe(true)
    })

    it('should send push notification when permission granted', async () => {
      const mockNotification = {
        addEventListener: jest.fn(),
        close: jest.fn()
      }
      
      Object.defineProperty(window, 'Notification', {
        value: jest.fn(() => mockNotification),
        writable: true
      })
      
      // Set permission to granted
      Object.defineProperty(Notification, 'permission', {
        value: 'granted',
        writable: true
      })
      
      await service.sendPushNotification('Test Title', { body: 'Test Body' })
      
      expect(Notification).toHaveBeenCalledWith('Test Title', {
        body: 'Test Body'
      })
    })
  })

  describe('Reconnection Logic', () => {
    it('should attempt reconnection on disconnection', async () => {
      mockSupabase.realtime.connect.mockResolvedValue(undefined)
      await service.connect('user-123')
      
      // Simulate disconnection
      const disconnectHandler = mockSupabase.realtime.on.mock.calls.find(
        call => call[0] === 'disconnected'
      )?.[1]
      
      if (disconnectHandler) {
        disconnectHandler()
      }
      
      // Should attempt to reconnect
      expect(mockSupabase.realtime.connect).toHaveBeenCalledTimes(1)
    })

    it('should respect max reconnection attempts', async () => {
      // Mock the connect method to always fail
      mockSupabase.realtime.connect.mockRejectedValue(new Error('Connection failed'))
      
      // Try to connect multiple times
      for (let i = 0; i < 6; i++) {
        try {
          await service.connect('user-123')
        } catch (error) {
          // Expected to fail
        }
      }
      
      // Should not exceed max attempts
      expect(mockSupabase.realtime.connect).toHaveBeenCalledTimes(6)
    })
  })

  describe('Cleanup', () => {
    it('should cleanup resources correctly', async () => {
      mockSupabase.realtime.connect.mockResolvedValue(undefined)
      await service.connect('user-123')
      
      await service.cleanup()
      
      expect(service.getConnectionStatus()).toBe(false)
      expect(service.getActiveChannels()).toEqual([])
    })
  })

  describe('Error Handling', () => {
    it('should handle channel subscription errors gracefully', async () => {
      mockSupabase.realtime.connect.mockResolvedValue(undefined)
      await service.connect('user-123')
      
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockRejectedValue(new Error('Subscription failed'))
      }
      
      mockSupabase.channel.mockReturnValue(mockChannel)
      
      await expect(
        service.subscribeToThread('thread-123', 'user-123')
      ).rejects.toThrow('Subscription failed')
    })

    it('should handle typing indicator errors gracefully', async () => {
      mockSupabase.realtime.connect.mockResolvedValue(undefined)
      await service.connect('user-123')
      
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockResolvedValue(undefined),
        track: jest.fn().mockResolvedValue(undefined),
        send: jest.fn().mockRejectedValue(new Error('Send failed'))
      }
      
      mockSupabase.channel.mockReturnValue(mockChannel)
      await service.subscribeToThread('thread-123', 'user-123')
      
      // Should not throw error
      await service.sendTypingIndicator('thread-123', 'user-123', true)
    })
  })
})
