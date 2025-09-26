import { logger } from '@/lib/services/LoggingService'

// =====================================================
// PERFORMANCE OPTIMIZATION SERVICE
// =====================================================

export interface PerformanceMetrics {
  timestamp: number
  memoryUsage: {
    used: number
    total: number
    percentage: number
  }
  cpuUsage: number
  responseTime: number
  throughput: number
  errorRate: number
  activeConnections: number
  messageQueueSize: number
}

export interface PerformanceThresholds {
  memoryUsage: number // percentage
  cpuUsage: number // percentage
  responseTime: number // milliseconds
  errorRate: number // percentage
  maxConnections: number
  maxQueueSize: number
}

export interface OptimizationAction {
  type: 'memory_cleanup' | 'connection_limit' | 'queue_processing' | 'cache_clear' | 'restart_service'
  priority: 'low' | 'medium' | 'high' | 'critical'
  description: string
  estimatedImpact: string
  executed: boolean
  timestamp: number
}

export class PerformanceOptimizationService {
  private metrics: PerformanceMetrics[] = []
  private thresholds: PerformanceThresholds
  private monitoringInterval: NodeJS.Timeout | null = null
  private isMonitoring: boolean = false
  private optimizationHistory: OptimizationAction[] = []
  private performanceObservers: Map<string, PerformanceObserver> = new Map()

  constructor() {
    this.thresholds = this.getDefaultThresholds()
    this.initializePerformanceMonitoring()
  }

  // =====================================================
  // INITIALIZATION
  // =====================================================

  private getDefaultThresholds(): PerformanceThresholds {
    return {
      memoryUsage: 80, // 80% memory usage threshold
      cpuUsage: 70, // 70% CPU usage threshold
      responseTime: 1000, // 1 second response time threshold
      errorRate: 5, // 5% error rate threshold
      maxConnections: 1000, // Maximum active connections
      maxQueueSize: 10000 // Maximum message queue size
    }
  }

  private initializePerformanceMonitoring(): void {
    // Initialize Performance Observer for navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming
              this.recordNavigationMetrics(navEntry)
            }
          }
        })
        
        navigationObserver.observe({ entryTypes: ['navigation'] })
        this.performanceObservers.set('navigation', navigationObserver)
      } catch (error) {
        logger.warn('Failed to initialize navigation performance observer', error)
      }

      // Initialize Performance Observer for resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming
              this.recordResourceMetrics(resourceEntry)
            }
          }
        })
        
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.performanceObservers.set('resource', resourceObserver)
      } catch (error) {
        logger.warn('Failed to initialize resource performance observer', error)
      }
    }
  }

  // =====================================================
  // MONITORING
  // =====================================================

  startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) {
      logger.warn('Performance monitoring is already active')
      return
    }

    this.isMonitoring = true
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics()
      this.analyzePerformance()
    }, intervalMs)

    logger.info('Performance monitoring started', { intervalMs })
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    
    this.isMonitoring = false
    logger.info('Performance monitoring stopped')
  }

  private collectMetrics(): void {
    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: this.getCPUUsage(),
      responseTime: this.getAverageResponseTime(),
      throughput: this.getThroughput(),
      errorRate: this.getErrorRate(),
      activeConnections: this.getActiveConnections(),
      messageQueueSize: this.getMessageQueueSize()
    }

    this.metrics.push(metrics)
    
    // Keep only last 1000 metrics to prevent memory bloat
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }

    // Log critical metrics
    if (metrics.memoryUsage.percentage > 90 || metrics.errorRate > 10) {
      logger.warn('Critical performance metrics detected', metrics)
    }
  }

  private getMemoryUsage(): { used: number; total: number; percentage: number } {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const used = memory.usedJSHeapSize
      const total = memory.totalJSHeapSize
      const percentage = (used / total) * 100
      
      return {
        used: Math.round(used / 1024 / 1024), // MB
        total: Math.round(total / 1024 / 1024), // MB
        percentage: Math.round(percentage)
      }
    }

    // Fallback for browsers without memory API
    return {
      used: 0,
      total: 0,
      percentage: 0
    }
  }

  private getCPUUsage(): number {
    // Browser doesn't provide direct CPU usage, so we estimate based on performance
    const now = performance.now()
    const timeSinceLastCall = now - (this.lastCPUMeasurement || now)
    this.lastCPUMeasurement = now

    // Simple heuristic based on time between calls
    // This is a rough estimate and not as accurate as system-level monitoring
    return Math.min(100, Math.max(0, (timeSinceLastCall / 16) * 100)) // 16ms = 60fps
  }

  private getAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0
    
    const recentMetrics = this.metrics.slice(-10) // Last 10 measurements
    const totalResponseTime = recentMetrics.reduce((sum, metric) => sum + metric.responseTime, 0)
    
    return Math.round(totalResponseTime / recentMetrics.length)
  }

  private getThroughput(): number {
    // Calculate messages per second based on recent activity
    if (this.metrics.length < 2) return 0
    
    const recentMetrics = this.metrics.slice(-5)
    const timeSpan = recentMetrics[recentMetrics.length - 1].timestamp - recentMetrics[0].timestamp
    const totalMessages = recentMetrics.reduce((sum, metric) => sum + metric.messageQueueSize, 0)
    
    return Math.round((totalMessages / timeSpan) * 1000) // messages per second
  }

  private getErrorRate(): number {
    // This would be calculated from actual error logs
    // For now, return a placeholder value
    return 0
  }

  private getActiveConnections(): number {
    // This would be obtained from the realtime messaging service
    // For now, return a placeholder value
    return 0
  }

  private getMessageQueueSize(): number {
    // This would be obtained from the message queue service
    // For now, return a placeholder value
    return 0
  }

  private lastCPUMeasurement: number = 0

  // =====================================================
  // PERFORMANCE ANALYSIS
  // =====================================================

  private analyzePerformance(): void {
    if (this.metrics.length === 0) return

    const currentMetrics = this.metrics[this.metrics.length - 1]
    const actions: OptimizationAction[] = []

    // Check memory usage
    if (currentMetrics.memoryUsage.percentage > this.thresholds.memoryUsage) {
      actions.push({
        type: 'memory_cleanup',
        priority: currentMetrics.memoryUsage.percentage > 90 ? 'critical' : 'high',
        description: 'High memory usage detected, initiating cleanup',
        estimatedImpact: 'Reduce memory usage by 20-30%',
        executed: false,
        timestamp: Date.now()
      })
    }

    // Check CPU usage
    if (currentMetrics.cpuUsage > this.thresholds.cpuUsage) {
      actions.push({
        type: 'connection_limit',
        priority: currentMetrics.cpuUsage > 85 ? 'critical' : 'medium',
        description: 'High CPU usage detected, limiting new connections',
        estimatedImpact: 'Reduce CPU load by 15-25%',
        executed: false,
        timestamp: Date.now()
      })
    }

    // Check response time
    if (currentMetrics.responseTime > this.thresholds.responseTime) {
      actions.push({
        type: 'queue_processing',
        priority: currentMetrics.responseTime > 2000 ? 'critical' : 'high',
        description: 'Slow response time detected, optimizing queue processing',
        estimatedImpact: 'Improve response time by 30-40%',
        executed: false,
        timestamp: Date.now()
      })
    }

    // Check error rate
    if (currentMetrics.errorRate > this.thresholds.errorRate) {
      actions.push({
        type: 'restart_service',
        priority: currentMetrics.errorRate > 15 ? 'critical' : 'high',
        description: 'High error rate detected, considering service restart',
        estimatedImpact: 'Reduce errors by 50-80%',
        executed: false,
        timestamp: Date.now()
      })
    }

    // Execute optimization actions
    actions.forEach(action => this.executeOptimizationAction(action))
  }

  private async executeOptimizationAction(action: OptimizationAction): Promise<void> {
    try {
      logger.info('Executing optimization action', action)

      switch (action.type) {
        case 'memory_cleanup':
          await this.performMemoryCleanup()
          break
        case 'connection_limit':
          await this.limitConnections()
          break
        case 'queue_processing':
          await this.optimizeQueueProcessing()
          break
        case 'cache_clear':
          await this.clearCaches()
          break
        case 'restart_service':
          await this.restartService()
          break
      }

      action.executed = true
      this.optimizationHistory.push(action)
      
      logger.info('Optimization action executed successfully', action)
    } catch (error) {
      logger.error('Failed to execute optimization action', { action, error })
    }
  }

  // =====================================================
  // OPTIMIZATION ACTIONS
  // =====================================================

  private async performMemoryCleanup(): Promise<void> {
    // Clear unused event listeners
    this.clearUnusedEventListeners()
    
    // Clear performance metrics if too many
    if (this.metrics.length > 500) {
      this.metrics = this.metrics.slice(-250)
    }
    
    // Clear optimization history if too long
    if (this.optimizationHistory.length > 100) {
      this.optimizationHistory = this.optimizationHistory.slice(-50)
    }
    
    // Force garbage collection if available
    if ('gc' in window) {
      try {
        (window as any).gc()
      } catch (error) {
        // GC not available or failed
      }
    }
  }

  private async limitConnections(): Promise<void> {
    // This would integrate with the realtime messaging service
    // to limit new connections when CPU usage is high
    logger.info('Limiting new connections due to high CPU usage')
  }

  private async optimizeQueueProcessing(): Promise<void> {
    // This would optimize message queue processing
    // by adjusting batch sizes, priorities, etc.
    logger.info('Optimizing message queue processing')
  }

  private async clearCaches(): Promise<void> {
    // Clear various caches
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      } catch (error) {
        logger.warn('Failed to clear caches', error)
      }
    }
  }

  private async restartService(): Promise<void> {
    // This would restart critical services
    // For now, just log the action
    logger.warn('Service restart recommended due to high error rate')
  }

  private clearUnusedEventListeners(): void {
    // Clean up performance observers if not needed
    this.performanceObservers.forEach((observer, key) => {
      try {
        observer.disconnect()
        this.performanceObservers.delete(key)
      } catch (error) {
        logger.warn('Failed to disconnect performance observer', error)
      }
    })
  }

  // =====================================================
  // PERFORMANCE METRICS RECORDING
  // =====================================================

  private recordNavigationMetrics(navEntry: PerformanceNavigationTiming): void {
    const metrics = {
      type: 'navigation',
      url: navEntry.name,
      loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
      domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
      firstPaint: navEntry.responseStart - navEntry.requestStart,
      timestamp: Date.now()
    }

    logger.debug('Navigation performance metrics', metrics)
  }

  private recordResourceMetrics(resourceEntry: PerformanceResourceTiming): void {
    const metrics = {
      type: 'resource',
      name: resourceEntry.name,
      duration: resourceEntry.duration,
      size: resourceEntry.transferSize,
      timestamp: Date.now()
    }

    logger.debug('Resource performance metrics', metrics)
  }

  // =====================================================
  // PUBLIC API
  // =====================================================

  getCurrentMetrics(): PerformanceMetrics | null {
    if (this.metrics.length === 0) return null
    return { ...this.metrics[this.metrics.length - 1] }
  }

  getMetricsHistory(limit: number = 100): PerformanceMetrics[] {
    return this.metrics.slice(-limit)
  }

  getOptimizationHistory(): OptimizationAction[] {
    return [...this.optimizationHistory]
  }

  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds }
    logger.info('Performance thresholds updated', this.thresholds)
  }

  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds }
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  getPerformanceScore(): number {
    if (this.metrics.length === 0) return 100

    const currentMetrics = this.metrics[this.metrics.length - 1]
    let score = 100

    // Deduct points for each threshold violation
    if (currentMetrics.memoryUsage.percentage > this.thresholds.memoryUsage) {
      score -= 20
    }
    if (currentMetrics.cpuUsage > this.thresholds.cpuUsage) {
      score -= 20
    }
    if (currentMetrics.responseTime > this.thresholds.responseTime) {
      score -= 20
    }
    if (currentMetrics.errorRate > this.thresholds.errorRate) {
      score -= 20
    }

    return Math.max(0, score)
  }

  getPerformanceTrend(): 'improving' | 'stable' | 'declining' {
    if (this.metrics.length < 10) return 'stable'

    const recentMetrics = this.metrics.slice(-10)
    const firstScore = this.calculateMetricsScore(recentMetrics[0])
    const lastScore = this.calculateMetricsScore(recentMetrics[recentMetrics.length - 1])
    const difference = lastScore - firstScore

    if (difference > 10) return 'improving'
    if (difference < -10) return 'declining'
    return 'stable'
  }

  private calculateMetricsScore(metrics: PerformanceMetrics): number {
    let score = 100

    if (metrics.memoryUsage.percentage > this.thresholds.memoryUsage) score -= 25
    if (metrics.cpuUsage > this.thresholds.cpuUsage) score -= 25
    if (metrics.responseTime > this.thresholds.responseTime) score -= 25
    if (metrics.errorRate > this.thresholds.errorRate) score -= 25

    return Math.max(0, score)
  }

  // =====================================================
  // CLEANUP
  // =====================================================

  async cleanup(): Promise<void> {
    this.stopMonitoring()
    
    // Disconnect all performance observers
    this.performanceObservers.forEach(observer => {
      try {
        observer.disconnect()
      } catch (error) {
        logger.warn('Failed to disconnect performance observer during cleanup', error)
      }
    })
    this.performanceObservers.clear()
    
    // Clear metrics and history
    this.metrics = []
    this.optimizationHistory = []
    
    logger.info('Performance optimization service cleaned up')
  }
}

// =====================================================
// GLOBAL INSTANCE
// =====================================================

export const performanceOptimization = new PerformanceOptimizationService()

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

export const startPerformanceMonitoring = (intervalMs?: number) =>
  performanceOptimization.startMonitoring(intervalMs)

export const stopPerformanceMonitoring = () =>
  performanceOptimization.stopMonitoring()

export const getCurrentPerformanceMetrics = () =>
  performanceOptimization.getCurrentMetrics()

export const getPerformanceScore = () =>
  performanceOptimization.getPerformanceScore()

export const getPerformanceTrend = () =>
  performanceOptimization.getPerformanceTrend()

export const updatePerformanceThresholds = (thresholds: Partial<PerformanceThresholds>) =>
  performanceOptimization.updateThresholds(thresholds)
