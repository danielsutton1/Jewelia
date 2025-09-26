'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle } from 'lucide-react'

export function UserRoleDisplay() {
  const { user, userRole, permissions } = useAuth()

  if (!user) {
    return null
  }

  const permissionItems = [
    { key: 'canViewCustomers', label: 'View Customers' },
    { key: 'canEditCustomers', label: 'Edit Customers' },
    { key: 'canViewOrders', label: 'View Orders' },
    { key: 'canEditOrders', label: 'Edit Orders' },
    { key: 'canViewInventory', label: 'View Inventory' },
    { key: 'canEditInventory', label: 'Edit Inventory' },
    { key: 'canViewProduction', label: 'View Production' },
    { key: 'canEditProduction', label: 'Edit Production' },
    { key: 'canViewAnalytics', label: 'View Analytics' },
    { key: 'canManageUsers', label: 'Manage Users' },
  ]

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-purple-100 text-purple-800'
      case 'sales':
        return 'bg-blue-100 text-blue-800'
      case 'production':
        return 'bg-orange-100 text-orange-800'
      case 'logistics':
        return 'bg-green-100 text-green-800'
      case 'viewer':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          User Role & Permissions
          <Badge className={getRoleColor(userRole || 'viewer')}>
            {userRole?.toUpperCase() || 'VIEWER'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              <strong>User:</strong> {user.user_metadata?.full_name || user.email}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Role:</strong> {userRole || 'viewer'}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Permissions:</h4>
            <div className="grid grid-cols-2 gap-2">
              {permissionItems.map((item) => (
                <div key={item.key} className="flex items-center gap-2 text-sm">
                  {permissions[item.key as keyof typeof permissions] ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={permissions[item.key as keyof typeof permissions] ? 'text-green-700' : 'text-red-700'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 