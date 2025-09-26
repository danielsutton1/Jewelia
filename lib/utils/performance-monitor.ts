import { logger } from './logger';

export interface PerformanceMetric {
  id: string;
  operation: string;
  duration: number;
  timestamp: string;
  userId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  metadata?: Record<string, any>;
}

export interface DatabaseMetric extends PerformanceMetric {
  table: string;
  queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  rowCount?: number;
}

export interface ApiMetric extends PerformanceMetric {
  endpoint: string;
  requestSize?: number;
  responseSize?: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;
  private readonly flushInterval = 60000; // 1 minute

  private constructor() {
    // Set up periodic flushing
    setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // Remove old metrics if buffer is full
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log the metric
    logger.logPerformance({
      operation: metric.operation,
      duration: metric.duration,
      timestamp: metric.timestamp,
      userId: metric.userId,
      path: metric.path,
      method: metric.method,
      metadata: metric.metadata
    });
  }

  // API Performance Monitoring
  startApiTimer(endpoint: string, method: string, userId?: string): () => void {
    const startTime = Date.now();
    const requestId = this.generateId();

    return (statusCode?: number, requestSize?: number, responseSize?: number) => {
      const duration = Date.now() - startTime;
      
      const metric: ApiMetric = {
        id: requestId,
        operation: 'API_REQUEST',
        duration,
        timestamp: new Date().toISOString(),
        userId,
        path: endpoint,
        method,
        statusCode,
        endpoint,
        requestSize,
        responseSize
      };

      this.addMetric(metric);
    };
  }

  // Database Performance Monitoring
  startDatabaseTimer(operation: string, table: string, queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE', userId?: string): () => void {
    const startTime = Date.now();
    const requestId = this.generateId();

    return (rowCount?: number) => {
      const duration = Date.now() - startTime;
      
      const metric: DatabaseMetric = {
        id: requestId,
        operation: 'DATABASE_OPERATION',
        duration,
        timestamp: new Date().toISOString(),
        userId,
        table,
        queryType,
        rowCount
      };

      this.addMetric(metric);
    };
  }

  // Custom Performance Monitoring
  measureOperation(operation: string, userId?: string, metadata?: Record<string, any>): () => void {
    const startTime = Date.now();
    const requestId = this.generateId();

    return () => {
      const duration = Date.now() - startTime;
      
      const metric: PerformanceMetric = {
        id: requestId,
        operation,
        duration,
        timestamp: new Date().toISOString(),
        userId,
        metadata
      };

      this.addMetric(metric);
    };
  }

  // Performance Analysis
  getMetrics(timeRange: { start: Date; end: Date }): PerformanceMetric[] {
    return this.metrics.filter(metric => {
      const metricTime = new Date(metric.timestamp);
      return metricTime >= timeRange.start && metricTime <= timeRange.end;
    });
  }

  getApiMetrics(timeRange: { start: Date; end: Date }): ApiMetric[] {
    return this.getMetrics(timeRange).filter(metric => 
      metric.operation === 'API_REQUEST'
    ) as ApiMetric[];
  }

  getDatabaseMetrics(timeRange: { start: Date; end: Date }): DatabaseMetric[] {
    return this.getMetrics(timeRange).filter(metric => 
      metric.operation === 'DATABASE_OPERATION'
    ) as DatabaseMetric[];
  }

  // Performance Statistics
  getPerformanceStats(timeRange: { start: Date; end: Date }) {
    const metrics = this.getMetrics(timeRange);
    
    if (metrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        slowestOperation: null,
        fastestOperation: null
      };
    }

    const durations = metrics.map(m => m.duration);
    const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
    const averageDuration = totalDuration / metrics.length;
    
    const slowestOperation = metrics.reduce((slowest, current) => 
      current.duration > slowest.duration ? current : slowest
    );
    
    const fastestOperation = metrics.reduce((fastest, current) => 
      current.duration < fastest.duration ? current : fastest
    );

    return {
      totalOperations: metrics.length,
      averageDuration: Math.round(averageDuration),
      slowestOperation: {
        operation: slowestOperation.operation,
        duration: slowestOperation.duration,
        timestamp: slowestOperation.timestamp,
        path: slowestOperation.path,
        method: slowestOperation.method
      },
      fastestOperation: {
        operation: fastestOperation.operation,
        duration: fastestOperation.duration,
        timestamp: fastestOperation.timestamp,
        path: fastestOperation.path,
        method: fastestOperation.method
      }
    };
  }

  // Performance Alerts
  checkPerformanceAlerts(threshold: number = 5000): PerformanceMetric[] {
    return this.metrics.filter(metric => 
      metric.duration > threshold
    );
  }

  // Database Performance Analysis
  getDatabasePerformanceStats(timeRange: { start: Date; end: Date }) {
    const dbMetrics = this.getDatabaseMetrics(timeRange);
    
    if (dbMetrics.length === 0) {
      return {
        totalQueries: 0,
        averageQueryTime: 0,
        queriesByType: {},
        slowestTable: null
      };
    }

    const queriesByType = dbMetrics.reduce((acc, metric) => {
      acc[metric.queryType] = (acc[metric.queryType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tablePerformance = dbMetrics.reduce((acc, metric) => {
      if (!acc[metric.table]) {
        acc[metric.table] = { count: 0, totalDuration: 0 };
      }
      acc[metric.table].count += 1;
      acc[metric.table].totalDuration += metric.duration;
      return acc;
    }, {} as Record<string, { count: number; totalDuration: number }>);

    const slowestTable = Object.entries(tablePerformance).reduce((slowest, [table, stats]) => {
      const avgDuration = stats.totalDuration / stats.count;
      if (!slowest || avgDuration > slowest.avgDuration) {
        return { table, avgDuration, count: stats.count };
      }
      return slowest;
    }, null as { table: string; avgDuration: number; count: number } | null);

    const totalDuration = dbMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    const averageQueryTime = totalDuration / dbMetrics.length;

    return {
      totalQueries: dbMetrics.length,
      averageQueryTime: Math.round(averageQueryTime),
      queriesByType,
      slowestTable
    };
  }

  private async flushMetrics() {
    if (this.metrics.length === 0) return;

    const metricsToFlush = [...this.metrics];
    this.metrics = [];

    try {
      // In production, you might want to send metrics to:
      // - Supabase (for database storage)
      // - External monitoring service (DataDog, New Relic, etc.)
      // - Analytics service
      
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to Supabase metrics table
        // await this.sendToSupabase(metricsToFlush);
        
        // Example: Send to external service
        // await this.sendToExternalService(metricsToFlush);
      }
    } catch (error) {
      logger.error('Failed to flush performance metrics', error as Error);
    }
  }

  // Clear metrics (useful for testing)
  clearMetrics() {
    this.metrics = [];
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Convenience functions
export const startApiTimer = (endpoint: string, method: string, userId?: string) => 
  performanceMonitor.startApiTimer(endpoint, method, userId);

export const startDatabaseTimer = (operation: string, table: string, queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE', userId?: string) => 
  performanceMonitor.startDatabaseTimer(operation, table, queryType, userId);

export const measureOperation = (operation: string, userId?: string, metadata?: Record<string, any>) => 
  performanceMonitor.measureOperation(operation, userId, metadata); 