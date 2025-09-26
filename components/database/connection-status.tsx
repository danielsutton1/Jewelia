"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Database, Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react'

interface ConnectionStatus {
  success: boolean
  mode?: string
  fallback?: string
  error?: string
  timestamp?: string
}

export function DatabaseConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const checkConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/health/database')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        success: false,
        error: 'Failed to check database connection',
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  const getStatusIcon = () => {
    if (loading) return <Wifi className="h-4 w-4 animate-pulse" />
    if (status?.success) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (status?.mode === 'backup') return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <WifiOff className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = () => {
    if (loading) return <Badge variant="secondary">Checking...</Badge>
    if (status?.success) return <Badge variant="default" className="bg-green-500">Connected</Badge>
    if (status?.mode === 'backup') return <Badge variant="secondary" className="bg-yellow-500">Backup Mode</Badge>
    return <Badge variant="destructive">Disconnected</Badge>
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Database className="h-4 w-4" />
          Database Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">
              {loading ? 'Checking...' : 
               status?.success ? 'Connected' : 
               status?.mode === 'backup' ? 'Backup Mode' : 'Disconnected'}
            </span>
          </div>
          {getStatusBadge()}
        </div>

        {status && (
          <div className="space-y-2 text-xs text-muted-foreground">
            {status.mode === 'backup' && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="font-medium text-yellow-800">Backup Mode Active</p>
                <p className="text-yellow-700">
                  Using mock data due to invalid database credentials in backup.
                </p>
              </div>
            )}
            
            {status.error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded">
                <p className="font-medium text-red-800">Connection Error</p>
                <p className="text-red-700">{status.error}</p>
              </div>
            )}

            {status.fallback && (
              <p>Fallback: {status.fallback}</p>
            )}

            {status.timestamp && (
              <p>Last checked: {new Date(status.timestamp).toLocaleTimeString()}</p>
            )}
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkConnection}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Checking...' : 'Refresh Status'}
        </Button>
      </CardContent>
    </Card>
  )
}
