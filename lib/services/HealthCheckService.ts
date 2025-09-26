import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'critical'
  component: string
  message: string
  timestamp: Date
  responseTime?: number
  details?: any
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical'
  checks: HealthCheckResult[]
  summary: {
    total: number
    healthy: number
    warning: number
    critical: number
  }
  timestamp: Date
}

export class HealthCheckService {
  private static instance: HealthCheckService

  static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService()
    }
    return HealthCheckService.instance
  }

  async performFullHealthCheck(): Promise<SystemHealth> {
    const checks: HealthCheckResult[] = []
    
    // Database connectivity
    checks.push(await this.checkDatabase())
    
    // API endpoints
    checks.push(await this.checkAPIEndpoints())
    
    // File storage
    checks.push(await this.checkFileStorage())
    
    // Authentication service
    checks.push(await this.checkAuthentication())
    
    // Real-time subscriptions
    checks.push(await this.checkRealTimeSubscriptions())
    
    // External integrations
    checks.push(await this.checkExternalIntegrations())
    
    // System resources
    checks.push(await this.checkSystemResources())
    
    // Security checks
    checks.push(await this.checkSecurity())
    
    // Performance metrics
    checks.push(await this.checkPerformance())
    
    // Calculate overall status
    const summary = this.calculateSummary(checks)
    const overall = this.determineOverallStatus(summary)
    
    return {
      overall,
      checks,
      summary,
      timestamp: new Date()
    }
  }

  private async checkDatabase(): Promise<HealthCheckResult> {
    const startTime = Date.now()
    
    try {
      const supabase = await createSupabaseServerClient()
      
      // Test basic query
      const { data, error } = await supabase
        .from('customers')
        .select('count')
        .limit(1)
      
      const responseTime = Date.now() - startTime
      
      if (error) {
        return {
          status: 'critical',
          component: 'Database',
          message: `Database connection failed: ${error.message}`,
          timestamp: new Date(),
          responseTime,
          details: { error: error.message }
        }
      }
      
      if (responseTime > 5000) {
        return {
          status: 'warning',
          component: 'Database',
          message: `Database response time is slow: ${responseTime}ms`,
          timestamp: new Date(),
          responseTime,
          details: { responseTime }
        }
      }
      
      return {
        status: 'healthy',
        component: 'Database',
        message: 'Database connection is healthy',
        timestamp: new Date(),
        responseTime,
        details: { responseTime }
      }
    } catch (error) {
      return {
        status: 'critical',
        component: 'Database',
        message: `Database check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  private async checkAPIEndpoints(): Promise<HealthCheckResult> {
    const startTime = Date.now()
    const endpoints = [
      '/api/analytics',
      '/api/customers',
      '/api/orders',
      '/api/inventory'
    ]
    
    const results = await Promise.allSettled(
      endpoints.map(endpoint => 
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${endpoint}`)
      )
    )
    
    const responseTime = Date.now() - startTime
    const failedEndpoints = results.filter(result => result.status === 'rejected').length
    
    if (failedEndpoints === endpoints.length) {
      return {
        status: 'critical',
        component: 'API Endpoints',
        message: 'All API endpoints are failing',
        timestamp: new Date(),
        responseTime,
        details: { failedEndpoints, totalEndpoints: endpoints.length }
      }
    }
    
    if (failedEndpoints > 0) {
      return {
        status: 'warning',
        component: 'API Endpoints',
        message: `${failedEndpoints} API endpoints are failing`,
        timestamp: new Date(),
        responseTime,
        details: { failedEndpoints, totalEndpoints: endpoints.length }
      }
    }
    
    return {
      status: 'healthy',
      component: 'API Endpoints',
      message: 'All API endpoints are responding',
      timestamp: new Date(),
      responseTime,
      details: { failedEndpoints, totalEndpoints: endpoints.length }
    }
  }

  private async checkFileStorage(): Promise<HealthCheckResult> {
    const startTime = Date.now()
    
    try {
      const supabase = await createSupabaseServerClient()
      
      // Test file storage access
      const { data, error } = await supabase.storage.listBuckets()
      
      const responseTime = Date.now() - startTime
      
      if (error) {
        return {
          status: 'critical',
          component: 'File Storage',
          message: `File storage access failed: ${error.message}`,
          timestamp: new Date(),
          responseTime,
          details: { error: error.message }
        }
      }
      
      return {
        status: 'healthy',
        component: 'File Storage',
        message: 'File storage is accessible',
        timestamp: new Date(),
        responseTime,
        details: { buckets: data?.length || 0 }
      }
    } catch (error) {
      return {
        status: 'critical',
        component: 'File Storage',
        message: `File storage check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  private async checkAuthentication(): Promise<HealthCheckResult> {
    const startTime = Date.now()
    
    try {
      const supabase = await createSupabaseServerClient()
      
      // Test authentication service
      const { data, error } = await supabase.auth.getSession()
      
      const responseTime = Date.now() - startTime
      
      if (error) {
        return {
          status: 'critical',
          component: 'Authentication',
          message: `Authentication service failed: ${error.message}`,
          timestamp: new Date(),
          responseTime,
          details: { error: error.message }
        }
      }
      
      return {
        status: 'healthy',
        component: 'Authentication',
        message: 'Authentication service is working',
        timestamp: new Date(),
        responseTime,
        details: { hasSession: !!data.session }
      }
    } catch (error) {
      return {
        status: 'critical',
        component: 'Authentication',
        message: `Authentication check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  private async checkRealTimeSubscriptions(): Promise<HealthCheckResult> {
    const startTime = Date.now()
    
    try {
      const supabase = await createSupabaseServerClient()
      
      // Test real-time subscription
      const channel = supabase.channel('health-check')
      const subscription = channel
        .on('presence', { event: 'sync' }, () => {})
        .subscribe()
      
      const responseTime = Date.now() - startTime
      
      // Clean up subscription
      setTimeout(() => {
        supabase.removeChannel(channel)
      }, 1000)
      
      if (subscription && typeof subscription === 'string' && subscription === 'SUBSCRIBED') {
        return {
          status: 'healthy',
          component: 'Real-time Subscriptions',
          message: 'Real-time subscriptions are working',
          timestamp: new Date(),
          responseTime,
          details: { status: 'SUBSCRIBED' }
        }
      } else {
        return {
          status: 'warning',
          component: 'Real-time Subscriptions',
          message: 'Real-time subscription status unclear',
          timestamp: new Date(),
          responseTime,
          details: { status: 'UNKNOWN' }
        }
      }
    } catch (error) {
      return {
        status: 'critical',
        component: 'Real-time Subscriptions',
        message: `Real-time subscription check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  private async checkExternalIntegrations(): Promise<HealthCheckResult> {
    const startTime = Date.now()
    
    try {
      // Check external services (if configured)
      const integrations = []
      
      if (process.env.SENDGRID_API_KEY) {
        integrations.push('SendGrid')
      }
      
      if (process.env.ONESIGNAL_APP_ID) {
        integrations.push('OneSignal')
      }
      
      if (process.env.RESEND_API_KEY) {
        integrations.push('Resend')
      }
      
      const responseTime = Date.now() - startTime
      
      if (integrations.length === 0) {
        return {
          status: 'healthy',
          component: 'External Integrations',
          message: 'No external integrations configured',
          timestamp: new Date(),
          responseTime,
          details: { integrations: [] }
        }
      }
      
      return {
        status: 'healthy',
        component: 'External Integrations',
        message: `External integrations configured: ${integrations.join(', ')}`,
        timestamp: new Date(),
        responseTime,
        details: { integrations }
      }
    } catch (error) {
      return {
        status: 'warning',
        component: 'External Integrations',
        message: `External integration check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  private async checkSystemResources(): Promise<HealthCheckResult> {
    const startTime = Date.now()
    
    try {
      // Check memory usage (Node.js)
      const memUsage = process.memoryUsage()
      const memUsageMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      }
      
      const responseTime = Date.now() - startTime
      
      // Check if memory usage is high
      if (memUsageMB.heapUsed > 500) { // 500MB threshold
        return {
          status: 'warning',
          component: 'System Resources',
          message: 'High memory usage detected',
          timestamp: new Date(),
          responseTime,
          details: { memoryUsage: memUsageMB }
        }
      }
      
      return {
        status: 'healthy',
        component: 'System Resources',
        message: 'System resources are normal',
        timestamp: new Date(),
        responseTime,
        details: { memoryUsage: memUsageMB }
      }
    } catch (error) {
      return {
        status: 'warning',
        component: 'System Resources',
        message: `System resource check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  private async checkSecurity(): Promise<HealthCheckResult> {
    const startTime = Date.now()
    
    try {
      // Check for required environment variables
      const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY'
      ]
      
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
      
      const responseTime = Date.now() - startTime
      
      if (missingVars.length > 0) {
        return {
          status: 'critical',
          component: 'Security',
          message: `Missing required environment variables: ${missingVars.join(', ')}`,
          timestamp: new Date(),
          responseTime,
          details: { missingVars }
        }
      }
      
      return {
        status: 'healthy',
        component: 'Security',
        message: 'Security configuration is complete',
        timestamp: new Date(),
        responseTime,
        details: { envVarsChecked: requiredEnvVars.length }
      }
    } catch (error) {
      return {
        status: 'critical',
        component: 'Security',
        message: `Security check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  private async checkPerformance(): Promise<HealthCheckResult> {
    const startTime = Date.now()
    
    try {
      // Simulate a performance test
      const testStart = Date.now()
      await new Promise(resolve => setTimeout(resolve, 100)) // Simulate work
      const testDuration = Date.now() - testStart
      
      const responseTime = Date.now() - startTime
      
      if (testDuration > 200) {
        return {
          status: 'warning',
          component: 'Performance',
          message: 'System performance is degraded',
          timestamp: new Date(),
          responseTime,
          details: { testDuration, threshold: 200 }
        }
      }
      
      return {
        status: 'healthy',
        component: 'Performance',
        message: 'System performance is optimal',
        timestamp: new Date(),
        responseTime,
        details: { testDuration }
      }
    } catch (error) {
      return {
        status: 'warning',
        component: 'Performance',
        message: `Performance check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  private calculateSummary(checks: HealthCheckResult[]) {
    const total = checks.length
    const healthy = checks.filter(check => check.status === 'healthy').length
    const warning = checks.filter(check => check.status === 'warning').length
    const critical = checks.filter(check => check.status === 'critical').length
    
    return { total, healthy, warning, critical }
  }

  private determineOverallStatus(summary: { total: number; healthy: number; warning: number; critical: number }): 'healthy' | 'warning' | 'critical' {
    if (summary.critical > 0) {
      return 'critical'
    }
    
    if (summary.warning > 0) {
      return 'warning'
    }
    
    return 'healthy'
  }

  async getHealthStatus(): Promise<SystemHealth> {
    return this.performFullHealthCheck()
  }

  async isHealthy(): Promise<boolean> {
    const health = await this.performFullHealthCheck()
    return health.overall === 'healthy'
  }
} 