'use client'

import React, { ReactNode } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Lock, 
  AlertTriangle, 
  Shield, 
  User, 
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'

interface EnhancedPermissionGuardProps {
  children: ReactNode
  permission?: string | string[]
  requireAll?: boolean
  fallback?: ReactNode
  showAlert?: boolean
  showDetails?: boolean
  className?: string
}

export function EnhancedPermissionGuard({ 
  children, 
  permission, 
  requireAll = false,
  fallback,
  showAlert = true,
  showDetails = false,
  className = ""
}: EnhancedPermissionGuardProps) {
  const { hasPermission, userRole, permissions, user } = useAuth()

  // If no permission required, show children
  if (!permission) {
    return <>{children}</>
  }

  // Check permissions
  const permissionsArray = Array.isArray(permission) ? permission : [permission]
  const hasAccess = requireAll 
    ? permissionsArray.every(p => hasPermission(p as any))
    : permissionsArray.some(p => hasPermission(p as any))

  // If user has access, show children
  if (hasAccess) {
    return <>{children}</>
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>
  }

  // If showAlert is false, return null
  if (!showAlert) {
    return null
  }

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'manager':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'sales':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'production':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'logistics':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Get permission status
  const getPermissionStatus = (perm: string) => {
    return permissions[perm as keyof typeof permissions] ? 'granted' : 'denied'
  }

  return (
    <div className={className}>
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Lock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-amber-800 text-lg">
                Access Restricted
              </CardTitle>
              <p className="text-amber-600 text-sm mt-1">
                You don't have permission to view this content
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* User Role Information */}
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-amber-600" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-amber-700">Your role:</span>
              <Badge className={getRoleColor(userRole || 'viewer')}>
                {userRole || 'Unknown'}
              </Badge>
            </div>
          </div>

          {/* Required Permissions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">
                Required {requireAll ? 'permissions (all)' : 'permission (any)'}:
              </span>
            </div>
            <div className="flex flex-wrap gap-2 ml-6">
              {permissionsArray.map((perm) => (
                <Badge 
                  key={perm}
                  variant="outline"
                  className={`text-xs ${
                    getPermissionStatus(perm) === 'granted' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {getPermissionStatus(perm) === 'granted' ? (
                    <Eye className="h-3 w-3 mr-1" />
                  ) : (
                    <EyeOff className="h-3 w-3 mr-1" />
                  )}
                  {perm}
                </Badge>
              ))}
            </div>
          </div>

          {/* Detailed Permission Breakdown */}
          {showDetails && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">
                  Your permissions:
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 ml-6">
                {Object.entries(permissions).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    {value ? (
                      <Eye className="h-3 w-3 text-green-600" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs ${value ? 'text-green-700' : 'text-red-700'}`}>
                      {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm"
              className="text-amber-700 border-amber-300 hover:bg-amber-100"
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="text-amber-700 border-amber-300 hover:bg-amber-100"
              onClick={() => window.location.href = '/settings'}
            >
              Contact Admin
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-amber-600 bg-amber-100 p-2 rounded">
            <AlertTriangle className="h-3 w-3 inline mr-1" />
            If you believe you should have access to this content, please contact your administrator.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Convenience components for common permissions
export function CustomerViewGuard({ children, fallback, showDetails }: { 
  children: ReactNode
  fallback?: ReactNode
  showDetails?: boolean
}) {
  return (
    <EnhancedPermissionGuard 
      permission="canViewCustomers" 
      fallback={fallback}
      showDetails={showDetails}
    >
      {children}
    </EnhancedPermissionGuard>
  )
}

export function CustomerEditGuard({ children, fallback, showDetails }: { 
  children: ReactNode
  fallback?: ReactNode
  showDetails?: boolean
}) {
  return (
    <EnhancedPermissionGuard 
      permission="canEditCustomers" 
      fallback={fallback}
      showDetails={showDetails}
    >
      {children}
    </EnhancedPermissionGuard>
  )
}

export function OrderViewGuard({ children, fallback, showDetails }: { 
  children: ReactNode
  fallback?: ReactNode
  showDetails?: boolean
}) {
  return (
    <EnhancedPermissionGuard 
      permission="canViewOrders" 
      fallback={fallback}
      showDetails={showDetails}
    >
      {children}
    </EnhancedPermissionGuard>
  )
}

export function OrderEditGuard({ children, fallback, showDetails }: { 
  children: ReactNode
  fallback?: ReactNode
  showDetails?: boolean
}) {
  return (
    <EnhancedPermissionGuard 
      permission="canEditOrders" 
      fallback={fallback}
      showDetails={showDetails}
    >
      {children}
    </EnhancedPermissionGuard>
  )
}

export function InventoryViewGuard({ children, fallback, showDetails }: { 
  children: ReactNode
  fallback?: ReactNode
  showDetails?: boolean
}) {
  return (
    <EnhancedPermissionGuard 
      permission="canViewInventory" 
      fallback={fallback}
      showDetails={showDetails}
    >
      {children}
    </EnhancedPermissionGuard>
  )
}

export function InventoryEditGuard({ children, fallback, showDetails }: { 
  children: ReactNode
  fallback?: ReactNode
  showDetails?: boolean
}) {
  return (
    <EnhancedPermissionGuard 
      permission="canEditInventory" 
      fallback={fallback}
      showDetails={showDetails}
    >
      {children}
    </EnhancedPermissionGuard>
  )
}

export function AnalyticsGuard({ children, fallback, showDetails }: { 
  children: ReactNode
  fallback?: ReactNode
  showDetails?: boolean
}) {
  return (
    <EnhancedPermissionGuard 
      permission="canViewAnalytics" 
      fallback={fallback}
      showDetails={showDetails}
    >
      {children}
    </EnhancedPermissionGuard>
  )
}

export function UserManagementGuard({ children, fallback, showDetails }: { 
  children: ReactNode
  fallback?: ReactNode
  showDetails?: boolean
}) {
  return (
    <EnhancedPermissionGuard 
      permission="canManageUsers" 
      fallback={fallback}
      showDetails={showDetails}
    >
      {children}
    </EnhancedPermissionGuard>
  )
}

export function AdminOnlyGuard({ children, fallback, showDetails }: { 
  children: ReactNode
  fallback?: ReactNode
  showDetails?: boolean
}) {
  return (
    <EnhancedPermissionGuard 
      permission={['canManageUsers', 'canViewFinancials', 'canEditFinancials']}
      requireAll={false}
      fallback={fallback}
      showDetails={showDetails}
    >
      {children}
    </EnhancedPermissionGuard>
  )
}
