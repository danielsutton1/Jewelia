"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Activity,
  Database,
  Globe,
  Shield,
  Clock
} from 'lucide-react'

interface HealthCheck {
  name: string
  endpoint: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number
  lastChecked: Date
  error?: string
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down'
  checks: HealthCheck[]
  lastFullCheck: Date
}

export default function SystemHealthCheck() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const endpoints = [
    { name: 'Authentication', endpoint: '/api/auth/status' },
    { name: 'Customers API', endpoint: '/api/customers?limit=1' },
    { name: 'Orders API', endpoint: '/api/orders?limit=1' },
    { name: 'Inventory API', endpoint: '/api/inventory?limit=1' },
    { name: 'Products API', endpoint: '/api/products?limit=1' },
    { name: 'Analytics API', endpoint: '/api/analytics?type=dashboard' },
    { name: 'Quotes API', endpoint: '/api/quotes?limit=1' },
    { name: 'Database Connection', endpoint: '/api/test-system' }
  ]

  const checkEndpoint = async (name: string, endpoint: string): Promise<HealthCheck> => {
    const startTime = Date.now()
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const responseTime = Date.now() - startTime
      
      if (response.ok) {
        return {
          name,
          endpoint,
          status: responseTime < 1000 ? 'healthy' : 'degraded',
          responseTime,
          lastChecked: new Date()
        }
      } else {
        return {
          name,
          endpoint,
          status: 'down',
          responseTime,
          lastChecked: new Date(),
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }
    } catch (error) {
      return {
        name,
        endpoint,
        status: 'down',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  const runHealthCheck = async () => {
    setLoading(true)
    
    try {
      const checks = await Promise.all(
        endpoints.map(({ name, endpoint }) => checkEndpoint(name, endpoint))
      )
      
      const downChecks = checks.filter(check => check.status === 'down')
      const degradedChecks = checks.filter(check => check.status === 'degraded')
      
      let overallStatus: 'healthy' | 'degraded' | 'down' = 'healthy'
      if (downChecks.length > 0) {
        overallStatus = 'down'
      } else if (degradedChecks.length > 0) {
        overallStatus = 'degraded'
      }
      
      setHealth({
        overall: overallStatus,
        checks,
        lastFullCheck: new Date()
      })
    } catch (error) {
      console.error('Health check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runHealthCheck()
    
    if (autoRefresh) {
      const interval = setInterval(runHealthCheck, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'down': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'degraded': return 'bg-yellow-500'
      case 'down': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getOverallStatusIcon = () => {
    if (!health) return <Activity className="h-6 w-6" />
    
    switch (health.overall) {
      case 'healthy': return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'degraded': return <AlertTriangle className="h-6 w-6 text-yellow-500" />
      case 'down': return <XCircle className="h-6 w-6 text-red-500" />
      default: return <Activity className="h-6 w-6" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getOverallStatusIcon()}
            System Health Check
            {health && (
              <Badge 
                variant="secondary" 
                className={`${getStatusColor(health.overall)} text-white`}
              >
                {health.overall.toUpperCase()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runHealthCheck}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Checking...' : 'Refresh'}
            </Button>
            <Button 
              variant={autoRefresh ? "default" : "outline"}
              size="sm" 
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Clock className="h-4 w-4" />
              Auto
            </Button>
          </div>
        </div>
        {health && (
          <p className="text-sm text-muted-foreground">
            Last checked: {health.lastFullCheck.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {!health ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Running initial health check...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {health.checks.filter(c => c.status === 'healthy').length}
                </div>
                <div className="text-sm text-green-600">Healthy</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {health.checks.filter(c => c.status === 'degraded').length}
                </div>
                <div className="text-sm text-yellow-600">Degraded</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {health.checks.filter(c => c.status === 'down').length}
                </div>
                <div className="text-sm text-red-600">Down</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(health.checks.reduce((acc, c) => acc + c.responseTime, 0) / health.checks.length)}ms
                </div>
                <div className="text-sm text-blue-600">Avg Response</div>
              </div>
            </div>

            {/* Detailed Checks */}
            <div className="space-y-2">
              <h4 className="font-medium">Service Status</h4>
              {health.checks.map((check) => (
                <div 
                  key={check.name}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <div className="font-medium">{check.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {check.responseTime}ms
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(check.status)}
                    >
                      {check.status}
                    </Badge>
                    {check.error && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Issues Summary */}
            {health.checks.some(check => check.status !== 'healthy') && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {health.checks.filter(c => c.status === 'down').length} services are down and{' '}
                  {health.checks.filter(c => c.status === 'degraded').length} are experiencing issues.
                  {health.checks.filter(c => c.status === 'down').map(check => (
                    <div key={check.name} className="mt-1 text-sm">
                      • {check.name}: {check.error}
                    </div>
                  ))}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 