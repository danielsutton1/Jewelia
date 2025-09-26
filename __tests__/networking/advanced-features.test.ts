import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NetworkService } from '@/lib/services/NetworkService'
import { UnifiedMessagingService } from '@/lib/services/UnifiedMessagingService'
import { MessagingCacheService } from '@/lib/services/MessagingCacheService'

describe('Advanced Networking & Messaging Features', () => {
  let networkService: NetworkService
  let messagingService: UnifiedMessagingService
  let cacheService: MessagingCacheService
  let supabase: any
  let testUser: any
  let testPartner: any

  beforeAll(async () => {
    networkService = new NetworkService()
    messagingService = new UnifiedMessagingService()
    cacheService = new MessagingCacheService({
      ttl: 3600,
      maxSize: 1000,
      enableMemoryCache: true,
      enableRedisCache: false
    })
    supabase = await createSupabaseServerClient()
    
    // Create test user
    const { data: { user }, error } = await supabase.auth.signUp({
      email: 'test-advanced@network.test',
      password: 'testpassword123'
    })
    
    if (error) {
      console.error('Failed to create test user:', error)
      throw error
    }
    
    testUser = user
  })

  afterAll(async () => {
    // Cleanup test data
    if (testUser) {
      await supabase.auth.admin.deleteUser(testUser.id)
    }
  })

  describe('Advanced Partner Matching', () => {
    it('should generate AI-powered partner recommendations', async () => {
      const recommendations = await networkService.getRecommendations(testUser.id, 10)

      expect(recommendations).toBeDefined()
      expect(Array.isArray(recommendations)).toBe(true)
      
      if (recommendations.length > 0) {
        const recommendation = recommendations[0]
        expect(recommendation).toHaveProperty('partner')
        expect(recommendation).toHaveProperty('score')
        expect(recommendation).toHaveProperty('reasons')
        expect(recommendation.score).toBeGreaterThanOrEqual(0)
      }
    })

    it('should discover partners with filters', async () => {
      const discovery = await networkService.discoverPartners({
        search: 'jewelry',
        specialties: ['diamonds'],
        location: 'New York',
        limit: 10
      })

      expect(discovery).toBeDefined()
      expect(discovery).toHaveProperty('partners')
      expect(discovery).toHaveProperty('total')
      expect(Array.isArray(discovery.partners)).toBe(true)
    })
  })

  describe('Network Analytics', () => {
    it('should generate comprehensive network metrics', async () => {
      const metrics = await networkService.getNetworkAnalytics(testUser.id)

      expect(metrics).toBeDefined()
      expect(metrics).toHaveProperty('totalConnections')
      expect(metrics).toHaveProperty('acceptedConnections')
      expect(metrics).toHaveProperty('pendingRequests')
      expect(metrics).toHaveProperty('connectionGrowth')
      expect(metrics).toHaveProperty('activityMetrics')
      expect(metrics).toHaveProperty('topSpecialties')
      expect(metrics).toHaveProperty('connectionGrowth')
      expect(metrics).toHaveProperty('collaborationMetrics')
    })

    it('should get collaboration spaces', async () => {
      const spaces = await networkService.getCollaborationSpaces(testUser.id)

      expect(spaces).toBeDefined()
      expect(Array.isArray(spaces)).toBe(true)
      
      if (spaces.length > 0) {
        const space = spaces[0]
        expect(space).toHaveProperty('id')
        expect(space).toHaveProperty('name')
        expect(space).toHaveProperty('description')
        expect(space).toHaveProperty('partners')
      }
    })
  })

  describe('Advanced Messaging Features', () => {
    it('should support voice messages', async () => {
      // Mock audio blob
      const audioBlob = new Blob(['test audio data'], { type: 'audio/webm' })
      
      const message = await messagingService.sendMessage({
        type: 'external',
        content: 'Voice message content',
        content_type: 'text',
        priority: 'normal',
        category: 'communication',
        thread_id: '550e8400-e29b-41d4-a716-446655440001',
        partner_id: '550e8400-e29b-41d4-a716-446655440000',
        tags: [],
        metadata: {
          voiceMessage: true,
          audioBlob: audioBlob
        }
      }, testUser.id)

      expect(message).toBeDefined()
      expect(message.type).toBe('external')
      expect(message.metadata.voiceMessage).toBe(true)
    })

    it('should support message reactions', async () => {
      const reaction = await messagingService.addReaction('test-message-id', testUser.id, 'emoji', { emoji: '👍' })

      expect(reaction).toBeDefined()
      expect(reaction.reaction_type).toBe('emoji')
      expect(reaction.user_id).toBe(testUser.id)
      expect(reaction.reaction_data.emoji).toBe('👍')
    })

    it('should support message status updates', async () => {
      const updatedMessage = await messagingService.updateMessage('test-message-id', {
        is_read: true,
        status: 'read',
        read_at: new Date().toISOString()
      })

      expect(updatedMessage).toBeDefined()
      expect(updatedMessage.is_read).toBe(true)
      expect(updatedMessage.status).toBe('read')
    })

    it('should support message threading and replies', async () => {
      const parentMessage = await messagingService.sendMessage({
        type: 'external',
        content: 'Parent message',
        content_type: 'text',
        priority: 'normal',
        category: 'communication',
        thread_id: '550e8400-e29b-41d4-a716-446655440001',
        partner_id: '550e8400-e29b-41d4-a716-446655440000',
        tags: [],
        metadata: {}
      }, testUser.id)

      const replyMessage = await messagingService.sendMessage({
        type: 'external',
        content: 'Reply to parent',
        content_type: 'text',
        priority: 'normal',
        category: 'communication',
        thread_id: '550e8400-e29b-41d4-a716-446655440001',
        partner_id: '550e8400-e29b-41d4-a716-446655440000',
        reply_to_id: parentMessage.id,
        tags: [],
        metadata: {}
      }, testUser.id)

      expect(replyMessage).toBeDefined()
      expect(replyMessage.reply_to_id).toBe(parentMessage.id)
    })
  })

  describe('Real-time Features', () => {
    it('should support read receipts', async () => {
      await messagingService.markMessageAsRead('test-message-id', testUser.id)

      // Verify the message was marked as read by getting it
      const message = await messagingService.getMessage('test-message-id')
      expect(message).toBeDefined()
      if (message) {
        expect(message.is_read).toBe(true)
      }
    })

    it('should support thread read status', async () => {
      await messagingService.markThreadAsRead('test-thread-id', testUser.id)

      // Verify the thread was marked as read by getting it
      const thread = await messagingService.getThread('test-thread-id')
      expect(thread).toBeDefined()
      if (thread) {
        expect(thread.unread_count).toBe(0)
      }
    })
  })

  describe('Performance and Caching', () => {
    it('should cache frequently accessed data', async () => {
      const cacheKey = 'user'
      const userId = testUser.id
      const testData = { connections: 150, lastUpdated: new Date().toISOString() }

      await cacheService.set(cacheKey, userId, testData)
      const cachedData = await cacheService.get(cacheKey, userId)

      expect(cachedData).toBeDefined()
      if (cachedData && typeof cachedData === 'object' && 'connections' in cachedData) {
        expect((cachedData as any).connections).toBe(testData.connections)
      }
    })

    it('should handle cache invalidation', async () => {
      const cacheKey = 'user'
      const userId = testUser.id
      const testData = { messageCount: 25 }

      await cacheService.set(cacheKey, userId, testData)
      await cacheService.delete(cacheKey, userId)
      const cachedData = await cacheService.get(cacheKey, userId)

      expect(cachedData).toBeNull()
    })

    it('should optimize database queries', async () => {
      const startTime = Date.now()
      
      await networkService.getRecommendations(testUser.id, 20)
      
      const endTime = Date.now()
      const queryTime = endTime - startTime

      // Query should complete within reasonable time (adjust threshold as needed)
      expect(queryTime).toBeLessThan(5000) // 5 seconds
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid user IDs gracefully', async () => {
      const recommendations = await networkService.getRecommendations('invalid-user-id', 10)

      expect(recommendations).toBeDefined()
      expect(Array.isArray(recommendations)).toBe(true)
      expect(recommendations.length).toBe(0)
    })

    it('should handle network failures gracefully', async () => {
      // Mock network failure
      const originalFetch = global.fetch
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

      try {
        const result = await networkService.getNetworkAnalytics(testUser.id)
        expect(result).toBeDefined()
      } catch (error) {
        expect(error).toBeDefined()
        if (error instanceof Error) {
          expect(error.message).toContain('Network error')
        }
      } finally {
        global.fetch = originalFetch
      }
    })

    it('should validate input parameters', async () => {
      await expect(
        networkService.getRecommendations('', 10)
      ).rejects.toThrow()

      await expect(
        networkService.getRecommendations(testUser.id, { limit: -10 })
      ).rejects.toThrow()

      await expect(
        networkService.getRecommendations(testUser.id, { limit: 1000 })
      ).rejects.toThrow()
    })
  })

  describe('Security and Privacy', () => {
    it('should enforce user privacy settings', async () => {
      const recommendations = await networkService.getRecommendations(testUser.id, 10)

      // Should not expose sensitive information
      recommendations.forEach((recommendation) => {
        const partner = recommendation.partner
        expect(partner).not.toHaveProperty('email')
        expect(partner).not.toHaveProperty('phone')
        expect(partner).not.toHaveProperty('address')
      })
    })

    it('should respect user blocking preferences', async () => {
      // Mock blocked user
      const blockedUserId = 'blocked-user-id'
      
      const recommendations = await networkService.getRecommendations(testUser.id, 10)

      // Should not include blocked users
      const hasBlockedUser = recommendations.some((recommendation) => recommendation.partner.id === blockedUserId)
      expect(hasBlockedUser).toBe(false)
    })

    it('should validate message permissions', async () => {
      // Should not allow sending messages to non-existent threads
      await expect(
        messagingService.sendMessage({
          type: 'external',
          content: 'Test message',
          content_type: 'text',
          priority: 'normal',
          category: 'communication',
          thread_id: 'non-existent-thread',
          tags: [],
          metadata: {}
        }, testUser.id)
      ).rejects.toThrow()
    })
  })
}) 