// Rate limiting utility for production security

export interface RateLimitConfig {
  limit: number        // Maximum requests per window
  window: number       // Time window in milliseconds
  blockDuration?: number // How long to block IP after limit exceeded
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  blocked: boolean
  blockExpiry?: number
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private blockedIPs: Map<string, number> = new Map()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  getLimit(): number {
    return this.config.limit
  }

  check(identifier: string): RateLimitResult {
    const now = Date.now()
    
    // Check if IP is blocked
    const blockExpiry = this.blockedIPs.get(identifier)
    if (blockExpiry && now < blockExpiry) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: blockExpiry,
        blocked: true,
        blockExpiry
      }
    }

    // Clean up expired block
    if (blockExpiry && now >= blockExpiry) {
      this.blockedIPs.delete(identifier)
    }

    // Get current requests for this identifier
    const requests = this.requests.get(identifier) || []
    const windowStart = now - this.config.window
    
    // Filter requests within the current window
    const recentRequests = requests.filter(timestamp => timestamp > windowStart)
    
    // Check if limit exceeded
    if (recentRequests.length >= this.config.limit) {
      // Block the IP if block duration is configured
      if (this.config.blockDuration) {
        const blockUntil = now + this.config.blockDuration
        this.blockedIPs.set(identifier, blockUntil)
      }
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: windowStart + this.config.window,
        blocked: true,
        blockExpiry: this.config.blockDuration ? now + this.config.blockDuration : undefined
      }
    }

    // Add current request
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)
    
    // Clean up old requests
    this.cleanup()
    
    return {
      allowed: true,
      remaining: this.config.limit - recentRequests.length,
      resetTime: windowStart + this.config.window,
      blocked: false
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const cutoff = now - this.config.window
    
    // Clean up expired requests
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > cutoff)
      if (validRequests.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, validRequests)
      }
    }
    
    // Clean up expired blocks
    for (const [identifier, expiry] of this.blockedIPs.entries()) {
      if (now >= expiry) {
        this.blockedIPs.delete(identifier)
      }
    }
  }

  // Get current status for an identifier
  getStatus(identifier: string): RateLimitResult {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    const windowStart = now - this.config.window
    const recentRequests = requests.filter(timestamp => timestamp > windowStart)
    
    const blockExpiry = this.blockedIPs.get(identifier)
    const blocked = blockExpiry ? now < blockExpiry : false
    
    return {
      allowed: !blocked && recentRequests.length < this.config.limit,
      remaining: Math.max(0, this.config.limit - recentRequests.length),
      resetTime: windowStart + this.config.window,
      blocked,
      blockExpiry
    }
  }

  // Reset rate limit for an identifier
  reset(identifier: string): void {
    this.requests.delete(identifier)
    this.blockedIPs.delete(identifier)
  }

  // Get statistics
  getStats(): {
    totalIdentifiers: number
    blockedIdentifiers: number
    totalRequests: number
  } {
    let totalRequests = 0
    for (const requests of this.requests.values()) {
      totalRequests += requests.length
    }
    
    return {
      totalIdentifiers: this.requests.size,
      blockedIdentifiers: this.blockedIPs.size,
      totalRequests
    }
  }
}

// Default rate limit configurations
export const DEFAULT_RATE_LIMITS = {
  // API endpoints
  API: { limit: 100, window: 60000, blockDuration: 300000 }, // 100 req/min, block 5 min
  
  // Authentication
  AUTH: { limit: 5, window: 300000, blockDuration: 900000 }, // 5 req/5min, block 15 min
  
  // File uploads
  UPLOAD: { limit: 10, window: 60000, blockDuration: 600000 }, // 10 req/min, block 10 min
  
  // Social actions
  SOCIAL: { limit: 200, window: 60000, blockDuration: 300000 }, // 200 req/min, block 5 min
  
  // Messaging
  MESSAGING: { limit: 50, window: 60000, blockDuration: 300000 }, // 50 req/min, block 5 min
} as const

// Create rate limiters for different endpoints
export const rateLimiters = {
  api: new RateLimiter(DEFAULT_RATE_LIMITS.API),
  auth: new RateLimiter(DEFAULT_RATE_LIMITS.AUTH),
  upload: new RateLimiter(DEFAULT_RATE_LIMITS.UPLOAD),
  social: new RateLimiter(DEFAULT_RATE_LIMITS.SOCIAL),
  messaging: new RateLimiter(DEFAULT_RATE_LIMITS.MESSAGING)
}

// Helper function to get client IP from request
export function getClientIP(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback to a default identifier
  return 'unknown'
}

// Middleware function for Next.js API routes
export function withRateLimit(
  handler: Function,
  limiter: RateLimiter = rateLimiters.api
) {
  return async (request: Request, ...args: any[]) => {
    const clientIP = getClientIP(request)
    const result = limiter.check(clientIP)
    
    if (!result.allowed) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        resetTime: result.resetTime,
        blocked: result.blocked,
        blockExpiry: result.blockExpiry
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limiter.getLimit().toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString(),
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
        }
      })
    }
    
    // Add rate limit headers to response
    const response = await handler(request, ...args)
    
    if (response instanceof Response) {
      response.headers.set('X-RateLimit-Limit', limiter.getLimit().toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
    }
    
    return response
  }
}

export default RateLimiter 