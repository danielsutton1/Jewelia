import { Message, MessageThread, MessageNotification } from './UnifiedMessagingService'

export interface CacheConfig {
  ttl: number // Time to live in seconds
  maxSize: number // Maximum number of items in cache
  enableMemoryCache: boolean
  enableRedisCache: boolean
  redisUrl?: string
}

export interface CacheStats {
  hits: number
  misses: number
  size: number
  memoryUsage: number
}

export class MessagingCacheService {
  private memoryCache: Map<string, { data: any; timestamp: number; ttl: number }>
  private redisClient: any
  private config: CacheConfig
  private stats: CacheStats

  constructor(config: CacheConfig) {
    this.config = config
    this.memoryCache = new Map()
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      memoryUsage: 0
    }
    
    this.initializeRedis()
  }

  private async initializeRedis() {
    if (this.config.enableRedisCache && this.config.redisUrl) {
      try {
        const Redis = await import('ioredis')
        this.redisClient = new Redis.default(this.config.redisUrl)
        console.log('Redis cache initialized')
      } catch (error) {
        console.warn('Redis cache initialization failed:', error)
        this.config.enableRedisCache = false
      }
    }
  }

  private generateKey(prefix: string, id: string): string {
    return `${prefix}:${id}`
  }

  private isExpired(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp > ttl * 1000
  }

  private cleanupMemoryCache() {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, value] of this.memoryCache.entries()) {
      if (this.isExpired(value.timestamp, value.ttl)) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => this.memoryCache.delete(key))

    // Remove oldest entries if cache is too large
    if (this.memoryCache.size > this.config.maxSize) {
      const entries = Array.from(this.memoryCache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toRemove = entries.slice(0, entries.length - this.config.maxSize)
      toRemove.forEach(([key]) => this.memoryCache.delete(key))
    }

    this.stats.size = this.memoryCache.size
    this.stats.memoryUsage = process.memoryUsage().heapUsed
  }

  async get<T>(prefix: string, id: string): Promise<T | null> {
    const key = this.generateKey(prefix, id)

    // Try memory cache first
    if (this.config.enableMemoryCache) {
      const memoryItem = this.memoryCache.get(key)
      if (memoryItem && !this.isExpired(memoryItem.timestamp, memoryItem.ttl)) {
        this.stats.hits++
        return memoryItem.data as T
      }
    }

    // Try Redis cache
    if (this.config.enableRedisCache && this.redisClient) {
      try {
        const redisData = await this.redisClient.get(key)
        if (redisData) {
          this.stats.hits++
          const data = JSON.parse(redisData)
          
          // Store in memory cache for faster subsequent access
          if (this.config.enableMemoryCache) {
            this.memoryCache.set(key, {
              data,
              timestamp: Date.now(),
              ttl: this.config.ttl
            })
          }
          
          return data as T
        }
      } catch (error) {
        console.warn('Redis get error:', error)
      }
    }

    this.stats.misses++
    return null
  }

  async set<T>(prefix: string, id: string, data: T, ttl?: number): Promise<void> {
    const key = this.generateKey(prefix, id)
    const cacheTtl = ttl || this.config.ttl

    // Store in memory cache
    if (this.config.enableMemoryCache) {
      this.memoryCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: cacheTtl
      })
      this.cleanupMemoryCache()
    }

    // Store in Redis cache
    if (this.config.enableRedisCache && this.redisClient) {
      try {
        await this.redisClient.setex(key, cacheTtl, JSON.stringify(data))
      } catch (error) {
        console.warn('Redis set error:', error)
      }
    }
  }

  async delete(prefix: string, id: string): Promise<void> {
    const key = this.generateKey(prefix, id)

    // Remove from memory cache
    if (this.config.enableMemoryCache) {
      this.memoryCache.delete(key)
      this.stats.size = this.memoryCache.size
    }

    // Remove from Redis cache
    if (this.config.enableRedisCache && this.redisClient) {
      try {
        await this.redisClient.del(key)
      } catch (error) {
        console.warn('Redis delete error:', error)
      }
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    // Clear memory cache entries matching pattern
    if (this.config.enableMemoryCache) {
      const keysToDelete: string[] = []
      for (const key of this.memoryCache.keys()) {
        if (key.includes(pattern)) {
          keysToDelete.push(key)
        }
      }
      keysToDelete.forEach(key => this.memoryCache.delete(key))
      this.stats.size = this.memoryCache.size
    }

    // Clear Redis cache entries matching pattern
    if (this.config.enableRedisCache && this.redisClient) {
      try {
        const keys = await this.redisClient.keys(pattern)
        if (keys.length > 0) {
          await this.redisClient.del(...keys)
        }
      } catch (error) {
        console.warn('Redis pattern invalidation error:', error)
      }
    }
  }

  // Message-specific cache methods
  async getMessage(messageId: string): Promise<Message | null> {
    return this.get<Message>('message', messageId)
  }

  async setMessage(messageId: string, message: Message): Promise<void> {
    await this.set('message', messageId, message, 300) // 5 minutes TTL
  }

  async getThread(threadId: string): Promise<MessageThread | null> {
    return this.get<MessageThread>('thread', threadId)
  }

  async setThread(threadId: string, thread: MessageThread): Promise<void> {
    await this.set('thread', threadId, thread, 600) // 10 minutes TTL
  }

  async getThreadMessages(threadId: string): Promise<Message[] | null> {
    return this.get<Message[]>('thread_messages', threadId)
  }

  async setThreadMessages(threadId: string, messages: Message[]): Promise<void> {
    await this.set('thread_messages', threadId, messages, 300) // 5 minutes TTL
  }

  async getNotifications(userId: string): Promise<MessageNotification[] | null> {
    return this.get<MessageNotification[]>('notifications', userId)
  }

  async setNotifications(userId: string, notifications: MessageNotification[]): Promise<void> {
    await this.set('notifications', userId, notifications, 180) // 3 minutes TTL
  }

  // Invalidation methods for real-time updates
  async invalidateMessage(messageId: string): Promise<void> {
    await this.delete('message', messageId)
    // Also invalidate thread messages since they might include this message
    await this.invalidatePattern('thread_messages:*')
  }

  async invalidateThread(threadId: string): Promise<void> {
    await this.delete('thread', threadId)
    await this.delete('thread_messages', threadId)
  }

  async invalidateUserNotifications(userId: string): Promise<void> {
    await this.delete('notifications', userId)
  }

  // Cache statistics
  getStats(): CacheStats {
    return { ...this.stats }
  }

  async clearAll(): Promise<void> {
    // Clear memory cache
    if (this.config.enableMemoryCache) {
      this.memoryCache.clear()
      this.stats.size = 0
    }

    // Clear Redis cache
    if (this.config.enableRedisCache && this.redisClient) {
      try {
        await this.redisClient.flushall()
      } catch (error) {
        console.warn('Redis flush error:', error)
      }
    }

    // Reset stats
    this.stats.hits = 0
    this.stats.misses = 0
    this.stats.memoryUsage = 0
  }

  async disconnect(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit()
    }
  }
}

// Default cache configuration
export const defaultCacheConfig: CacheConfig = {
  ttl: 300, // 5 minutes
  maxSize: 1000,
  enableMemoryCache: true,
  enableRedisCache: false,
  redisUrl: process.env.REDIS_URL
}

// Singleton instance
let cacheService: MessagingCacheService | null = null

export function getMessagingCacheService(config?: CacheConfig): MessagingCacheService {
  if (!cacheService) {
    cacheService = new MessagingCacheService(config || defaultCacheConfig)
  }
  return cacheService
} 
// Initialize cache service
export const messagingCache = getMessagingCacheService() 