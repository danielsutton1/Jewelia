'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PermissionGuardProps {
  children: ReactNode
  permission: string
  fallback?: ReactNode
  showAlert?: boolean
}

export function PermissionGuard({ 
  children, 
  permission, 
  fallback,
  showAlert = true 
}: PermissionGuardProps) {
  const { hasPermission, userRole } = useAuth()

  if (!hasPermission(permission as any)) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showAlert) {
      return (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            You don't have permission to view this content. 
            {userRole && ` Your current role is: ${userRole}`}
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  return <>{children}</>
}

// Convenience components for common permissions
export function CustomerViewGuard({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return <PermissionGuard permission="canViewCustomers" fallback={fallback}>{children}</PermissionGuard>
}

export function CustomerEditGuard({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return <PermissionGuard permission="canEditCustomers" fallback={fallback}>{children}</PermissionGuard>
}

export function OrderViewGuard({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return <PermissionGuard permission="canViewOrders" fallback={fallback}>{children}</PermissionGuard>
}

export function OrderEditGuard({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return <PermissionGuard permission="canEditOrders" fallback={fallback}>{children}</PermissionGuard>
}

export function InventoryViewGuard({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return <PermissionGuard permission="canViewInventory" fallback={fallback}>{children}</PermissionGuard>
}

export function InventoryEditGuard({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return <PermissionGuard permission="canEditInventory" fallback={fallback}>{children}</PermissionGuard>
}

export function ProductionViewGuard({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return <PermissionGuard permission="canViewProduction" fallback={fallback}>{children}</PermissionGuard>
}

export function ProductionEditGuard({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return <PermissionGuard permission="canEditProduction" fallback={fallback}>{children}</PermissionGuard>
}

export function AnalyticsGuard({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return <PermissionGuard permission="canViewAnalytics" fallback={fallback}>{children}</PermissionGuard>
}

export function UserManagementGuard({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return <PermissionGuard permission="canManageUsers" fallback={fallback}>{children}</PermissionGuard>
} 