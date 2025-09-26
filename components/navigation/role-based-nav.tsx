'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { 
  Users, 
  ShoppingCart, 
  Package, 
  Settings, 
  BarChart3, 
  Calendar,
  FileText,
  Truck,
  Shield,
  Home,
  Gem
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
  roles?: string[]
}

const navItems: NavItem[] = [
  {
    label: 'Marketplace',
    href: '/dashboard/marketplace',
    icon: ShoppingCart,
    permission: 'inventory_sharing_access'
  },
  {
    label: 'Inventory Sharing',
    href: '/dashboard/inventory-sharing',
    icon: Package,
    permission: 'inventory_sharing_access'
  },
  {
    label: 'Browse Network',
    href: '/dashboard/shared-inventory',
    icon: Gem,
    permission: 'inventory_sharing_access'
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    label: 'Customers',
    href: '/dashboard/customers',
    icon: Users,
    permission: 'canViewCustomers'
  },
  {
    label: 'Orders',
    href: '/dashboard/orders',
    icon: ShoppingCart,
    permission: 'canViewOrders'
  },
  {
    label: 'Inventory',
    href: '/dashboard/inventory',
    icon: Package,
    permission: 'canViewInventory'
  },
  {
    label: 'Production',
    href: '/dashboard/production',
    icon: Settings,
    permission: 'canViewProduction'
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    permission: 'canViewAnalytics'
  },
  {
    label: 'Calendar',
    href: '/dashboard/calendar',
    icon: Calendar,
    permission: 'canViewAnalytics'
  },
  {
    label: 'Reports',
    href: '/dashboard/reports',
    icon: FileText,
    permission: 'canViewAnalytics'
  },
  {
    label: 'Logistics',
    href: '/dashboard/logistics',
    icon: Truck,
    permission: 'canViewInventory'
  },
  {
    label: 'User Management',
    href: '/dashboard/users',
    icon: Shield,
    permission: 'canManageUsers',
    roles: ['admin']
  }
]

export function RoleBasedNav() {
  const { hasPermission, userRole } = useAuth()

  const filteredItems = navItems.filter(item => {
    // If no permission required, show to all
    if (!item.permission) return true
    
    // Check if user has the required permission
    if (!hasPermission(item.permission as any)) return false
    
    // If specific roles are required, check if user's role is included
    if (item.roles && !item.roles.includes(userRole || '')) return false
    
    return true
  })

  return (
    <nav className="space-y-2">
      {filteredItems.map((item) => {
        const IconComponent = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50",
              "text-gray-600 dark:text-gray-400"
            )}
          >
            <IconComponent className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

// Sidebar version for mobile/compact layouts
export function RoleBasedSidebar() {
  const { hasPermission, userRole } = useAuth()

  const filteredItems = navItems.filter(item => {
    if (!item.permission) return true
    if (!hasPermission(item.permission as any)) return false
    if (item.roles && !item.roles.includes(userRole || '')) return false
    return true
  })

  return (
    <div className="flex flex-col space-y-1">
      {filteredItems.map((item) => {
        const IconComponent = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50",
              "text-gray-600 dark:text-gray-400"
            )}
          >
            <IconComponent className="h-4 w-4" />
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
} 